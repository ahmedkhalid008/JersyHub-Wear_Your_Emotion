import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ReviewCard } from './ReviewCard';
import { ReviewResponse } from '../../types/domain';

const mockReview: ReviewResponse = {
  id: 'rev-100',
  productId: 'prod-1',
  userId: 'user-77',
  userName: 'Alex Ferguson',
  rating: 5,
  title: 'Top Quality Jersey',
  comment: 'Fabric feels premium and authentic.',
  verifiedPurchase: true,
  createdAt: '2025-01-01T12:00:00Z',
  updatedAt: '2025-01-01T12:00:00Z',
};

describe('ReviewCard Component', () => {
  it('renders review details, stars, and verified buyer badge', () => {
    render(<ReviewCard review={mockReview} />);

    expect(screen.getByText('Alex Ferguson')).toBeInTheDocument();
    expect(screen.getByText('Verified Buyer')).toBeInTheDocument();
    expect(screen.getByText('Top Quality Jersey')).toBeInTheDocument();
    expect(screen.getByText('Fabric feels premium and authentic.')).toBeInTheDocument();
  });

  it('displays edit and delete action buttons when current user owns the review', () => {
    const handleEdit = vi.fn();
    const handleDelete = vi.fn();

    render(
      <ReviewCard
        review={mockReview}
        currentUserId="user-77"
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    );

    const editBtn = screen.getByRole('button', { name: /edit your review/i });
    const deleteBtn = screen.getByRole('button', { name: /delete your review/i });

    expect(editBtn).toBeInTheDocument();
    expect(deleteBtn).toBeInTheDocument();

    fireEvent.click(editBtn);
    expect(handleEdit).toHaveBeenCalledWith(mockReview);

    fireEvent.click(deleteBtn);
    expect(handleDelete).toHaveBeenCalledWith('rev-100');
  });

  it('hides edit and delete action buttons for non-owner users', () => {
    render(<ReviewCard review={mockReview} currentUserId="user-999" />);

    expect(screen.queryByRole('button', { name: /edit your review/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /delete your review/i })).not.toBeInTheDocument();
  });
});
