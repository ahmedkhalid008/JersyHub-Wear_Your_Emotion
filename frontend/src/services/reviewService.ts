import { apiClient } from './api/client';
import { ApiResponse, PageResponse } from '../types/api';
import {
  ReviewResponse,
  ReviewSummaryResponse,
  CreateReviewRequest,
  UpdateReviewRequest,
} from '../types/domain';

export const reviewService = {
  async getProductReviews(
    productId: string,
    page = 0,
    size = 10
  ): Promise<PageResponse<ReviewResponse>> {
    const response: ApiResponse<PageResponse<ReviewResponse>> = await apiClient.get<
      PageResponse<ReviewResponse>
    >(`/products/${productId}/reviews?page=${page}&size=${size}&sort=createdAt,desc`, {
      skipAuth: true,
    });
    return response.data;
  },

  async getReviewSummary(productId: string): Promise<ReviewSummaryResponse> {
    const response: ApiResponse<ReviewSummaryResponse> = await apiClient.get<
      ReviewSummaryResponse
    >(`/products/${productId}/reviews/summary`, {
      skipAuth: true,
    });
    return response.data;
  },

  async createReview(productId: string, request: CreateReviewRequest): Promise<ReviewResponse> {
    const response: ApiResponse<ReviewResponse> = await apiClient.post<ReviewResponse>(
      `/products/${productId}/reviews`,
      request
    );
    return response.data;
  },

  async updateReview(
    productId: string,
    reviewId: string,
    request: UpdateReviewRequest
  ): Promise<ReviewResponse> {
    const response: ApiResponse<ReviewResponse> = await apiClient.put<ReviewResponse>(
      `/products/${productId}/reviews/${reviewId}`,
      request
    );
    return response.data;
  },

  async deleteReview(productId: string, reviewId: string): Promise<void> {
    await apiClient.delete<void>(`/products/${productId}/reviews/${reviewId}`);
  },
};
