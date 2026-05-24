'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { MoreVertical } from 'lucide-react';
import type { Assignment } from '@veda/shared';

interface Props {
  assignment: Assignment;
  onDelete: (id: string) => void;
}

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return dateStr;
  }
}

const STATUS_CONFIG: Record<
  string,
  { dot: string; label: string; pulse?: boolean }
> = {
  completed:  { dot: 'bg-emerald-500',          label: 'Ready' },
  processing: { dot: 'bg-brand-orange',          label: 'Generating', pulse: true },
  queued:     { dot: 'bg-app-text-muted',        label: 'Queued' },
  failed:     { dot: 'bg-red-500',               label: 'Failed' },
};

export default function AssignmentCard({ assignment, onDelete }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const statusCfg = STATUS_CONFIG[assignment.jobStatus] ?? STATUS_CONFIG.queued;

  return (
    <div className="group bg-white dark:bg-app-surface rounded-2xl border border-app-border/60 dark:border-app-border p-5 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 dark:shadow-[0_2px_8px_rgba(0,0,0,0.2),0_8px_24px_rgba(0,0,0,0.28)] dark:hover:shadow-[0_4px_16px_rgba(0,0,0,0.32),0_16px_40px_rgba(0,0,0,0.44)] transition-[box-shadow,transform,border-color] duration-200 flex flex-col gap-3 animate-fade-in">

      {/* Row 1: subject + grade tags + status + menu */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 flex-wrap min-w-0">
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-brand-orange/10 text-brand-orange border border-brand-orange/20 truncate max-w-[120px]">
            {assignment.subject}
          </span>
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-app-surface-2 text-app-text-secondary border border-app-border/70">
            Grade {assignment.grade}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Status badge */}
          <div className="flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${statusCfg.dot} ${statusCfg.pulse ? 'animate-pulse' : ''}`} />
            <span className="text-[11px] font-medium text-app-text-muted hidden sm:inline">
              {statusCfg.label}
            </span>
          </div>

          {/* 3-dot menu */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((p) => !p)}
              className="p-1.5 rounded-lg text-app-text-muted hover:text-app-text-primary hover:bg-app-surface-2 active:scale-90 transition-[background-color,color,transform] duration-100"
              aria-label="Assignment options"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-8 z-50 w-44 bg-app-surface/95 backdrop-blur-xl rounded-2xl shadow-dropdown dark:shadow-[0_4px_12px_rgba(0,0,0,0.3),0_16px_40px_rgba(0,0,0,0.5)] py-1 overflow-hidden animate-fade-in">
                <Link
                  href={`/assignments/${assignment.id}`}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center px-4 py-2.5 text-[13px] text-app-text-primary hover:bg-app-surface-2 transition-colors"
                >
                  View Assignment
                </Link>
                <button
                  onClick={() => { setMenuOpen(false); onDelete(assignment.id); }}
                  className="w-full flex items-center px-4 py-2.5 text-[13px] text-red-500 hover:bg-red-500/10 transition-colors border-t border-app-border/50"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Row 2: title */}
      <Link href={`/assignments/${assignment.id}`} className="block min-w-0">
        <h3 className="font-semibold text-[15px] text-app-text-primary leading-snug line-clamp-2 group-hover:text-brand-orange transition-colors duration-150">
          {assignment.title}
        </h3>
      </Link>

      {/* Row 3: dates */}
      <div className="flex items-center justify-between pt-1 mt-auto border-t border-app-border/40">
        <p className="text-[11.5px] text-app-text-muted">
          <span className="font-medium text-app-text-secondary">Created</span>{' '}
          {formatDate(assignment.createdAt)}
        </p>
        <p className="text-[11.5px] text-app-text-muted">
          <span className="font-medium text-app-text-secondary">Due</span>{' '}
          {formatDate(assignment.dueDate)}
        </p>
      </div>
    </div>
  );
}
