import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router';
import { AdminOrdersPage } from './AdminOrdersPage';
import { adminService } from '../../services/adminService';
import { useAuthStore } from '../../stores/useAuthStore';
import { AdminOrderSummaryResponse, AdminOrderDetailResponse } from '../../types/domain';

vi.mock('../../services/adminService');

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

const mockOrderSummary: AdminOrderSummaryResponse = {
  id: 'ord-admin-1',
  orderNumber: 'ORD-2026-999',
  userId: 'user-88',
  customerName: 'Jane Smith',
  customerEmail: 'jane@example.com',
  status: 'PROCESSING',
  paymentStatus: 'SUCCESS',
  totalAmount: 3060,
  currency: 'BDT',
  totalItems: 2,
  createdAt: '2026-09-29T10:00:00Z',
};

const mockOrderDetail: AdminOrderDetailResponse = {
  id: 'ord-admin-1',
  orderNumber: 'ORD-2026-999',
  userId: 'user-88',
  customerName: 'Jane Smith',
  customerEmail: 'jane@example.com',
  status: 'PROCESSING',
  subtotal: 3000,
  discountAmount: 0,
  shippingAmount: 60,
  customizationAmount: 0,
  totalAmount: 3060,
  currency: 'BDT',
  shippingRecipientName: 'Jane Smith',
  shippingPhone: '01800000000',
  shippingDivision: 'Dhaka',
  shippingDistrict: 'Dhaka',
  shippingArea: 'Dhanmondi',
  shippingAddressLine: 'House 5, Road 2',
  items: [],
  createdAt: '2026-09-29T10:00:00Z',
  updatedAt: '2026-09-29T10:00:00Z',
};

describe('AdminOrdersPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({
      user: { id: 'admin-1', email: 'admin@example.com', name: 'Admin', role: 'ADMIN', enabled: true, emailVerified: true },
      accessToken: 'token-123',
      isAuthenticated: true,
      isInitialized: true,
    });
  });

  it('renders admin orders list and opens order detail modal', async () => {
    vi.mocked(adminService.getOrders).mockResolvedValue({
      content: [mockOrderSummary],
      page: 0,
      size: 15,
      totalElements: 1,
      totalPages: 1,
      first: true,
      last: true,
    });
    vi.mocked(adminService.getOrderById).mockResolvedValue(mockOrderDetail);

    const queryClient = createTestQueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AdminOrdersPage />
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(await screen.findByText('ORD-2026-999')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();

    const viewBtn = screen.getByRole('button', { name: /Details/i });
    fireEvent.click(viewBtn);

    expect(adminService.getOrderById).toHaveBeenCalledWith('ord-admin-1');
  });

  it('filters orders by status', async () => {
    vi.mocked(adminService.getOrders).mockResolvedValue({
      content: [],
      page: 0,
      size: 15,
      totalElements: 0,
      totalPages: 0,
      first: true,
      last: true,
    });

    const queryClient = createTestQueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AdminOrdersPage />
        </MemoryRouter>
      </QueryClientProvider>
    );

    const select = await screen.findByRole('combobox');
    fireEvent.change(select, { target: { value: 'SHIPPED' } });

    expect(adminService.getOrders).toHaveBeenCalledWith('SHIPPED', 0, 15);
  });
});
