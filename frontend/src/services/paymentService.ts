import { apiClient } from './api/client';
import { ApiResponse } from '../types/api';
import { PaymentInitiateRequest, PaymentInitiateResponse, PaymentResponse } from '../types/domain';

export const paymentService = {
  async initiatePayment(request: PaymentInitiateRequest): Promise<PaymentInitiateResponse> {
    const response: ApiResponse<PaymentInitiateResponse> = await apiClient.post<PaymentInitiateResponse>(
      '/payments/sslcommerz/initiate',
      request
    );
    return response.data;
  },

  async getPayment(paymentId: string): Promise<PaymentResponse> {
    const response: ApiResponse<PaymentResponse> = await apiClient.get<PaymentResponse>(
      `/payments/${paymentId}`
    );
    return response.data;
  },
};
