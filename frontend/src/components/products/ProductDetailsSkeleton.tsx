import React from 'react';

export const ProductDetailsSkeleton: React.FC = () => {
  return (
    <div className="space-y-8 animate-pulse" role="status" aria-label="Loading product details">
      {/* Top back button skeleton */}
      <div className="h-4 w-32 bg-slate-800/80 rounded" />

      {/* Main product grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left image viewport */}
        <div className="lg:col-span-6 space-y-4">
          <div className="aspect-[4/3] w-full rounded-2xl bg-slate-800/60" />
          <div className="flex gap-3">
            <div className="h-20 w-20 rounded-xl bg-slate-800/60" />
            <div className="h-20 w-20 rounded-xl bg-slate-800/60" />
            <div className="h-20 w-20 rounded-xl bg-slate-800/60" />
          </div>
        </div>

        {/* Right info column */}
        <div className="lg:col-span-6 space-y-6">
          <div className="space-y-2">
            <div className="h-4 w-1/4 bg-slate-800/80 rounded" />
            <div className="h-8 w-3/4 bg-slate-800/80 rounded" />
            <div className="h-4 w-1/3 bg-slate-800/80 rounded" />
          </div>

          <div className="h-10 w-1/3 bg-slate-800/80 rounded" />

          <div className="space-y-3 pt-4 border-t border-slate-800/60">
            <div className="h-4 w-1/4 bg-slate-800/80 rounded" />
            <div className="flex gap-2">
              <div className="h-10 w-14 bg-slate-800/80 rounded-xl" />
              <div className="h-10 w-14 bg-slate-800/80 rounded-xl" />
              <div className="h-10 w-14 bg-slate-800/80 rounded-xl" />
            </div>
          </div>

          <div className="space-y-2 pt-4 border-t border-slate-800/60">
            <div className="h-4 w-1/4 bg-slate-800/80 rounded" />
            <div className="h-16 w-full bg-slate-800/60 rounded-xl" />
          </div>
        </div>
      </div>
      <span className="sr-only">Loading product specifications...</span>
    </div>
  );
};
