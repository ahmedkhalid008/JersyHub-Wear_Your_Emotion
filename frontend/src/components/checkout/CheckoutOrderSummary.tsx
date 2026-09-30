import React from 'react';
import { ShoppingBag, Tag, ShieldCheck } from 'lucide-react';
import { CartResponse } from '../../types/domain';
import { formatCurrency } from '../../utils';

export interface CheckoutOrderSummaryProps {
  cart: CartResponse;
  couponCode?: string | null;
  discountAmount?: number;
}

export const CheckoutOrderSummary: React.FC<CheckoutOrderSummaryProps> = ({
  cart,
  couponCode,
  discountAmount = 0,
}) => {
  const subtotal = cart.total;
  const shipping = 60; // Standard shipping inside BD if applicable, backend computes final total
  const finalTotal = Math.max(0, subtotal - discountAmount + shipping);

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 sm:p-6 backdrop-blur-md space-y-6">
      <div className="flex items-center gap-2.5 border-b border-slate-800 pb-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
          <ShoppingBag className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-extrabold text-white">Order Summary</h2>
          <p className="text-xs text-slate-400">
            {cart.totalItems} {cart.totalItems === 1 ? 'item' : 'items'} in your order
          </p>
        </div>
      </div>

      {/* Item List */}
      <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
        {cart.items.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between gap-3 p-3 rounded-xl border border-slate-800/80 bg-slate-950/40 text-xs"
          >
            <div className="flex items-center gap-3 min-w-0">
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt={item.productName}
                  className="h-12 w-12 rounded-lg object-cover bg-slate-800 border border-slate-700/60 flex-shrink-0"
                />
              ) : (
                <div className="h-12 w-12 rounded-lg bg-slate-800 border border-slate-700/60 flex items-center justify-center text-slate-500 font-bold flex-shrink-0">
                  {item.productName.charAt(0)}
                </div>
              )}
              <div className="min-w-0">
                <p className="font-extrabold text-white truncate">{item.productName}</p>
                <div className="flex items-center gap-2 text-slate-400 mt-0.5">
                  {item.size && (
                    <span className="inline-block px-1.5 py-0.5 bg-slate-800 rounded font-semibold text-[10px]">
                      Size: {item.size}
                    </span>
                  )}
                  <span>Qty: {item.quantity}</span>
                </div>
              </div>
            </div>

            <div className="text-right flex-shrink-0">
              <p className="font-extrabold text-amber-400">{formatCurrency(item.subtotal)}</p>
              <p className="text-[10px] text-slate-500">{formatCurrency(item.unitPrice)} each</p>
            </div>
          </div>
        ))}
      </div>

      {/* Financial Breakdown */}
      <div className="space-y-2.5 border-t border-slate-800 pt-4 text-xs">
        <div className="flex justify-between text-slate-400">
          <span>Subtotal</span>
          <span className="font-bold text-slate-200">{formatCurrency(subtotal)}</span>
        </div>

        {couponCode && discountAmount > 0 && (
          <div className="flex justify-between text-emerald-400 font-semibold">
            <span className="flex items-center gap-1">
              <Tag className="h-3.5 w-3.5" />
              Discount ({couponCode})
            </span>
            <span>-{formatCurrency(discountAmount)}</span>
          </div>
        )}

        <div className="flex justify-between text-slate-400">
          <span>Standard Delivery</span>
          <span className="font-bold text-slate-200">{formatCurrency(shipping)}</span>
        </div>

        <div className="border-t border-slate-800/80 pt-3 flex justify-between items-center text-base">
          <span className="font-extrabold text-white">Total Payable</span>
          <span className="font-black text-amber-400 text-xl">{formatCurrency(finalTotal)}</span>
        </div>
      </div>

      {/* Trust badge */}
      <div className="flex items-center gap-2 text-[11px] text-slate-400 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
        <ShieldCheck className="h-4 w-4 text-amber-400 flex-shrink-0" />
        <span>Price, discounts, and inventory are verified authoritatively by backend at checkout.</span>
      </div>
    </div>
  );
};
