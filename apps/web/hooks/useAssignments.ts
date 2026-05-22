'use client';

import { useEffect, useCallback, useState } from 'react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { useAssignmentStore } from '@/store/assignmentStore';
import { useNotificationStore } from '@/store/notificationStore';
import type { Assignment } from '@veda/shared';

const CACHE_TTL_MS = 30_000;
const PAGE_SIZE = 12;

export function useAssignments() {
  const {
    assignments, setAssignments, appendAssignments,
    setLoading, setError, setLastFetchedAt,
    isLoading, error, lastFetchedAt,
  } = useAssignmentStore();
  const syncFromAssignments = useNotificationStore((s) => s.syncFromAssignments);

  const hasFetched = lastFetchedAt !== null;
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  const fetchAssignments = useCallback(async (force = false) => {
    const now = Date.now();
    const fresh = lastFetchedAt !== null && now - lastFetchedAt < CACHE_TTL_MS;
    if (!force && fresh) return;

    if (assignments.length === 0) setLoading(true);
    setError(null);

    try {
      const result = await api.assignments.list(1, PAGE_SIZE);
      setAssignments(result.data);
      setCurrentPage(1);
      setTotalPages(result.totalPages);
      setLastFetchedAt(Date.now());
      syncFromAssignments(result.data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [assignments.length, lastFetchedAt, setAssignments, setError, setLastFetchedAt, setLoading, syncFromAssignments]);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  const loadMore = useCallback(async () => {
    if (currentPage >= totalPages || isFetchingMore) return;
    setIsFetchingMore(true);
    try {
      const nextPage = currentPage + 1;
      const result = await api.assignments.list(nextPage, PAGE_SIZE);
      appendAssignments(result.data);
      setCurrentPage(nextPage);
      setTotalPages(result.totalPages);
    } catch {
      toast.error('Could not load more assignments.');
    } finally {
      setIsFetchingMore(false);
    }
  }, [currentPage, totalPages, isFetchingMore, appendAssignments]);

  const deleteAssignment = useCallback(
    async (id: string) => {
      try {
        await api.assignments.delete(id);
        setAssignments(assignments.filter((a: Assignment) => a.id !== id));
        toast.success('Assignment deleted');
      } catch {
        toast.error('Could not delete assignment. Please try again.');
      }
    },
    [assignments, setAssignments],
  );

  return {
    assignments,
    isLoading,
    error,
    hasFetched,
    hasMore: currentPage < totalPages,
    isFetchingMore,
    refetch: () => fetchAssignments(true),
    deleteAssignment,
    loadMore,
  };
}
