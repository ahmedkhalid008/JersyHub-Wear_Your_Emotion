import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { OrdersPage } from './OrdersPage';
import { orderService } from '../services/orderService';
import { useAuthStore } from '../stores/useAuthStore';
import { OrderResponse } from '../types/domain';

vi.mock('../services/orderService', () => ({
  orderService: {
    getUserOrders: vi.fn(),
  },
}));

const mockOrder: OrderResponse = {
  id: 'ord-1',
  orderNumber: 'ORD-2026-001',
  userId: 'user-1',
  status: 'PAID',
  subtotal: 2500,
  discountAmount: 0,
  shippingAmount: 60,
  customizationAmount: 0,
  totalAmount: 2560,
  currency: 'BDT',
  shippingRecipientName: 'Neymar Jr',
  shippingPhone: '01812345678',
  shippingDivision: 'Dhaka',
  shippingDistrict: 'Dhaka',
  shippingArea: 'Banani',
  shippingAddressLine: 'Road 11',
  items: [
    {
      id: 'item-1',
      productId: 'prod-1',
      productVariantId: 'var-1',
      productName: 'Brazil 2026 Special Edition Jersey',
      unitPrice: 2500,
      quantity: 1,
      subtotal: 2500,
    },
  ],
  createdAt: '2026-09-29T10:00:00Z',
  updatedAt: '2026-09-29T10:00:00Z',
};

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

const renderOrdersPage = () => {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/orders']}>
        <Routes>
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/login" element={<div>Login Destination</div>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
};

describe('OrdersPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({
      user: { id: 'user-1', email: 'user@example.com', name: 'User', role: 'CUSTOMER', enabled: true, emailVerified: true },
      accessToken: 'token-123',
      isAuthenticated: true,
    });
  });

  it('redirects unauthenticated user to login', () => {
    useAuthStore.setState({
      user: null,
      accessToken: null,
      isAuthenticated: false,
    });

    renderOrdersPage();

    expect(screen.getByText('Login Destination')).toBeInTheDocument();
  });

  it('displays empty orders state when customer has 0 orders', async () => {
    vi.mocked(orderService.getUserOrders).mockResolvedValue([]);

    renderOrdersPage();

    expect(await screen.findByText("You haven't placed any orders yet")).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /continue shopping/i })).toBeInTheDocument();
  });

  it('renders order list when customer has orders', async () => {
    vi.mocked(orderService.getUserOrders).mockResolvedValue([mockOrder]);

    renderOrdersPage();

    expect(await screen.findByText('My Orders')).toBeInTheDocument();
    expect(screen.getByText('ORD-2026-001')).toBeInTheDocument();
    expect(screen.getByText(/Deliver to Neymar Jr/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /view order details/i })).toBeInTheDocument();
  });
});
