import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from './useAuthStore';

describe('useAuthStore', () => {
  beforeEach(() => {
    useAuthStore.getState().logout();
  });

  it('initializes with unauthenticated default state', () => {
    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
    expect(state.accessToken).toBeNull();
    expect(state.refreshToken).toBeNull();
    expect(state.isInitialized).toBe(true);
  });

  it('updates state upon setAuth call', () => {
    const mockUser = {
      id: 'uuid-admin',
      email: 'admin@jerseyhub.com',
      name: 'Admin User',
      role: 'ADMIN' as const,
      enabled: true,
      emailVerified: true,
    };
    useAuthStore.getState().setAuth(mockUser, 'access-123', 'refresh-456');

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.user).toEqual(mockUser);
    expect(state.accessToken).toBe('access-123');
    expect(state.refreshToken).toBe('refresh-456');
  });

  it('resets state upon logout', () => {
    const mockUser = {
      id: 'uuid-user',
      email: 'user@jerseyhub.com',
      name: 'Standard User',
      role: 'CUSTOMER' as const,
      enabled: true,
      emailVerified: false,
    };
    useAuthStore.getState().setAuth(mockUser, 'access-123');

    useAuthStore.getState().logout();
    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
    expect(state.accessToken).toBeNull();
  });

  it('resets state on onUnauthorized call', () => {
    const mockUser = {
      id: 'uuid-user',
      email: 'user@jerseyhub.com',
      name: 'Standard User',
      role: 'CUSTOMER' as const,
      enabled: true,
      emailVerified: false,
    };
    useAuthStore.getState().setAuth(mockUser, 'access-123');

    useAuthStore.getState().onUnauthorized();
    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.accessToken).toBeNull();
  });
});
