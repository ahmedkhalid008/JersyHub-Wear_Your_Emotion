import React from 'react';

export interface ProductGridSkeletonProps {
  count?: number;
}

export const ProductGridSkeleton: React.FC<ProductGridSkeletonProps> = ({ count = 8 }) => {
  return (
    <div
      className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
      aria-label="Loading products"
      role="status"
    >
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="flex flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/40 p-0 animate-pulse"
        >
          {/* Skeleton image */}
          <div className="aspect-[4/3] w-full bg-slate-800/60" />
          {/* Skeleton text */}
          <div className="p-4 space-y-3">
            <div className="h-3 w-1/3 bg-slate-800/80 rounded" />
            <div className="h-4 w-4/5 bg-slate-800/80 rounded" />
            <div className="h-4 w-2/3 bg-slate-800/80 rounded" />
            <div className="pt-3 border-t border-slate-800/60 flex justify-between items-center">
              <div className="h-5 w-1/4 bg-slate-800/80 rounded" />
              <div className="h-3 w-1/4 bg-slate-800/80 rounded" />
            </div>
          </div>
        </div>
      ))}
      <span className="sr-only">Loading products catalog...</span>
    </div>
  );
};
