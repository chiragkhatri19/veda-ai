'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import {
  CheckCircle2, Plus, ArrowRight, Loader2, XCircle, Clock,
  FileText, BookOpen, HelpCircle, Users,
} from 'lucide-react';
import { useAssignmentStore } from '@/store/assignmentStore';
import { useGroupStore } from '@/store/groupStore';
import { useUserStore } from '@/store/userStore';
import { useAssignments } from '@/hooks/useAssignments';
import type { Assignment } from '@veda/shared';

const STATUS_CONFIG = {
  completed:  { label: 'Ready',      className: 'text-emerald-500', icon: CheckCircle2, spin: false },
  processing: { label: 'Generating', className: 'text-orange-400',  icon: Loader2,      spin: true  },
  queued:     { label: 'Queued',     className: 'text-zinc-400',    icon: Clock,        spin: false },
  failed:     { label: 'Failed',     className: 'text-red-500',     icon: XCircle,      spin: false },
} as const;

function StatCard({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  accent: string;
}) {
  return (
    <div className="bg-white dark:bg-app-surface rounded-2xl p-4 flex flex-col gap-3 shadow-card dark:shadow-[0_2px_8px_rgba(0,0,0,0.2),0_8px_24px_rgba(0,0,0,0.28)] animate-fade-in">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${accent}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <p className="text-[26px] font-bold text-app-text-primary leading-none tabular-nums">{value}</p>
        <p className="text-[11px] text-app-text-muted mt-1">{label}</p>
      </div>
    </div>
  );
}

function RecentRow({ assignment }: { assignment: Assignment }) {
  const cfg = STATUS_CONFIG[assignment.jobStatus];
  const StatusIcon = cfg.icon;

  return (
    <Link
      href={`/assignments/${assignment.id}`}
      className="flex items-center gap-4 px-5 py-3.5 hover:bg-app-surface-2 active:bg-app-border/40 transition-colors group"
    >
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-medium text-app-text-primary truncate group-hover:text-brand-orange transition-colors">
          {assignment.title}
        </p>
        <p className="text-[11px] text-app-text-muted mt-0.5">
          {assignment.subject} · Grade {assignment.grade}
        </p>
      </div>
      <span className={`inline-flex items-center gap-1.5 text-[11px] font-medium shrink-0 ${cfg.className}`}>
        <StatusIcon className={`w-3.5 h-3.5 ${cfg.spin ? 'animate-spin' : ''}`} />
        {cfg.label}
      </span>
    </Link>
  );
}

export default function DashboardPage() {
  useAssignments();

  const { assignments } = useAssignmentStore();
  const { groups } = useGroupStore();
  const { name } = useUserStore();

  const stats = useMemo(() => {
    const completed = assignments.filter((a) => a.jobStatus === 'completed');
    const totalQuestions = completed.reduce((s, a) => s + (a.questionPaper?.totalQuestions ?? 0), 0);
    return { total: assignments.length, completed: completed.length, questions: totalQuestions, groups: groups.length };
  }, [assignments, groups]);

  const recent = assignments.slice(0, 5);
  const firstName = name.split(' ')[0];
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="px-6 py-6 space-y-7">
      {/* Welcome */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 suppressHydrationWarning className="text-[22px] font-bold text-app-text-primary">
            {greeting}, {firstName} 👋
          </h1>
          <p className="text-[13px] text-app-text-secondary mt-1">
            {stats.total === 0
              ? 'Create your first question paper to get started.'
              : stats.completed === stats.total && stats.total > 0
                ? `All ${stats.total} paper${stats.total !== 1 ? 's' : ''} are ready.`
                : `${stats.total} paper${stats.total !== 1 ? 's' : ''} · ${stats.completed} ready · ${stats.total - stats.completed} pending`}
          </p>
        </div>
        <Link
          href="/assignments/create"
          className="inline-flex items-center gap-2 px-4 py-2.5 text-[13px] font-semibold text-white bg-brand-orange rounded-xl hover:opacity-90 active:scale-[0.97] active:opacity-80 transition-[opacity,transform] duration-150 shrink-0"
        >
          <Plus className="w-4 h-4" strokeWidth={2.5} />
          New Paper
        </Link>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 stagger-grid">
        <StatCard label="Total Papers"    value={stats.total}     icon={FileText}    accent="bg-blue-500/10 text-blue-500" />
        <StatCard label="Papers Ready"    value={stats.completed} icon={CheckCircle2} accent="bg-emerald-500/10 text-emerald-500" />
        <StatCard label="Questions Made"  value={stats.questions} icon={HelpCircle}  accent="bg-orange-500/10 text-brand-orange" />
        <StatCard label="Class Groups"    value={stats.groups}    icon={Users}       accent="bg-purple-500/10 text-purple-500" />
      </div>

      {/* Quick actions — only shown for new users */}
      {stats.total < 3 && (
        <div>
          <p className="text-[11px] font-semibold text-app-text-muted uppercase tracking-wider mb-3">Get Started</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {([
              { href: '/assignments/create', label: 'Create a Question Paper', desc: 'Set up a new AI-generated exam or test'          },
              { href: '/toolkit/rubric',     label: 'Build a Rubric',          desc: 'Auto-generate a marking scheme for any paper'   },
            ] as const).map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="bg-white dark:bg-app-surface rounded-2xl p-4 flex items-center justify-between group shadow-card hover:shadow-card-hover dark:shadow-[0_2px_8px_rgba(0,0,0,0.2),0_8px_24px_rgba(0,0,0,0.28)] dark:hover:shadow-[0_4px_16px_rgba(0,0,0,0.32),0_16px_40px_rgba(0,0,0,0.44)] active:scale-[0.98] transition-shadow duration-150"
              >
                <div>
                  <p className="text-[13px] font-semibold text-app-text-primary group-hover:text-brand-orange transition-colors">{action.label}</p>
                  <p className="text-[11px] text-app-text-muted mt-0.5">{action.desc}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-app-text-muted group-hover:text-brand-orange transition-colors shrink-0" />
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Recent assignments */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-[12px] font-semibold text-app-text-secondary">Recent Assignments</p>
          {assignments.length > 5 && (
            <Link href="/assignments" className="text-[12px] text-brand-orange hover:underline">
              View all
            </Link>
          )}
        </div>

        {recent.length === 0 ? (
          <div className="bg-white dark:bg-app-surface rounded-2xl px-5 py-10 text-center shadow-card dark:shadow-[0_2px_8px_rgba(0,0,0,0.2),0_8px_24px_rgba(0,0,0,0.28)]">
            <BookOpen className="w-8 h-8 text-app-text-muted mx-auto mb-3" />
            <p className="text-[13px] text-app-text-muted mb-3">No assignments yet</p>
            <Link href="/assignments/create" className="text-[13px] font-semibold text-brand-orange hover:underline">
              Create your first paper →
            </Link>
          </div>
        ) : (
          <div className="bg-white dark:bg-app-surface rounded-2xl overflow-hidden divide-y divide-app-border/40 shadow-card dark:shadow-[0_2px_8px_rgba(0,0,0,0.2),0_8px_24px_rgba(0,0,0,0.28)]">
            {recent.map((a) => <RecentRow key={a.id} assignment={a} />)}
          </div>
        )}
      </div>
    </div>
  );
}
