import React from 'react';
import { AlertTriangle, RefreshCw, ShoppingCart } from 'lucide-react';
import { Link } from 'react-router';
import { Button } from '../ui/Button';

export interface CheckoutErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  showCartLink?: boolean;
}

export const CheckoutErrorState: React.FC<CheckoutErrorStateProps> = ({
  title = 'Checkout Error',
  message,
  onRetry,
  showCartLink = true,
}) => {
  return (
    <div className="max-w-md mx-auto my-12 p-6 sm:p-8 rounded-2xl border border-red-500/30 bg-slate-900/80 backdrop-blur-md text-center space-y-4">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 text-red-400">
        <AlertTriangle className="h-7 w-7" />
      </div>

      <div className="space-y-1">
        <h3 className="text-lg font-black text-white">{title}</h3>
        <p className="text-xs sm:text-sm text-slate-300">{message}</p>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        {onRetry && (
          <Button type="button" variant="outline" size="sm" onClick={onRetry} className="border-slate-700">
            <RefreshCw className="h-4 w-4 mr-1.5" />
            Try Again
          </Button>
        )}
        {showCartLink && (
          <Link to="/cart">
            <Button type="button" variant="amber" size="sm">
              <ShoppingCart className="h-4 w-4 mr-1.5" />
              Return to Cart
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
};
