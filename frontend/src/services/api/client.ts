import { ApiResponse } from '../../types/api';
import { ApiError } from './errors';
import { useAuthStore } from '../../stores/useAuthStore';
import { authService } from '../authService';
import { AuthResponse } from '../../types/auth';

export interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  timeout?: number;
  skipAuth?: boolean;
  _isRetry?: boolean;
}

export class ApiClient {
  private baseUrl: string;
  private refreshPromise: Promise<AuthResponse> | null = null;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';
    if (this.baseUrl.endsWith('/')) {
      this.baseUrl = this.baseUrl.slice(0, -1);
    }
  }

  public getBaseUrl(): string {
    return this.baseUrl;
  }

  public async request<T>(endpoint: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    const { body, headers = {}, timeout = 30000, skipAuth = false, _isRetry = false, ...customConfig } = options;

    const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = `${this.baseUrl}${normalizedEndpoint}`;

    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(headers as Record<string, string>),
    };

    if (!skipAuth) {
      const token = useAuthStore.getState().accessToken;
      if (token) {
        requestHeaders['Authorization'] = `Bearer ${token}`;
      }
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const config: RequestInit = {
      ...customConfig,
      headers: requestHeaders,
      signal: options.signal || controller.signal,
    };

    if (body !== undefined) {
      config.body = typeof body === 'string' ? body : JSON.stringify(body);
    }

    try {
      const response = await fetch(url, config);
      clearTimeout(timeoutId);

      if (!response.ok) {
        const isAuthEndpoint = normalizedEndpoint.includes('/auth/login') ||
                               normalizedEndpoint.includes('/auth/register') ||
                               normalizedEndpoint.includes('/auth/refresh');

        if (response.status === 401 && !skipAuth && !_isRetry && !isAuthEndpoint) {
          const refreshToken = useAuthStore.getState().refreshToken;

          if (refreshToken) {
            try {
              if (!this.refreshPromise) {
                this.refreshPromise = authService.refresh(refreshToken).finally(() => {
                  this.refreshPromise = null;
                });
              }

              const authData = await this.refreshPromise;
              useAuthStore.getState().setAuth(authData.user, authData.accessToken, authData.refreshToken);

              // Retry original request once
              return this.request<T>(endpoint, { ...options, _isRetry: true });
            } catch {
              useAuthStore.getState().logout();
            }
          } else {
            useAuthStore.getState().onUnauthorized();
          }
        } else if (response.status === 401 && !isAuthEndpoint) {
          useAuthStore.getState().onUnauthorized();
        }

        let errorJson;
        try {
          errorJson = await response.json();
        } catch {
          // Body wasn't JSON
        }
        throw ApiError.fromErrorResponse(response.status, errorJson);
      }

      if (response.status === 204) {
        return {
          success: true,
          message: 'Operation completed successfully',
          data: null as T,
          timestamp: new Date().toISOString(),
        };
      }

      const json = await response.json();
      return json as ApiResponse<T>;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof ApiError) {
        throw error;
      }

      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new ApiError(408, 'Request timeout. The server took too long to respond.', 'REQUEST_TIMEOUT');
      }

      throw ApiError.networkError(error as Error);
    }
  }

  public get<T>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  public post<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'POST', body });
  }

  public put<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'PUT', body });
  }

  public patch<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'PATCH', body });
  }

  public delete<T>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }

  public async getBlob(endpoint: string, options: RequestOptions = {}): Promise<Blob> {
    const { headers = {}, timeout = 30000, skipAuth = false, _isRetry = false, body: _body, ...customConfig } = options;

    const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = `${this.baseUrl}${normalizedEndpoint}`;

    const requestHeaders: Record<string, string> = {
      'Accept': 'application/pdf, application/octet-stream, */*',
      ...(headers as Record<string, string>),
    };

    if (!skipAuth) {
      const token = useAuthStore.getState().accessToken;
      if (token) {
        requestHeaders['Authorization'] = `Bearer ${token}`;
      }
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const config: RequestInit = {
      ...customConfig,
      method: 'GET',
      headers: requestHeaders,
      signal: options.signal || controller.signal,
    };

    try {
      const response = await fetch(url, config);
      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 401 && !skipAuth && !_isRetry) {
          const refreshToken = useAuthStore.getState().refreshToken;

          if (refreshToken) {
            try {
              if (!this.refreshPromise) {
                this.refreshPromise = authService.refresh(refreshToken).finally(() => {
                  this.refreshPromise = null;
                });
              }

              const authData = await this.refreshPromise;
              useAuthStore.getState().setAuth(authData.user, authData.accessToken, authData.refreshToken);

              return this.getBlob(endpoint, { ...options, _isRetry: true });
            } catch {
              useAuthStore.getState().logout();
            }
          } else {
            useAuthStore.getState().onUnauthorized();
          }
        } else if (response.status === 401) {
          useAuthStore.getState().onUnauthorized();
        }

        let errorJson;
        try {
          errorJson = await response.json();
        } catch {
          // Body was not JSON
        }
        throw ApiError.fromErrorResponse(response.status, errorJson);
      }

      return await response.blob();
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof ApiError) {
        throw error;
      }

      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new ApiError(408, 'Request timeout. The server took too long to respond.', 'REQUEST_TIMEOUT');
      }

      throw ApiError.networkError(error as Error);
    }
  }
}

export const apiClient = new ApiClient();
