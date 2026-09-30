import React from 'react';
import { Clock, CheckCircle2, Package, Truck, CheckCheck, XCircle, RotateCcw } from 'lucide-react';
import { OrderStatus } from '../../types/domain';

export interface OrderStatusBadgeProps {
  status: OrderStatus;
  className?: string;
}

export const OrderStatusBadge: React.FC<OrderStatusBadgeProps> = ({ status, className = '' }) => {
  const getBadgeConfig = (status: OrderStatus) => {
    switch (status) {
      case 'PAID':
        return {
          label: 'Paid',
          icon: CheckCircle2,
          styles: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
        };
      case 'PROCESSING':
        return {
          label: 'Processing',
          icon: Package,
          styles: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
        };
      case 'SHIPPED':
        return {
          label: 'Shipped',
          icon: Truck,
          styles: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
        };
      case 'DELIVERED':
        return {
          label: 'Delivered',
          icon: CheckCheck,
          styles: 'bg-emerald-500/15 text-emerald-300 border-emerald-400/40',
        };
      case 'CANCELLED':
        return {
          label: 'Cancelled',
          icon: XCircle,
          styles: 'bg-red-500/10 text-red-400 border-red-500/30',
        };
      case 'REFUND_REQUESTED':
        return {
          label: 'Refund Requested',
          icon: RotateCcw,
          styles: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
        };
      case 'REFUNDED':
        return {
          label: 'Refunded',
          icon: RotateCcw,
          styles: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
        };
      case 'PENDING_PAYMENT':
      case 'PENDING':
      default:
        return {
          label: 'Pending Payment',
          icon: Clock,
          styles: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
        };
    }
  };

  const config = getBadgeConfig(status);
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${config.styles} ${className}`}
    >
      <Icon className="h-3.5 w-3.5" />
      <span>{config.label}</span>
    </span>
  );
};
