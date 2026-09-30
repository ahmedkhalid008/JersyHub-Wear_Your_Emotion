import React, { useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ShoppingBag, X } from 'lucide-react';
import { useProducts } from '../hooks/useProducts';
import { useCategories } from '../hooks/useCategories';
import { PageHeader } from '../components/ui/PageHeader';
import { ProductSearch } from '../components/products/ProductSearch';
import { ProductSort } from '../components/products/ProductSort';
import { ProductFilters } from '../components/products/ProductFilters';
import { ProductGrid } from '../components/products/ProductGrid';
import { ProductGridSkeleton } from '../components/products/ProductGridSkeleton';
import { ProductPagination } from '../components/products/ProductPagination';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorState } from '../components/ui/ErrorState';
import { Badge } from '../components/ui/Badge';
import { JerseyAuthenticity, JerseyType, ProductQueryParams } from '../types/domain';

export const ProductsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Extract query parameters from URL state safely
  const queryParams: ProductQueryParams = useMemo(() => {
    const search = searchParams.get('search') || undefined;
    const category = searchParams.get('category') || undefined;
    const brand = searchParams.get('brand') || undefined;
    const team = searchParams.get('team') || undefined;
    const league = searchParams.get('league') || undefined;
    const season = searchParams.get('season') || undefined;
    const jerseyTypeRaw = searchParams.get('jerseyType');
    const authenticityRaw = searchParams.get('authenticity');
    const sort = searchParams.get('sort') || 'newest';

    const minPriceRaw = searchParams.get('minPrice');
    const minPrice = minPriceRaw && !isNaN(Number(minPriceRaw)) ? Number(minPriceRaw) : undefined;

    const maxPriceRaw = searchParams.get('maxPrice');
    const maxPrice = maxPriceRaw && !isNaN(Number(maxPriceRaw)) ? Number(maxPriceRaw) : undefined;

    const pageRaw = searchParams.get('page');
    const page = pageRaw && !isNaN(Number(pageRaw)) && Number(pageRaw) >= 0 ? parseInt(pageRaw, 10) : 0;

    const jerseyType: JerseyType | undefined =
      jerseyTypeRaw && ['HOME', 'AWAY', 'THIRD', 'TRAINING', 'SPECIAL_EDITION'].includes(jerseyTypeRaw)
        ? (jerseyTypeRaw as JerseyType)
        : undefined;

    const authenticity: JerseyAuthenticity | undefined =
      authenticityRaw && ['AUTHENTIC', 'REPLICA'].includes(authenticityRaw)
        ? (authenticityRaw as JerseyAuthenticity)
        : undefined;

    return {
      search,
      category,
      brand,
      team,
      league,
      season,
      jerseyType,
      authenticity,
      minPrice,
      maxPrice,
      sort,
      page,
      size: 20,
    };
  }, [searchParams]);

  // Fetch categories & products via TanStack Query
  const { data: categories = [] } = useCategories();
  const {
    data: productsPage,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useProducts(queryParams);

  // Helper to update URL search parameters while maintaining or resetting page
  const updateUrlParams = useCallback(
    (updates: Partial<ProductQueryParams>, resetPage = true) => {
      setSearchParams(
        (prev) => {
          const nextParams = new URLSearchParams(prev);

          Object.entries(updates).forEach(([key, val]) => {
            if (val === undefined || val === null || val === '') {
              nextParams.delete(key);
            } else {
              nextParams.set(key, String(val));
            }
          });

          if (resetPage) {
            nextParams.set('page', '0');
          }

          return nextParams;
        },
        { replace: false }
      );
    },
    [setSearchParams]
  );

  const handleSearchChange = useCallback(
    (newSearch: string) => {
      updateUrlParams({ search: newSearch.trim() || undefined });
    },
    [updateUrlParams]
  );

  const handleSortChange = useCallback(
    (newSort: string) => {
      updateUrlParams({ sort: newSort });
    },
    [updateUrlParams]
  );

  const handleFilterChange = useCallback(
    (newFilters: Partial<ProductQueryParams>) => {
      updateUrlParams(newFilters);
    },
    [updateUrlParams]
  );

  const handleClearFilters = useCallback(() => {
    setSearchParams((prev) => {
      const nextParams = new URLSearchParams();
      // Keep search and sort if user desires, or reset all except sort
      const currentSort = prev.get('sort');
      if (currentSort) {
        nextParams.set('sort', currentSort);
      }
      return nextParams;
    });
  }, [setSearchParams]);

  const handlePageChange = useCallback(
    (newPage: number) => {
      updateUrlParams({ page: newPage }, false);
    },
    [updateUrlParams]
  );

  // Check if any filter (excluding default sort & default page) is active
  const hasActiveFilters = useMemo(() => {
    return Boolean(
      queryParams.search ||
        queryParams.category ||
        queryParams.brand ||
        queryParams.team ||
        queryParams.league ||
        queryParams.jerseyType ||
        queryParams.authenticity ||
        queryParams.minPrice !== undefined ||
        queryParams.maxPrice !== undefined
    );
  }, [queryParams]);

  // Remove single active filter helper
  const removeFilter = (key: keyof ProductQueryParams) => {
    updateUrlParams({ [key]: undefined });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Authentic Football Kits"
        description="Explore official player and fan version jerseys from world top clubs and national teams."
      />

      {/* Top Bar: Search & Sort Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur-md">
        <div className="flex-1 max-w-xl">
          <ProductSearch value={queryParams.search || ''} onChange={handleSearchChange} />
        </div>
        <div className="flex items-center justify-between sm:justify-end gap-3">
          <ProductSort value={queryParams.sort || 'newest'} onChange={handleSortChange} />
        </div>
      </div>

      {/* Active Filter Pills Bar */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 pt-1 pb-2">
          <span className="text-xs font-semibold text-slate-400">Active:</span>
          {queryParams.search && (
            <Badge variant="default" className="flex items-center gap-1.5 py-1">
              <span>Search: "{queryParams.search}"</span>
              <button
                onClick={() => removeFilter('search')}
                aria-label="Remove search filter"
                className="hover:text-white"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {queryParams.category && (
            <Badge variant="default" className="flex items-center gap-1.5 py-1">
              <span>Category: {queryParams.category}</span>
              <button
                onClick={() => removeFilter('category')}
                aria-label="Remove category filter"
                className="hover:text-white"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {queryParams.jerseyType && (
            <Badge variant="default" className="flex items-center gap-1.5 py-1">
              <span>Type: {queryParams.jerseyType}</span>
              <button
                onClick={() => removeFilter('jerseyType')}
                aria-label="Remove jersey type filter"
                className="hover:text-white"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {queryParams.authenticity && (
            <Badge variant="default" className="flex items-center gap-1.5 py-1">
              <span>Auth: {queryParams.authenticity}</span>
              <button
                onClick={() => removeFilter('authenticity')}
                aria-label="Remove authenticity filter"
                className="hover:text-white"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {queryParams.brand && (
            <Badge variant="default" className="flex items-center gap-1.5 py-1">
              <span>Brand: {queryParams.brand}</span>
              <button
                onClick={() => removeFilter('brand')}
                aria-label="Remove brand filter"
                className="hover:text-white"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {(queryParams.minPrice !== undefined || queryParams.maxPrice !== undefined) && (
            <Badge variant="default" className="flex items-center gap-1.5 py-1">
              <span>
                Price: ${queryParams.minPrice ?? 0} - ${queryParams.maxPrice ?? '∞'}
              </span>
              <button
                onClick={() => {
                  removeFilter('minPrice');
                  removeFilter('maxPrice');
                }}
                aria-label="Remove price filter"
                className="hover:text-white"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          <button
            onClick={handleClearFilters}
            className="text-xs font-semibold text-amber-400 hover:underline ml-1"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Catalog Main Layout: Sidebar Filters + Products Grid */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        <ProductFilters
          filters={queryParams}
          categories={categories}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
          hasActiveFilters={hasActiveFilters}
        />

        <main className="flex-1 w-full space-y-6">
          {/* Loading State */}
          {isLoading && <ProductGridSkeleton count={8} />}

          {/* Error State */}
          {isError && (
            <ErrorState
              title="Failed to load product catalog"
              message={
                error instanceof Error
                  ? error.message
                  : 'An error occurred while communicating with the server. Please check your connection.'
              }
              onRetry={() => refetch()}
              isRetrying={isFetching}
            />
          )}

          {/* Empty State */}
          {!isLoading && !isError && productsPage && productsPage.content.length === 0 && (
            <EmptyState
              icon={<ShoppingBag className="h-8 w-8 text-amber-400" />}
              title="No football kits found"
              description="No jerseys match your current search and filter criteria. Try searching for something else or clearing your filters."
              actionLabel={hasActiveFilters ? 'Clear all filters' : undefined}
              onAction={hasActiveFilters ? handleClearFilters : undefined}
            />
          )}

          {/* Success Grid & Pagination */}
          {!isLoading && !isError && productsPage && productsPage.content.length > 0 && (
            <>
              <ProductGrid products={productsPage.content} />

              <ProductPagination
                page={productsPage.page}
                totalPages={productsPage.totalPages}
                totalElements={productsPage.totalElements}
                isFirst={productsPage.first}
                isLast={productsPage.last}
                onPageChange={handlePageChange}
              />
            </>
          )}
        </main>
      </div>
    </div>
  );
};
