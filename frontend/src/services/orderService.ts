import { apiClient } from './api/client';
import { ApiResponse } from '../types/api';
import { CheckoutRequest, OrderResponse } from '../types/domain';

export const orderService = {
  async checkout(request: CheckoutRequest): Promise<OrderResponse> {
    const response: ApiResponse<OrderResponse> = await apiClient.post<OrderResponse>(
      '/orders/checkout',
      request
    );
    return response.data;
  },

  async getUserOrders(): Promise<OrderResponse[]> {
    const response: ApiResponse<OrderResponse[]> = await apiClient.get<OrderResponse[]>('/orders');
    return response.data;
  },

  async getUserOrder(orderId: string): Promise<OrderResponse> {
    const response: ApiResponse<OrderResponse> = await apiClient.get<OrderResponse>(
      `/orders/${orderId}`
    );
    return response.data;
  },

  async cancelOrder(orderId: string): Promise<OrderResponse> {
    const response: ApiResponse<OrderResponse> = await apiClient.patch<OrderResponse>(
      `/orders/${orderId}/cancel`
    );
    return response.data;
  },

  async downloadInvoice(orderId: string): Promise<Blob> {
    return apiClient.getBlob(`/orders/${orderId}/invoice`);
  },
};
