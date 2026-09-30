import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ProductsPage } from './ProductsPage';
import { productService } from '../services/productService';
import { categoryService } from '../services/categoryService';
import { PageResponse } from '../types/api';
import { ProductSummary } from '../types/domain';

vi.mock('../services/productService', () => ({
  productService: {
    getProducts: vi.fn(),
  },
}));

vi.mock('../services/categoryService', () => ({
  categoryService: {
    getCategories: vi.fn(),
  },
}));

const mockProducts: ProductSummary[] = [
  {
    id: 'prod-1',
    name: 'Real Madrid Home Kit 24/25',
    slug: 'real-madrid-home',
    brand: 'Adidas',
    team: 'Real Madrid',
    league: 'La Liga',
    jerseyType: 'HOME',
    authenticity: 'AUTHENTIC',
    basePrice: 120,
    active: true,
    featured: true,
    primaryImageUrl: 'http://example.com/rm.jpg',
    stockStatus: 'IN_STOCK',
    available: true,
  },
  {
    id: 'prod-2',
    name: 'Barcelona Away Kit 24/25',
    slug: 'barcelona-away',
    brand: 'Nike',
    team: 'FC Barcelona',
    league: 'La Liga',
    jerseyType: 'AWAY',
    authenticity: 'REPLICA',
    basePrice: 90,
    active: true,
    featured: false,
    primaryImageUrl: 'http://example.com/barca.jpg',
    stockStatus: 'IN_STOCK',
    available: true,
  },
];

const mockPageResponse: PageResponse<ProductSummary> = {
  content: mockProducts,
  page: 0,
  size: 20,
  totalElements: 2,
  totalPages: 1,
  first: true,
  last: true,
};

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

const renderProductsPage = (initialEntries = ['/products']) => {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={initialEntries}>
        <Routes>
          <Route path="/products" element={<ProductsPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
};

describe('ProductsPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(categoryService.getCategories).mockResolvedValue([]);
  });

  it('renders products list successfully', async () => {
    vi.mocked(productService.getProducts).mockResolvedValue(mockPageResponse);

    renderProductsPage();

    expect(await screen.findByText('Real Madrid Home Kit 24/25')).toBeInTheDocument();
    expect(screen.getByText('Barcelona Away Kit 24/25')).toBeInTheDocument();
  });

  it('renders empty state when no products match search or filter criteria', async () => {
    vi.mocked(productService.getProducts).mockResolvedValue({
      content: [],
      page: 0,
      size: 20,
      totalElements: 0,
      totalPages: 0,
      first: true,
      last: true,
    });

    renderProductsPage(['/products?search=NonExistentKit']);

    expect(await screen.findByText('No football kits found')).toBeInTheDocument();
    expect(screen.getByText(/No jerseys match your current search and filter criteria/i)).toBeInTheDocument();
  });

  it('renders error state and handles retry button click', async () => {
    vi.mocked(productService.getProducts).mockRejectedValue(new Error('Network error'));

    renderProductsPage();

    expect(await screen.findByText('Failed to load product catalog')).toBeInTheDocument();

    const retryButton = screen.getByRole('button', { name: /try again/i });
    expect(retryButton).toBeInTheDocument();

    vi.mocked(productService.getProducts).mockResolvedValue(mockPageResponse);
    fireEvent.click(retryButton);

    await waitFor(() => {
      expect(screen.getByText('Real Madrid Home Kit 24/25')).toBeInTheDocument();
    });
  });

  it('triggers search update when user types in search input', async () => {
    vi.mocked(productService.getProducts).mockResolvedValue(mockPageResponse);

    renderProductsPage();

    const searchInput = await screen.findByRole('searchbox', { name: /search products/i });
    fireEvent.change(searchInput, { target: { value: 'Arsenal' } });

    await waitFor(() => {
      expect(productService.getProducts).toHaveBeenCalledWith(
        expect.objectContaining({
          search: 'Arsenal',
        })
      );
    });
  });

  it('triggers sort update when sort option is changed', async () => {
    vi.mocked(productService.getProducts).mockResolvedValue(mockPageResponse);

    renderProductsPage();

    const sortSelect = await screen.findByRole('combobox', { name: /sort products/i });
    fireEvent.change(sortSelect, { target: { value: 'price_asc' } });

    await waitFor(() => {
      expect(productService.getProducts).toHaveBeenCalledWith(
        expect.objectContaining({
          sort: 'price_asc',
        })
      );
    });
  });
});
