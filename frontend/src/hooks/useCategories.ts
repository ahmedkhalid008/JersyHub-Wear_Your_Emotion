import { useQuery } from '@tanstack/react-query';
import { categoryService } from '../services/categoryService';
import { queryKeys } from '../services/api/queryKeys';

export function useCategories() {
  return useQuery({
    queryKey: queryKeys.categories.all,
    queryFn: () => categoryService.getCategories(),
    staleTime: 1000 * 60 * 10, // 10 minutes stale time for static category tree
  });
}
