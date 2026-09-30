import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from './Button';
import { cn } from '../../lib/utils';

export interface ErrorStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  message?: string;
  onRetry?: () => void;
  isRetrying?: boolean;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message = 'Failed to load requested data. Please try again.',
  onRetry,
  isRetrying = false,
  className,
  ...props
}) => {
  return (
    <div
      className={cn(
        'rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-slate-200 shadow-lg',
        className
      )}
      {...props}
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 pt-0.5">
          <AlertCircle className="h-6 w-6 text-red-400" />
        </div>
        <div className="flex-1 space-y-1">
          <h4 className="text-sm font-bold text-red-300">{title}</h4>
          <p className="text-xs text-red-400/90 leading-relaxed">{message}</p>
          {onRetry && (
            <div className="pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onRetry}
                isLoading={isRetrying}
                className="border-red-500/40 text-red-300 hover:bg-red-500/20 hover:text-white"
              >
                <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                <span>Try Again</span>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
