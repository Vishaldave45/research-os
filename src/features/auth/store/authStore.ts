import { create } from 'zustand';
import { AuthState, LoginCredentials, RegisterCredentials } from '../types';
import { authApi } from '../api/authApi';
import { apiClient } from '../../../services/api/client';

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  tokens: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,
  error: null,

  clearError: () => set({ error: null }),

  initAuth: async () => {
    const accessToken = apiClient.getAccessToken();
    if (!accessToken) {
      set({ isInitialized: true, isAuthenticated: false, user: null, tokens: null });
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const user = await authApi.fetchCurrentUser();
      set({
        user,
        isAuthenticated: true,
        isLoading: false,
        isInitialized: true,
      });
    } catch (err: any) {
      // Access token might be invalid or expired; try refresh
      const refreshed = await get().refreshTokens();
      if (refreshed) {
        try {
          const user = await authApi.fetchCurrentUser();
          set({
            user,
            isAuthenticated: true,
            isLoading: false,
            isInitialized: true,
          });
          return;
        } catch {
          // If still fails, clear state
        }
      }

      apiClient.clearTokens();
      set({
        user: null,
        tokens: null,
        isAuthenticated: false,
        isLoading: false,
        isInitialized: true,
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
      const tokens = response.tokens || { access_token: accessToken, refresh_token: refreshToken, token_type: 'bearer', expires_in: 900 };

      if (accessToken) {
        apiClient.setTokens(accessToken, refreshToken);
      }

      set({
        user,
        tokens,
        isAuthenticated: true,
        isLoading: false,
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
      const tokens = response.tokens || { access_token: accessToken, refresh_token: refreshToken, token_type: 'bearer', expires_in: 900 };

      if (accessToken) {
        apiClient.setTokens(accessToken, refreshToken);
      }

      set({
        user,
        tokens,
        isAuthenticated: true,
        isLoading: false,
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

  logout: async () => {
    const currentTokens = get().tokens;
    const refreshToken = currentTokens?.refresh_token || localStorage.getItem('researchos_refresh_token') || undefined;

    set({ isLoading: true });
    try {
      await authApi.logout(refreshToken);
    } finally {
      apiClient.clearTokens();
      set({
        user: null,
        tokens: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  },

  refreshTokens: async (): Promise<boolean> => {
    const refreshToken = localStorage.getItem('researchos_refresh_token');
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
        user: null,
        tokens: null,
        isAuthenticated: false,
      });
      return false;
    }
  },
}));
