import React from 'react';

export const CartSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-pulse" role="status" aria-label="Loading shopping cart">
      {/* Items list skeleton */}
      <div className="lg:col-span-8 space-y-4">
        <div className="h-24 rounded-2xl bg-slate-900/40 border border-slate-800" />
        <div className="h-24 rounded-2xl bg-slate-900/40 border border-slate-800" />
        <div className="h-24 rounded-2xl bg-slate-900/40 border border-slate-800" />
      </div>

      {/* Summary skeleton */}
      <div className="lg:col-span-4 h-64 rounded-3xl bg-slate-900/40 border border-slate-800 p-6 space-y-4">
        <div className="h-6 w-1/2 bg-slate-800/80 rounded" />
        <div className="h-4 w-full bg-slate-800/80 rounded" />
        <div className="h-4 w-3/4 bg-slate-800/80 rounded" />
        <div className="h-10 w-full bg-slate-800/80 rounded-xl pt-4" />
      </div>
      <span className="sr-only">Loading cart items...</span>
    </div>
  );
};
