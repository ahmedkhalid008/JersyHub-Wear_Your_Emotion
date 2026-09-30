import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router';
import { AdminCouponsPage } from './AdminCouponsPage';
import { adminService } from '../../services/adminService';
import { useAuthStore } from '../../stores/useAuthStore';
import { CouponResponse } from '../../types/domain';

vi.mock('../../services/adminService');

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

const mockCoupon: CouponResponse = {
  id: 'coup-1',
  code: 'SUMMER20',
  description: 'Summer Sale 20% Off',
  discountType: 'PERCENTAGE',
  discountValue: 20,
  minimumOrderAmount: 1000,
  maximumDiscountAmount: 500,
  usageLimit: 100,
  usageCount: 15,
  active: true,
  createdAt: '2026-01-01',
  updatedAt: '2026-01-01',
};

describe('AdminCouponsPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({
      user: { id: 'admin-1', email: 'admin@example.com', name: 'Admin', role: 'ADMIN', enabled: true, emailVerified: true },
      accessToken: 'token-123',
      isAuthenticated: true,
      isInitialized: true,
    });
  });

  it('renders coupons list and toggles coupon activation status', async () => {
    vi.mocked(adminService.getCoupons).mockResolvedValue({
      content: [mockCoupon],
      page: 0,
      size: 15,
      totalElements: 1,
      totalPages: 1,
      first: true,
      last: true,
    });
    vi.mocked(adminService.deactivateCoupon).mockResolvedValue({
      ...mockCoupon,
      active: false,
    });

    const queryClient = createTestQueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AdminCouponsPage />
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(await screen.findByText('SUMMER20')).toBeInTheDocument();
    expect(screen.getByText('Summer Sale 20% Off')).toBeInTheDocument();

    const deactBtn = screen.getByRole('button', { name: 'Deactivate' });
    fireEvent.click(deactBtn);

    await waitFor(() => {
      expect(adminService.deactivateCoupon).toHaveBeenCalledWith('coup-1');
    });
  });

  it('creates a new coupon code via modal form', async () => {
    vi.mocked(adminService.getCoupons).mockResolvedValue({
      content: [],
      page: 0,
      size: 15,
      totalElements: 0,
      totalPages: 0,
      first: true,
      last: true,
    });
    vi.mocked(adminService.createCoupon).mockResolvedValue(mockCoupon);

    const queryClient = createTestQueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AdminCouponsPage />
        </MemoryRouter>
      </QueryClientProvider>
    );

    const createBtn = await screen.findByText('Create Coupon');
    fireEvent.click(createBtn);

    expect(screen.getByRole('heading', { name: /Create Promotional Coupon/i })).toBeInTheDocument();

    const codeInput = screen.getByPlaceholderText('e.g. SUMMER10, JERSEY20');
    fireEvent.change(codeInput, { target: { value: 'JERSEYS10' } });

    const submitBtns = screen.getAllByRole('button', { name: 'Create Coupon' });
    const submitBtn = submitBtns[submitBtns.length - 1];
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(adminService.createCoupon).toHaveBeenCalledWith(
        expect.objectContaining({
          code: 'JERSEYS10',
        })
      );
    });
  });
});
