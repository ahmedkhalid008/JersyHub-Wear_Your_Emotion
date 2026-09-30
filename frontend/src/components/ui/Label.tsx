import React from 'react';
import { cn } from '../../lib/utils';

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

export const Label: React.FC<LabelProps> = ({ className, children, required, ...props }) => {
  return (
    <label
      className={cn('block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5', className)}
      {...props}
    >
      {children}
      {required && <span className="ml-1 text-amber-500">*</span>}
    </label>
  );
};
