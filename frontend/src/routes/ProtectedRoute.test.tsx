import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { describe, it, expect, beforeEach } from 'vitest';
import { ProtectedRoute } from './ProtectedRoute';
import { AdminRoute } from './AdminRoute';
import { useAuthStore } from '../stores/useAuthStore';

describe('Route Protection Guards', () => {
  beforeEach(() => {
    useAuthStore.getState().logout();
  });

  it('redirects unauthenticated user from ProtectedRoute to /login', () => {
    render(
      <MemoryRouter initialEntries={['/account']}>
        <Routes>
          <Route path="/login" element={<div>Login Screen</div>} />
          <Route
            path="/account"
            element={
              <ProtectedRoute>
                <div>Protected Account Info</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Login Screen')).toBeInTheDocument();
    expect(screen.queryByText('Protected Account Info')).not.toBeInTheDocument();
  });

  it('renders children when authenticated in ProtectedRoute', () => {
    useAuthStore.getState().setAuth(
      { id: 'uuid-1', email: 'user@example.com', name: 'Jane Doe', role: 'CUSTOMER', enabled: true, emailVerified: true },
      'valid-token'
    );

    render(
      <MemoryRouter initialEntries={['/account']}>
        <Routes>
          <Route path="/login" element={<div>Login Screen</div>} />
          <Route
            path="/account"
            element={
              <ProtectedRoute>
                <div>Protected Account Info</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Protected Account Info')).toBeInTheDocument();
  });

  it('redirects non-admin user from AdminRoute to /forbidden', () => {
    useAuthStore.getState().setAuth(
      { id: 'uuid-1', email: 'user@example.com', name: 'Standard User', role: 'CUSTOMER', enabled: true, emailVerified: true },
      'valid-token'
    );

    render(
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route path="/forbidden" element={<div>Forbidden Access</div>} />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <div>Secret Admin Panel</div>
              </AdminRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Forbidden Access')).toBeInTheDocument();
    expect(screen.queryByText('Secret Admin Panel')).not.toBeInTheDocument();
  });

  it('renders admin content when user has ADMIN role in AdminRoute', () => {
    useAuthStore.getState().setAuth(
      { id: 'uuid-2', email: 'admin@jerseyhub.com', name: 'Super Admin', role: 'ADMIN', enabled: true, emailVerified: true },
      'admin-token'
    );

    render(
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route path="/forbidden" element={<div>Forbidden Access</div>} />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <div>Secret Admin Panel</div>
              </AdminRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Secret Admin Panel')).toBeInTheDocument();
  });
});
