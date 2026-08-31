export interface AuthUser {
  id: string;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  full_name: string;
}

export interface AuthResponse {
  user: AuthUser;
  tokens: AuthTokens;
}

export interface TokenRefreshResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'unauthenticated';

export type OAuthProvider = 'google' | 'github';

export interface OAuthUrlResponse {
  provider: OAuthProvider;
  url: string;
  configured: boolean;
  client_id?: string;
  redirect_uri: string;
}

export interface OAuthCallbackPayload {
  provider: OAuthProvider;
  code: string;
  redirect_uri: string;
}

export interface OAuthDevConnectPayload {
  provider: OAuthProvider;
  email?: string;
  full_name?: string;
}

export interface AuthState {
  status: AuthStatus;
  user: AuthUser | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  loginWithOAuth: (provider: OAuthProvider) => Promise<void>;
  handleOAuthCode: (payload: OAuthCallbackPayload) => Promise<void>;
  connectOAuthDev: (payload: OAuthDevConnectPayload) => Promise<void>;
  logout: () => Promise<void>;
  refreshTokens: () => Promise<boolean>;
  clearError: () => void;
  initAuth: () => Promise<void>;
}
