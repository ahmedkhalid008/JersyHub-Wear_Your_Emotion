import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ReviewForm } from './ReviewForm';

describe('ReviewForm Component', () => {
  it('renders rating picker, title input, and comment textarea', () => {
    render(<ReviewForm onSubmit={vi.fn()} />);

    expect(screen.getByText('Write a Product Review')).toBeInTheDocument();
    expect(screen.getByLabelText(/Rate 5 out of 5 stars/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/e.g. Excellent quality kit/i)).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/Share details about the jersey quality/i)
    ).toBeInTheDocument();
  });

  it('validates required comment field on submission', async () => {
    const handleSubmit = vi.fn();
    render(<ReviewForm onSubmit={handleSubmit} />);

    const submitBtn = screen.getByRole('button', { name: /submit review/i });
    fireEvent.click(submitBtn);

    expect(await screen.findByText('Review comment cannot be empty.')).toBeInTheDocument();
    expect(handleSubmit).not.toHaveBeenCalled();
  });

  it('submits form with valid rating, title, and comment', async () => {
    const handleSubmit = vi.fn().mockResolvedValue(undefined);
    render(<ReviewForm onSubmit={handleSubmit} />);

    const titleInput = screen.getByPlaceholderText(/e.g. Excellent quality kit/i);
    const commentInput = screen.getByPlaceholderText(/Share details about the jersey quality/i);
    const starBtn = screen.getByLabelText(/Rate 4 out of 5 stars/i);

    fireEvent.click(starBtn);
    fireEvent.change(titleInput, { target: { value: 'Best kit ever' } });
    fireEvent.change(commentInput, { target: { value: 'Awesome fitting and great badges.' } });

    const submitBtn = screen.getByRole('button', { name: /submit review/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledWith({
        rating: 4,
        title: 'Best kit ever',
        comment: 'Awesome fitting and great badges.',
      });
    });
  });
});
