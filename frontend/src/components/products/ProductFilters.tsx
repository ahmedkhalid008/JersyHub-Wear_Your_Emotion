import React, { useState } from 'react';
import { Filter, RotateCcw, DollarSign, Tag, ShieldCheck, Layers } from 'lucide-react';
import { CategoryResponse, JerseyAuthenticity, JerseyType, ProductQueryParams } from '../../types/domain';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';

export interface ProductFiltersProps {
  filters: ProductQueryParams;
  categories: CategoryResponse[];
  onFilterChange: (newFilters: Partial<ProductQueryParams>) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

const JERSEY_TYPES: { value: JerseyType; label: string }[] = [
  { value: 'HOME', label: 'Home Kit' },
  { value: 'AWAY', label: 'Away Kit' },
  { value: 'THIRD', label: 'Third Kit' },
  { value: 'TRAINING', label: 'Training' },
  { value: 'SPECIAL_EDITION', label: 'Special Edition' },
];

const AUTHENTICITY_OPTIONS: { value: JerseyAuthenticity; label: string }[] = [
  { value: 'AUTHENTIC', label: 'Player Authentic' },
  { value: 'REPLICA', label: 'Fan Replica' },
];

export const ProductFilters: React.FC<ProductFiltersProps> = ({
  filters,
  categories,
  onFilterChange,
  onClearFilters,
  hasActiveFilters,
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [minPriceInput, setMinPriceInput] = useState<string>(filters.minPrice?.toString() || '');
  const [maxPriceInput, setMaxPriceInput] = useState<string>(filters.maxPrice?.toString() || '');
  const [brandInput, setBrandInput] = useState<string>(filters.brand || '');

  const handleApplyPrice = (e: React.FormEvent) => {
    e.preventDefault();
    const min = minPriceInput ? parseFloat(minPriceInput) : undefined;
    const max = maxPriceInput ? parseFloat(maxPriceInput) : undefined;
    onFilterChange({
      minPrice: min && !isNaN(min) ? min : undefined,
      maxPrice: max && !isNaN(max) ? max : undefined,
    });
  };

  const handleApplyBrand = (e: React.FormEvent) => {
    e.preventDefault();
    onFilterChange({ brand: brandInput.trim() || undefined });
  };

  const filterContent = (
    <div className="space-y-6">
      {/* Active Filter Clear Header */}
      {hasActiveFilters && (
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <span className="text-xs font-semibold text-amber-400">Active Filters Applied</span>
          <button
            onClick={() => {
              setMinPriceInput('');
              setMaxPriceInput('');
              setBrandInput('');
              onClearFilters();
            }}
            className="flex items-center gap-1 text-xs font-medium text-slate-400 hover:text-white transition-colors"
          >
            <RotateCcw className="h-3 w-3" />
            Reset all
          </button>
        </div>
      )}

      {/* Category Filter */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Layers className="h-3.5 w-3.5 text-amber-500" />
          Category
        </h4>
        <div className="space-y-1">
          <button
            onClick={() => onFilterChange({ category: undefined })}
            className={`w-full text-left rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
              !filters.category
                ? 'bg-amber-500/10 text-amber-400 font-semibold border border-amber-500/20'
                : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => {
            const isSelected = filters.category === cat.slug;
            return (
              <div key={cat.id} className="space-y-1">
                <button
                  onClick={() => onFilterChange({ category: cat.slug })}
                  className={`w-full text-left rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors flex items-center justify-between ${
                    isSelected
                      ? 'bg-amber-500/10 text-amber-400 font-semibold border border-amber-500/20'
                      : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                  }`}
                >
                  <span>{cat.name}</span>
                </button>
                {/* Child categories */}
                {cat.children && cat.children.length > 0 && (
                  <div className="pl-3 space-y-1 border-l border-slate-800 ml-2">
                    {cat.children.map((child) => {
                      const isChildSelected = filters.category === child.slug;
                      return (
                        <button
                          key={child.id}
                          onClick={() => onFilterChange({ category: child.slug })}
                          className={`w-full text-left rounded-lg px-2 py-1 text-[11px] font-medium transition-colors ${
                            isChildSelected
                              ? 'bg-amber-500/10 text-amber-400 font-semibold'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          {child.name}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Jersey Type Filter */}
      <div className="space-y-2 border-t border-slate-800/80 pt-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Tag className="h-3.5 w-3.5 text-amber-500" />
          Jersey Type
        </h4>
        <div className="flex flex-wrap gap-1.5">
          {JERSEY_TYPES.map((type) => {
            const isSelected = filters.jerseyType === type.value;
            return (
              <button
                key={type.value}
                onClick={() =>
                  onFilterChange({
                    jerseyType: isSelected ? undefined : type.value,
                  })
                }
                className={`rounded-xl px-2.5 py-1 text-xs font-medium border transition-all ${
                  isSelected
                    ? 'bg-amber-500 text-slate-950 font-bold border-amber-400 shadow-sm'
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
                }`}
              >
                {type.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Authenticity Filter */}
      <div className="space-y-2 border-t border-slate-800/80 pt-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5 text-amber-500" />
          Authenticity
        </h4>
        <div className="flex flex-wrap gap-1.5">
          {AUTHENTICITY_OPTIONS.map((opt) => {
            const isSelected = filters.authenticity === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() =>
                  onFilterChange({
                    authenticity: isSelected ? undefined : opt.value,
                  })
                }
                className={`rounded-xl px-2.5 py-1 text-xs font-medium border transition-all ${
                  isSelected
                    ? 'bg-amber-500 text-slate-950 font-bold border-amber-400 shadow-sm'
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Brand Filter */}
      <div className="space-y-2 border-t border-slate-800/80 pt-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Brand</h4>
        <form onSubmit={handleApplyBrand} className="flex gap-2">
          <input
            type="text"
            value={brandInput}
            onChange={(e) => setBrandInput(e.target.value)}
            placeholder="e.g. Nike, Adidas"
            aria-label="Filter by brand"
            className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
          />
          <Button type="submit" size="sm" variant="outline" className="border-slate-800 text-xs px-3">
            Apply
          </Button>
        </form>
      </div>

      {/* Price Range Filter */}
      <div className="space-y-2 border-t border-slate-800/80 pt-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <DollarSign className="h-3.5 w-3.5 text-amber-500" />
          Price Range
        </h4>
        <form onSubmit={handleApplyPrice} className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              min="0"
              placeholder="Min ($)"
              value={minPriceInput}
              onChange={(e) => setMinPriceInput(e.target.value)}
              aria-label="Minimum price"
              className="w-full rounded-xl border border-slate-800 bg-slate-900 px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
            />
            <input
              type="number"
              min="0"
              placeholder="Max ($)"
              value={maxPriceInput}
              onChange={(e) => setMaxPriceInput(e.target.value)}
              aria-label="Maximum price"
              className="w-full rounded-xl border border-slate-800 bg-slate-900 px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
            />
          </div>
          <Button type="submit" size="sm" variant="outline" className="w-full border-slate-800 text-xs">
            Apply Price Filter
          </Button>
        </form>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Filter Button */}
      <div className="lg:hidden mb-4">
        <Button
          variant="outline"
          onClick={() => setMobileOpen(true)}
          className="w-full justify-between border-slate-800 bg-slate-900 text-slate-200"
        >
          <span className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-amber-500" />
            Filter Products
          </span>
          {hasActiveFilters && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-slate-950">
              !
            </span>
          )}
        </Button>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 flex-shrink-0 space-y-6 rounded-2xl border border-slate-800 bg-slate-900/40 p-5 backdrop-blur-sm self-start">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Filter className="h-4 w-4 text-amber-500" />
            Filters
          </h3>
        </div>
        {filterContent}
      </aside>

      {/* Mobile Modal Drawer */}
      <Modal isOpen={mobileOpen} onClose={() => setMobileOpen(false)} title="Filter Products">
        <div className="p-2">
          {filterContent}
          <div className="mt-6 border-t border-slate-800 pt-4 flex gap-2">
            <Button
              className="flex-1 bg-amber-500 text-slate-950 hover:bg-amber-400 font-bold"
              onClick={() => setMobileOpen(false)}
            >
              Show Results
            </Button>
            {hasActiveFilters && (
              <Button
                variant="outline"
                className="border-slate-800"
                onClick={() => {
                  setMinPriceInput('');
                  setMaxPriceInput('');
                  setBrandInput('');
                  onClearFilters();
                }}
              >
                Reset
              </Button>
            )}
          </div>
        </div>
      </Modal>
    </>
  );
};
