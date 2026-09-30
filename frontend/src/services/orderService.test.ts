import { describe, it, expect, vi, beforeEach } from 'vitest';
import { orderService } from './orderService';
import { apiClient } from './api/client';
import { OrderResponse } from '../types/domain';

vi.mock('./api/client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    getBlob: vi.fn(),
  },
}));

describe('orderService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockOrder: OrderResponse = {
    id: 'ord-123',
    orderNumber: 'ORD-2026-001',
    userId: 'user-1',
    status: 'PENDING_PAYMENT',
    subtotal: 2500,
    discountAmount: 250,
    shippingAmount: 60,
    customizationAmount: 0,
    totalAmount: 2310,
    currency: 'BDT',
    shippingRecipientName: 'John Doe',
    shippingPhone: '01700000000',
    shippingDivision: 'Dhaka',
    shippingDistrict: 'Dhaka',
    shippingArea: 'Mirpur',
    shippingAddressLine: 'House 12, Road 5',
    items: [],
    createdAt: '2026-09-29T10:00:00Z',
    updatedAt: '2026-09-29T10:00:00Z',
  };

  it('checkout calls POST /orders/checkout and returns order response', async () => {
    vi.mocked(apiClient.post).mockResolvedValueOnce({
      success: true,
      data: mockOrder,
      message: 'Order created',
      timestamp: new Date().toISOString(),
    });

    const result = await orderService.checkout({
      shippingAddressId: 'addr-1',
      couponCode: 'SUMMER10',
    });

    expect(apiClient.post).toHaveBeenCalledWith('/orders/checkout', {
      shippingAddressId: 'addr-1',
      couponCode: 'SUMMER10',
    });
    expect(result).toEqual(mockOrder);
  });

  it('getUserOrders calls GET /orders and returns list of orders', async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({
      success: true,
      data: [mockOrder],
      message: 'Orders retrieved',
      timestamp: new Date().toISOString(),
    });

    const result = await orderService.getUserOrders();

    expect(apiClient.get).toHaveBeenCalledWith('/orders');
    expect(result).toEqual([mockOrder]);
  });

  it('getUserOrder calls GET /orders/:id and returns order detail', async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({
      success: true,
      data: mockOrder,
      message: 'Order retrieved',
      timestamp: new Date().toISOString(),
    });

    const result = await orderService.getUserOrder('ord-123');

    expect(apiClient.get).toHaveBeenCalledWith('/orders/ord-123');
    expect(result).toEqual(mockOrder);
  });

  it('cancelOrder calls PATCH /orders/:id/cancel', async () => {
    const cancelledOrder = { ...mockOrder, status: 'CANCELLED' as const };
    vi.mocked(apiClient.patch).mockResolvedValueOnce({
      success: true,
      data: cancelledOrder,
      message: 'Order cancelled',
      timestamp: new Date().toISOString(),
    });

    const result = await orderService.cancelOrder('ord-123');

    expect(apiClient.patch).toHaveBeenCalledWith('/orders/ord-123/cancel');
    expect(result.status).toBe('CANCELLED');
  });

  it('downloadInvoice calls GET /orders/:id/invoice and returns Blob', async () => {
    const mockBlob = new Blob(['pdf-binary-content'], { type: 'application/pdf' });
    vi.mocked(apiClient.getBlob).mockResolvedValueOnce(mockBlob);

    const result = await orderService.downloadInvoice('ord-123');

    expect(apiClient.getBlob).toHaveBeenCalledWith('/orders/ord-123/invoice');
    expect(result).toEqual(mockBlob);
  });
});
