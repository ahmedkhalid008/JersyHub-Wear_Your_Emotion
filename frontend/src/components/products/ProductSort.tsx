import React from 'react';
import { ArrowUpDown } from 'lucide-react';

export interface ProductSortProps {
  value: string;
  onChange: (sortKey: string) => void;
}

export const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest Arrivals' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'name_asc', label: 'Name: A to Z' },
  { value: 'name_desc', label: 'Name: Z to A' },
] as const;

export const ProductSort: React.FC<ProductSortProps> = ({ value, onChange }) => {
  return (
    <div className="flex items-center gap-2">
      <label htmlFor="product-sort-select" className="sr-only sm:not-sr-only text-xs font-semibold text-slate-400 whitespace-nowrap flex items-center gap-1.5">
        <ArrowUpDown className="h-3.5 w-3.5 text-amber-500" />
        Sort by:
      </label>
      <select
        id="product-sort-select"
        value={value || 'newest'}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Sort products"
        className="rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs font-medium text-slate-200 shadow-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value} className="bg-slate-900 text-slate-200">
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};
