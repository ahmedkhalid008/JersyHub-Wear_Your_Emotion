import { apiClient } from './api/client';
import { ApiResponse, PageResponse } from '../types/api';
import { ProductSummary, ProductDetailResponse, ProductQueryParams } from '../types/domain';

export const productService = {
  async getProducts(params: ProductQueryParams = {}): Promise<PageResponse<ProductSummary>> {
    const searchParams = new URLSearchParams();

    if (params.search && params.search.trim()) {
      searchParams.set('search', params.search.trim());
    }
    if (params.category && params.category.trim()) {
      searchParams.set('category', params.category.trim());
    }
    if (params.brand && params.brand.trim()) {
      searchParams.set('brand', params.brand.trim());
    }
    if (params.team && params.team.trim()) {
      searchParams.set('team', params.team.trim());
    }
    if (params.league && params.league.trim()) {
      searchParams.set('league', params.league.trim());
    }
    if (params.season && params.season.trim()) {
      searchParams.set('season', params.season.trim());
    }
    if (params.jerseyType) {
      searchParams.set('jerseyType', params.jerseyType);
    }
    if (params.authenticity) {
      searchParams.set('authenticity', params.authenticity);
    }
    if (params.featured !== undefined && params.featured !== null) {
      searchParams.set('featured', String(params.featured));
    }
    if (params.minPrice !== undefined && params.minPrice !== null && !isNaN(params.minPrice)) {
      searchParams.set('minPrice', String(params.minPrice));
    }
    if (params.maxPrice !== undefined && params.maxPrice !== null && !isNaN(params.maxPrice)) {
      searchParams.set('maxPrice', String(params.maxPrice));
    }
    if (params.sort && params.sort.trim()) {
      searchParams.set('sort', params.sort.trim());
    } else {
      searchParams.set('sort', 'newest');
    }
    if (params.page !== undefined && params.page !== null && params.page >= 0) {
      searchParams.set('page', String(params.page));
    } else {
      searchParams.set('page', '0');
    }
    if (params.size !== undefined && params.size !== null && params.size > 0) {
      searchParams.set('size', String(params.size));
    } else {
      searchParams.set('size', '20');
    }

    const queryString = searchParams.toString();
    const endpoint = `/products${queryString ? `?${queryString}` : ''}`;

    const response: ApiResponse<PageResponse<ProductSummary>> = await apiClient.get<PageResponse<ProductSummary>>(
      endpoint,
      { skipAuth: true }
    );
    return response.data;
  },

  async getProductById(id: string): Promise<ProductDetailResponse> {
    const response: ApiResponse<ProductDetailResponse> = await apiClient.get<ProductDetailResponse>(
      `/products/${id}`,
      { skipAuth: true }
    );
    return response.data;
  },

  async getProductBySlug(slug: string): Promise<ProductDetailResponse> {
    const response: ApiResponse<ProductDetailResponse> = await apiClient.get<ProductDetailResponse>(
      `/products/slug/${slug}`,
      { skipAuth: true }
    );
    return response.data;
  },
};
