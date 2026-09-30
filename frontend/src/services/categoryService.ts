import { apiClient } from './api/client';
import { ApiResponse } from '../types/api';
import { CategoryResponse } from '../types/domain';

export const categoryService = {
  async getCategories(): Promise<CategoryResponse[]> {
    const response: ApiResponse<CategoryResponse[]> = await apiClient.get<CategoryResponse[]>('/categories', {
      skipAuth: true,
    });
    return response.data || [];
  },

  async getCategoryById(id: string): Promise<CategoryResponse> {
    const response: ApiResponse<CategoryResponse> = await apiClient.get<CategoryResponse>(`/categories/${id}`, {
      skipAuth: true,
    });
    return response.data;
  },

  async getCategoryBySlug(slug: string): Promise<CategoryResponse> {
    const response: ApiResponse<CategoryResponse> = await apiClient.get<CategoryResponse>(`/categories/slug/${slug}`, {
      skipAuth: true,
    });
    return response.data;
  },
};
