import React from 'react';
import { ShoppingCart, MapPin, CreditCard, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const CheckoutHeader: React.FC = () => {
  return (
    <div className="mb-8 space-y-4">
      {/* Title & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Secure Checkout
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Complete your order and proceed to SSLCommerz secure payment gateway.
          </p>
        </div>
        <Link
          to="/cart"
          className="inline-flex items-center gap-2 text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors"
        >
          <ShoppingCart className="h-4 w-4" />
          Back to Shopping Cart
        </Link>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 overflow-x-auto py-2">
        <Link to="/cart" className="flex items-center gap-1.5 text-slate-300 hover:text-amber-400">
          <ShoppingCart className="h-4 w-4 text-emerald-400" />
          <span>Cart</span>
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-slate-600 flex-shrink-0" />
        <div className="flex items-center gap-1.5 text-amber-400 font-bold bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
          <MapPin className="h-4 w-4" />
          <span>Address & Order Review</span>
        </div>
        <ChevronRight className="h-3.5 w-3.5 text-slate-600 flex-shrink-0" />
        <div className="flex items-center gap-1.5 text-slate-500">
          <CreditCard className="h-4 w-4" />
          <span>SSLCommerz Payment</span>
        </div>
      </div>
    </div>
  );
};
