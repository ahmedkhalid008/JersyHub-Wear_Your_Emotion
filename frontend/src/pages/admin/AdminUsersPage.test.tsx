import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router';
import { AdminUsersPage } from './AdminUsersPage';
import { adminService } from '../../services/adminService';
import { useAuthStore } from '../../stores/useAuthStore';
import { AdminUserResponse } from '../../types/domain';

vi.mock('../../services/adminService');

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

const mockUser: AdminUserResponse = {
  id: 'usr-77',
  email: 'customer@example.com',
  name: 'Alice Johnson',
  role: 'CUSTOMER',
  enabled: true,
  emailVerified: true,
  createdAt: '2026-05-10T14:30:00Z',
  updatedAt: '2026-05-10T14:30:00Z',
};

describe('AdminUsersPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({
      user: { id: 'admin-1', email: 'admin@example.com', name: 'Admin', role: 'ADMIN', enabled: true, emailVerified: true },
      accessToken: 'token-123',
      isAuthenticated: true,
      isInitialized: true,
    });
  });

  it('renders registered users directory', async () => {
    vi.mocked(adminService.getUsers).mockResolvedValue({
      content: [mockUser],
      page: 0,
      size: 15,
      totalElements: 1,
      totalPages: 1,
      first: true,
      last: true,
    });

    const queryClient = createTestQueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AdminUsersPage />
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(await screen.findByText('Alice Johnson')).toBeInTheDocument();
    expect(screen.getByText('customer@example.com')).toBeInTheDocument();
    expect(screen.getByText('CUSTOMER')).toBeInTheDocument();
  });
});
