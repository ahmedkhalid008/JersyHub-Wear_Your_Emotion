import { describe, it, expect, vi, beforeEach } from 'vitest';
import { reviewService } from './reviewService';
import { apiClient } from './api/client';
import { ReviewResponse, ReviewSummaryResponse } from '../types/domain';

vi.mock('./api/client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('reviewService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockReview: ReviewResponse = {
    id: 'rev-1',
    productId: 'prod-1',
    userId: 'user-1',
    userName: 'John Doe',
    rating: 5,
    title: 'Great quality kit',
    comment: 'Super comfortable fabric and fast shipping!',
    verifiedPurchase: true,
    createdAt: '2025-01-01T10:00:00Z',
    updatedAt: '2025-01-01T10:00:00Z',
  };

  it('fetches paginated product reviews', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      success: true,
      message: 'Success',
      data: {
        content: [mockReview],
        page: 0,
        size: 10,
        totalElements: 1,
        totalPages: 1,
        first: true,
        last: true,
      },
      timestamp: '2025-01-01T00:00:00Z',
    });

    const result = await reviewService.getProductReviews('prod-1', 0, 10);

    expect(apiClient.get).toHaveBeenCalledWith(
      '/products/prod-1/reviews?page=0&size=10&sort=createdAt,desc',
      { skipAuth: true }
    );
    expect(result.content).toHaveLength(1);
    expect(result.content[0].id).toBe('rev-1');
  });

  it('fetches review summary', async () => {
    const mockSummary: ReviewSummaryResponse = {
      productId: 'prod-1',
      averageRating: 4.8,
      totalReviews: 25,
    };

    vi.mocked(apiClient.get).mockResolvedValue({
      success: true,
      message: 'Success',
      data: mockSummary,
      timestamp: '2025-01-01T00:00:00Z',
    });

    const result = await reviewService.getReviewSummary('prod-1');

    expect(apiClient.get).toHaveBeenCalledWith('/products/prod-1/reviews/summary', {
      skipAuth: true,
    });
    expect(result.averageRating).toBe(4.8);
    expect(result.totalReviews).toBe(25);
  });

  it('submits a new review', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({
      success: true,
      message: 'Created',
      data: mockReview,
      timestamp: '2025-01-01T00:00:00Z',
    });

    const result = await reviewService.createReview('prod-1', {
      rating: 5,
      title: 'Great quality kit',
      comment: 'Super comfortable fabric and fast shipping!',
    });

    expect(apiClient.post).toHaveBeenCalledWith('/products/prod-1/reviews', {
      rating: 5,
      title: 'Great quality kit',
      comment: 'Super comfortable fabric and fast shipping!',
    });
    expect(result).toEqual(mockReview);
  });

  it('updates an existing review', async () => {
    vi.mocked(apiClient.put).mockResolvedValue({
      success: true,
      message: 'Updated',
      data: mockReview,
      timestamp: '2025-01-01T00:00:00Z',
    });

    const result = await reviewService.updateReview('prod-1', 'rev-1', {
      rating: 4,
      title: 'Updated title',
      comment: 'Updated comment',
    });

    expect(apiClient.put).toHaveBeenCalledWith('/products/prod-1/reviews/rev-1', {
      rating: 4,
      title: 'Updated title',
      comment: 'Updated comment',
    });
    expect(result).toEqual(mockReview);
  });

  it('deletes an existing review', async () => {
    vi.mocked(apiClient.delete).mockResolvedValue({
      success: true,
      message: 'Deleted',
      data: null,
      timestamp: '2025-01-01T00:00:00Z',
    });

    await reviewService.deleteReview('prod-1', 'rev-1');

    expect(apiClient.delete).toHaveBeenCalledWith('/products/prod-1/reviews/rev-1');
  });
});
