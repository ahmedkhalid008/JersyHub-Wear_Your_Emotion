import { describe, it, expect, vi, beforeEach } from 'vitest';
import { paymentService } from './paymentService';
import { apiClient } from './api/client';
import { PaymentInitiateResponse, PaymentResponse } from '../types/domain';

vi.mock('./api/client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

describe('paymentService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initiatePayment calls POST /payments/sslcommerz/initiate', async () => {
    const mockResponse: PaymentInitiateResponse = {
      paymentId: 'pay-1',
      orderId: 'ord-123',
      transactionId: 'TXN-999',
      amount: 2310,
      currency: 'BDT',
      gatewayPageUrl: 'https://sandbox.sslcommerz.com/testgw',
      status: 'INITIATED',
    };

    vi.mocked(apiClient.post).mockResolvedValueOnce({
      success: true,
      data: mockResponse,
      message: 'Session created',
      timestamp: new Date().toISOString(),
    });

    const result = await paymentService.initiatePayment({ orderId: 'ord-123' });

    expect(apiClient.post).toHaveBeenCalledWith('/payments/sslcommerz/initiate', {
      orderId: 'ord-123',
    });
    expect(result).toEqual(mockResponse);
  });

  it('getPayment calls GET /payments/:id', async () => {
    const mockPayment: PaymentResponse = {
      id: 'pay-1',
      orderId: 'ord-123',
      transactionId: 'TXN-999',
      gateway: 'SSLCOMMERZ',
      amount: 2310,
      currency: 'BDT',
      status: 'SUCCESS',
      paidAt: '2026-09-29T10:05:00Z',
      createdAt: '2026-09-29T10:00:00Z',
      updatedAt: '2026-09-29T10:05:00Z',
    };

    vi.mocked(apiClient.get).mockResolvedValueOnce({
      success: true,
      data: mockPayment,
      message: 'Payment details',
      timestamp: new Date().toISOString(),
    });

    const result = await paymentService.getPayment('pay-1');

    expect(apiClient.get).toHaveBeenCalledWith('/payments/pay-1');
    expect(result).toEqual(mockPayment);
  });
});
