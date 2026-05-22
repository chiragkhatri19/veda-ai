'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { useAssignmentStore } from '@/store/assignmentStore';
import { useUserStore } from '@/store/userStore';
import type { CreateAssignmentInput } from '@veda/shared';

export function useCreateAssignment() {
  const router = useRouter();
  const { setCreateFormData, createFormData, reset } = useAssignmentStore();
  const { school } = useUserStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const submitAssignment = async (data: CreateAssignmentInput) => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const { assignmentId } = await api.assignments.create({ ...data, schoolName: school });
      if (!assignmentId) {
        throw new Error('Server did not return a valid assignment ID. Please try again.');
      }
      reset();
      toast.success('Assignment created — generating your paper…');
      router.push(`/assignments/${assignmentId}`);
    } catch (err) {
      const message = (err as Error).message;
      setSubmitError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    createFormData,
    setCreateFormData,
    isSubmitting,
    submitError,
    submitAssignment,
  };
}
