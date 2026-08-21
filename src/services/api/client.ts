const API_BASE_URL = '/api/v1';

export interface ApiError {
  message: string;
  status: number;
  details?: any;
}

class ApiClient {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private activeWorkspaceId: string | null = null;

  constructor() {
    this.loadTokens();
  }

  private loadTokens() {
    try {
      this.accessToken = localStorage.getItem('researchos_access_token');
      this.refreshToken = localStorage.getItem('researchos_refresh_token');
      this.activeWorkspaceId = localStorage.getItem('researchos_workspace_id');
    } catch {
      // Ignore if localStorage unavailable
    }
  }

  public setTokens(accessToken: string, refreshToken: string) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    try {
      localStorage.setItem('researchos_access_token', accessToken);
      localStorage.setItem('researchos_refresh_token', refreshToken);
    } catch {}
  }

  public clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    try {
      localStorage.removeItem('researchos_access_token');
      localStorage.removeItem('researchos_refresh_token');
    } catch {}
  }

  public setActiveWorkspace(workspaceId: string) {
    this.activeWorkspaceId = workspaceId;
    try {
      localStorage.setItem('researchos_workspace_id', workspaceId);
    } catch {}
  }

  public getActiveWorkspaceId(): string | null {
    return this.activeWorkspaceId;
  }

  public getAccessToken(): string | null {
    return this.accessToken;
  }

  private async refreshAccessToken(): Promise<boolean> {
    if (!this.refreshToken) return false;

    try {
      const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          refreshToken: this.refreshToken,
          refresh_token: this.refreshToken,
        }),
      });

      if (!res.ok) {
        this.clearTokens();
        return false;
      }

      const data = await res.json();
      if (data.tokens?.accessToken) {
        this.setTokens(data.tokens.accessToken, data.tokens.refreshToken || this.refreshToken);
        return true;
      } else if (data.access_token) {
        this.setTokens(data.access_token, data.refresh_token || this.refreshToken);
        return true;
      }
    } catch {
      this.clearTokens();
    }
    return false;
  }

  public async request<T = any>(
    endpoint: string,
    options: RequestInit = {},
    isRetry = false
  ): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    if (this.activeWorkspaceId) {
      headers['X-Workspace-Id'] = this.activeWorkspaceId;
    }

    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (response.status === 401 && !isRetry && this.refreshToken) {
        const refreshed = await this.refreshAccessToken();
        if (refreshed) {
          return this.request<T>(endpoint, options, true);
        }
      }

      if (response.status === 204) {
        return {} as T;
      }

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw {
          message: data.error || data.detail || `Request failed with status ${response.status}`,
          status: response.status,
          details: data,
        } as ApiError;
      }

      return data as T;
    } catch (err: any) {
      if (err.status) throw err;
      throw {
        message: err.message || 'Network connection failed',
        status: 0,
      } as ApiError;
    }
  }

  public get<T = any>(endpoint: string, headers?: Record<string, string>) {
    return this.request<T>(endpoint, { method: 'GET', headers });
  }

  public post<T = any>(endpoint: string, body?: any, headers?: Record<string, string>) {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
      headers,
    });
  }

  public put<T = any>(endpoint: string, body?: any, headers?: Record<string, string>) {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
      headers,
    });
  }

  public delete<T = any>(endpoint: string, headers?: Record<string, string>) {
    return this.request<T>(endpoint, { method: 'DELETE', headers });
  }
}

export const apiClient = new ApiClient();
