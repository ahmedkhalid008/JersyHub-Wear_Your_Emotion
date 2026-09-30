import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router';
import { AdminProductsPage } from './AdminProductsPage';
import { adminService } from '../../services/adminService';
import { useAuthStore } from '../../stores/useAuthStore';
import { ProductSummary, ProductDetailResponse, ProductVariantResponse } from '../../types/domain';

vi.mock('../../services/adminService');

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

const mockProductSummary: ProductSummary = {
  id: 'prod-100',
  name: 'Real Madrid 2024 Home Kit',
  slug: 'real-madrid-2024-home',
  basePrice: 4500,
  active: true,
  stockStatus: 'IN_STOCK',
  available: true,
  featured: true,
  primaryImageUrl: 'http://example.com/jersey.jpg',
};

const mockProductDetail: ProductDetailResponse = {
  id: 'prod-100',
  name: 'Real Madrid 2024 Home Kit',
  slug: 'real-madrid-2024-home',
  description: 'Official jersey',
  basePrice: 4500,
  active: true,
  stockStatus: 'IN_STOCK',
  available: true,
  featured: true,
  categories: [],
  images: [{ id: 'img-1', imageUrl: 'http://example.com/jersey.jpg', primary: true, sortOrder: 1 }],
  variants: [],
  createdAt: '2026-01-01',
  updatedAt: '2026-01-01',
};

const mockVariantResponse: ProductVariantResponse = {
  id: 'var-1',
  productId: 'prod-100',
  sku: 'BARCELONA-2024-AWAY-S',
  size: 'S',
  price: 2500,
  stockQuantity: 0,
  active: true,
};

describe('AdminProductsPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({
      user: { id: 'admin-1', email: '04324205191008@uits.edu.bd', name: 'Admin User', role: 'ADMIN', enabled: true, emailVerified: true },
      accessToken: 'token-123',
      isAuthenticated: true,
      isInitialized: true,
    });
  });

  it('renders products list and handles product status update', async () => {
    vi.mocked(adminService.getProducts).mockResolvedValue({
      content: [mockProductSummary],
      page: 0,
      size: 15,
      totalElements: 1,
      totalPages: 1,
      first: true,
      last: true,
    });
    vi.mocked(adminService.updateProductStatus).mockResolvedValue({
      ...mockProductDetail,
      active: false,
    });

    const queryClient = createTestQueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AdminProductsPage />
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(await screen.findByText('Real Madrid 2024 Home Kit')).toBeInTheDocument();

    const deactivateBtn = screen.getByText('Deactivate');
    fireEvent.click(deactivateBtn);

    await waitFor(() => {
      expect(adminService.updateProductStatus).toHaveBeenCalledWith('prod-100', false);
    });
  });

  it('opens create product modal and submits new product with size variants, stock, and image URL', async () => {
    vi.mocked(adminService.getProducts).mockResolvedValue({
      content: [],
      page: 0,
      size: 15,
      totalElements: 0,
      totalPages: 0,
      first: true,
      last: true,
    });
    vi.mocked(adminService.createProduct).mockResolvedValue(mockProductDetail);
    vi.mocked(adminService.createProductVariant).mockResolvedValue(mockVariantResponse);
    vi.mocked(adminService.adjustInventory).mockResolvedValue({});
    vi.mocked(adminService.addProductImage).mockResolvedValue({});

    const queryClient = createTestQueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AdminProductsPage />
        </MemoryRouter>
      </QueryClientProvider>
    );

    const addBtn = await screen.findByText('Add New Jersey');
    fireEvent.click(addBtn);

    expect(screen.getByRole('heading', { name: /Add New Jersey/i })).toBeInTheDocument();

    const nameInput = screen.getByPlaceholderText('e.g. Real Madrid 2026 Home Kit');
    fireEvent.change(nameInput, { target: { value: 'Barcelona 2024 Away' } });

    const imgInput = screen.getByPlaceholderText('https://images.unsplash.com/... or CDN image URL');
    fireEvent.change(imgInput, { target: { value: 'https://example.com/barcelona.jpg' } });

    const submitBtn = screen.getByRole('button', { name: 'Create Product & Seed Stock' });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(adminService.createProduct).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Barcelona 2024 Away',
          slug: 'barcelona-2024-away',
        })
      );
      expect(adminService.createProductVariant).toHaveBeenCalled();
      expect(adminService.adjustInventory).toHaveBeenCalled();
      expect(adminService.addProductImage).toHaveBeenCalledWith('prod-100', expect.objectContaining({
        imageUrl: 'https://example.com/barcelona.jpg',
        isPrimary: true,
      }));
    });
  });

  it('opens edit product modal and submits updated product details', async () => {
    vi.mocked(adminService.getProducts).mockResolvedValue({
      content: [mockProductSummary],
      page: 0,
      size: 15,
      totalElements: 1,
      totalPages: 1,
      first: true,
      last: true,
    });
    vi.mocked(adminService.updateProduct).mockResolvedValue(mockProductDetail);

    const queryClient = createTestQueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AdminProductsPage />
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(await screen.findByText('Real Madrid 2024 Home Kit')).toBeInTheDocument();

    const editBtn = screen.getByText('Edit');
    fireEvent.click(editBtn);

    expect(screen.getByRole('heading', { name: /Edit Jersey:/i })).toBeInTheDocument();

    const submitBtn = screen.getByRole('button', { name: 'Save Changes' });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(adminService.updateProduct).toHaveBeenCalledWith('prod-100', expect.objectContaining({
        name: 'Real Madrid 2024 Home Kit',
        slug: 'real-madrid-2024-home',
      }));
    });
  });

  it('deletes product when delete button is confirmed', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    vi.mocked(adminService.getProducts).mockResolvedValue({
      content: [mockProductSummary],
      page: 0,
      size: 15,
      totalElements: 1,
      totalPages: 1,
      first: true,
      last: true,
    });
    vi.mocked(adminService.deleteProduct).mockResolvedValue();

    const queryClient = createTestQueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AdminProductsPage />
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(await screen.findByText('Real Madrid 2024 Home Kit')).toBeInTheDocument();

    const deleteBtn = screen.getByLabelText('Delete product');
    fireEvent.click(deleteBtn);

    await waitFor(() => {
      expect(adminService.deleteProduct).toHaveBeenCalledWith('prod-100');
    });
  });
});
