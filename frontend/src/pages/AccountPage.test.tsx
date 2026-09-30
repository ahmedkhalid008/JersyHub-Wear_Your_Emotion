import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AccountPage } from './AccountPage';
import { useAuthStore } from '../stores/useAuthStore';
import { authService } from '../services/authService';

vi.mock('../services/authService');

describe('AccountPage Component', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    useAuthStore.getState().logout();
    vi.restoreAllMocks();
  });

  it('renders user profile details from auth state / query', async () => {
    const mockUser = {
      id: 'uuid-99',
      name: 'Alice Smith',
      email: 'alice@example.com',
      phone: '+8801700000000',
      role: 'CUSTOMER' as const,
      enabled: true,
      emailVerified: true,
      createdAt: '2026-01-01T00:00:00Z',
    };

    useAuthStore.getState().setAuth(mockUser, 'access-token');
    vi.mocked(authService.getCurrentUser).mockResolvedValueOnce(mockUser);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AccountPage />
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(screen.getAllByText('Alice Smith').length).toBeGreaterThan(0);
    expect(screen.getAllByText('alice@example.com').length).toBeGreaterThan(0);
    expect(screen.getByText('+8801700000000')).toBeInTheDocument();
    expect(screen.getByText('CUSTOMER')).toBeInTheDocument();
  });

  it('triggers logout when sign out button is clicked', async () => {
    const mockUser = {
      id: 'uuid-99',
      name: 'Alice Smith',
      email: 'alice@example.com',
      role: 'CUSTOMER' as const,
      enabled: true,
      emailVerified: true,
    };

    useAuthStore.getState().setAuth(mockUser, 'access-token');
    vi.mocked(authService.getCurrentUser).mockResolvedValueOnce(mockUser);
    vi.mocked(authService.logout).mockResolvedValueOnce();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AccountPage />
        </MemoryRouter>
      </QueryClientProvider>
    );

    const signOutBtn = screen.getByRole('button', { name: /sign out/i });
    fireEvent.click(signOutBtn);

    expect(authService.logout).toHaveBeenCalled();
  });
});
