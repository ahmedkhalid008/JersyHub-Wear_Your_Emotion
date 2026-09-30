import React from 'react';

export const CheckoutSkeleton: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-pulse">
      <div className="h-16 bg-slate-800/40 rounded-2xl w-full" />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-6">
          <div className="h-64 bg-slate-800/40 rounded-2xl" />
          <div className="h-48 bg-slate-800/40 rounded-2xl" />
        </div>
        <div className="lg:col-span-5 space-y-6">
          <div className="h-80 bg-slate-800/40 rounded-2xl" />
        </div>
      </div>
    </div>
  );
};
