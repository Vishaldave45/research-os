import { create } from 'zustand';
import {
  AuthState,
  LoginCredentials,
  RegisterCredentials,
  OAuthProvider,
  OAuthCallbackPayload,
  OAuthDevConnectPayload,
} from '../types';
import { authApi } from '../api/authApi';
import { apiClient } from '../../../services/api/client';

export const useAuthStore = create<AuthState>((set, get) => ({
  status: 'idle',
  user: null,
  tokens: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,
  error: null,

  clearError: () => set({ error: null }),

  initAuth: async () => {
    try {
      const accessToken = localStorage.getItem('researchos_access_token');
      const refreshToken = localStorage.getItem('researchos_refresh_token');

      if (accessToken) {
        apiClient.setTokens(accessToken, refreshToken || undefined);
        try {
          const user = await authApi.fetchCurrentUser();
          set({
            status: 'authenticated',
            user,
            tokens: {
              access_token: accessToken,
              refresh_token: refreshToken || '',
              token_type: 'bearer',
              expires_in: 900,
            },
            isAuthenticated: true,
            isLoading: false,
            isInitialized: true,
            error: null,
          });
          return;
        } catch {
          // Token might be expired, try refreshing
          if (refreshToken) {
            const refreshed = await get().refreshTokens();
            if (refreshed) {
              const user = await authApi.fetchCurrentUser();
              set({
                status: 'authenticated',
                user,
                isAuthenticated: true,
                isLoading: false,
                isInitialized: true,
                error: null,
              });
              return;
            }
          }
        }
      }

      // If no valid tokens found, set unauthenticated
      apiClient.clearTokens();
      set({
        status: 'unauthenticated',
        user: null,
        tokens: null,
        isAuthenticated: false,
        isLoading: false,
        isInitialized: true,
        error: null,
      });
    } catch {
      apiClient.clearTokens();
      set({
        status: 'unauthenticated',
        user: null,
        tokens: null,
        isAuthenticated: false,
        isLoading: false,
        isInitialized: true,
        error: null,
      });
    }
  },

  login: async (credentials: LoginCredentials) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authApi.login(credentials);
      const accessToken = response.tokens?.access_token || (response as any).access_token;
      const refreshToken = response.tokens?.refresh_token || (response as any).refresh_token;
      const user = response.user || (response as any);
      const tokens = response.tokens || {
        access_token: accessToken,
        refresh_token: refreshToken,
        token_type: 'bearer',
        expires_in: 900,
      };

      if (accessToken) {
        apiClient.setTokens(accessToken, refreshToken);
      }

      set({
        status: 'authenticated',
        user,
        tokens,
        isAuthenticated: true,
        isLoading: false,
        isInitialized: true,
        error: null,
      });
    } catch (err: any) {
      set({
        isLoading: false,
        error: err.message || 'Login failed. Please check your credentials.',
      });
      throw err;
    }
  },

  register: async (credentials: RegisterCredentials) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authApi.register(credentials);
      const accessToken = response.tokens?.access_token || (response as any).access_token;
      const refreshToken = response.tokens?.refresh_token || (response as any).refresh_token;
      const user = response.user || (response as any);
      const tokens = response.tokens || {
        access_token: accessToken,
        refresh_token: refreshToken,
        token_type: 'bearer',
        expires_in: 900,
      };

      if (accessToken) {
        apiClient.setTokens(accessToken, refreshToken);
      }

      set({
        status: 'authenticated',
        user,
        tokens,
        isAuthenticated: true,
        isLoading: false,
        isInitialized: true,
        error: null,
      });
    } catch (err: any) {
      set({
        isLoading: false,
        error: err.message || 'Registration failed. Please check your details.',
      });
      throw err;
    }
  },

  loginWithOAuth: async (provider: OAuthProvider) => {
    set({ isLoading: true, error: null });
    const redirectUri = `${window.location.origin}/auth/callback`;

    try {
      const oauthData = await authApi.getOAuthUrl(provider, redirectUri);

      if (!oauthData.configured) {
        // If OAuth credentials are not yet configured in environment variables,
        // use development connect directly to provide a smooth testing experience
        const devEmail = provider === 'google' ? 'researcher.google@lab.org' : 'researcher.github@lab.org';
        const devName = provider === 'google' ? 'Dr. Google Researcher' : 'GitHub Science Contributor';
        await get().connectOAuthDev({ provider, email: devEmail, full_name: devName });
        return;
      }

      // Open OAuth popup directly with provider's authorization URL
      const popupWidth = 600;
      const popupHeight = 700;
      const left = window.screenX + (window.outerWidth - popupWidth) / 2;
      const top = window.screenY + (window.outerHeight - popupHeight) / 2.5;

      const popup = window.open(
        oauthData.url,
        `${provider}_oauth_popup`,
        `width=${popupWidth},height=${popupHeight},left=${left},top=${top},status=no,toolbar=no,menubar=no`
      );

      if (!popup) {
        throw new Error('OAuth popup was blocked by your browser. Please enable popups and retry.');
      }

      return new Promise<void>((resolve, reject) => {
        let isResolved = false;

        const cleanup = () => {
          window.removeEventListener('message', handleMessage);
          clearInterval(pollTimer);
        };

        const handleMessage = async (event: MessageEvent) => {
          if (event.data?.type === 'OAUTH_AUTH_SUCCESS' || event.data?.type === 'OAUTH_AUTH_CODE') {
            const { code, error: authError } = event.data;
            if (authError) {
              cleanup();
              isResolved = true;
              set({ isLoading: false, error: authError });
              reject(new Error(authError));
              return;
            }
            if (code) {
              cleanup();
              isResolved = true;
              try {
                await get().handleOAuthCode({ provider, code, redirect_uri: redirectUri });
                resolve();
              } catch (err: any) {
                reject(err);
              }
            }
          }
        };

        window.addEventListener('message', handleMessage);

        const pollTimer = setInterval(() => {
          if (popup.closed && !isResolved) {
            cleanup();
            set({ isLoading: false });
            // Closed by user before auth finished
            resolve();
          }
        }, 1000);
      });
    } catch (err: any) {
      set({
        isLoading: false,
        error: err.message || `Failed to initiate ${provider} authentication.`,
      });
      throw err;
    }
  },

  handleOAuthCode: async (payload: OAuthCallbackPayload) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authApi.handleOAuthCallback(payload);
      const accessToken = response.tokens.access_token;
      const refreshToken = response.tokens.refresh_token;

      apiClient.setTokens(accessToken, refreshToken);

      set({
        status: 'authenticated',
        user: response.user,
        tokens: response.tokens,
        isAuthenticated: true,
        isLoading: false,
        isInitialized: true,
        error: null,
      });
    } catch (err: any) {
      set({
        isLoading: false,
        error: err.message || 'OAuth verification failed.',
      });
      throw err;
    }
  },

  connectOAuthDev: async (payload: OAuthDevConnectPayload) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authApi.connectOAuthDev(payload);
      const accessToken = response.tokens.access_token;
      const refreshToken = response.tokens.refresh_token;

      apiClient.setTokens(accessToken, refreshToken);

      set({
        status: 'authenticated',
        user: response.user,
        tokens: response.tokens,
        isAuthenticated: true,
        isLoading: false,
        isInitialized: true,
        error: null,
      });
    } catch (err: any) {
      set({
        isLoading: false,
        error: err.message || 'OAuth connect failed.',
      });
      throw err;
    }
  },

  logout: async () => {
    const currentTokens = get().tokens;
    const refreshToken =
      currentTokens?.refresh_token ||
      (() => {
        try {
          return localStorage.getItem('researchos_refresh_token');
        } catch {
          return undefined;
        }
      })() ||
      undefined;

    set({ isLoading: true });
    try {
      if (refreshToken) {
        await authApi.logout(refreshToken).catch(() => {});
      }
    } finally {
      apiClient.clearTokens();
      set({
        status: 'unauthenticated',
        user: null,
        tokens: null,
        isAuthenticated: false,
        isLoading: false,
        isInitialized: true,
        error: null,
      });
    }
  },

  refreshTokens: async (): Promise<boolean> => {
    const refreshToken = (() => {
      try {
        return localStorage.getItem('researchos_refresh_token');
      } catch {
        return null;
      }
    })();

    if (!refreshToken) return false;

    try {
      const refreshed = await authApi.refreshTokens(refreshToken);
      apiClient.setTokens(refreshed.access_token, refreshed.refresh_token);
      set({
        tokens: refreshed,
      });
      return true;
    } catch {
      apiClient.clearTokens();
      set({
        status: 'unauthenticated',
        user: null,
        tokens: null,
        isAuthenticated: false,
      });
      return false;
    }
  },
}));

