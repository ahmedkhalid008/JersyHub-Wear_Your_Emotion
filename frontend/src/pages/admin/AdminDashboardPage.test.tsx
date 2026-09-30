import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AdminDashboardPage } from './AdminDashboardPage';
import { adminService } from '../../services/adminService';
import { useAuthStore } from '../../stores/useAuthStore';
import { AdminDashboardSummaryResponse } from '../../types/domain';

vi.mock('../../services/adminService', () => ({
  adminService: {
    getDashboardSummary: vi.fn(),
    getOrders: vi.fn(),
  },
}));

const mockSummary: AdminDashboardSummaryResponse = {
  totalUsers: 150,
  totalProducts: 45,
  totalOrders: 320,
  pendingOrders: 12,
  processingOrders: 18,
  shippedOrders: 25,
  deliveredOrders: 250,
  cancelledOrders: 15,
  totalSuccessfulRevenue: 850000,
};

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

describe('AdminDashboardPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({
      user: { id: 'admin-1', email: 'admin@example.com', name: 'Super Admin', role: 'ADMIN', enabled: true, emailVerified: true },
      accessToken: 'token-123',
      isAuthenticated: true,
      isInitialized: true,
    });
  });

  it('renders dashboard metrics from actual backend API response', async () => {
    vi.mocked(adminService.getDashboardSummary).mockResolvedValue(mockSummary);
    vi.mocked(adminService.getOrders).mockResolvedValue({
      content: [],
      page: 0,
      size: 5,
      totalElements: 0,
      totalPages: 0,
      first: true,
      last: true,
    });

    const queryClient = createTestQueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AdminDashboardPage />
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(await screen.findByText('Admin Dashboard')).toBeInTheDocument();
    expect(await screen.findByText('320')).toBeInTheDocument(); // totalOrders
    expect(await screen.findByText('150')).toBeInTheDocument(); // totalUsers
    expect(await screen.findByText('45')).toBeInTheDocument(); // totalProducts
  });
});
