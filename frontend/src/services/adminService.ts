import { apiClient } from './api/client';
import { ApiResponse, PageResponse } from '../types/api';
import {
  AdminDashboardSummaryResponse,
  AdminOrderSummaryResponse,
  AdminOrderDetailResponse,
  AdminUserResponse,
  AdminReviewResponse,
  CouponResponse,
  CouponCreateRequest,
  ProductSummary,
  ProductDetailResponse,
  ProductCreateRequest,
  ProductUpdateRequest,
  ProductVariantAdminCreateRequest,
  ProductVariantResponse,
  InventoryAdjustmentRequest,
  ProductImageCreateRequest,
} from '../types/domain';

export const adminService = {
  // Dashboard
  async getDashboardSummary(): Promise<AdminDashboardSummaryResponse> {
    const response: ApiResponse<AdminDashboardSummaryResponse> = await apiClient.get(
      '/admin/dashboard/summary'
    );
    return response.data;
  },

  // Orders
  async getOrders(status?: string, page = 0, size = 20): Promise<PageResponse<AdminOrderSummaryResponse>> {
    const params = new URLSearchParams({ page: page.toString(), size: size.toString() });
    if (status) params.append('status', status);

    const response: ApiResponse<PageResponse<AdminOrderSummaryResponse>> = await apiClient.get(
      `/admin/orders?${params.toString()}`
    );
    return response.data;
  },

  async getOrderById(id: string): Promise<AdminOrderDetailResponse> {
    const response: ApiResponse<AdminOrderDetailResponse> = await apiClient.get(
      `/admin/orders/${id}`
    );
    return response.data;
  },

  // Users
  async getUsers(page = 0, size = 20): Promise<PageResponse<AdminUserResponse>> {
    const params = new URLSearchParams({ page: page.toString(), size: size.toString() });
    const response: ApiResponse<PageResponse<AdminUserResponse>> = await apiClient.get(
      `/admin/users?${params.toString()}`
    );
    return response.data;
  },

  async getUserById(id: string): Promise<AdminUserResponse> {
    const response: ApiResponse<AdminUserResponse> = await apiClient.get(`/admin/users/${id}`);
    return response.data;
  },

  // Products
  async getProducts(
    search?: string,
    active?: boolean,
    page = 0,
    size = 20
  ): Promise<PageResponse<ProductSummary>> {
    const params = new URLSearchParams({ page: page.toString(), size: size.toString() });
    if (search) params.append('search', search);
    if (active !== undefined) params.append('active', active.toString());

    const response: ApiResponse<PageResponse<ProductSummary>> = await apiClient.get(
      `/admin/products?${params.toString()}`
    );
    return response.data;
  },

  async createProduct(request: ProductCreateRequest): Promise<ProductDetailResponse> {
    const response: ApiResponse<ProductDetailResponse> = await apiClient.post(
      '/admin/products',
      request
    );
    return response.data;
  },

  async updateProduct(id: string, request: ProductUpdateRequest): Promise<ProductDetailResponse> {
    const response: ApiResponse<ProductDetailResponse> = await apiClient.put(
      `/admin/products/${id}`,
      request
    );
    return response.data;
  },

  async updateProductStatus(id: string, active: boolean): Promise<ProductDetailResponse> {
    const response: ApiResponse<ProductDetailResponse> = await apiClient.patch(
      `/admin/products/${id}/status`,
      { active }
    );
    return response.data;
  },

  async deleteProduct(id: string): Promise<void> {
    await apiClient.delete(`/admin/products/${id}`);
  },

  async createProductVariant(
    productId: string,
    request: ProductVariantAdminCreateRequest
  ): Promise<ProductVariantResponse> {
    const response: ApiResponse<ProductVariantResponse> = await apiClient.post(
      `/admin/products/${productId}/variants`,
      request
    );
    return response.data;
  },

  async adjustInventory(request: InventoryAdjustmentRequest): Promise<unknown> {
    const response: ApiResponse<unknown> = await apiClient.post(
      '/admin/inventory/adjust',
      request
    );
    return response.data;
  },

  async addProductImage(
    productId: string,
    request: ProductImageCreateRequest
  ): Promise<unknown> {
    const response: ApiResponse<unknown> = await apiClient.post(
      `/admin/products/${productId}/images`,
      request
    );
    return response.data;
  },

  // Coupons
  async getCoupons(page = 0, size = 20): Promise<PageResponse<CouponResponse>> {
    const params = new URLSearchParams({ page: page.toString(), size: size.toString() });
    const response: ApiResponse<PageResponse<CouponResponse>> = await apiClient.get(
      `/admin/coupons?${params.toString()}`
    );
    return response.data;
  },

  async createCoupon(request: CouponCreateRequest): Promise<CouponResponse> {
    const response: ApiResponse<CouponResponse> = await apiClient.post('/admin/coupons', request);
    return response.data;
  },

  async activateCoupon(id: string): Promise<CouponResponse> {
    const response: ApiResponse<CouponResponse> = await apiClient.patch(
      `/admin/coupons/${id}/activate`
    );
    return response.data;
  },

  async deactivateCoupon(id: string): Promise<CouponResponse> {
    const response: ApiResponse<CouponResponse> = await apiClient.patch(
      `/admin/coupons/${id}/deactivate`
    );
    return response.data;
  },

  async deleteCoupon(id: string): Promise<void> {
    await apiClient.delete(`/admin/coupons/${id}`);
  },

  // Reviews Moderation
  async getReviews(approved?: boolean, page = 0, size = 20): Promise<PageResponse<AdminReviewResponse>> {
    const params = new URLSearchParams({ page: page.toString(), size: size.toString() });
    if (approved !== undefined) params.append('approved', approved.toString());

    const response: ApiResponse<PageResponse<AdminReviewResponse>> = await apiClient.get(
      `/admin/reviews?${params.toString()}`
    );
    return response.data;
  },

  async approveReview(id: string): Promise<AdminReviewResponse> {
    const response: ApiResponse<AdminReviewResponse> = await apiClient.patch(
      `/admin/reviews/${id}/approve`
    );
    return response.data;
  },

  async rejectReview(id: string): Promise<AdminReviewResponse> {
    const response: ApiResponse<AdminReviewResponse> = await apiClient.patch(
      `/admin/reviews/${id}/reject`
    );
    return response.data;
  },
};
