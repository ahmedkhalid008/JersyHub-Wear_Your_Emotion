import React from 'react';
import { ProductSummary } from '../../types/domain';
import { ProductCard } from './ProductCard';

export interface ProductGridProps {
  products: ProductSummary[];
}

export const ProductGrid: React.FC<ProductGridProps> = ({ products }) => {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};
