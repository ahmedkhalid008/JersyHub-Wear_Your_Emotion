import { describe, it, expect, vi, beforeEach } from 'vitest';
import { cartService } from './cartService';
import { apiClient } from './api/client';
import { CartResponse, CartItemResponse, CouponApplyResponse } from '../types/domain';

vi.mock('./api/client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('cartService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockItem: CartItemResponse = {
    id: 'item-1',
    productVariantId: 'var-1',
    productId: 'prod-1',
    productName: 'Real Madrid Home Kit',
    productSlug: 'real-madrid-home',
    sku: 'RM-H-M',
    size: 'M' as unknown as import('../types/domain').ProductVariant['size'],
    imageUrl: 'http://example.com/rm.jpg',
    unitPrice: 100,
    quantity: 2,
    subtotal: 200,
    active: true,
    stockQuantity: 10,
    available: true,
  };

  const mockCart: CartResponse = {
    id: 'cart-1',
    userId: 'user-1',
    items: [mockItem],
    total: 200,
    totalItems: 2,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  };

  it('fetches authenticated user cart', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      success: true,
      message: 'Success',
      data: mockCart,
      timestamp: '2025-01-01T00:00:00Z',
    });

    const result = await cartService.getCart();

    expect(apiClient.get).toHaveBeenCalledWith('/cart');
    expect(result).toEqual(mockCart);
  });

  it('adds product variant item to cart', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({
      success: true,
      message: 'Added',
      data: mockCart,
      timestamp: '2025-01-01T00:00:00Z',
    });

    const result = await cartService.addItem({ productVariantId: 'var-1', quantity: 1 });

    expect(apiClient.post).toHaveBeenCalledWith('/cart/items', {
      productVariantId: 'var-1',
      quantity: 1,
    });
    expect(result).toEqual(mockCart);
  });

  it('updates cart item quantity', async () => {
    vi.mocked(apiClient.patch).mockResolvedValue({
      success: true,
      message: 'Updated',
      data: mockCart,
      timestamp: '2025-01-01T00:00:00Z',
    });

    const result = await cartService.updateItemQuantity('item-1', { quantity: 3 });

    expect(apiClient.patch).toHaveBeenCalledWith('/cart/items/item-1', { quantity: 3 });
    expect(result).toEqual(mockCart);
  });

  it('removes item from cart', async () => {
    vi.mocked(apiClient.delete).mockResolvedValue({
      success: true,
      message: 'Removed',
      data: mockCart,
      timestamp: '2025-01-01T00:00:00Z',
    });

    await cartService.removeItem('item-1');

    expect(apiClient.delete).toHaveBeenCalledWith('/cart/items/item-1');
  });

  it('clears all items from cart', async () => {
    vi.mocked(apiClient.delete).mockResolvedValue({
      success: true,
      message: 'Cleared',
      data: { ...mockCart, items: [], total: 0, totalItems: 0 },
      timestamp: '2025-01-01T00:00:00Z',
    });

    await cartService.clearCart();

    expect(apiClient.delete).toHaveBeenCalledWith('/cart');
  });

  it('applies coupon to cart session', async () => {
    const mockCouponResponse: CouponApplyResponse = {
      couponCode: 'WELCOME10',
      discountType: 'PERCENTAGE',
      discountAmount: 20,
      subtotal: 200,
      shippingAmount: 0,
      totalAfterDiscount: 180,
    };

    vi.mocked(apiClient.post).mockResolvedValue({
      success: true,
      message: 'Applied',
      data: mockCouponResponse,
      timestamp: '2025-01-01T00:00:00Z',
    });

    const result = await cartService.applyCoupon('WELCOME10');

    expect(apiClient.post).toHaveBeenCalledWith('/cart/coupon', { code: 'WELCOME10' });
    expect(result).toEqual(mockCouponResponse);
  });

  it('removes coupon from cart session', async () => {
    vi.mocked(apiClient.delete).mockResolvedValue({
      success: true,
      message: 'Removed',
      data: null,
      timestamp: '2025-01-01T00:00:00Z',
    });

    await cartService.removeCoupon();

    expect(apiClient.delete).toHaveBeenCalledWith('/cart/coupon');
  });
});
