import React from 'react';
import { useSearchParams, Link } from 'react-router';
import { AlertOctagon, RefreshCw, ShoppingCart } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const PaymentFailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId') || searchParams.get('order_id') || undefined;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center space-y-6">
      <div className="rounded-3xl border border-red-500/30 bg-slate-900/80 backdrop-blur-md p-6 sm:p-10 space-y-6 shadow-2xl shadow-red-500/5">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-red-500/10 text-red-400 ring-8 ring-red-500/5">
          <AlertOctagon className="h-10 w-10" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-black text-white">Payment Failed</h1>
          <p className="text-sm text-slate-300 max-w-md mx-auto">
            Your transaction could not be processed by SSLCommerz. Your card or account has not been charged.
          </p>
          {orderId && (
            <p className="text-xs text-slate-400 font-mono pt-1">
              Reference Order: {orderId}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 border-t border-slate-800">
          <Link to="/checkout" className="w-full sm:w-auto">
            <Button type="button" variant="amber" size="md" fullWidth>
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Checkout Again
            </Button>
          </Link>
          <Link to="/cart" className="w-full sm:w-auto">
            <Button type="button" variant="outline" size="md" fullWidth className="border-slate-700">
              <ShoppingCart className="h-4 w-4 mr-2" />
              Return to Cart
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
