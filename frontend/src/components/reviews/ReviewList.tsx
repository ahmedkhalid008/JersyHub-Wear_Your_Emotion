import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Plus, Lock } from 'lucide-react';
import {
  useProductReviews,
  useReviewSummary,
  useCreateReview,
  useUpdateReview,
  useDeleteReview,
} from '../../hooks/useReviews';
import { useAuthStore } from '../../stores/useAuthStore';
import { ReviewSummary } from './ReviewSummary';
import { ReviewCard } from './ReviewCard';
import { ReviewForm } from './ReviewForm';
import { ProductPagination } from '../products/ProductPagination';
import { Button } from '../ui/Button';
import { EmptyState } from '../ui/EmptyState';
import { ErrorState } from '../ui/ErrorState';
import { Modal } from '../ui/Modal';
import { ReviewResponse } from '../../types/domain';

export interface ReviewListProps {
  productId: string;
}

export const ReviewList: React.FC<ReviewListProps> = ({ productId }) => {
  const [page, setPage] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [editingReview, setEditingReview] = useState<ReviewResponse | null>(null);
  const [deletingReviewId, setDeletingReviewId] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { isAuthenticated, user } = useAuthStore();

  const { data: summary } = useReviewSummary(productId);
  const {
    data: reviewPage,
    isLoading,
    isError,
    error,
    refetch,
  } = useProductReviews(productId, page);

  const createMutation = useCreateReview(productId);
  const updateMutation = useUpdateReview(productId);
  const deleteMutation = useDeleteReview(productId);

  const handleCreateSubmit = async (data: { rating: number; title?: string; comment: string }) => {
    setSubmitError(null);
    try {
      await createMutation.mutateAsync(data);
      setShowForm(false);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setSubmitError(err.message);
      } else {
        setSubmitError('Failed to submit review. Please try again.');
      }
    }
  };

  const handleUpdateSubmit = async (data: { rating: number; title?: string; comment: string }) => {
    if (!editingReview) return;
    setSubmitError(null);
    try {
      await updateMutation.mutateAsync({
        reviewId: editingReview.id,
        request: data,
      });
      setEditingReview(null);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setSubmitError(err.message);
      } else {
        setSubmitError('Failed to update review. Please try again.');
      }
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingReviewId) return;
    try {
      await deleteMutation.mutateAsync(deletingReviewId);
      setDeletingReviewId(null);
    } catch {
      // Handled by mutation error or query invalidation
    }
  };

  return (
    <section className="space-y-6 pt-8 border-t border-slate-800" aria-label="Product Reviews">
      {/* Header & Rating Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-amber-500" />
            Customer Reviews & Ratings
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real feedback from verified buyers of this kit.
          </p>
        </div>

        {isAuthenticated ? (
          !showForm && !editingReview && (
            <Button
              size="sm"
              onClick={() => {
                setSubmitError(null);
                setShowForm(true);
              }}
              className="bg-amber-500 text-slate-950 hover:bg-amber-400 font-bold self-start sm:self-auto"
            >
              <Plus className="h-4 w-4 mr-1.5" />
              Write a Review
            </Button>
          )
        ) : (
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 px-3.5 py-2 text-xs text-slate-400 flex items-center gap-2 self-start sm:self-auto">
            <Lock className="h-3.5 w-3.5 text-amber-500" />
            <span>
              Have this jersey?{' '}
              <Link to="/login" className="font-bold text-amber-400 hover:underline">
                Sign in
              </Link>{' '}
              to leave a review.
            </span>
          </div>
        )}
      </div>

      {/* Aggregate Rating Banner */}
      <ReviewSummary summary={summary} />

      {/* Write Review Form Collapsible */}
      {showForm && (
        <ReviewForm
          onSubmit={handleCreateSubmit}
          onCancel={() => setShowForm(false)}
          isLoading={createMutation.isPending}
          error={submitError}
        />
      )}

      {/* Edit Review Modal */}
      {editingReview && (
        <ReviewForm
          initialData={editingReview}
          onSubmit={handleUpdateSubmit}
          onCancel={() => setEditingReview(null)}
          isLoading={updateMutation.isPending}
          error={submitError}
        />
      )}

      {/* Review List & Pagination */}
      {isLoading && (
        <div className="space-y-4 animate-pulse">
          <div className="h-28 rounded-2xl bg-slate-900/40 border border-slate-800" />
          <div className="h-28 rounded-2xl bg-slate-900/40 border border-slate-800" />
        </div>
      )}

      {isError && (
        <ErrorState
          title="Could not load customer reviews"
          message={error instanceof Error ? error.message : 'Failed to fetch review data.'}
          onRetry={() => refetch()}
        />
      )}

      {!isLoading && !isError && reviewPage && reviewPage.content.length === 0 && (
        <EmptyState
          icon={<MessageSquare className="h-8 w-8 text-amber-400" />}
          title="No customer reviews yet"
          description="Be the first verified customer to share your thoughts on this jersey!"
          actionLabel={isAuthenticated && !showForm ? 'Write the first review' : undefined}
          onAction={isAuthenticated && !showForm ? () => setShowForm(true) : undefined}
        />
      )}

      {!isLoading && !isError && reviewPage && reviewPage.content.length > 0 && (
        <div className="space-y-4">
          {reviewPage.content.map((rev) => (
            <ReviewCard
              key={rev.id}
              review={rev}
              currentUserId={user?.id}
              onEdit={(reviewToEdit) => {
                setSubmitError(null);
                setEditingReview(reviewToEdit);
              }}
              onDelete={(idToDelete) => setDeletingReviewId(idToDelete)}
            />
          ))}

          <ProductPagination
            page={reviewPage.page}
            totalPages={reviewPage.totalPages}
            totalElements={reviewPage.totalElements}
            isFirst={reviewPage.first}
            isLast={reviewPage.last}
            onPageChange={(newPage) => setPage(newPage)}
          />
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(deletingReviewId)}
        onClose={() => setDeletingReviewId(null)}
        title="Delete Review Confirmation"
      >
        <div className="space-y-4 p-2">
          <p className="text-xs text-slate-300">
            Are you sure you want to delete your review? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeletingReviewId(null)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              isLoading={deleteMutation.isPending}
              onClick={handleDeleteConfirm}
              className="bg-red-500 hover:bg-red-600 text-white font-bold"
            >
              Delete Review
            </Button>
          </div>
        </div>
      </Modal>
    </section>
  );
};
