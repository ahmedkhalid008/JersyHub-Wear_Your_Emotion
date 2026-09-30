import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, beforeEach } from 'vitest';
import { MainLayout } from './MainLayout';
import { useAuthStore } from '../stores/useAuthStore';

describe('MainLayout Component', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    useAuthStore.getState().logout();
  });

  it('renders JerseyHub branding and header links', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <MainLayout />
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(screen.getAllByText(/JERSEY/i).length).toBeGreaterThan(0);
    expect(screen.getByText('Products')).toBeInTheDocument();
    expect(screen.getByText('Sign In')).toBeInTheDocument();
  });

  it('renders admin badge link when user has ADMIN role', () => {
    useAuthStore.getState().setAuth(
      { id: 'uuid-1', email: 'admin@jerseyhub.com', name: 'Admin User', role: 'ADMIN', enabled: true, emailVerified: true },
      'jwt-admin-token'
    );

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <MainLayout />
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(screen.getAllByText(/Admin/i).length).toBeGreaterThan(0);
  });
});
