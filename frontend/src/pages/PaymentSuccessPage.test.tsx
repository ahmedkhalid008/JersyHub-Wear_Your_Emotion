import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PaymentSuccessPage } from './PaymentSuccessPage';
import { orderService } from '../services/orderService';
import { useAuthStore } from '../stores/useAuthStore';
import { OrderResponse } from '../types/domain';

vi.mock('../services/orderService', () => ({
  orderService: {
    getUserOrder: vi.fn(),
  },
}));

vi.mock('../services/paymentService', () => ({
  paymentService: {
    getPayment: vi.fn(),
  },
}));

const mockOrder: OrderResponse = {
  id: 'ord-100',
  orderNumber: 'ORD-2026-00100',
  userId: 'user-1',
  status: 'PAID',
  subtotal: 2500,
  discountAmount: 0,
  shippingAmount: 60,
  customizationAmount: 0,
  totalAmount: 2560,
  currency: 'BDT',
  shippingRecipientName: 'Lionel Messi',
  shippingPhone: '01711112222',
  shippingDivision: 'Dhaka',
  shippingDistrict: 'Dhaka',
  shippingArea: 'Gulshan',
  shippingAddressLine: 'House 10, Road 2',
  items: [],
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

const renderSuccessPage = (searchParams = '?orderId=ord-100') => {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[`/payment/success${searchParams}`]}>
        <Routes>
          <Route path="/payment/success" element={<PaymentSuccessPage />} />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
};

describe('PaymentSuccessPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({
      user: { id: 'user-1', email: 'user@example.com', name: 'User', role: 'CUSTOMER', enabled: true, emailVerified: true },
      accessToken: 'token-123',
      isAuthenticated: true,
    });
  });

  it('renders payment successful message and order details', async () => {
    vi.mocked(orderService.getUserOrder).mockResolvedValue(mockOrder);

    renderSuccessPage('?orderId=ord-100');

    expect(await screen.findByText('Payment Successful!')).toBeInTheDocument();
    expect(await screen.findByText('ORD-2026-00100')).toBeInTheDocument();
    expect(screen.getByText('Lionel Messi (01711112222)')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /continue shopping/i })).toBeInTheDocument();
  });
});
