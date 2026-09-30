import React, { useState } from 'react';
import { useParams, Link, Navigate } from 'react-router';
import { ArrowLeft, Download, Calendar, MapPin, AlertCircle, XCircle } from 'lucide-react';
import { useAuthStore } from '../stores/useAuthStore';
import { useOrderDetails, useDownloadInvoice, useCancelOrder } from '../hooks/useOrders';
import { OrderStatusBadge } from '../components/orders/OrderStatusBadge';
import { OrderDetailsSkeleton } from '../components/orders/OrderDetailsSkeleton';
import { formatCurrency } from '../utils';
import { Button } from '../components/ui/Button';

export const OrderDetailsPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const { isAuthenticated } = useAuthStore();

  const { data: order, isLoading, isError, refetch } = useOrderDetails(orderId);
  const downloadInvoiceMutation = useDownloadInvoice();
  const cancelOrderMutation = useCancelOrder();

  const [cancelError, setCancelError] = useState<string | null>(null);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (isLoading) {
    return <OrderDetailsSkeleton />;
  }

  if (isError || !order) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center space-y-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 text-red-400">
          <AlertCircle className="h-8 w-8" />
        </div>
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl font-black text-white">Order Not Found</h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-sm mx-auto">
            The requested order could not be loaded or does not belong to your account.
          </p>
        </div>
        <div className="flex items-center justify-center gap-3 pt-2">
          <Button type="button" variant="outline" size="sm" onClick={() => refetch()} className="border-slate-700">
            Try Again
          </Button>
          <Link to="/orders">
            <Button type="button" variant="amber" size="sm">
              <ArrowLeft className="h-4 w-4 mr-1.5" />
              Back to Orders
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const formattedDate = new Date(order.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const handleDownloadInvoice = () => {
    downloadInvoiceMutation.mutate({
      orderId: order.id,
      orderNumber: order.orderNumber,
    });
  };

  const handleCancelOrder = async () => {
    setCancelError(null);
    try {
      await cancelOrderMutation.mutateAsync(order.id);
    } catch {
      setCancelError('Unable to cancel order. Please refresh and try again.');
    }
  };

  const canCancel = order.status === 'PENDING_PAYMENT';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Bar / Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <Link to="/orders">
            <Button type="button" variant="outline" size="sm" className="border-slate-800 text-slate-300">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black font-mono text-white tracking-tight">
                {order.orderNumber}
              </h1>
              <OrderStatusBadge status={order.status} />
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1">
              <Calendar className="h-3.5 w-3.5 text-amber-400" />
              Placed on {formattedDate}
            </p>
          </div>
        </div>

        {/* Invoice Download Action */}
        <Button
          type="button"
          variant="amber"
          size="sm"
          isLoading={downloadInvoiceMutation.isPending}
          onClick={handleDownloadInvoice}
          className="font-bold text-xs"
        >
          <Download className="h-4 w-4 mr-1.5" />
          Download PDF Invoice
        </Button>
      </div>

      {cancelError && (
        <div className="p-3.5 rounded-xl border border-red-500/30 bg-red-500/10 text-xs text-red-300 font-semibold">
          {cancelError}
        </div>
      )}

      {/* Main Order Details Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left 8 Cols: Itemized Snapshot */}
        <div className="lg:col-span-8 space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 sm:p-6 backdrop-blur-md space-y-4">
            <h2 className="text-sm font-extrabold text-white uppercase tracking-wider border-b border-slate-800 pb-3">
              Order Items ({order.items.length})
            </h2>

            <div className="divide-y divide-slate-800/80">
              {order.items.map((item) => (
                <div key={item.id} className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                  <div className="space-y-1 min-w-0">
                    <p className="font-extrabold text-sm text-white truncate">{item.productName}</p>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      {item.size && (
                        <span className="px-1.5 py-0.5 bg-slate-800 rounded font-semibold text-[10px]">
                          Size: {item.size}
                        </span>
                      )}
                      {item.sku && <span className="font-mono text-[10px]">SKU: {item.sku}</span>}
                      <span>Qty: {item.quantity}</span>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0 text-xs">
                    <p className="font-black text-amber-400 text-sm">{formatCurrency(item.subtotal)}</p>
                    <p className="text-[10px] text-slate-500">{formatCurrency(item.unitPrice)} each</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping Address Snapshot */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 sm:p-6 backdrop-blur-md space-y-3">
            <div className="flex items-center gap-2 text-amber-400 font-extrabold text-sm">
              <MapPin className="h-4 w-4" />
              <span>Shipping Address</span>
            </div>
            <div className="text-xs text-slate-300 space-y-1">
              <p className="font-bold text-white">
                {order.shippingRecipientName} ({order.shippingPhone})
              </p>
              <p>
                {order.shippingAddressLine}, {order.shippingArea}, {order.shippingDistrict},{' '}
                {order.shippingDivision}
                {order.shippingPostalCode ? ` - ${order.shippingPostalCode}` : ''}
              </p>
            </div>
          </div>
        </div>

        {/* Right 4 Cols: Order Financial Summary & Actions */}
        <div className="lg:col-span-4 space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 sm:p-6 backdrop-blur-md space-y-4">
            <h2 className="text-sm font-extrabold text-white uppercase tracking-wider border-b border-slate-800 pb-3">
              Order Breakdown
            </h2>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal</span>
                <span className="font-bold text-slate-200">{formatCurrency(order.subtotal)}</span>
              </div>

              {order.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-400 font-semibold">
                  <span>Coupon Discount</span>
                  <span>-{formatCurrency(order.discountAmount)}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-400">
                <span>Shipping Fee</span>
                <span className="font-bold text-slate-200">{formatCurrency(order.shippingAmount)}</span>
              </div>

              <div className="border-t border-slate-800 pt-3 flex justify-between items-center text-sm">
                <span className="font-extrabold text-white">Total</span>
                <span className="font-black text-amber-400 text-lg">
                  {formatCurrency(order.totalAmount)}
                </span>
              </div>
            </div>
          </div>

          {canCancel && (
            <div className="p-4 rounded-2xl border border-red-500/20 bg-red-500/5 space-y-3">
              <p className="text-xs text-red-300">
                This order has not been paid yet. You can cancel it and release reserved stock.
              </p>
              <Button
                type="button"
                variant="danger"
                size="sm"
                fullWidth
                isLoading={cancelOrderMutation.isPending}
                onClick={handleCancelOrder}
                className="text-xs font-bold"
              >
                <XCircle className="h-4 w-4 mr-1.5" />
                Cancel Order
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
