const API_BASE_URL = '/api/v1';

export interface ApiError {
  message: string;
  status: number;
  details?: any;
}

interface RequestDiagnostics {
  method: string;
  url: string;
  endpoint: string;
  headers: Record<string, string>;
  body?: any;
  timestamp: string;
}

class ApiClient {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private activeWorkspaceId: string | null = null;
  private refreshPromise: Promise<boolean> | null = null;

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
    if (!accessToken || accessToken === 'undefined' || accessToken === 'null') {
      this.clearTokens();
      return;
    }
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    try {
      localStorage.setItem('researchos_access_token', accessToken);
      if (refreshToken && refreshToken !== 'undefined' && refreshToken !== 'null') {
        localStorage.setItem('researchos_refresh_token', refreshToken);
      }
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
    if (!workspaceId) return;
    this.activeWorkspaceId = workspaceId;
    try {
      localStorage.setItem('researchos_workspace_id', workspaceId);
    } catch {}
  }

  public getActiveWorkspaceId(): string | null {
    if (this.activeWorkspaceId && this.activeWorkspaceId !== 'undefined') return this.activeWorkspaceId;
    try {
      const wsId = localStorage.getItem('researchos_workspace_id');
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
      const token = localStorage.getItem('researchos_access_token');
      if (token && token !== 'undefined' && token !== 'null') {
        this.accessToken = token;
        return token;
      }
    } catch {}
    return null;
  }

  /**
   * Diagnostic logging interceptor: prints detailed outgoing request headers and incoming
   * response status / payloads to the browser console when authentication-related calls fail.
   */
  private logAuthFailureDiagnostics(
    req: RequestDiagnostics,
    responseInfo: {
      status: number;
      statusText?: string;
      responseHeaders?: Record<string, string>;
      errorData?: any;
      errorMessage?: string;
    }
  ) {
    const isAuthRelated =
      responseInfo.status === 401 ||
      responseInfo.status === 403 ||
      req.endpoint.includes('/auth') ||
      !!req.headers['Authorization'];

    if (!isAuthRelated) return;

    const authHeader = req.headers['Authorization'] || req.headers['authorization'] || null;
    const tokenDetails = authHeader
      ? {
          present: true,
          type: authHeader.startsWith('Bearer ') ? 'Bearer' : 'Other',
          preview: authHeader.length > 25 ? `${authHeader.slice(0, 15)}...${authHeader.slice(-6)}` : authHeader,
          length: authHeader.length,
          fullHeader: authHeader,
        }
      : {
          present: false,
          type: 'None',
          preview: '<NONE>',
          length: 0,
          fullHeader: null,
        };

    const styleTitle = 'background: #dc2626; color: white; font-weight: bold; padding: 2px 6px; border-radius: 4px;';
    const styleLabel = 'color: #3b82f6; font-weight: bold;';
    const styleWarn = 'color: #f59e0b; font-weight: bold;';

    console.groupCollapsed(
      `%c[API Auth Failure Diagnostic]%c ${req.method} ${req.endpoint} (Status: ${responseInfo.status || 'Network Error'})`,
      styleTitle,
      'color: inherit; font-weight: bold;'
    );

    console.log(
      `%c[Request Overview]%c ${req.method} ${req.url}\nTimestamp: ${req.timestamp}`,
      styleLabel,
      'color: inherit;'
    );

    console.log(
      `%c[Outgoing Authorization Header Analysis]:`,
      styleWarn,
      tokenDetails
    );

    console.log(
      `%c[All Outgoing Request Headers]:`,
      styleLabel,
      req.headers
    );

    if (req.body !== undefined) {
      console.log(
        `%c[Outgoing Request Body]:`,
        styleLabel,
        req.body
      );
    }

    console.log(
      `%c[Incoming Response Status]:%c ${responseInfo.status} ${responseInfo.statusText || ''}`,
      styleWarn,
      'font-weight: bold;'
    );

    if (responseInfo.responseHeaders && Object.keys(responseInfo.responseHeaders).length > 0) {
      console.log(
        `%c[Incoming Response Headers]:`,
        styleLabel,
        responseInfo.responseHeaders
      );
    }

    if (responseInfo.errorData) {
      console.log(
        `%c[Incoming Error Response Body]:`,
        styleLabel,
        responseInfo.errorData
      );
    }

    if (responseInfo.errorMessage) {
      console.log(
        `%c[Parsed Error Message]:%c ${responseInfo.errorMessage}`,
        styleWarn,
        'color: #ef4444;'
      );
    }

    console.groupEnd();
  }

  private async refreshAccessToken(): Promise<boolean> {
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    const currentRefresh = this.refreshToken || (() => {
      try {
        return localStorage.getItem('researchos_refresh_token');
      } catch {
        return null;
      }
    })();

    if (!currentRefresh) return false;

    this.refreshPromise = (async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            refresh_token: currentRefresh,
          }),
        });

        if (!res.ok) {
          this.clearTokens();
          return false;
        }

        const data = await res.json();
        if (data.access_token) {
          this.setTokens(data.access_token, data.refresh_token || currentRefresh);
          return true;
        }
      } catch {
        this.clearTokens();
      } finally {
        this.refreshPromise = null;
      }
      return false;
    })();

    return this.refreshPromise;
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

    const accessToken = this.getAccessToken();
    const isPublicAuth =
      endpoint.includes('/auth/login') ||
      endpoint.includes('/auth/register') ||
      endpoint.includes('/auth/refresh');

    if (accessToken && !isPublicAuth) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    const workspaceId = this.getActiveWorkspaceId();
    if (workspaceId) {
      headers['X-Workspace-Id'] = workspaceId;
    }

    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
    const method = options.method || 'GET';

    const reqDiagnostics: RequestDiagnostics = {
      method,
      url,
      endpoint,
      headers: { ...headers },
      body: options.body,
      timestamp: new Date().toISOString(),
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const hasRefresh = !!(this.refreshToken || (() => {
        try { return localStorage.getItem('researchos_refresh_token'); } catch { return null; }
      })());

      if (response.status === 401 && !isRetry && !isPublicAuth && hasRefresh) {
        const refreshed = await this.refreshAccessToken();
        if (refreshed) {
          return this.request<T>(endpoint, options, true);
        }
      }

      if (response.status === 204) {
        return {} as T;
      }

      const data = await response.json().catch(() => ({}));

      // Extract response headers for diagnostics
      const responseHeaders: Record<string, string> = {};
      try {
        response.headers.forEach((value, key) => {
          responseHeaders[key] = value;
        });
      } catch {}

      if (!response.ok) {
        let errorMsg = `Request failed with status ${response.status}`;
        if (data.error) {
          if (typeof data.error === 'string') {
            errorMsg = data.error;
          } else if (typeof data.error === 'object' && data.error !== null) {
            errorMsg = (data.error as any).message || JSON.stringify(data.error);
          }
        } else if (data.detail) {
          if (typeof data.detail === 'string') {
            errorMsg = data.detail;
          } else if (Array.isArray(data.detail)) {
            errorMsg = data.detail.map((d: any) => d.msg || JSON.stringify(d)).join(', ');
          } else if (typeof data.detail === 'object') {
            errorMsg = (data.detail as any).message || JSON.stringify(data.detail);
          }
        }

        // Trigger diagnostic logging interceptor for failed auth / 401 / 403 / auth routes
        this.logAuthFailureDiagnostics(reqDiagnostics, {
          status: response.status,
          statusText: response.statusText,
          responseHeaders,
          errorData: data,
          errorMessage: errorMsg,
        });

        throw {
          message: errorMsg,
          status: response.status,
          details: data,
        } as ApiError;
      }

      return data as T;
    } catch (err: any) {
      if (err.status) {
        throw err;
      }

      // Network level failure
      this.logAuthFailureDiagnostics(reqDiagnostics, {
        status: 0,
        statusText: 'Network / Connection Failure',
        errorMessage: err.message || 'Network connection failed',
      });

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

