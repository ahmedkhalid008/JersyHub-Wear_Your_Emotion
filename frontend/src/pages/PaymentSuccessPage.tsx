import React from 'react';
import { useSearchParams, Link, Navigate } from 'react-router';
import { CheckCircle2, ShoppingBag, MapPin, PackageCheck, ArrowRight } from 'lucide-react';
import { useAuthStore } from '../stores/useAuthStore';
import { useOrderDetails, usePaymentDetails } from '../hooks/useCheckout';
import { formatCurrency } from '../utils';
import { Button } from '../components/ui/Button';

export const PaymentSuccessPage: React.FC = () => {
  const { isAuthenticated } = useAuthStore();
  const [searchParams] = useSearchParams();

  const orderId = searchParams.get('orderId') || searchParams.get('order_id') || undefined;
  const paymentId = searchParams.get('paymentId') || searchParams.get('payment_id') || undefined;

  const { data: order, isLoading: isOrderLoading } = useOrderDetails(orderId);
  const { data: payment, isLoading: isPaymentLoading } = usePaymentDetails(paymentId);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const isLoading = isOrderLoading || isPaymentLoading;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="rounded-3xl border border-emerald-500/30 bg-slate-900/80 backdrop-blur-md p-6 sm:p-10 text-center space-y-6 shadow-2xl shadow-emerald-500/5">
        {/* Success Icon */}
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-500/10 text-emerald-400 ring-8 ring-emerald-500/5">
          <CheckCircle2 className="h-10 w-10" />
        </div>

        {/* Title */}
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-black text-white">Payment Successful!</h1>
          <p className="text-sm text-slate-300 max-w-md mx-auto">
            Thank you for your purchase. Your payment has been confirmed by SSLCommerz and your order is being processed.
          </p>
        </div>

        {isLoading ? (
          <div className="h-40 rounded-2xl bg-slate-800/40 animate-pulse" />
        ) : order || payment ? (
          <div className="space-y-6 text-left">
            {/* Order Meta Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl border border-slate-800 bg-slate-950/60 text-xs">
              <div>
                <p className="text-slate-400 font-medium">Order Number</p>
                <p className="font-extrabold text-sm text-white mt-0.5">
                  {order?.orderNumber || orderId || 'VERIFIED'}
                </p>
              </div>

              <div>
                <p className="text-slate-400 font-medium">Payment Status</p>
                <span className="inline-flex items-center gap-1 font-extrabold text-emerald-400 mt-0.5">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {payment?.status || order?.status || 'PAID'}
                </span>
              </div>

              <div>
                <p className="text-slate-400 font-medium">Amount Paid</p>
                <p className="font-extrabold text-base text-amber-400 mt-0.5">
                  {formatCurrency(order?.totalAmount || payment?.amount || 0)}
                </p>
              </div>

              <div>
                <p className="text-slate-400 font-medium">Payment Gateway</p>
                <p className="font-extrabold text-slate-200 mt-0.5">
                  {payment?.gateway || 'SSLCommerz'}
                </p>
              </div>
            </div>

            {/* Recipient Details */}
            {order && (
              <div className="p-4 rounded-2xl border border-slate-800 bg-slate-950/40 text-xs space-y-2">
                <div className="flex items-center gap-2 text-amber-400 font-extrabold">
                  <MapPin className="h-4 w-4" />
                  <span>Delivery Address</span>
                </div>
                <p className="text-slate-200 font-semibold">{order.shippingRecipientName} ({order.shippingPhone})</p>
                <p className="text-slate-400">
                  {order.shippingAddressLine}, {order.shippingArea}, {order.shippingDistrict}, {order.shippingDivision}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="p-4 rounded-2xl border border-slate-800 bg-slate-950/40 text-xs text-slate-400">
            Order verification complete. You can view your order status in your account dashboard.
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 border-t border-slate-800">
          <Link to="/account" className="w-full sm:w-auto">
            <Button type="button" variant="outline" size="md" fullWidth className="border-slate-700">
              <PackageCheck className="h-4 w-4 mr-2" />
              View Account & Orders
            </Button>
          </Link>
          <Link to="/products" className="w-full sm:w-auto">
            <Button type="button" variant="amber" size="md" fullWidth>
              <ShoppingBag className="h-4 w-4 mr-2" />
              Continue Shopping
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
