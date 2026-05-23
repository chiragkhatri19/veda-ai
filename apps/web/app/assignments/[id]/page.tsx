'use client';

import { useEffect, useCallback, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, AlertTriangle, RefreshCw } from 'lucide-react';
import { api } from '@/lib/api';
import { useAssignmentStore } from '@/store/assignmentStore';
import { useJobProgress } from '@/hooks/useJobProgress';
import GenerationScreen from '@/components/shared/GenerationScreen';
import QuestionPaperView from '@/components/output/QuestionPaperView';

function BackLink() {
  return (
    <Link
      href="/assignments"
      className="inline-flex items-center gap-1.5 text-[13px] text-app-text-muted hover:text-app-text-primary transition-colors mb-6 no-print"
    >
      <ArrowLeft className="w-4 h-4" />
      Assignments
    </Link>
  );
}

export default function AssignmentDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const { setCurrentAssignment, currentAssignment } = useAssignmentStore();
  const [notFound, setNotFound] = useState(false);

  const fetchAssignment = useCallback(async () => {
    try {
      const data = await api.assignments.get(id);
      setCurrentAssignment(data);
    } catch {
      setNotFound(true);
    }
  }, [id, setCurrentAssignment]);

  useEffect(() => { fetchAssignment(); }, [fetchAssignment]);

  const isGenerating =
    currentAssignment?.jobStatus === 'queued' ||
    currentAssignment?.jobStatus === 'processing';

  const jobProgress = useJobProgress(isGenerating ? id : null, currentAssignment?.jobStatus);

  // When the socket signals completion, re-fetch to get the full questionPaper from the DB
  useEffect(() => {
    if (jobProgress.status === 'completed') {
      setTimeout(fetchAssignment, 1500);
    }
  }, [jobProgress.status, fetchAssignment]);

  const handleRegenerate = async () => {
    try {
      await api.assignments.regenerate(id);
      setCurrentAssignment({ ...currentAssignment!, jobStatus: 'queued', questionPaper: null });
    } catch {
      // Errors handled by the caller's toast
    }
  };

  /* ── Not found ───────────────────────────────────────────── */
  if (notFound) {
    return (
      <div className="px-6 py-6">
        <div className="max-w-sm mx-auto text-center py-20">
          <div className="w-14 h-14 bg-app-surface-2 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-7 h-7 text-app-text-muted" />
          </div>
          <h3 className="text-[16px] font-bold text-app-text-primary mb-2">Assignment not found</h3>
          <p className="text-[13px] text-app-text-secondary mb-6">
            This assignment may have been deleted or the link is incorrect.
          </p>
          <Link
            href="/assignments"
            className="inline-flex items-center gap-2 bg-brand-dark text-white text-[13px] font-semibold px-5 py-2.5 rounded-full hover:opacity-90 transition-opacity"
          >
            Back to Assignments
          </Link>
        </div>
      </div>
    );
  }

  /* ── Still fetching (first load) ─────────────────────────── */
  if (!currentAssignment) {
    return (
      <div className="px-6 py-6">
        <BackLink />
        <GenerationScreen status="loading" progress={0} />
      </div>
    );
  }

  /* ── Generating (queued / processing) ─────────────────────── */
  if (isGenerating || jobProgress.status === 'processing') {
    return (
      <div className="px-6 py-6">
        <BackLink />
        <GenerationScreen
          status={jobProgress.status === 'idle' ? 'processing' : jobProgress.status}
          progress={jobProgress.progress}
          message={jobProgress.message}
          error={jobProgress.error}
          title={currentAssignment.title}
          subject={currentAssignment.subject}
          grade={currentAssignment.grade}
        />
      </div>
    );
  }

  /* ── Failed ───────────────────────────────────────────────── */
  if (currentAssignment.jobStatus === 'failed') {
    return (
      <div className="px-6 py-6">
        <BackLink />
        <GenerationScreen status="failed" progress={0} />
        <div className="flex justify-center mt-8">
          <button
            onClick={handleRegenerate}
            className="inline-flex items-center gap-2 bg-brand-dark text-white text-[13px] font-semibold px-5 py-2.5 rounded-full hover:opacity-90 transition-opacity"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  /* ── Completed ────────────────────────────────────────────── */
  if (currentAssignment.jobStatus === 'completed' && currentAssignment.questionPaper) {
    return (
      <QuestionPaperView assignment={currentAssignment} onRegenerate={handleRegenerate} />
    );
  }

  return null;
}
