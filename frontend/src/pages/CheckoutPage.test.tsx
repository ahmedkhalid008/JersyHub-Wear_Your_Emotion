import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CheckoutPage } from './CheckoutPage';
import { cartService } from '../services/cartService';
import { addressService } from '../services/addressService';
import { orderService } from '../services/orderService';
import { paymentService } from '../services/paymentService';
import { useAuthStore } from '../stores/useAuthStore';
import { CartResponse, AddressResponse, OrderResponse, PaymentInitiateResponse } from '../types/domain';

vi.mock('../services/cartService', () => ({
  cartService: {
    getCart: vi.fn(),
    clearCart: vi.fn(),
  },
}));

vi.mock('../services/addressService', () => ({
  addressService: {
    getAddresses: vi.fn(),
  },
}));

vi.mock('../services/orderService', () => ({
  orderService: {
    checkout: vi.fn(),
  },
}));

vi.mock('../services/paymentService', () => ({
  paymentService: {
    initiatePayment: vi.fn(),
  },
}));

const mockCart: CartResponse = {
  id: 'cart-1',
  userId: 'user-1',
  items: [
    {
      id: 'item-1',
      productVariantId: 'var-1',
      productId: 'prod-1',
      productName: 'Argentina 2026 Home Jersey',
      productSlug: 'argentina-2026-home',
      sku: 'ARG-L',
      size: 'L',
      imageUrl: 'http://example.com/arg.jpg',
      unitPrice: 2500,
      quantity: 1,
      subtotal: 2500,
      active: true,
      stockQuantity: 5,
      available: true,
    },
  ],
  total: 2500,
  totalItems: 1,
  createdAt: '2026-09-29T10:00:00Z',
  updatedAt: '2026-09-29T10:00:00Z',
};

const mockAddress: AddressResponse = {
  id: 'addr-1',
  recipientName: 'Lionel Messi',
  phone: '01711112222',
  division: 'Dhaka',
  district: 'Dhaka',
  area: 'Gulshan',
  addressLine: 'House 10, Road 2',
  postalCode: '1212',
  isDefault: true,
};

const mockOrder: OrderResponse = {
  id: 'ord-100',
  orderNumber: 'ORD-2026-00100',
  userId: 'user-1',
  status: 'PENDING_PAYMENT',
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

const mockPaymentResponse: PaymentInitiateResponse = {
  paymentId: 'pay-1',
  orderId: 'ord-100',
  transactionId: 'TXN-888',
  amount: 2560,
  currency: 'BDT',
  gatewayPageUrl: 'https://sandbox.sslcommerz.com/gwprocess/v4/api.php?sessionkey=MOCKSESSION',
  status: 'INITIATED',
};

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

const renderCheckoutPage = () => {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/checkout']}>
        <Routes>
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/login" element={<div>Login Page Destination</div>} />
          <Route path="/products" element={<div>Products Catalog</div>} />
          <Route path="/order-success" element={<div>Order Success Page Destination</div>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
};

describe('CheckoutPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({
      user: { id: 'user-1', email: 'user@example.com', name: 'User', role: 'CUSTOMER', enabled: true, emailVerified: true },
      accessToken: 'token-123',
      isAuthenticated: true,
    });
    vi.mocked(cartService.clearCart).mockResolvedValue({
      ...mockCart,
      items: [],
      total: 0,
      totalItems: 0,
    });
  });

  it('redirects unauthenticated user to login', () => {
    useAuthStore.setState({
      user: null,
      accessToken: null,
      isAuthenticated: false,
    });

    renderCheckoutPage();

    expect(screen.getByText('Login Page Destination')).toBeInTheDocument();
  });

  it('displays empty cart state when cart has 0 items', async () => {
    vi.mocked(cartService.getCart).mockResolvedValue({
      ...mockCart,
      items: [],
      total: 0,
      totalItems: 0,
    });
    vi.mocked(addressService.getAddresses).mockResolvedValue([mockAddress]);

    renderCheckoutPage();

    expect(await screen.findByText('Your cart is empty')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /browse jerseys/i })).toBeInTheDocument();
  });

  it('renders checkout page with address selection and order summary', async () => {
    vi.mocked(cartService.getCart).mockResolvedValue(mockCart);
    vi.mocked(addressService.getAddresses).mockResolvedValue([mockAddress]);

    renderCheckoutPage();

    expect(await screen.findByText('Secure Checkout')).toBeInTheDocument();
    expect(screen.getByText('Argentina 2026 Home Jersey')).toBeInTheDocument();
    expect(screen.getByText('Lionel Messi')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /place order & pay with sslcommerz/i })).toBeInTheDocument();
  });

  it('submits checkout order and initiates payment on click, clearing cart only after gateway URL response', async () => {
    vi.mocked(cartService.getCart).mockResolvedValue(mockCart);
    vi.mocked(addressService.getAddresses).mockResolvedValue([mockAddress]);
    vi.mocked(orderService.checkout).mockResolvedValue(mockOrder);
    vi.mocked(paymentService.initiatePayment).mockResolvedValue(mockPaymentResponse);

    // Mock window.location
    const originalLocation = window.location;
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { href: '' },
    });

    renderCheckoutPage();

    const submitBtn = await screen.findByRole('button', { name: /place order & pay with sslcommerz/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(orderService.checkout).toHaveBeenCalledWith({
        shippingAddressId: 'addr-1',
        paymentMethod: 'SSLCOMMERZ',
        items: [
          {
            productVariantId: 'var-1',
            quantity: 1,
          },
        ],
      });
      expect(paymentService.initiatePayment).toHaveBeenCalledWith({
        orderId: 'ord-100',
      });
      expect(cartService.clearCart).toHaveBeenCalled();
      expect(window.location.href).toBe('https://sandbox.sslcommerz.com/gwprocess/v4/api.php?sessionkey=MOCKSESSION');
    });

    Object.defineProperty(window, 'location', {
      writable: true,
      value: originalLocation,
    });
  });

  it('submits COD checkout order and clears cart only after receiving order success response', async () => {
    vi.mocked(cartService.getCart).mockResolvedValue(mockCart);
    vi.mocked(addressService.getAddresses).mockResolvedValue([mockAddress]);
    vi.mocked(orderService.checkout).mockResolvedValue(mockOrder);

    renderCheckoutPage();

    const codOption = await screen.findByText('Cash on Delivery (COD)');
    fireEvent.click(codOption);

    const submitBtn = screen.getByRole('button', { name: /confirm order \(cash on delivery\)/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(orderService.checkout).toHaveBeenCalledWith({
        shippingAddressId: 'addr-1',
        paymentMethod: 'CASH_ON_DELIVERY',
        items: [
          {
            productVariantId: 'var-1',
            quantity: 1,
          },
        ],
      });
      expect(cartService.clearCart).toHaveBeenCalled();
      expect(screen.getByText('Order Success Page Destination')).toBeInTheDocument();
    });
  });

  it('does NOT clear cart when order placement fails and displays error message', async () => {
    vi.mocked(cartService.getCart).mockResolvedValue(mockCart);
    vi.mocked(addressService.getAddresses).mockResolvedValue([mockAddress]);
    vi.mocked(orderService.checkout).mockRejectedValue(new Error('Network error during checkout'));

    renderCheckoutPage();

    const submitBtn = await screen.findByRole('button', { name: /place order & pay with sslcommerz/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(orderService.checkout).toHaveBeenCalled();
      expect(cartService.clearCart).not.toHaveBeenCalled();
      expect(screen.getByText('Network error during checkout')).toBeInTheDocument();
      // Ensure empty cart guard was NOT triggered
      expect(screen.queryByText('Your cart is empty')).not.toBeInTheDocument();
    });
  });
});
