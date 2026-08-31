/**
 * ResearchOS Authoritative API Client Layer
 * Connects React UI directly to FastAPI backend (/api/v1) with zero silent localStorage/mock fallbacks.
 * Multi-tenant workspace isolation is enforced via Authorization & X-Workspace-Id headers.
 */

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'researchos_access_token',
  REFRESH_TOKEN: 'researchos_refresh_token',
  WORKSPACE_ID: 'researchos_active_workspace_id',
};

class ApiClient {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private activeWorkspaceId: string | null = null;

  constructor() {
    this.loadPersistedTokens();
  }

  private loadPersistedTokens() {
    try {
      this.accessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      this.refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
      this.activeWorkspaceId = localStorage.getItem(STORAGE_KEYS.WORKSPACE_ID);
    } catch {}
  }

  public setTokens(accessToken: string, refreshToken?: string) {
    this.accessToken = accessToken;
    try {
      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
      if (refreshToken) {
        this.refreshToken = refreshToken;
        localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
      }
    } catch {}
  }

  public clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    try {
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    } catch {}
  }

  public setActiveWorkspace(workspaceId: string) {
    this.activeWorkspaceId = workspaceId;
    try {
      localStorage.setItem(STORAGE_KEYS.WORKSPACE_ID, workspaceId);
    } catch {}
  }

  public getActiveWorkspaceId(): string | null {
    if (this.activeWorkspaceId && this.activeWorkspaceId !== 'undefined') {
      return this.activeWorkspaceId;
    }
    try {
      const wsId = localStorage.getItem(STORAGE_KEYS.WORKSPACE_ID);
      if (wsId && wsId !== 'undefined') {
        this.activeWorkspaceId = wsId;
        return wsId;
      }
    } catch {}
    return null;
  }

  public getAccessToken(): string | null {
    if (this.accessToken && this.accessToken !== 'undefined' && this.accessToken !== 'null') {
      return this.accessToken;
    }
    try {
      const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      if (token && token !== 'undefined' && token !== 'null') {
        this.accessToken = token;
        return token;
      }
    } catch {}
    return null;
  }

  public async request<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    const token = this.getAccessToken();
    const isPublicAuth =
      endpoint.includes('/auth/login') ||
      endpoint.includes('/auth/register') ||
      endpoint.includes('/auth/refresh') ||
      endpoint.includes('/auth/oauth/');

    if (token && !isPublicAuth && !headers['Authorization']) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const workspaceId = this.getActiveWorkspaceId();
    if (workspaceId && !headers['X-Workspace-Id']) {
      headers['X-Workspace-Id'] = workspaceId;
    }

    const method = (options.method || 'GET').toUpperCase();

    // Standardize URL targeting Vite reverse proxy (/api -> http://localhost:8000/api/v1)
    const apiUrl = endpoint.startsWith('/api') || endpoint.startsWith('/auth') || endpoint.startsWith('/health')
      ? endpoint
      : `/api/v1${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

    const response = await fetch(apiUrl, {
      method,
      headers,
      body: options.body,
    });

    if (response.ok) {
      if (response.status === 204) return null as T;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return (await response.json()) as T;
      }
      return (await response.text()) as unknown as T;
    }

    if (response.status === 401 && !isPublicAuth) {
      this.clearTokens();
      throw { message: 'Authentication session expired. Please log in again.', status: 401 };
    }

    let errDetail = 'Request failed';
    try {
      const errJson = await response.json();
      errDetail = errJson.detail || errJson.message || errJson.error?.message || JSON.stringify(errJson);
    } catch {
      errDetail = await response.text();
    }
    throw { message: errDetail, status: response.status };
  }

  public get<T = any>(endpoint: string, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET', headers });
  }

  public post<T = any>(endpoint: string, body?: any, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body !== undefined ? JSON.stringify(body) : undefined,
      headers,
    });
  }

  public put<T = any>(endpoint: string, body?: any, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body !== undefined ? JSON.stringify(body) : undefined,
      headers,
    });
  }

  public delete<T = any>(endpoint: string, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE', headers });
  }
}

export const apiClient = new ApiClient();
