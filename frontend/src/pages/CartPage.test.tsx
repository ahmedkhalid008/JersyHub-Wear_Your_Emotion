import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CartPage } from './CartPage';
import { cartService } from '../services/cartService';
import { useAuthStore } from '../stores/useAuthStore';
import { CartResponse } from '../types/domain';

vi.mock('../services/cartService', () => ({
  cartService: {
    getCart: vi.fn(),
    addItem: vi.fn(),
    updateItemQuantity: vi.fn(),
    removeItem: vi.fn(),
    clearCart: vi.fn(),
    applyCoupon: vi.fn(),
    removeCoupon: vi.fn(),
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
      productName: 'Real Madrid Home Kit',
      productSlug: 'real-madrid-home',
      sku: 'RM-M',
      size: 'M' as unknown as import('../types/domain').ProductVariant['size'],
      imageUrl: 'http://example.com/rm.jpg',
      unitPrice: 120,
      quantity: 1,
      subtotal: 120,
      active: true,
      stockQuantity: 10,
      available: true,
    },
  ],
  total: 120,
  totalItems: 1,
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
};

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

const renderCartPage = () => {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/cart']}>
        <Routes>
          <Route path="/cart" element={<CartPage />} />
          <Route path="/login" element={<div>Login Page</div>} />
          <Route path="/products" element={<div>Products Page</div>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
};

describe('CartPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({
      user: { id: 'user-1', email: 'user@example.com', name: 'User', role: 'CUSTOMER', enabled: true, emailVerified: true },
      accessToken: 'token',
      isAuthenticated: true,
    });
  });

  it('renders cart page with items and order summary', async () => {
    vi.mocked(cartService.getCart).mockResolvedValue(mockCart);

    renderCartPage();

    expect(await screen.findByText('Real Madrid Home Kit')).toBeInTheDocument();
    expect(screen.getByText('Shopping Cart')).toBeInTheDocument();
    expect(screen.getByText('Order Summary')).toBeInTheDocument();
  });

  it('renders empty cart state when user cart is empty', async () => {
    vi.mocked(cartService.getCart).mockResolvedValue({
      ...mockCart,
      items: [],
      total: 0,
      totalItems: 0,
    });

    renderCartPage();

    expect(await screen.findByText('Your cart is empty')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /continue shopping/i })).toBeInTheDocument();
  });

  it('prompts unauthenticated user to sign in', () => {
    useAuthStore.setState({
      user: null,
      accessToken: null,
      isAuthenticated: false,
    });

    renderCartPage();

    expect(screen.getByText('Sign in to view your cart')).toBeInTheDocument();
  });
});
