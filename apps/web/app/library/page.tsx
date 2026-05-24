'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Library, Search, Download, Eye, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { useAssignmentStore } from '@/store/assignmentStore';
import { useAssignments } from '@/hooks/useAssignments';
import { api } from '@/lib/api';
import type { Assignment } from '@veda/shared';

const SUBJECT_ALL = 'All Subjects';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function PaperCard({ assignment }: { assignment: Assignment }) {
  const [downloading, setDownloading] = useState(false);
  const questions = assignment.questionPaper?.totalQuestions ?? 0;
  const marks = assignment.questionPaper?.maximumMarks ?? 0;

  async function handleDownload(e: React.MouseEvent) {
    e.preventDefault();
    setDownloading(true);
    try {
      const blob = await api.assignments.downloadPdf(assignment.id);
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `${assignment.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`;
      anchor.click();
      URL.revokeObjectURL(url);
      toast.success('PDF downloaded');
    } catch {
      toast.info('Opening print dialog…');
      window.print();
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="bg-white dark:bg-app-surface rounded-2xl p-5 flex flex-col gap-4 shadow-card hover:shadow-card-hover hover:-translate-y-px dark:shadow-[0_2px_8px_rgba(0,0,0,0.2),0_8px_24px_rgba(0,0,0,0.28)] dark:hover:shadow-[0_4px_16px_rgba(0,0,0,0.32),0_16px_40px_rgba(0,0,0,0.44)] transition-[box-shadow,transform] duration-200 group">
      <div className="flex items-start justify-between gap-2">
        <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
          <FileText className="w-[18px] h-[18px] text-emerald-600 dark:text-emerald-400" />
        </div>
        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-app-surface-2 text-app-text-secondary tabular-nums">
          {questions > 0 ? `${questions} Qs` : assignment.grade}
        </span>
      </div>

      <div className="flex-1">
        <h3 className="text-[14px] font-semibold text-app-text-primary leading-snug group-hover:text-brand-orange transition-colors line-clamp-2">
          {assignment.title}
        </h3>
        <p className="text-[12px] text-app-text-muted mt-1">
          {assignment.subject} · Grade {assignment.grade}
        </p>
      </div>

      <div className="flex items-center gap-2 text-[11px] text-app-text-muted pt-3 border-t border-app-border/60">
        {marks > 0 && (
          <span className="font-medium text-app-text-secondary">{marks} marks</span>
        )}
        {marks > 0 && <span>·</span>}
        <span className="ml-auto">{formatDate(assignment.createdAt)}</span>
      </div>

      <div className="flex gap-2">
        <Link
          href={`/assignments/${assignment.id}`}
          className="flex-1 inline-flex items-center justify-center gap-1.5 h-8 rounded-lg border border-app-border text-[12px] font-medium text-app-text-secondary hover:border-brand-orange hover:text-brand-orange active:scale-[0.97] transition-[border-color,color,transform] duration-100"
        >
          <Eye className="w-3.5 h-3.5" />
          View
        </Link>
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="flex-1 inline-flex items-center justify-center gap-1.5 h-8 rounded-lg border border-app-border bg-app-surface-2 text-[12px] font-medium text-app-text-secondary hover:bg-emerald-500/10 hover:border-emerald-500/30 hover:text-emerald-600 dark:hover:text-emerald-400 active:scale-[0.97] transition-[background-color,border-color,color,transform] duration-100 disabled:opacity-50"
        >
          <Download className={`w-3.5 h-3.5 ${downloading ? 'animate-spin' : ''}`} />
          {downloading ? '…' : 'PDF'}
        </button>
      </div>
    </div>
  );
}

function LibrarySkeletonGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="bg-white dark:bg-app-surface rounded-2xl p-5 space-y-4 shadow-card">
          <div className="flex items-start justify-between">
            <div className="skeleton h-9 w-9 rounded-lg" />
            <div className="skeleton h-5 w-14 rounded-full" />
          </div>
          <div className="space-y-2">
            <div className="skeleton h-4 w-full rounded" />
            <div className="skeleton h-3 w-2/3 rounded" />
          </div>
          <div className="skeleton h-8 w-full rounded-lg" />
        </div>
      ))}
    </div>
  );
}

export default function LibraryPage() {
  useAssignments();

  const { assignments, isLoading } = useAssignmentStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [subjectFilter, setSubjectFilter] = useState(SUBJECT_ALL);

  const completedPapers = useMemo(
    () => assignments.filter((a) => a.jobStatus === 'completed'),
    [assignments],
  );

  const subjects = useMemo(() => {
    const set = new Set(completedPapers.map((a) => a.subject));
    return [SUBJECT_ALL, ...Array.from(set).sort()];
  }, [completedPapers]);

  const filtered = useMemo(() => {
    return completedPapers.filter((a) => {
      const matchesSubject = subjectFilter === SUBJECT_ALL || a.subject === subjectFilter;
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch = !q || a.title.toLowerCase().includes(q) || a.subject.toLowerCase().includes(q);
      return matchesSubject && matchesSearch;
    });
  }, [completedPapers, subjectFilter, searchQuery]);

  return (
    <div className="px-6 py-6 space-y-6">
      <div>
        <h1 className="text-[22px] font-bold text-app-text-primary">My Library</h1>
        <p className="text-[13px] text-app-text-secondary mt-0.5">
          {isLoading ? 'Loading…' : `${completedPapers.length} generated question ${completedPapers.length === 1 ? 'paper' : 'papers'}`}
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-app-text-muted pointer-events-none" />
          <input
            type="text"
            placeholder="Search papers…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-9 pl-9 pr-3 rounded-lg border border-app-border text-[13px] text-app-text-primary placeholder:text-app-text-muted focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange bg-app-surface transition-colors"
          />
        </div>
        {subjects.length > 1 && (
          <select
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className="h-9 px-3 rounded-lg border border-app-border text-[13px] text-app-text-primary bg-app-surface focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange transition-colors"
          >
            {subjects.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        )}
      </div>

      {/* Content */}
      {isLoading ? (
        <LibrarySkeletonGrid />
      ) : filtered.length === 0 ? (
        <div className="bg-white dark:bg-app-surface rounded-2xl px-6 py-16 flex flex-col items-center text-center shadow-card dark:shadow-[0_2px_8px_rgba(0,0,0,0.2),0_8px_24px_rgba(0,0,0,0.28)]">
          <div className="w-14 h-14 rounded-2xl bg-app-surface-2 flex items-center justify-center mb-4">
            <Library className="w-7 h-7 text-app-text-muted" />
          </div>
          <h3 className="text-[15px] font-semibold text-app-text-primary mb-1.5">
            {completedPapers.length === 0 ? 'Your library is empty' : 'No papers match'}
          </h3>
          <p className="text-[13px] text-app-text-secondary mb-5 max-w-xs leading-relaxed">
            {completedPapers.length === 0
              ? 'Generated papers appear here once they are ready.'
              : 'Try adjusting your search or removing the subject filter.'}
          </p>
          {completedPapers.length === 0 && (
            <Link
              href="/assignments/create"
              className="inline-flex items-center gap-2 bg-brand-dark text-white text-[13px] font-semibold px-5 py-2.5 rounded-full hover:opacity-90 active:scale-[0.97] active:opacity-80 transition-[opacity,transform] duration-150"
            >
              Create an assignment
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 stagger-grid">
          {filtered.map((a) => <PaperCard key={a.id} assignment={a} />)}
        </div>
      )}
    </div>
  );
}
