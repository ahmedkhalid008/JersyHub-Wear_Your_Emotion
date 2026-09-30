import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Shirt, Trash2, Plus, Minus, AlertTriangle } from 'lucide-react';
import { CartItemResponse } from '../../types/domain';
import { formatCurrency } from '../../utils';

export interface CartItemCardProps {
  item: CartItemResponse;
  onUpdateQuantity: (cartItemId: string, newQuantity: number) => Promise<void>;
  onRemoveItem: (cartItemId: string) => Promise<void>;
  isUpdating?: boolean;
}

export const CartItemCard: React.FC<CartItemCardProps> = ({
  item,
  onUpdateQuantity,
  onRemoveItem,
  isUpdating = false,
}) => {
  const [imgError, setImgError] = useState(false);

  const handleDecrease = () => {
    if (item.quantity > 1) {
      onUpdateQuantity(item.id, item.quantity - 1);
    }
  };

  const handleIncrease = () => {
    if (item.stockQuantity > item.quantity) {
      onUpdateQuantity(item.id, item.quantity + 1);
    }
  };

  const isMaxStockReached = item.quantity >= item.stockQuantity;

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 sm:p-5 backdrop-blur-md transition-all hover:border-slate-700">
      {/* Left: Image & Info */}
      <div className="flex items-center gap-4 w-full sm:w-auto">
        <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border border-slate-800 bg-slate-950 flex items-center justify-center">
          {item.imageUrl && !imgError ? (
            <img
              src={item.imageUrl}
              alt={item.productName}
              onError={() => setImgError(true)}
              className="h-full w-full object-cover object-center"
            />
          ) : (
            <Shirt className="h-10 w-10 text-slate-700" />
          )}
        </div>

        <div className="space-y-1 min-w-0 flex-1">
          <h3 className="text-sm font-bold text-white truncate hover:text-amber-400 transition-colors">
            <Link to={`/products/${item.productId}`}>{item.productName}</Link>
          </h3>

          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
            {item.size && (
              <span className="rounded-md bg-slate-800 px-2 py-0.5 font-bold text-amber-300 border border-slate-700">
                Size: {item.size}
              </span>
            )}
            <span className="text-slate-300 font-semibold">{formatCurrency(item.unitPrice)}</span>
          </div>

          {/* Stock warnings */}
          {!item.available && (
            <span className="inline-flex items-center gap-1 text-[11px] text-red-400 font-medium">
              <AlertTriangle className="h-3 w-3" />
              Unavailable / Out of Stock
            </span>
          )}
        </div>
      </div>

      {/* Right: Quantity controls & Line Total */}
      <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-800">
        {/* Quantity selector */}
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-xl border border-slate-800 bg-slate-950 p-1">
            <button
              type="button"
              disabled={item.quantity <= 1 || isUpdating}
              onClick={handleDecrease}
              aria-label={`Decrease quantity of ${item.productName}`}
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white disabled:opacity-30 transition-colors"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="min-w-[2rem] text-center text-xs font-bold text-white">
              {item.quantity}
            </span>
            <button
              type="button"
              disabled={isMaxStockReached || isUpdating}
              onClick={handleIncrease}
              aria-label={`Increase quantity of ${item.productName}`}
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white disabled:opacity-30 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Subtotal & Delete action */}
        <div className="flex items-center gap-4">
          <span className="text-sm font-extrabold text-white min-w-[4.5rem] text-right">
            {formatCurrency(item.subtotal)}
          </span>

          <button
            type="button"
            disabled={isUpdating}
            onClick={() => onRemoveItem(item.id)}
            aria-label={`Remove ${item.productName} from cart`}
            className="rounded-xl p-2 text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors focus:outline-none"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
