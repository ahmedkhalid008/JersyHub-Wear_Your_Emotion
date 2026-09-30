import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reviewService } from '../services/reviewService';
import { queryKeys } from '../services/api/queryKeys';
import { CreateReviewRequest, UpdateReviewRequest } from '../types/domain';

export function useProductReviews(productId?: string, page = 0, size = 10) {
  return useQuery({
    queryKey: queryKeys.reviews.byProduct(productId || '', page),
    queryFn: () => reviewService.getProductReviews(productId!, page, size),
    enabled: Boolean(productId),
    staleTime: 1000 * 60 * 2,
  });
}

export function useReviewSummary(productId?: string) {
  return useQuery({
    queryKey: queryKeys.reviews.summary(productId || ''),
    queryFn: () => reviewService.getReviewSummary(productId!),
    enabled: Boolean(productId),
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateReview(productId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateReviewRequest) => reviewService.createReview(productId, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', 'product', productId] });
      queryClient.invalidateQueries({ queryKey: queryKeys.reviews.summary(productId) });
    },
  });
}

export function useUpdateReview(productId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ reviewId, request }: { reviewId: string; request: UpdateReviewRequest }) =>
      reviewService.updateReview(productId, reviewId, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', 'product', productId] });
      queryClient.invalidateQueries({ queryKey: queryKeys.reviews.summary(productId) });
    },
  });
}

export function useDeleteReview(productId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reviewId: string) => reviewService.deleteReview(productId, reviewId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', 'product', productId] });
      queryClient.invalidateQueries({ queryKey: queryKeys.reviews.summary(productId) });
    },
  });
}
