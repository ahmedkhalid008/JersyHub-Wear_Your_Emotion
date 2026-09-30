import { useQuery } from '@tanstack/react-query';
import { productService } from '../services/productService';
import { queryKeys } from '../services/api/queryKeys';
import { ProductQueryParams } from '../types/domain';

export function useProducts(params: ProductQueryParams) {
  return useQuery({
    queryKey: queryKeys.products.list(params as Record<string, unknown>),
    queryFn: () => productService.getProducts(params),
    staleTime: 1000 * 60 * 2, // 2 minutes stale time to avoid redundant refetches
  });
}

export function useProductDetail(id?: string) {
  return useQuery({
    queryKey: queryKeys.products.detail(id || ''),
    queryFn: () => productService.getProductById(id!),
    enabled: Boolean(id),
    staleTime: 1000 * 60 * 5,
  });
}
