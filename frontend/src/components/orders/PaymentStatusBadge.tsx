import React from 'react';
import { ShieldCheck, AlertCircle, XCircle, Clock, RotateCcw } from 'lucide-react';
import { PaymentStatus } from '../../types/domain';

export interface PaymentStatusBadgeProps {
  status: PaymentStatus;
  className?: string;
}

export const PaymentStatusBadge: React.FC<PaymentStatusBadgeProps> = ({ status, className = '' }) => {
  const getBadgeConfig = (status: PaymentStatus) => {
    switch (status) {
      case 'SUCCESS':
        return {
          label: 'Payment Successful',
          icon: ShieldCheck,
          styles: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
        };
      case 'FAILED':
        return {
          label: 'Payment Failed',
          icon: AlertCircle,
          styles: 'bg-red-500/10 text-red-400 border-red-500/30',
        };
      case 'CANCELLED':
        return {
          label: 'Payment Cancelled',
          icon: XCircle,
          styles: 'bg-slate-800 text-slate-400 border-slate-700',
        };
      case 'REFUNDED':
        return {
          label: 'Payment Refunded',
          icon: RotateCcw,
          styles: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
        };
      case 'INITIATED':
      case 'PENDING':
      default:
        return {
          label: 'Payment Initiated',
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
