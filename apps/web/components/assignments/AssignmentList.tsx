'use client';

import AssignmentCard from './AssignmentCard';
import EmptyState from './EmptyState';
import SkeletonCard from '@/components/shared/SkeletonCard';
import type { Assignment } from '@veda/shared';

interface Props {
  assignments: Assignment[];
  onDelete: (id: string) => void;
  isLoading?: boolean;
  searchQuery?: string;
}

export default function AssignmentList({
  assignments,
  onDelete,
  isLoading,
  searchQuery,
}: Props) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (assignments.length === 0) {
    return <EmptyState hasSearch={!!searchQuery} />;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 stagger-grid">
      {assignments.map((assignment) => (
        <AssignmentCard key={assignment.id} assignment={assignment} onDelete={onDelete} />
      ))}
    </div>
  );
}
