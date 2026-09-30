import React, { useState, useEffect } from 'react';
import { Star, Send } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { ReviewResponse } from '../../types/domain';

export interface ReviewFormProps {
  initialData?: ReviewResponse | null;
  onSubmit: (data: { rating: number; title?: string; comment: string }) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
  error?: string | null;
}

export const ReviewForm: React.FC<ReviewFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  error = null,
}) => {
  const [rating, setRating] = useState<number>(initialData?.rating || 5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [title, setTitle] = useState<string>(initialData?.title || '');
  const [comment, setComment] = useState<string>(initialData?.comment || '');
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setRating(initialData.rating);
      setTitle(initialData.title || '');
      setComment(initialData.comment || '');
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (rating < 1 || rating > 5) {
      setValidationError('Please select a rating between 1 and 5 stars.');
      return;
    }

    if (!comment.trim()) {
      setValidationError('Review comment cannot be empty.');
      return;
    }

    if (comment.trim().length > 2000) {
      setValidationError('Comment exceeds maximum length of 2000 characters.');
      return;
    }

    await onSubmit({
      rating,
      title: title.trim() || undefined,
      comment: comment.trim(),
    });
  };

  const activeStar = hoverRating || rating;

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/80 p-5 backdrop-blur-md"
    >
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <h3 className="text-sm font-bold text-white">
          {initialData ? 'Edit Your Review' : 'Write a Product Review'}
        </h3>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-xs font-semibold text-slate-400 hover:text-white"
          >
            Cancel
          </button>
        )}
      </div>

      {/* Interactive Star Picker */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-300">Your Rating *</label>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              aria-label={`Rate ${star} out of 5 stars`}
              className="p-1 focus:outline-none focus:ring-1 focus:ring-amber-500 rounded-md transition-transform hover:scale-110"
            >
              <Star
                className={`h-6 w-6 ${
                  star <= activeStar
                    ? 'text-amber-400 fill-amber-400'
                    : 'text-slate-700'
                }`}
              />
            </button>
          ))}
          <span className="ml-2 text-xs font-bold text-amber-400">{activeStar} / 5</span>
        </div>
      </div>

      {/* Title Input */}
      <Input
        label="Review Title (Optional)"
        placeholder="e.g. Excellent quality kit & official printing!"
        value={title}
        maxLength={150}
        onChange={(e) => setTitle(e.target.value)}
      />

      {/* Comment Input */}
      <div className="space-y-1">
        <label htmlFor="review-comment-textarea" className="text-xs font-semibold text-slate-300">
          Review Comment *
        </label>
        <textarea
          id="review-comment-textarea"
          rows={4}
          value={comment}
          maxLength={2000}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share details about the jersey quality, fitting, fabric material, or size accuracy..."
          className="w-full rounded-xl border border-slate-800 bg-slate-900/90 px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
        />
        <div className="flex justify-end">
          <span className="text-[10px] text-slate-500">{comment.length} / 2000</span>
        </div>
      </div>

      {/* Error displays */}
      {(validationError || error) && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">
          {validationError || error}
        </div>
      )}

      {/* Submit button */}
      <div className="flex justify-end gap-2 pt-2">
        {onCancel && (
          <Button type="button" variant="outline" size="sm" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          size="sm"
          isLoading={isLoading}
          className="bg-amber-500 text-slate-950 hover:bg-amber-400 font-bold"
        >
          <Send className="h-3.5 w-3.5 mr-1.5" />
          {initialData ? 'Update Review' : 'Submit Review'}
        </Button>
      </div>
    </form>
  );
};
