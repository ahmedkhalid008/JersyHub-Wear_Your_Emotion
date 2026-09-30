import React from 'react';
import { LucideIcon } from 'lucide-react';

export interface AdminStatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  isLoading?: boolean;
  variant?: 'default' | 'amber' | 'emerald' | 'blue' | 'purple';
}

export const AdminStatCard: React.FC<AdminStatCardProps> = ({
  title,
  value,
  icon: Icon,
  description,
  isLoading = false,
  variant = 'default',
}) => {
  const variantStyles = {
    default: 'border-slate-800 bg-slate-900/60 text-slate-400',
    amber: 'border-amber-500/30 bg-amber-500/5 text-amber-400',
    emerald: 'border-emerald-500/30 bg-emerald-500/5 text-emerald-400',
    blue: 'border-blue-500/30 bg-blue-500/5 text-blue-400',
    purple: 'border-purple-500/30 bg-purple-500/5 text-purple-400',
  };

  return (
    <div className={`rounded-2xl border p-5 backdrop-blur-md space-y-3 ${variantStyles[variant]}`}>
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">{title}</span>
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-950/60 border border-slate-800">
          <Icon className="h-5 w-5" />
        </div>
      </div>

      {isLoading ? (
        <div className="h-8 w-24 rounded bg-slate-800 animate-pulse" />
      ) : (
        <div className="space-y-0.5">
          <p className="text-2xl sm:text-3xl font-black text-white tracking-tight">{value}</p>
          {description && <p className="text-[11px] text-slate-400">{description}</p>}
        </div>
      )}
    </div>
  );
};
