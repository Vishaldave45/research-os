import { apiClient } from '../../../services/api/client';
import {
  AuthResponse,
  AuthUser,
  LoginCredentials,
  RegisterCredentials,
  TokenRefreshResponse,
  OAuthProvider,
  OAuthUrlResponse,
  OAuthCallbackPayload,
  OAuthDevConnectPayload,
} from '../types';

export const authApi = {
  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    const payload = {
      email: credentials.email.trim().toLowerCase(),
      password: credentials.password,
      full_name: credentials.full_name.trim(),
    };
    return await apiClient.post<AuthResponse>('/auth/register', payload);
  },

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const payload = {
      email: credentials.email.trim().toLowerCase(),
      password: credentials.password,
    };
    return await apiClient.post<AuthResponse>('/auth/login', payload);
  },

  async getOAuthUrl(provider: OAuthProvider, redirectUri: string): Promise<OAuthUrlResponse> {
    return await apiClient.get<OAuthUrlResponse>(
      `/auth/oauth/${provider}/url?redirect_uri=${encodeURIComponent(redirectUri)}`
    );
  },

  async handleOAuthCallback(payload: OAuthCallbackPayload): Promise<AuthResponse> {
    return await apiClient.post<AuthResponse>(`/auth/oauth/${payload.provider}/callback`, payload);
  },

  async connectOAuthDev(payload: OAuthDevConnectPayload): Promise<AuthResponse> {
    return await apiClient.post<AuthResponse>('/auth/oauth/dev-connect', payload);
  },

  async refreshTokens(refreshToken: string): Promise<TokenRefreshResponse> {
    return await apiClient.post<TokenRefreshResponse>('/auth/refresh', {
      refresh_token: refreshToken,
    });
  },

  async logout(refreshToken?: string): Promise<void> {
    if (refreshToken) {
      try {
        await apiClient.post('/auth/logout', {
          refresh_token: refreshToken,
        });
      } catch {
        // Continue client-side logout even if server-side revocation network fails
      }
    }
  },

  async fetchCurrentUser(): Promise<AuthUser> {
    const res = await apiClient.get<any>('/auth/me');
    // Normalize if backend returned { user: {...} } or direct user object
    return res.user || res;
  },
};
