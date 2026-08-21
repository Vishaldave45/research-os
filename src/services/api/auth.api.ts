import { apiClient } from './client';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: string;
}

export interface WorkspaceItem {
  id: string;
  name: string;
  slug: string;
  description: string;
}

export interface AuthResponse {
  user: UserProfile;
  workspace?: WorkspaceItem;
  workspaces?: WorkspaceItem[];
  activeWorkspaceId?: string;
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

export const authApi = {
  async register(email: string, password: string, fullName: string, role?: string): Promise<AuthResponse> {
    const res = await apiClient.post<AuthResponse>('/auth/register', {
      email,
      password,
      full_name: fullName,
      role,
    });
    apiClient.setTokens(res.tokens.accessToken, res.tokens.refreshToken);
    if (res.workspace) {
      apiClient.setActiveWorkspace((res.workspace as any).id);
    }
    return res;
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    const res = await apiClient.post<AuthResponse>('/auth/login', { email, password });
    apiClient.setTokens(res.tokens.accessToken, res.tokens.refreshToken);
    if (res.activeWorkspaceId) {
      apiClient.setActiveWorkspace(res.activeWorkspaceId);
    }
    return res;
  },

  async getMe(): Promise<{ user: UserProfile; workspaces: WorkspaceItem[]; activeWorkspaceId: string }> {
    return apiClient.get('/auth/me');
  },

  logout() {
    apiClient.clearTokens();
  },
};
