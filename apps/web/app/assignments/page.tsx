'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Filter, Search, Plus, X } from 'lucide-react';
import { useAssignments } from '@/hooks/useAssignments';
import AssignmentList from '@/components/assignments/AssignmentList';
import type { Assignment } from '@veda/shared';

type SortOption = 'newest' | 'oldest' | 'name';
type StatusFilter = 'all' | 'completed' | 'processing' | 'failed';

function filterAndSort(
  assignments: Assignment[],
  query: string,
  status: StatusFilter,
  sort: SortOption,
): Assignment[] {
  let result = assignments;

  if (query.trim()) {
    const q = query.toLowerCase();
    result = result.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.subject.toLowerCase().includes(q) ||
        a.grade.toLowerCase().includes(q),
    );
  }

  if (status !== 'all') {
    result = result.filter((a) =>
      status === 'processing'
        ? a.jobStatus === 'queued' || a.jobStatus === 'processing'
        : a.jobStatus === status,
    );
  }

  return [...result].sort((a, b) => {
    if (sort === 'name') return a.title.localeCompare(b.title);
    if (sort === 'oldest')
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

export default function AssignmentsPage() {
  const { assignments, isLoading, error, hasFetched, hasMore, isFetchingMore, refetch, deleteAssignment, loadMore } =
    useAssignments();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [showFilters, setShowFilters] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const filtered = useMemo(
    () => filterAndSort(assignments, searchQuery, statusFilter, sortBy),
    [assignments, searchQuery, statusFilter, sortBy],
  );

  const showFloatingButton = hasFetched && assignments.length > 0;

  return (
    <div className="px-5 sm:px-6 py-6 min-h-full">
      {/* Page header */}
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
          <h1 className="text-[22px] font-bold text-app-text-primary">Assignments</h1>
        </div>
        <p className="text-[13px] text-app-text-secondary ml-4">Manage and create assignments for your classes.</p>
      </div>

      {/* Error */}
      {error && (
        <div className="border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20 rounded-lg px-4 py-3 mb-5 flex items-center justify-between">
          <p className="text-[12px] text-red-600 dark:text-red-400">{error}</p>
          <button
            onClick={refetch}
            className="text-[12px] font-semibold text-red-600 dark:text-red-400 border border-red-300 dark:border-red-800/60 rounded-lg px-3 py-1 hover:bg-red-100 dark:hover:bg-red-950/40 transition-colors ml-4 shrink-0"
          >
            Retry
          </button>
        </div>
      )}

      {/* Filter + Search bar */}
      {(hasFetched || isLoading) && (
        <div className="flex items-center gap-3 mb-5">
          <button
            onClick={() => setShowFilters((p) => !p)}
            className={`flex items-center gap-2 px-4 py-2.5 text-[13px] font-medium rounded-xl border transition-colors shrink-0 ${
              showFilters || statusFilter !== 'all' || sortBy !== 'newest'
                ? 'bg-brand-orange text-white border-brand-orange'
                : 'text-app-text-secondary border-app-border hover:border-app-text-muted bg-app-surface'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filter By
          </button>

          <div className="flex-1 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-app-text-muted pointer-events-none" />
            <input
              ref={searchRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Assignment"
              className="w-full pl-10 pr-10 py-2.5 text-[13px] text-app-text-primary bg-app-surface border border-app-border rounded-full focus:outline-none focus:border-app-text-muted transition-colors placeholder:text-app-text-muted"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-app-text-muted hover:text-app-text-primary transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Filter dropdowns */}
      {showFilters && (
        <div className="flex items-center gap-4 mb-5 flex-wrap border border-app-border bg-app-surface-2 rounded-xl p-4 animate-fade-in">
          <div>
            <label className="text-[11px] font-semibold text-app-text-muted uppercase tracking-wide mb-1 block">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              className="text-[12px] text-app-text-primary border border-app-border rounded-lg px-3 py-1.5 bg-app-surface focus:outline-none focus:border-brand-orange"
            >
              <option value="all">All</option>
              <option value="completed">Ready</option>
              <option value="processing">Generating</option>
              <option value="failed">Failed</option>
            </select>
          </div>
          <div>
            <label className="text-[11px] font-semibold text-app-text-muted uppercase tracking-wide mb-1 block">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="text-[12px] text-app-text-primary border border-app-border rounded-lg px-3 py-1.5 bg-app-surface focus:outline-none focus:border-brand-orange"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="name">Name A–Z</option>
            </select>
          </div>
        </div>
      )}

      {/* List */}
      <AssignmentList
        assignments={filtered}
        onDelete={deleteAssignment}
        isLoading={isLoading && !hasFetched}
        searchQuery={searchQuery}
      />

      {/* Load more */}
      {hasMore && (
        <div className="flex justify-center mt-6">
          <button
            onClick={loadMore}
            disabled={isFetchingMore}
            className="inline-flex items-center gap-2 px-6 py-2.5 text-[13px] font-medium text-app-text-secondary border border-app-border bg-white rounded-full hover:bg-app-surface-2 active:scale-[0.97] transition-[background-color,transform] duration-100 disabled:opacity-60 shadow-sm"
          >
            {isFetchingMore ? 'Loading…' : 'Load more'}
          </button>
        </div>
      )}

      {/* Bottom create button */}
      {showFloatingButton && (
        <div className="flex justify-center mt-6 pb-4">
          <Link
            href="/assignments/create"
            className="inline-flex items-center gap-2 px-6 py-2.5 text-[13px] font-semibold text-white bg-brand-dark rounded-full hover:opacity-90 active:scale-[0.97] active:opacity-80 transition-[opacity,transform] duration-150 shadow-sm"
          >
            <Plus className="w-4 h-4" strokeWidth={2.5} />
            Create Assignment
          </Link>
        </div>
      )}
    </div>
  );
}
