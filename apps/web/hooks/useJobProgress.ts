'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getSocket, subscribeToAssignment, unsubscribeFromAssignment } from '@/lib/socket';
import { useAssignmentStore } from '@/store/assignmentStore';
import type { JobProgressEvent, GeneratedQuestionPaper } from '@veda/shared';

interface JobProgress {
  status: 'idle' | 'processing' | 'completed' | 'failed';
  progress: number;
  message: string;
  error?: string;
  result?: GeneratedQuestionPaper;
}

function deriveInitialProgress(initialStatus?: string): JobProgress {
  if (initialStatus === 'queued') {
    return { status: 'processing', progress: 5, message: 'Queued for generation...' };
  }
  if (initialStatus === 'processing') {
    return { status: 'processing', progress: 15, message: 'Generating your question paper...' };
  }
  return { status: 'idle', progress: 0, message: '' };
}

export function useJobProgress(assignmentId: string | null, initialStatus?: string) {
  const router = useRouter();
  const { updateAssignment, currentAssignment } = useAssignmentStore();

  // Reset navigated guard each time assignmentId or initialStatus changes
  const navigated = useRef(false);
  useEffect(() => {
    navigated.current = false;
  }, [assignmentId, initialStatus]);

  const [progress, setProgress] = useState<JobProgress>(() =>
    deriveInitialProgress(initialStatus),
  );

  // Re-sync initial state when the assignment's status changes externally (e.g. page refresh)
  useEffect(() => {
    setProgress(deriveInitialProgress(initialStatus));
  }, [initialStatus]);

  useEffect(() => {
    if (!assignmentId) return;

    const socket = getSocket();

    const handleProgress = (event: JobProgressEvent) => {
      setProgress({
        status: event.status,
        progress: event.progress,
        message: event.message,
        error: event.error,
        result: event.result,
      });

      if (event.status === 'completed' && !navigated.current) {
        navigated.current = true;
        if (currentAssignment) {
          updateAssignment({
            ...currentAssignment,
            jobStatus: 'completed',
            questionPaper: event.result ?? null,
          });
        }
        // Brief delay so the user sees the success state before the page refreshes
        setTimeout(() => {
          router.refresh();
        }, 1500);
      }
    };

    // On reconnect, re-subscribe so the server pushes the cached progress state
    const handleReconnect = () => {
      subscribeToAssignment(assignmentId);
    };

    socket.on('connect', handleReconnect);
    socket.on('job:progress', handleProgress);
    subscribeToAssignment(assignmentId);

    return () => {
      socket.off('connect', handleReconnect);
      socket.off('job:progress', handleProgress);
      unsubscribeFromAssignment(assignmentId);
    };
  }, [assignmentId, currentAssignment, router, updateAssignment]);

  return progress;
}
