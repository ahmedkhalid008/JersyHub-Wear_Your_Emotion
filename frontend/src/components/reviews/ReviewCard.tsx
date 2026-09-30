import React from 'react';
import { Star, CheckCircle, Edit3, Trash2, User } from 'lucide-react';
import { ReviewResponse } from '../../types/domain';
import { formatDate } from '../../utils';

export interface ReviewCardProps {
  review: ReviewResponse;
  currentUserId?: string;
  onEdit?: (review: ReviewResponse) => void;
  onDelete?: (reviewId: string) => void;
}

export const ReviewCard: React.FC<ReviewCardProps> = ({
  review,
  currentUserId,
  onEdit,
  onDelete,
}) => {
  const isOwner = Boolean(currentUserId && String(currentUserId) === String(review.userId));

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm transition-all hover:border-slate-700">
      {/* Top row: Reviewer info & actions */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 text-slate-300 font-bold border border-slate-700">
            <User className="h-5 w-5 text-amber-500/90" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white">{review.userName || 'Anonymous'}</span>
              {review.verifiedPurchase && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/20">
                  <CheckCircle className="h-3 w-3" />
                  Verified Buyer
                </span>
              )}
            </div>
            <span className="text-[11px] text-slate-500">{formatDate(review.createdAt)}</span>
          </div>
        </div>

        {/* Edit / Delete actions for review owner */}
        {isOwner && (
          <div className="flex items-center gap-1.5">
            {onEdit && (
              <button
                type="button"
                onClick={() => onEdit(review)}
                aria-label="Edit your review"
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-amber-400 transition-colors"
              >
                <Edit3 className="h-4 w-4" />
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={() => onDelete(review.id)}
                aria-label="Delete your review"
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-red-400 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Star Rating */}
      <div className="flex items-center gap-1" aria-label={`Rated ${review.rating} out of 5 stars`}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= review.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-700'
            }`}
            aria-hidden="true"
          />
        ))}
      </div>

      {/* Title & Comment Content */}
      {review.title && <h4 className="text-sm font-bold text-slate-200">{review.title}</h4>}
      <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">{review.comment}</p>
    </div>
  );
};
