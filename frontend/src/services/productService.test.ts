import { describe, it, expect, vi, beforeEach } from 'vitest';
import { productService } from './productService';
import { apiClient } from './api/client';
import { ApiResponse, PageResponse } from '../types/api';
import { ProductSummary, ProductDetailResponse } from '../types/domain';

vi.mock('./api/client', () => ({
  apiClient: {
    get: vi.fn(),
  },
}));

describe('productService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockProductSummary: ProductSummary = {
    id: 'prod-123',
    name: 'Real Madrid Home Kit 24/25',
    slug: 'real-madrid-home-24-25',
    brand: 'Adidas',
    team: 'Real Madrid',
    league: 'La Liga',
    jerseyType: 'HOME',
    authenticity: 'AUTHENTIC',
    basePrice: 120,
    active: true,
    featured: true,
    primaryImageUrl: 'https://example.com/real-madrid.jpg',
    stockStatus: 'IN_STOCK',
    available: true,
  };

  const mockPageResponse: PageResponse<ProductSummary> = {
    content: [mockProductSummary],
    page: 0,
    size: 20,
    totalElements: 1,
    totalPages: 1,
    first: true,
    last: true,
  };

  const mockApiResponse: ApiResponse<PageResponse<ProductSummary>> = {
    success: true,
    message: 'Products retrieved successfully',
    data: mockPageResponse,
    timestamp: new Date().toISOString(),
  };

  it('fetches products with default query parameters', async () => {
    vi.mocked(apiClient.get).mockResolvedValue(mockApiResponse);

    const result = await productService.getProducts();

    expect(apiClient.get).toHaveBeenCalledWith('/products?sort=newest&page=0&size=20', {
      skipAuth: true,
    });
    expect(result).toEqual(mockPageResponse);
  });

  it('formats custom search, filter, sort, and pagination query params correctly', async () => {
    vi.mocked(apiClient.get).mockResolvedValue(mockApiResponse);

    await productService.getProducts({
      search: 'Barcelona',
      category: 'la-liga-kits',
      brand: 'Nike',
      jerseyType: 'HOME',
      authenticity: 'AUTHENTIC',
      minPrice: 50,
      maxPrice: 150,
      sort: 'price_asc',
      page: 2,
      size: 12,
    });

    const calledEndpoint = vi.mocked(apiClient.get).mock.calls[0][0];
    const url = new URL(`http://localhost${calledEndpoint}`);

    expect(url.searchParams.get('search')).toBe('Barcelona');
    expect(url.searchParams.get('category')).toBe('la-liga-kits');
    expect(url.searchParams.get('brand')).toBe('Nike');
    expect(url.searchParams.get('jerseyType')).toBe('HOME');
    expect(url.searchParams.get('authenticity')).toBe('AUTHENTIC');
    expect(url.searchParams.get('minPrice')).toBe('50');
    expect(url.searchParams.get('maxPrice')).toBe('150');
    expect(url.searchParams.get('sort')).toBe('price_asc');
    expect(url.searchParams.get('page')).toBe('2');
    expect(url.searchParams.get('size')).toBe('12');
  });

  it('fetches product by ID', async () => {
    const mockDetail: ProductDetailResponse = {
      ...mockProductSummary,
      description: 'Official kit',
      country: 'Spain',
      season: '2024/2025',
      material: '100% Polyester',
      categories: [],
      images: [],
      variants: [],
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
    };

    vi.mocked(apiClient.get).mockResolvedValue({
      success: true,
      message: 'Success',
      data: mockDetail,
      timestamp: new Date().toISOString(),
    });

    const result = await productService.getProductById('prod-123');

    expect(apiClient.get).toHaveBeenCalledWith('/products/prod-123', { skipAuth: true });
    expect(result).toEqual(mockDetail);
  });
});
