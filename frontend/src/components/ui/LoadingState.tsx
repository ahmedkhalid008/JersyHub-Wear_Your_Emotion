import React from 'react';
import { Spinner } from './Spinner';
import { cn } from '../../lib/utils';

export interface LoadingStateProps extends React.HTMLAttributes<HTMLDivElement> {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading data...',
  size = 'md',
  className,
  ...props
}) => {
  return (
    <div
      className={cn('flex flex-col items-center justify-center py-12 px-4 text-center space-y-3', className)}
      {...props}
    >
      <Spinner size={size} />
      <p className="text-sm font-medium text-slate-400">{message}</p>
    </div>
  );
};
