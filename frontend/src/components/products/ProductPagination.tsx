import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../ui/Button';

export interface ProductPaginationProps {
  page: number; // 0-indexed
  totalPages: number;
  totalElements: number;
  isFirst: boolean;
  isLast: boolean;
  onPageChange: (newPage: number) => void;
}

export const ProductPagination: React.FC<ProductPaginationProps> = ({
  page,
  totalPages,
  totalElements,
  isFirst,
  isLast,
  onPageChange,
}) => {
  if (totalPages <= 1) {
    return null;
  }

  const currentPageDisplay = page + 1;

  // Generate simple page numbers array (showing max 5 page buttons)
  const getPageNumbers = () => {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(0, page - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages - 1, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(0, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <nav
      className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-slate-800/80 pt-6 sm:flex-row"
      aria-label="Catalog Pagination Navigation"
    >
      <div className="text-xs text-slate-400 font-medium">
        Showing page <span className="font-bold text-white">{currentPageDisplay}</span> of{' '}
        <span className="font-bold text-white">{totalPages}</span> ({totalElements} items)
      </div>

      <div className="flex items-center gap-1.5">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={isFirst || page <= 0}
          aria-label="Go to previous page"
          className="border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 disabled:opacity-40"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Previous
        </Button>

        <div className="hidden sm:flex items-center gap-1">
          {getPageNumbers().map((p) => {
            const isCurrent = p === page;
            return (
              <button
                key={p}
                onClick={() => onPageChange(p)}
                aria-current={isCurrent ? 'page' : undefined}
                aria-label={`Go to page ${p + 1}`}
                className={`h-8 w-8 rounded-lg text-xs font-semibold transition-all ${
                  isCurrent
                    ? 'bg-amber-500 text-slate-950 font-bold border border-amber-400'
                    : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
                }`}
              >
                {p + 1}
              </button>
            );
          })}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={isLast || page >= totalPages - 1}
          aria-label="Go to next page"
          className="border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 disabled:opacity-40"
        >
          Next
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </nav>
  );
};
