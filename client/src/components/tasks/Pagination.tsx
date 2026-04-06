'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Pagination as PaginationData } from '@/types';

interface PaginationProps {
  pagination: PaginationData;
  onPageChange: (page: number) => void;
}

export default function Pagination({ pagination, onPageChange }: PaginationProps) {
  const { currentPage, totalPages, totalCount, limit, hasNextPage, hasPreviousPage } = pagination;

  if (totalPages <= 1) return null;

  const start = (currentPage - 1) * limit + 1;
  const end = Math.min(currentPage * limit, totalCount);

  // Build visible page numbers — always show first, last, and neighbours
  const pages: (number | '...')[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== '...') {
      pages.push('...');
    }
  }

  return (
    <div className="flex items-center justify-between gap-4 flex-wrap">
      {/* Range info */}
      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
        Showing {start}–{end} of {totalCount}
      </span>

      {/* Page buttons */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!hasPreviousPage}
          className="btn-ghost px-2 py-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Previous page"
        >
          <ChevronLeft size={15} />
        </button>

        {pages.map((p, i) =>
          p === '...' ? (
            <span
              key={`ellipsis-${i}`}
              className="px-2 text-xs"
              style={{ color: 'var(--text-muted)' }}
            >
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p as number)}
              className="w-8 h-8 rounded-lg text-xs font-medium transition-all"
              style={
                p === currentPage
                  ? { background: 'var(--accent)', color: '#fff' }
                  : { color: 'var(--text-secondary)' }
              }
            >
              {p}
            </button>
          )
        )}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!hasNextPage}
          className="btn-ghost px-2 py-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Next page"
        >
          <ChevronRight size={15} />
        </button>
      </div>
    </div>
  );
}
