import React from 'react';
import { Link } from 'react-router';
import { Calendar, Package, ChevronRight, MapPin } from 'lucide-react';
import { OrderResponse } from '../../types/domain';
import { OrderStatusBadge } from './OrderStatusBadge';
import { formatCurrency } from '../../utils';
import { Button } from '../ui/Button';

export interface OrderCardProps {
  order: OrderResponse;
}

export const OrderCard: React.FC<OrderCardProps> = ({ order }) => {
  const itemCount = order.items ? order.items.reduce((sum, item) => sum + item.quantity, 0) : 0;
  const formattedDate = new Date(order.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 sm:p-6 backdrop-blur-md transition-all hover:border-slate-700 space-y-4">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3.5">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm sm:text-base font-black text-white">
              {order.orderNumber}
            </span>
            <OrderStatusBadge status={order.status} />
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5 text-amber-400" />
              {formattedDate}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Package className="h-3.5 w-3.5 text-slate-500" />
              {itemCount} {itemCount === 1 ? 'item' : 'items'}
            </span>
          </div>
        </div>

        <div className="text-left sm:text-right">
          <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Total Amount</p>
          <p className="text-lg font-black text-amber-400">{formatCurrency(order.totalAmount)}</p>
        </div>
      </div>

      {/* Recipient & Action Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-1.5 text-slate-300">
          <MapPin className="h-4 w-4 text-slate-500 flex-shrink-0" />
          <span className="truncate max-w-xs sm:max-w-md">
            Deliver to {order.shippingRecipientName}, {order.shippingDistrict}
          </span>
        </div>

        <Link to={`/orders/${order.id}`}>
          <Button type="button" variant="outline" size="sm" className="w-full sm:w-auto text-xs border-slate-700">
            View Order Details
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </Link>
      </div>
    </div>
  );
};
