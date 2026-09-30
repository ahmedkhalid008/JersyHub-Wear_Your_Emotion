import { apiClient } from './api/client';
import { ApiResponse } from '../types/api';
import {
  CartResponse,
  AddToCartRequest,
  UpdateCartItemRequest,
  CouponApplyResponse,
} from '../types/domain';

export const cartService = {
  async getCart(): Promise<CartResponse> {
    const response: ApiResponse<CartResponse> = await apiClient.get<CartResponse>('/cart');
    return response.data;
  },

  async addItem(request: AddToCartRequest): Promise<CartResponse> {
    const response: ApiResponse<CartResponse> = await apiClient.post<CartResponse>(
      '/cart/items',
      request
    );
    return response.data;
  },

  async updateItemQuantity(
    cartItemId: string,
    request: UpdateCartItemRequest
  ): Promise<CartResponse> {
    const response: ApiResponse<CartResponse> = await apiClient.patch<CartResponse>(
      `/cart/items/${cartItemId}`,
      request
    );
    return response.data;
  },

  async removeItem(cartItemId: string): Promise<CartResponse> {
    const response: ApiResponse<CartResponse> = await apiClient.delete<CartResponse>(
      `/cart/items/${cartItemId}`
    );
    return response.data;
  },

  async clearCart(): Promise<CartResponse> {
    const response: ApiResponse<CartResponse> = await apiClient.delete<CartResponse>('/cart');
    return response.data;
  },

  async applyCoupon(code: string): Promise<CouponApplyResponse> {
    const response: ApiResponse<CouponApplyResponse> = await apiClient.post<CouponApplyResponse>(
      '/cart/coupon',
      { code }
    );
    return response.data;
  },

  async removeCoupon(): Promise<void> {
    await apiClient.delete<void>('/cart/coupon');
  },
};
