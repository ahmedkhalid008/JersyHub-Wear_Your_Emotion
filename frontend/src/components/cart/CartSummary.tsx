import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tag, Check, X, ShieldCheck, ArrowRight } from 'lucide-react';
import { Button } from '../ui/Button';
import { formatCurrency } from '../../utils';
import { CouponApplyResponse } from '../../types/domain';

export interface CartSummaryProps {
  subtotal: number;
  appliedCoupon?: CouponApplyResponse | null;
  onApplyCoupon: (code: string) => Promise<void>;
  onRemoveCoupon: () => Promise<void>;
  isApplyingCoupon?: boolean;
  couponError?: string | null;
  onCheckout?: () => void;
}

export const CartSummary: React.FC<CartSummaryProps> = ({
  subtotal,
  appliedCoupon,
  onApplyCoupon,
  onRemoveCoupon,
  isApplyingCoupon = false,
  couponError = null,
  onCheckout,
}) => {
  const navigate = useNavigate();
  const [code, setCode] = useState('');

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    await onApplyCoupon(code.trim());
    setCode('');
  };

  const handleCheckout = () => {
    if (onCheckout) {
      onCheckout();
    } else {
      navigate('/checkout');
    }
  };

  const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const finalTotal = appliedCoupon ? appliedCoupon.totalAfterDiscount : Math.max(0, subtotal - discountAmount);

  return (
    <div className="space-y-6 rounded-3xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-md">
      <h3 className="text-base font-extrabold text-white tracking-tight border-b border-slate-800 pb-3">
        Order Summary
      </h3>

      {/* Pricing breakdown */}
      <div className="space-y-3 text-xs">
        <div className="flex justify-between text-slate-300">
          <span>Subtotal</span>
          <span className="font-bold text-white">{formatCurrency(subtotal)}</span>
        </div>

        {appliedCoupon && (
          <div className="flex justify-between text-emerald-400 font-semibold">
            <span className="flex items-center gap-1">
              <Tag className="h-3.5 w-3.5" />
              Discount ({appliedCoupon.couponCode})
            </span>
            <span>-{formatCurrency(discountAmount)}</span>
          </div>
        )}

        <div className="flex justify-between text-slate-400">
          <span>Delivery / Shipping</span>
          <span className="text-slate-500 font-medium">Calculated at Checkout</span>
        </div>

        <div className="flex justify-between border-t border-slate-800/80 pt-3 text-sm font-extrabold text-white">
          <span>Total</span>
          <span className="text-amber-400 text-lg">{formatCurrency(finalTotal)}</span>
        </div>
      </div>

      {/* Coupon Application Box */}
      <div className="space-y-3 border-t border-slate-800/80 pt-4">
        <label htmlFor="coupon-code-input" className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Tag className="h-3.5 w-3.5 text-amber-500" />
          Promo / Coupon Code
        </label>

        {appliedCoupon ? (
          <div className="flex items-center justify-between rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-300">
            <div className="flex items-center gap-2 font-semibold">
              <Check className="h-4 w-4 text-emerald-400" />
              <span>Coupon "{appliedCoupon.couponCode}" applied</span>
            </div>
            <button
              type="button"
              onClick={onRemoveCoupon}
              aria-label="Remove coupon"
              className="rounded-md p-1 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <form onSubmit={handleApply} className="flex gap-2">
            <input
              id="coupon-code-input"
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="Enter coupon code"
              aria-label="Promo or coupon code"
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs font-semibold text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
            />
            <Button
              type="submit"
              size="sm"
              isLoading={isApplyingCoupon}
              disabled={!code.trim()}
              className="bg-amber-500 text-slate-950 hover:bg-amber-400 font-bold px-4"
            >
              Apply
            </Button>
          </form>
        )}

        {couponError && (
          <p className="text-xs text-red-400 font-medium pt-1">{couponError}</p>
        )}
      </div>

      {/* Active Checkout Action */}
      <div className="pt-2 space-y-2.5">
        <Button
          type="button"
          variant="amber"
          size="lg"
          fullWidth
          onClick={handleCheckout}
          className="font-extrabold text-sm sm:text-base py-3.5 shadow-lg shadow-amber-500/10 flex items-center justify-center gap-2"
        >
          Proceed to Checkout
          <ArrowRight className="h-4 w-4" />
        </Button>
        <p className="text-center text-[11px] text-slate-400 font-medium flex items-center justify-center gap-1.5">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          <span>Guaranteed safe & secure checkout</span>
        </p>
      </div>
    </div>
  );
};
