import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ProductDetailsPage } from './ProductDetailsPage';
import { productService } from '../services/productService';
import { reviewService } from '../services/reviewService';
import { ProductDetailResponse } from '../types/domain';

vi.mock('../services/productService', () => ({
  productService: {
    getProductById: vi.fn(),
  },
}));

vi.mock('../services/reviewService', () => ({
  reviewService: {
    getProductReviews: vi.fn(),
    getReviewSummary: vi.fn(),
    createReview: vi.fn(),
    updateReview: vi.fn(),
    deleteReview: vi.fn(),
  },
}));

const mockProductDetail: ProductDetailResponse = {
  id: 'prod-999',
  name: 'Manchester City Home Kit 24/25',
  slug: 'man-city-home-24-25',
  description: 'Official player version home kit featuring DryCELL tech.',
  brand: 'Puma',
  team: 'Manchester City',
  league: 'Premier League',
  country: 'England',
  season: '2024/2025',
  jerseyType: 'HOME',
  authenticity: 'AUTHENTIC',
  material: '100% Recycled Polyester',
  basePrice: 110,
  active: true,
  featured: true,
  categories: [{ id: 'cat-1', name: 'Premier League', slug: 'premier-league', active: true, children: [] }],
  images: [{ id: 'img-1', imageUrl: 'http://example.com/mancity.jpg', primary: true, sortOrder: 1 }],
  variants: [
    { id: 'v-1', size: 'M', stockQuantity: 10, additionalPrice: 0, active: true },
    { id: 'v-2', size: 'L', stockQuantity: 0, additionalPrice: 5, active: true },
  ],
  stockStatus: 'IN_STOCK',
  available: true,
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
};

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

const renderProductDetailsPage = (productId = 'prod-999') => {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[`/products/${productId}`]}>
        <Routes>
          <Route path="/products/:productId" element={<ProductDetailsPage />} />
          <Route path="/products" element={<div>Products Catalog Page</div>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
};

describe('ProductDetailsPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(reviewService.getReviewSummary).mockResolvedValue({
      productId: 'prod-999',
      averageRating: 4.5,
      totalReviews: 2,
    });
    vi.mocked(reviewService.getProductReviews).mockResolvedValue({
      content: [],
      page: 0,
      size: 10,
      totalElements: 0,
      totalPages: 0,
      first: true,
      last: true,
    });
  });

  it('renders product details and specifications successfully', async () => {
    vi.mocked(productService.getProductById).mockResolvedValue(mockProductDetail);

    renderProductDetailsPage();

    expect(await screen.findByRole('heading', { name: 'Manchester City Home Kit 24/25' })).toBeInTheDocument();
    expect(screen.getByText('Puma')).toBeInTheDocument();
    expect(screen.getByText('Manchester City')).toBeInTheDocument();
    expect(screen.getByText('৳110.00')).toBeInTheDocument();
    expect(screen.getByText('In Stock')).toBeInTheDocument();
    expect(screen.getByText('Player Authentic')).toBeInTheDocument();
    expect(screen.getByText('Select Jersey Size')).toBeInTheDocument();
    expect(screen.getByText('M')).toBeInTheDocument();
    expect(screen.getByText('L')).toBeInTheDocument();
  });

  it('updates price display when a variant with additional price is selected', async () => {
    vi.mocked(productService.getProductById).mockResolvedValue(mockProductDetail);

    renderProductDetailsPage();

    const sizeM = await screen.findByRole('button', { name: /Select size M/i });
    fireEvent.click(sizeM);

    expect(screen.getByText('Selected Size: M')).toBeInTheDocument();
  });

  it('renders Product Not Found state when product API returns null', async () => {
    vi.mocked(productService.getProductById).mockResolvedValue(null as unknown as ProductDetailResponse);

    renderProductDetailsPage('non-existent');

    expect(await screen.findByText('Product Not Found')).toBeInTheDocument();
    expect(
      screen.getByText('The requested jersey could not be found or is no longer available in our store.')
    ).toBeInTheDocument();
  });

  it('renders error state when product fetch fails', async () => {
    vi.mocked(productService.getProductById).mockRejectedValue(new Error('Server error'));

    renderProductDetailsPage();

    expect(await screen.findByText('Could not load product details')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
  });
});
