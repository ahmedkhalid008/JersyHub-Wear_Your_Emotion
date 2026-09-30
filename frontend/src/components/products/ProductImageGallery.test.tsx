import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProductImageGallery } from './ProductImageGallery';
import { ProductImage } from '../../types/domain';

const mockImages: ProductImage[] = [
  { id: 'img-1', imageUrl: 'http://example.com/front.jpg', primary: true, sortOrder: 1 },
  { id: 'img-2', imageUrl: 'http://example.com/back.jpg', primary: false, sortOrder: 2 },
];

describe('ProductImageGallery Component', () => {
  it('renders primary product image preview', () => {
    render(<ProductImageGallery images={mockImages} productName="Real Madrid Kit" />);

    const primaryImg = screen.getByAltText('Real Madrid Kit view 1');
    expect(primaryImg).toBeInTheDocument();
    expect(primaryImg).toHaveAttribute('src', 'http://example.com/front.jpg');
  });

  it('changes active preview when thumbnail button is clicked', () => {
    render(<ProductImageGallery images={mockImages} productName="Real Madrid Kit" />);

    const secondThumbnail = screen.getByRole('button', { name: /view product image 2/i });
    fireEvent.click(secondThumbnail);

    const updatedImg = screen.getByAltText('Real Madrid Kit view 2');
    expect(updatedImg).toBeInTheDocument();
    expect(updatedImg).toHaveAttribute('src', 'http://example.com/back.jpg');
  });

  it('renders fallback when no images are provided', () => {
    render(<ProductImageGallery images={[]} productName="Real Madrid Kit" />);

    expect(screen.getByText('No Image Available')).toBeInTheDocument();
  });
});
