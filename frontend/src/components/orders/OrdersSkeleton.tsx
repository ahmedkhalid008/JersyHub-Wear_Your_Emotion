import React from 'react';

export const OrdersSkeleton: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-4 animate-pulse">
      <div className="h-16 bg-slate-800/40 rounded-2xl w-full mb-6" />
      <div className="h-32 bg-slate-800/40 rounded-2xl w-full" />
      <div className="h-32 bg-slate-800/40 rounded-2xl w-full" />
      <div className="h-32 bg-slate-800/40 rounded-2xl w-full" />
    </div>
  );
};
