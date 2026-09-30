import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Shirt, ShieldCheck, Tag } from 'lucide-react';
import { ProductSummary } from '../../types/domain';
import { Badge } from '../ui/Badge';
import { formatCurrency } from '../../utils';

export interface ProductCardProps {
  product: ProductSummary;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const [imgError, setImgError] = useState(false);

  const getStockBadge = () => {
    switch (product.stockStatus) {
      case 'IN_STOCK':
        return <Badge variant="success" size="sm">In Stock</Badge>;
      case 'LOW_STOCK':
        return <Badge variant="warning" size="sm">Low Stock</Badge>;
      case 'OUT_OF_STOCK':
      default:
        return <Badge variant="danger" size="sm">Out of Stock</Badge>;
    }
  };

  const getJerseyTypeLabel = (type?: string) => {
    if (!type) return null;
    return type.replace('_', ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
  };

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 transition-all duration-300 hover:border-amber-500/40 hover:bg-slate-900 hover:shadow-xl hover:shadow-amber-500/5">
      {/* Image container */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-950/80">
        {product.primaryImageUrl && !imgError ? (
          <img
            src={product.primaryImageUrl}
            alt={product.name}
            onError={() => setImgError(true)}
            className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-slate-950 p-4 text-slate-600">
            <Shirt className="h-16 w-16 text-slate-700/60 group-hover:text-amber-500/30 transition-colors" />
            <span className="mt-2 text-xs text-slate-500 font-medium">Jersey Image</span>
          </div>
        )}

        {/* Top Badges overlay */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-1 pointer-events-none">
          <div className="flex flex-wrap gap-1">
            {product.featured && (
              <Badge variant="default" size="sm" className="bg-amber-500 text-slate-950 border-amber-400 font-bold">
                Featured
              </Badge>
            )}
            {product.authenticity && (
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-950/80 px-2 py-0.5 text-[10px] font-medium text-amber-300 border border-amber-500/30 backdrop-blur-md">
                <ShieldCheck className="h-3 w-3" />
                {product.authenticity === 'AUTHENTIC' ? 'Authentic' : 'Replica'}
              </span>
            )}
          </div>
          <div>{getStockBadge()}</div>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4">
        {/* Subtitle / Brand & Team */}
        <div className="mb-1 flex items-center gap-2 text-[11px] font-medium text-slate-400">
          {product.brand && (
            <span className="uppercase tracking-wider text-amber-400/90">{product.brand}</span>
          )}
          {product.brand && product.team && <span>•</span>}
          {product.team && <span className="truncate text-slate-300">{product.team}</span>}
        </div>

        {/* Product Title */}
        <h3 className="line-clamp-2 text-sm font-bold text-white group-hover:text-amber-400 transition-colors">
          <Link to={`/products/${product.id}`} className="focus:outline-none focus:underline">
            <span className="absolute inset-0" aria-hidden="true" />
            {product.name}
          </Link>
        </h3>

        {/* Metadata Footer */}
        <div className="mt-auto pt-3 flex items-center justify-between border-t border-slate-800/80">
          <div className="flex items-baseline gap-1">
            <span className="text-base font-extrabold text-white">
              {formatCurrency(product.basePrice)}
            </span>
          </div>

          {product.jerseyType && (
            <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 font-medium">
              <Tag className="h-3 w-3 text-slate-500" />
              {getJerseyTypeLabel(product.jerseyType)}
            </span>
          )}
        </div>
      </div>
    </article>
  );
};
