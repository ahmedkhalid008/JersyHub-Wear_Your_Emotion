import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProductPagination } from './ProductPagination';

describe('ProductPagination Component', () => {
  it('disables previous button on first page', () => {
    const handlePageChange = vi.fn();

    render(
      <ProductPagination
        page={0}
        totalPages={5}
        totalElements={100}
        isFirst={true}
        isLast={false}
        onPageChange={handlePageChange}
      />
    );

    const prevButton = screen.getByRole('button', { name: /previous page/i });
    expect(prevButton).toBeDisabled();

    const nextButton = screen.getByRole('button', { name: /next page/i });
    expect(nextButton).not.toBeDisabled();
  });

  it('disables next button on last page', () => {
    const handlePageChange = vi.fn();

    render(
      <ProductPagination
        page={4}
        totalPages={5}
        totalElements={100}
        isFirst={false}
        isLast={true}
        onPageChange={handlePageChange}
      />
    );

    const prevButton = screen.getByRole('button', { name: /previous page/i });
    expect(prevButton).not.toBeDisabled();

    const nextButton = screen.getByRole('button', { name: /next page/i });
    expect(nextButton).toBeDisabled();
  });

  it('triggers onPageChange with new page index when clicked', () => {
    const handlePageChange = vi.fn();

    render(
      <ProductPagination
        page={1}
        totalPages={5}
        totalElements={100}
        isFirst={false}
        isLast={false}
        onPageChange={handlePageChange}
      />
    );

    const nextButton = screen.getByRole('button', { name: /next page/i });
    fireEvent.click(nextButton);

    expect(handlePageChange).toHaveBeenCalledWith(2);
  });
});
