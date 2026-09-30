import React from 'react';
import { useSearchParams, Link } from 'react-router';
import { XCircle, ShoppingBag, ShoppingCart } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const PaymentCancelPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId') || searchParams.get('order_id') || undefined;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center space-y-6">
      <div className="rounded-3xl border border-slate-800 bg-slate-900/80 backdrop-blur-md p-6 sm:p-10 space-y-6">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-amber-500/10 text-amber-400">
          <XCircle className="h-10 w-10" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-black text-white">Payment Cancelled</h1>
          <p className="text-sm text-slate-300 max-w-md mx-auto">
            You cancelled the payment transaction on the SSLCommerz gateway page.
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
              <ShoppingCart className="h-4 w-4 mr-2" />
              Return to Checkout
            </Button>
          </Link>
          <Link to="/products" className="w-full sm:w-auto">
            <Button type="button" variant="outline" size="md" fullWidth className="border-slate-700">
              <ShoppingBag className="h-4 w-4 mr-2" />
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
