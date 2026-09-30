import React from 'react';

export const OrderDetailsSkeleton: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-pulse">
      <div className="h-10 bg-slate-800/40 rounded-xl w-48" />
      <div className="h-40 bg-slate-800/40 rounded-2xl w-full" />
      <div className="h-64 bg-slate-800/40 rounded-2xl w-full" />
      <div className="h-40 bg-slate-800/40 rounded-2xl w-full" />
    </div>
  );
};
