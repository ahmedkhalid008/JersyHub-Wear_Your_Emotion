import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ProductCard } from './ProductCard';
import { ProductSummary } from '../../types/domain';

const mockProduct: ProductSummary = {
  id: 'prod-456',
  name: 'Arsenal Away Kit 24/25',
  slug: 'arsenal-away-24-25',
  brand: 'Adidas',
  team: 'Arsenal',
  league: 'Premier League',
  jerseyType: 'AWAY',
  authenticity: 'REPLICA',
  basePrice: 95.5,
  active: true,
  featured: false,
  primaryImageUrl: 'https://example.com/arsenal.jpg',
  stockStatus: 'IN_STOCK',
  available: true,
};

describe('ProductCard Component', () => {
  it('renders product details correctly', () => {
    render(
      <MemoryRouter>
        <ProductCard product={mockProduct} />
      </MemoryRouter>
    );

    expect(screen.getByText('Arsenal Away Kit 24/25')).toBeInTheDocument();
    expect(screen.getByText('Adidas')).toBeInTheDocument();
    expect(screen.getByText('Arsenal')).toBeInTheDocument();
    expect(screen.getByText('৳95.50')).toBeInTheDocument();
    expect(screen.getByText('In Stock')).toBeInTheDocument();
    expect(screen.getByText('Replica')).toBeInTheDocument();
  });

  it('links to product detail page /products/:id', () => {
    render(
      <MemoryRouter>
        <ProductCard product={mockProduct} />
      </MemoryRouter>
    );

    const link = screen.getByRole('link', { name: /Arsenal Away Kit 24\/25/i });
    expect(link).toHaveAttribute('href', '/products/prod-456');
  });

  it('renders fallback UI when primary image is missing or null', () => {
    const productNoImg: ProductSummary = {
      ...mockProduct,
      primaryImageUrl: null,
    };

    render(
      <MemoryRouter>
        <ProductCard product={productNoImg} />
      </MemoryRouter>
    );

    expect(screen.getByText('Jersey Image')).toBeInTheDocument();
  });
});
