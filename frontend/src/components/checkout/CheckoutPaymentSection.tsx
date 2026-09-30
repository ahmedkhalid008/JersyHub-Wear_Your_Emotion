import React from 'react';
import { CreditCard, Lock, ArrowRight, CheckCircle2, Banknote, ShieldCheck } from 'lucide-react';
import { Button } from '../ui/Button';

export interface CheckoutPaymentSectionProps {
  paymentMethod: 'SSLCOMMERZ' | 'CASH_ON_DELIVERY';
  onSelectPaymentMethod: (method: 'SSLCOMMERZ' | 'CASH_ON_DELIVERY') => void;
  onConfirmOrder: () => void;
  isSubmitting: boolean;
  disabled: boolean;
  errorMessage?: string | null;
}

export const CheckoutPaymentSection: React.FC<CheckoutPaymentSectionProps> = ({
  paymentMethod,
  onSelectPaymentMethod,
  onConfirmOrder,
  isSubmitting,
  disabled,
  errorMessage,
}) => {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 sm:p-6 backdrop-blur-md space-y-6">
      <div className="flex items-center gap-2.5 border-b border-slate-800 pb-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
          <CreditCard className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-extrabold text-white">Payment Method</h2>
          <p className="text-xs text-slate-400">Choose your preferred payment option</p>
        </div>
      </div>

      <div className="space-y-3">
        {/* SSLCommerz Option Card */}
        <div
          onClick={() => onSelectPaymentMethod('SSLCOMMERZ')}
          className={`cursor-pointer rounded-xl border p-4 space-y-3 transition-all ${
            paymentMethod === 'SSLCOMMERZ'
              ? 'border-amber-500 bg-amber-500/10 shadow-md shadow-amber-500/5'
              : 'border-slate-800 bg-slate-950/40 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500 text-slate-950 font-black text-xs">
                SSL
              </div>
              <div>
                <p className="font-extrabold text-sm text-white">Online Payment (SSLCommerz)</p>
                <p className="text-xs text-slate-400">bKash, Nagad, Rocket, Visa, Mastercard, AMEX, Net Banking</p>
              </div>
            </div>
            {paymentMethod === 'SSLCOMMERZ' ? (
              <CheckCircle2 className="h-5 w-5 text-amber-400" />
            ) : (
              <div className="h-5 w-5 rounded-full border border-slate-700" />
            )}
          </div>

          {paymentMethod === 'SSLCOMMERZ' && (
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-amber-500/10 text-[10px] text-amber-300/80 font-bold">
              <span className="px-2 py-0.5 rounded bg-slate-900/80 border border-slate-700">bKash</span>
              <span className="px-2 py-0.5 rounded bg-slate-900/80 border border-slate-700">Nagad</span>
              <span className="px-2 py-0.5 rounded bg-slate-900/80 border border-slate-700">Rocket</span>
              <span className="px-2 py-0.5 rounded bg-slate-900/80 border border-slate-700">VISA</span>
              <span className="px-2 py-0.5 rounded bg-slate-900/80 border border-slate-700">MasterCard</span>
              <span className="px-2 py-0.5 rounded bg-slate-900/80 border border-slate-700">Net Banking</span>
            </div>
          )}
        </div>

        {/* Cash on Delivery (COD) Option Card */}
        <div
          onClick={() => onSelectPaymentMethod('CASH_ON_DELIVERY')}
          className={`cursor-pointer rounded-xl border p-4 space-y-2 transition-all ${
            paymentMethod === 'CASH_ON_DELIVERY'
              ? 'border-amber-500 bg-amber-500/10 shadow-md shadow-amber-500/5'
              : 'border-slate-800 bg-slate-950/40 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 font-bold">
                <Banknote className="h-4 w-4" />
              </div>
              <div>
                <p className="font-extrabold text-sm text-white">Cash on Delivery (COD)</p>
                <p className="text-xs text-slate-400">Pay in cash when your jersey arrives at your doorstep</p>
              </div>
            </div>
            {paymentMethod === 'CASH_ON_DELIVERY' ? (
              <CheckCircle2 className="h-5 w-5 text-amber-400" />
            ) : (
              <div className="h-5 w-5 rounded-full border border-slate-700" />
            )}
          </div>
        </div>
      </div>

      {/* Error display if any */}
      {errorMessage && (
        <div className="p-3.5 rounded-xl border border-red-500/30 bg-red-500/10 text-xs text-red-300 font-semibold">
          {errorMessage}
        </div>
      )}

      {/* Confirm Button */}
      <div className="space-y-3 pt-2">
        <Button
          type="button"
          variant="amber"
          size="lg"
          fullWidth
          isLoading={isSubmitting}
          disabled={disabled || isSubmitting}
          onClick={onConfirmOrder}
          className="font-extrabold text-sm sm:text-base py-3.5 shadow-lg shadow-amber-500/10"
        >
          {isSubmitting ? (
            'Processing Order...'
          ) : paymentMethod === 'CASH_ON_DELIVERY' ? (
            <>
              Confirm Order (Cash on Delivery)
              <ArrowRight className="ml-2 h-5 w-5" />
            </>
          ) : (
            <>
              Place Order & Pay with SSLCommerz
              <ArrowRight className="ml-2 h-5 w-5" />
            </>
          )}
        </Button>

        <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500">
          {paymentMethod === 'CASH_ON_DELIVERY' ? (
            <>
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              <span>Safe & reliable nationwide delivery. Pay upon inspection.</span>
            </>
          ) : (
            <>
              <Lock className="h-3.5 w-3.5 text-amber-400" />
              <span>Encrypted payment. You will be redirected to SSLCommerz portal.</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
