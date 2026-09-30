import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AdminRoute } from './AdminRoute';
import { useAuthStore } from '../stores/useAuthStore';

describe('AdminRoute Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('redirects unauthenticated user to /login', () => {
    useAuthStore.setState({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isInitialized: true,
    });

    render(
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <div>Admin Secret Page</div>
              </AdminRoute>
            }
          />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });

  it('redirects non-admin customer user to /forbidden', () => {
    useAuthStore.setState({
      user: { id: 'u-1', email: 'cust@example.com', name: 'Customer', role: 'CUSTOMER', enabled: true, emailVerified: true },
      accessToken: 'token',
      isAuthenticated: true,
      isInitialized: true,
    });

    render(
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <div>Admin Secret Page</div>
              </AdminRoute>
            }
          />
          <Route path="/forbidden" element={<div>Access Forbidden Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Access Forbidden Page')).toBeInTheDocument();
  });

  it('renders children when user has ADMIN role', () => {
    useAuthStore.setState({
      user: { id: 'admin-1', email: 'admin@example.com', name: 'Super Admin', role: 'ADMIN', enabled: true, emailVerified: true },
      accessToken: 'token',
      isAuthenticated: true,
      isInitialized: true,
    });

    render(
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <div>Admin Secret Page</div>
              </AdminRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Admin Secret Page')).toBeInTheDocument();
  });
});
