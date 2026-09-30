import React from 'react';
import { Star } from 'lucide-react';
import { ReviewSummaryResponse } from '../../types/domain';

export interface ReviewSummaryProps {
  summary?: ReviewSummaryResponse;
}

export const ReviewSummary: React.FC<ReviewSummaryProps> = ({ summary }) => {
  const avg = summary?.averageRating || 0;
  const count = summary?.totalReviews || 0;

  return (
    <div
      className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/40 p-5 backdrop-blur-md"
      aria-label={`Average rating ${avg} out of 5 based on ${count} customer reviews`}
    >
      <div className="flex items-center gap-4">
        <div className="flex flex-col items-center justify-center rounded-2xl bg-amber-500/10 px-5 py-3 border border-amber-500/20">
          <span className="text-3xl font-extrabold text-amber-400">
            {avg > 0 ? avg.toFixed(1) : '0.0'}
          </span>
          <span className="text-[10px] uppercase font-bold tracking-wider text-amber-500/80 mt-0.5">
            Out of 5
          </span>
        </div>

        <div>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`h-5 w-5 ${
                  star <= Math.round(avg)
                    ? 'text-amber-400 fill-amber-400'
                    : 'text-slate-700'
                }`}
                aria-hidden="true"
              />
            ))}
          </div>
          <p className="mt-1 text-xs text-slate-400 font-medium">
            Based on <span className="text-white font-bold">{count}</span> verified customer{' '}
            {count === 1 ? 'review' : 'reviews'}
          </p>
        </div>
      </div>
    </div>
  );
};
