import React from 'react';
import { cn } from '../../lib/utils';

export interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  actions,
  className,
  ...props
}) => {
  return (
    <div
      className={cn('flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-2 border-b border-slate-800/60', className)}
      {...props}
    >
      <div className="space-y-1">
        <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl uppercase">{title}</h1>
        {description && <p className="text-sm text-slate-400 max-w-2xl">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </div>
  );
};
