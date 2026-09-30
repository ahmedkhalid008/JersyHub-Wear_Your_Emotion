import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ApiClient } from './client';
import { ApiError } from './errors';
import { useAuthStore } from '../../stores/useAuthStore';
import { authService } from '../authService';

vi.mock('../authService');

describe('ApiClient', () => {
  let client: ApiClient;
  const mockFetch = vi.fn();

  beforeEach(() => {
    client = new ApiClient('http://localhost:8080/api/v1');
    vi.stubGlobal('fetch', mockFetch);
    useAuthStore.getState().logout();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('configures default base URL', () => {
    expect(client.getBaseUrl()).toBe('http://localhost:8080/api/v1');
  });

  it('performs successful GET request and parses JSON response', async () => {
    const mockData = { success: true, message: 'OK', data: { status: 'UP' }, timestamp: '2026-01-01' };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockData,
    });

    const res = await client.get('/health');
    expect(res).toEqual(mockData);
  });

  it('attaches Authorization Bearer header when user is authenticated', async () => {
    useAuthStore.getState().setAuth(
      { id: 'uuid-1', email: 'user@example.com', name: 'John Doe', role: 'CUSTOMER', enabled: true, emailVerified: false },
      'test-jwt-access-token'
    );

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ success: true, data: [] }),
    });

    await client.get('/orders');
    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:8080/api/v1/orders',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer test-jwt-access-token',
        }),
      })
    );
  });

  it('throws ApiError on HTTP 404 response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: async () => ({
        success: false,
        message: 'Product not found',
        errorCode: 'RESOURCE_NOT_FOUND',
      }),
    });

    await expect(client.get('/products/999')).rejects.toThrow(ApiError);
  });

  it('attempts single-flight token refresh on 401 response and retries request', async () => {
    useAuthStore.getState().setAuth(
      { id: 'uuid-1', email: 'user@example.com', name: 'John Doe', role: 'CUSTOMER', enabled: true, emailVerified: false },
      'expired-jwt-token',
      'valid-refresh-token'
    );

    // Initial 401 call
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ success: false, message: 'Token expired' }),
    });

    // Refresh token service call mock
    vi.mocked(authService.refresh).mockResolvedValueOnce({
      accessToken: 'new-jwt-token',
      refreshToken: 'new-refresh-token',
      tokenType: 'Bearer',
      expiresIn: 900,
      user: { id: 'uuid-1', email: 'user@example.com', name: 'John Doe', role: 'CUSTOMER', enabled: true, emailVerified: false },
    });

    // Retried call succeeds
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ success: true, data: { orderId: '123' } }),
    });

    const res = await client.get('/orders');
    expect(authService.refresh).toHaveBeenCalledWith('valid-refresh-token');
    expect(useAuthStore.getState().accessToken).toBe('new-jwt-token');
    expect(res.data).toEqual({ orderId: '123' });
  });

  it('performs single-flight refresh for concurrent 401 requests', async () => {
    useAuthStore.getState().setAuth(
      { id: 'uuid-1', email: 'user@example.com', name: 'John Doe', role: 'CUSTOMER', enabled: true, emailVerified: false },
      'expired-jwt-token',
      'valid-refresh-token'
    );

    mockFetch
      .mockResolvedValueOnce({ ok: false, status: 401, json: async () => ({ message: 'Expired' }) })
      .mockResolvedValueOnce({ ok: false, status: 401, json: async () => ({ message: 'Expired' }) });

    vi.mocked(authService.refresh).mockResolvedValueOnce({
      accessToken: 'fresh-jwt-token',
      refreshToken: 'fresh-refresh-token',
      tokenType: 'Bearer',
      expiresIn: 900,
      user: { id: 'uuid-1', email: 'user@example.com', name: 'John Doe', role: 'CUSTOMER', enabled: true, emailVerified: false },
    });

    mockFetch
      .mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({ success: true, data: 'req1' }) })
      .mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({ success: true, data: 'req2' }) });

    const [res1, res2] = await Promise.all([client.get('/res1'), client.get('/res2')]);

    expect(authService.refresh).toHaveBeenCalledTimes(1);
    expect(res1.data).toBe('req1');
    expect(res2.data).toBe('req2');
  });

  it('clears authentication store when token refresh fails', async () => {
    useAuthStore.getState().setAuth(
      { id: 'uuid-1', email: 'user@example.com', name: 'John Doe', role: 'CUSTOMER', enabled: true, emailVerified: false },
      'expired-jwt-token',
      'invalid-refresh-token'
    );

    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ success: false, message: 'Token expired' }),
    });

    vi.mocked(authService.refresh).mockRejectedValueOnce(new ApiError(401, 'Invalid refresh token', 'INVALID_REFRESH'));

    await expect(client.get('/orders')).rejects.toThrow(ApiError);
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(useAuthStore.getState().accessToken).toBeNull();
  });

  it('fetches PDF invoice blob successfully via getBlob method', async () => {
    useAuthStore.getState().setAuth(
      { id: 'uuid-1', email: 'user@example.com', name: 'John Doe', role: 'CUSTOMER', enabled: true, emailVerified: false },
      'test-jwt'
    );

    const pdfBlob = new Blob(['%PDF-1.4 mock pdf content'], { type: 'application/pdf' });
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      blob: async () => pdfBlob,
    });

    const blob = await client.getBlob('/orders/order-100/invoice');
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.type).toBe('application/pdf');
    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:8080/api/v1/orders/order-100/invoice',
      expect.objectContaining({
        headers: expect.objectContaining({
          Accept: 'application/pdf, application/octet-stream, */*',
          Authorization: 'Bearer test-jwt',
        }),
      })
    );
  });
});
