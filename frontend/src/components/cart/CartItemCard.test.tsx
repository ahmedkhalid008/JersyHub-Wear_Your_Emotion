import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { CartItemCard } from './CartItemCard';
import { CartItemResponse } from '../../types/domain';

const mockItem: CartItemResponse = {
  id: 'cart-item-1',
  productVariantId: 'var-1',
  productId: 'prod-1',
  productName: 'Barcelona Home Kit 24/25',
  productSlug: 'barcelona-home',
  sku: 'FCB-H-L',
  size: 'L' as unknown as import('../../types/domain').ProductVariant['size'],
  imageUrl: 'http://example.com/barca.jpg',
  unitPrice: 90,
  quantity: 2,
  subtotal: 180,
  active: true,
  stockQuantity: 10,
  available: true,
};

describe('CartItemCard Component', () => {
  it('renders cart item details and subtotal correctly', () => {
    render(
      <MemoryRouter>
        <CartItemCard item={mockItem} onUpdateQuantity={vi.fn()} onRemoveItem={vi.fn()} />
      </MemoryRouter>
    );

    expect(screen.getByText('Barcelona Home Kit 24/25')).toBeInTheDocument();
    expect(screen.getByText('Size: L')).toBeInTheDocument();
    expect(screen.getByText('৳90.00')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('৳180.00')).toBeInTheDocument();
  });

  it('triggers onUpdateQuantity when quantity buttons are clicked', () => {
    const handleUpdate = vi.fn();

    render(
      <MemoryRouter>
        <CartItemCard item={mockItem} onUpdateQuantity={handleUpdate} onRemoveItem={vi.fn()} />
      </MemoryRouter>
    );

    const increaseBtn = screen.getByRole('button', { name: /increase quantity/i });
    fireEvent.click(increaseBtn);

    expect(handleUpdate).toHaveBeenCalledWith('cart-item-1', 3);
  });

  it('triggers onRemoveItem when remove trash button is clicked', () => {
    const handleRemove = vi.fn();

    render(
      <MemoryRouter>
        <CartItemCard item={mockItem} onUpdateQuantity={vi.fn()} onRemoveItem={handleRemove} />
      </MemoryRouter>
    );

    const removeBtn = screen.getByRole('button', { name: /remove barcelona home kit/i });
    fireEvent.click(removeBtn);

    expect(handleRemove).toHaveBeenCalledWith('cart-item-1');
  });
});
