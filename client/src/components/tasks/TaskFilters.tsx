'use client';

import { useCallback, useRef } from 'react';
import { Search, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import { TaskFilters as Filters } from '@/types';

interface TaskFiltersProps {
  filters: Filters;
  onUpdate: (updates: Partial<Filters>) => void;
  totalCount: number;
}

export default function TaskFilters({ filters, onUpdate, totalCount }: TaskFiltersProps) {
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounce search to avoid hammering the API
  const handleSearch = useCallback(
    (value: string) => {
      if (searchTimer.current) clearTimeout(searchTimer.current);
      searchTimer.current = setTimeout(() => {
        onUpdate({ search: value, page: 1 });
      }, 350);
    },
    [onUpdate]
  );

  const toggleSort = () => {
    onUpdate({ sortOrder: filters.sortOrder === 'desc' ? 'asc' : 'desc', page: 1 });
  };

  const hasActiveFilters = filters.status || filters.priority || filters.search;

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:flex-wrap">
      {/* Search */}
      <div className="relative flex-1 min-w-0 sm:max-w-xs">
        <Search
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ color: 'var(--text-muted)' }}
        />
        <input
          type="text"
          className="input pl-9 text-sm"
          placeholder="Search tasks…"
          defaultValue={filters.search}
          onChange={(e) => handleSearch(e.target.value)}
        />
      </div>

      {/* Filters row */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Status filter */}
        <div className="flex items-center gap-1.5">
          <SlidersHorizontal size={13} style={{ color: 'var(--text-muted)' }} />
          <select
            className="input text-xs py-2 pr-7 pl-2.5 min-w-0 w-auto"
            value={filters.status}
            onChange={(e) => onUpdate({ status: e.target.value as Filters['status'], page: 1 })}
          >
            <option value="">All statuses</option>
            <option value="PENDING">Pending</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>

        {/* Priority filter */}
        <select
          className="input text-xs py-2 pr-7 pl-2.5 min-w-0 w-auto"
          value={filters.priority}
          onChange={(e) => onUpdate({ priority: e.target.value as Filters['priority'], page: 1 })}
        >
          <option value="">All priorities</option>
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
          <option value="LOW">Low</option>
        </select>

        {/* Sort by */}
        <select
          className="input text-xs py-2 pr-7 pl-2.5 min-w-0 w-auto"
          value={filters.sortBy}
          onChange={(e) => onUpdate({ sortBy: e.target.value, page: 1 })}
        >
          <option value="createdAt">Created</option>
          <option value="updatedAt">Updated</option>
          <option value="dueDate">Due date</option>
          <option value="priority">Priority</option>
          <option value="title">Title</option>
        </select>

        {/* Sort direction */}
        <button
          onClick={toggleSort}
          className="btn-ghost px-2.5 py-2 text-xs gap-1.5"
          title={filters.sortOrder === 'desc' ? 'Newest first' : 'Oldest first'}
        >
          <ArrowUpDown size={13} />
          <span className="hidden sm:inline">
            {filters.sortOrder === 'desc' ? 'Desc' : 'Asc'}
          </span>
        </button>

        {/* Clear filters */}
        {hasActiveFilters && (
          <button
            onClick={() => onUpdate({ search: '', status: '', priority: '', page: 1 })}
            className="text-xs px-2.5 py-2 rounded-lg transition-colors"
            style={{ color: 'var(--accent)' }}
          >
            Clear
          </button>
        )}
      </div>

      {/* Result count */}
      <span
        className="text-xs ml-auto hidden sm:block shrink-0"
        style={{ color: 'var(--text-muted)' }}
      >
        {totalCount} {totalCount === 1 ? 'task' : 'tasks'}
      </span>
    </div>
  );
}
