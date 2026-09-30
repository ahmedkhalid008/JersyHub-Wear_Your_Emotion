import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { authService } from './authService';
import { apiClient } from './api/client';

describe('authService', () => {
  beforeEach(() => {
    vi.spyOn(apiClient, 'post');
    vi.spyOn(apiClient, 'get');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('calls POST /auth/login with credentials', async () => {
    const mockAuthResponse = {
      accessToken: 'acc-123',
      refreshToken: 'ref-456',
      tokenType: 'Bearer',
      expiresIn: 900,
      user: { id: 'uuid-1', name: 'John', email: 'john@example.com', role: 'CUSTOMER' as const, enabled: true, emailVerified: false },
    };

    vi.mocked(apiClient.post).mockResolvedValueOnce({
      success: true,
      message: 'Login successful',
      data: mockAuthResponse,
      timestamp: '2026-01-01',
    });

    const res = await authService.login({ email: 'john@example.com', password: 'password123' });
    expect(apiClient.post).toHaveBeenCalledWith('/auth/login', { email: 'john@example.com', password: 'password123' }, { skipAuth: true });
    expect(res).toEqual(mockAuthResponse);
  });

  it('calls POST /auth/register with user payload', async () => {
    const mockUser = {
      id: 'uuid-2',
      name: 'Jane Doe',
      email: 'jane@example.com',
      role: 'CUSTOMER' as const,
      enabled: true,
      emailVerified: false,
    };

    vi.mocked(apiClient.post).mockResolvedValueOnce({
      success: true,
      message: 'User registered',
      data: mockUser,
      timestamp: '2026-01-01',
    });

    const res = await authService.register({ name: 'Jane Doe', email: 'jane@example.com', password: 'password123' });
    expect(apiClient.post).toHaveBeenCalledWith(
      '/auth/register',
      { name: 'Jane Doe', email: 'jane@example.com', password: 'password123' },
      { skipAuth: true }
    );
    expect(res).toEqual(mockUser);
  });

  it('calls GET /auth/me to retrieve current user', async () => {
    const mockUser = {
      id: 'uuid-1',
      name: 'John',
      email: 'john@example.com',
      role: 'CUSTOMER' as const,
      enabled: true,
      emailVerified: true,
    };

    vi.mocked(apiClient.get).mockResolvedValueOnce({
      success: true,
      message: 'User profile retrieved',
      data: mockUser,
      timestamp: '2026-01-01',
    });

    const res = await authService.getCurrentUser();
    expect(apiClient.get).toHaveBeenCalledWith('/auth/me');
    expect(res).toEqual(mockUser);
  });

  it('calls POST /auth/refresh with refresh token', async () => {
    const mockAuthResponse = {
      accessToken: 'new-acc',
      refreshToken: 'new-ref',
      tokenType: 'Bearer',
      expiresIn: 900,
      user: { id: 'uuid-1', name: 'John', email: 'john@example.com', role: 'CUSTOMER' as const, enabled: true, emailVerified: false },
    };

    vi.mocked(apiClient.post).mockResolvedValueOnce({
      success: true,
      message: 'Token refreshed',
      data: mockAuthResponse,
      timestamp: '2026-01-01',
    });

    const res = await authService.refresh('ref-456');
    expect(apiClient.post).toHaveBeenCalledWith('/auth/refresh', { refreshToken: 'ref-456' }, { skipAuth: true });
    expect(res).toEqual(mockAuthResponse);
  });
});
