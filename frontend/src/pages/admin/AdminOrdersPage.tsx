import React, { useState } from 'react';
import { ShoppingBag, Eye, MapPin, X } from 'lucide-react';
import { useAdminOrders, useAdminOrderDetail } from '../../hooks/useAdmin';
import { OrderStatusBadge } from '../../components/orders/OrderStatusBadge';
import { PaymentStatusBadge } from '../../components/orders/PaymentStatusBadge';
import { formatCurrency } from '../../utils';
import { Button } from '../../components/ui/Button';

export const AdminOrdersPage: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [page, setPage] = useState(0);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const { data: pageData, isLoading, isError, refetch } = useAdminOrders(statusFilter, page, 15);
  const { data: selectedOrder, isLoading: isDetailLoading } = useAdminOrderDetail(selectedOrderId || undefined);

  const orders = pageData?.content || [];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-white">Customer Orders Overview</h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
              Admin Orders
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Monitor and audit order processing across all customer accounts.
          </p>
        </div>

        <select
          value={statusFilter || 'ALL'}
          onChange={(e) => {
            const val = e.target.value;
            setStatusFilter(val === 'ALL' ? undefined : val);
            setPage(0);
          }}
          className="rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-amber-500"
        >
          <option value="ALL">All Order Statuses</option>
          <option value="PENDING_PAYMENT">Pending Payment</option>
          <option value="PAID">Paid</option>
          <option value="PROCESSING">Processing</option>
          <option value="SHIPPED">Shipped</option>
          <option value="DELIVERED">Delivered</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      {/* Order Detail Modal */}
      {selectedOrderId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-amber-400" />
                <h2 className="text-base font-black font-mono text-white">
                  {selectedOrder?.orderNumber || 'Loading...'}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrderId(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {isDetailLoading ? (
              <div className="h-40 rounded-xl bg-slate-800/40 animate-pulse" />
            ) : selectedOrder ? (
              <div className="space-y-4 text-xs">
                {/* Meta details */}
                <div className="grid grid-cols-2 gap-4 p-3 rounded-xl border border-slate-800 bg-slate-950">
                  <div>
                    <span className="text-slate-500 font-semibold">Customer</span>
                    <p className="font-bold text-white mt-0.5">{selectedOrder.customerName}</p>
                    <p className="text-[10px] text-slate-400">{selectedOrder.customerEmail}</p>
                  </div>
                  <div>
                    <span className="text-slate-500 font-semibold">Status</span>
                    <div className="mt-0.5">
                      <OrderStatusBadge status={selectedOrder.status} />
                    </div>
                  </div>
                </div>

                {/* Items */}
                <div className="space-y-2">
                  <h3 className="font-bold text-slate-300 uppercase text-[10px]">Order Snapshot</h3>
                  <div className="divide-y divide-slate-800 border border-slate-800 rounded-xl p-3 bg-slate-950">
                    {selectedOrder.items.map((item) => (
                      <div key={item.id} className="py-2 flex items-center justify-between">
                        <div>
                          <p className="font-bold text-white">{item.productName}</p>
                          <p className="text-[10px] text-slate-500">Qty: {item.quantity} {item.size ? `• Size: ${item.size}` : ''}</p>
                        </div>
                        <p className="font-bold text-amber-400">{formatCurrency(item.subtotal)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Totals & Delivery */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-xl border border-slate-800 bg-slate-950 space-y-1">
                    <span className="text-[10px] text-amber-400 font-bold flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> Shipping Recipient
                    </span>
                    <p className="font-semibold text-white">{selectedOrder.shippingRecipientName} ({selectedOrder.shippingPhone})</p>
                    <p className="text-[10px] text-slate-400">{selectedOrder.shippingAddressLine}, {selectedOrder.shippingDistrict}</p>
                  </div>

                  <div className="p-3 rounded-xl border border-slate-800 bg-slate-950 text-right space-y-1">
                    <span className="text-[10px] text-slate-500 font-bold">Total Amount</span>
                    <p className="text-lg font-black text-amber-400">{formatCurrency(selectedOrder.totalAmount)}</p>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* Orders Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-md">
        {isLoading ? (
          <div className="h-64 bg-slate-800/40 rounded-xl animate-pulse" />
        ) : isError ? (
          <div className="p-4 text-center text-xs text-red-400">
            Failed to load admin orders. <button onClick={() => refetch()} className="underline font-bold">Retry</button>
          </div>
        ) : orders.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500">No orders match status criteria.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-3">Order Number</th>
                  <th className="py-3 px-3">Customer</th>
                  <th className="py-3 px-3">Order Status</th>
                  <th className="py-3 px-3">Payment Status</th>
                  <th className="py-3 px-3 text-right">Total</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {orders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-800/40">
                    <td className="py-3 px-3 font-mono font-bold text-white">{ord.orderNumber}</td>
                    <td className="py-3 px-3">
                      <div className="text-slate-200 font-bold">{ord.customerName}</div>
                      <div className="text-[10px] text-slate-500">{ord.customerEmail}</div>
                    </td>
                    <td className="py-3 px-3">
                      <OrderStatusBadge status={ord.status} />
                    </td>
                    <td className="py-3 px-3">
                      <PaymentStatusBadge status={ord.paymentStatus} />
                    </td>
                    <td className="py-3 px-3 text-right font-black text-amber-400">
                      {formatCurrency(ord.totalAmount)}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedOrderId(ord.id)}
                        className="text-[10px] border-slate-800 text-slate-300 hover:text-white"
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        Details
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
