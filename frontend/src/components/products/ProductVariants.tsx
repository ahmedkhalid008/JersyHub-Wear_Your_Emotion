import React from 'react';
import { ProductVariant } from '../../types/domain';
import { formatCurrency } from '../../utils';

export interface ProductVariantsProps {
  variants: ProductVariant[];
  selectedVariantId: string | number | null;
  onSelectVariant: (variant: ProductVariant) => void;
  basePrice: number;
}

export const ProductVariants: React.FC<ProductVariantsProps> = ({
  variants,
  selectedVariantId,
  onSelectVariant,
  basePrice,
}) => {
  if (!variants || variants.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
          Select Jersey Size
        </label>
        {selectedVariantId && (
          <span className="text-xs font-medium text-amber-400">
            Selected Size: {variants.find((v) => String(v.id) === String(selectedVariantId))?.size}
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-2.5">
        {variants.map((variant) => {
          const isSelected = String(variant.id) === String(selectedVariantId);
          const isOutOfStock = variant.stockQuantity <= 0 || variant.active === false;
          const variantPrice = basePrice + (variant.additionalPrice || 0);

          return (
            <button
              key={variant.id}
              type="button"
              disabled={isOutOfStock}
              onClick={() => onSelectVariant(variant)}
              aria-label={`Select size ${variant.size}${
                isOutOfStock ? ' (Out of stock)' : ''
              }`}
              className={`group relative flex min-w-[3.5rem] flex-col items-center justify-center rounded-xl border px-3.5 py-2 transition-all ${
                isSelected
                  ? 'border-amber-500 bg-amber-500/10 text-amber-300 font-bold ring-2 ring-amber-500/30'
                  : isOutOfStock
                  ? 'border-slate-800/60 bg-slate-950/40 text-slate-600 cursor-not-allowed line-through'
                  : 'border-slate-800 bg-slate-900/80 text-slate-200 hover:border-slate-700 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span className="text-sm font-extrabold">{variant.size}</span>
              {variant.additionalPrice ? (
                <span className="text-[10px] text-slate-400 mt-0.5">
                  {formatCurrency(variantPrice)}
                </span>
              ) : null}

              {/* Stock tooltip indicator */}
              {!isOutOfStock && variant.stockQuantity > 0 && variant.stockQuantity <= 5 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-3.5 min-w-[0.875rem] items-center justify-center rounded-full bg-amber-500 px-1 text-[9px] font-bold text-slate-950">
                  {variant.stockQuantity}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
