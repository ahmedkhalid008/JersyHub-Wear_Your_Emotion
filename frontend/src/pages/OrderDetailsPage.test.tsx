import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { OrderDetailsPage } from './OrderDetailsPage';
import { orderService } from '../services/orderService';
import { useAuthStore } from '../stores/useAuthStore';
import { OrderResponse } from '../types/domain';

vi.mock('../services/orderService', () => ({
  orderService: {
    getUserOrder: vi.fn(),
    downloadInvoice: vi.fn(),
    cancelOrder: vi.fn(),
  },
}));

const mockOrder: OrderResponse = {
  id: 'ord-100',
  orderNumber: 'ORD-2026-00100',
  userId: 'user-1',
  status: 'PAID',
  subtotal: 3000,
  discountAmount: 300,
  shippingAmount: 60,
  customizationAmount: 0,
  totalAmount: 2760,
  currency: 'BDT',
  shippingRecipientName: 'Kylian Mbappe',
  shippingPhone: '01799887766',
  shippingDivision: 'Dhaka',
  shippingDistrict: 'Dhaka',
  shippingArea: 'Uttara',
  shippingAddressLine: 'Sector 4, Road 12',
  shippingPostalCode: '1230',
  items: [
    {
      id: 'item-10',
      productId: 'prod-10',
      productVariantId: 'var-10',
      productName: 'France 2026 Home Jersey',
      size: 'XL',
      sku: 'FRA-XL',
      unitPrice: 3000,
      quantity: 1,
      subtotal: 3000,
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

const renderOrderDetailsPage = (orderId = 'ord-100') => {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[`/orders/${orderId}`]}>
        <Routes>
          <Route path="/orders/:orderId" element={<OrderDetailsPage />} />
          <Route path="/login" element={<div>Login Destination</div>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
};

describe('OrderDetailsPage Component', () => {
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

    renderOrderDetailsPage();

    expect(screen.getByText('Login Destination')).toBeInTheDocument();
  });

  it('renders order details, itemized snapshot, and totals correctly', async () => {
    vi.mocked(orderService.getUserOrder).mockResolvedValue(mockOrder);

    renderOrderDetailsPage('ord-100');

    expect(await screen.findByText('ORD-2026-00100')).toBeInTheDocument();
    expect(screen.getByText('France 2026 Home Jersey')).toBeInTheDocument();
    expect(screen.getByText(/Kylian Mbappe/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /download pdf invoice/i })).toBeInTheDocument();
  });

  it('triggers downloadInvoice when Download PDF Invoice is clicked', async () => {
    vi.mocked(orderService.getUserOrder).mockResolvedValue(mockOrder);
    const mockBlob = new Blob(['dummy pdf'], { type: 'application/pdf' });
    vi.mocked(orderService.downloadInvoice).mockResolvedValue(mockBlob);

    // Mock URL.createObjectURL
    window.URL.createObjectURL = vi.fn().mockReturnValue('blob:http://localhost/mock-url');
    window.URL.revokeObjectURL = vi.fn();

    renderOrderDetailsPage('ord-100');

    const downloadBtn = await screen.findByRole('button', { name: /download pdf invoice/i });
    fireEvent.click(downloadBtn);

    await waitFor(() => {
      expect(orderService.downloadInvoice).toHaveBeenCalledWith('ord-100');
    });
  });
});
