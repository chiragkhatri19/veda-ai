'use client';

import { useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { useAssignmentStore } from '@/store/assignmentStore';
import { useNotificationStore } from '@/store/notificationStore';
import type { Assignment } from '@veda/shared';

const CACHE_TTL_MS = 30_000;

export function useAssignments() {
  const {
    assignments, setAssignments,
    setLoading, setError, setLastFetchedAt,
    isLoading, error, lastFetchedAt,
  } = useAssignmentStore();
  const syncFromAssignments = useNotificationStore((s) => s.syncFromAssignments);

  const hasFetched = lastFetchedAt !== null;

  const fetchAssignments = useCallback(async (force = false) => {
    const now = Date.now();
    const fresh = lastFetchedAt !== null && now - lastFetchedAt < CACHE_TTL_MS;
    if (!force && fresh) return;

    // Show loading spinner only on the very first load (no cached data yet)
    if (assignments.length === 0) setLoading(true);
    setError(null);

    try {
      const data = await api.assignments.list();
      setAssignments(data);
      setLastFetchedAt(Date.now());
      syncFromAssignments(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [assignments.length, lastFetchedAt, setAssignments, setError, setLastFetchedAt, setLoading, syncFromAssignments]);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

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

  return { assignments, isLoading, error, hasFetched, refetch: () => fetchAssignments(true), deleteAssignment };
}
