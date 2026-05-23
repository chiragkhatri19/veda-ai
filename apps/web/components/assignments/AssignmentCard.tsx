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
    return `${day}-${month}-${year}`;
  } catch {
    return dateStr;
  }
}

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

  return (
    <div className="group bg-white dark:bg-app-surface rounded-2xl p-5 shadow-card hover:shadow-card-hover dark:shadow-[0_2px_8px_rgba(0,0,0,0.2),0_8px_24px_rgba(0,0,0,0.28)] dark:hover:shadow-[0_4px_16px_rgba(0,0,0,0.32),0_16px_40px_rgba(0,0,0,0.44)] transition-shadow duration-200 flex flex-col gap-3 animate-fade-in">
      {/* Top row: title + menu */}
      <div className="flex items-start justify-between gap-2">
        <Link href={`/assignments/${assignment.id}`} className="flex-1 min-w-0">
          <h3 className="font-semibold text-[15px] text-app-text-primary leading-snug line-clamp-2 group-hover:text-brand-orange transition-colors duration-150">
            {assignment.title}
          </h3>
        </Link>

        <div className="relative shrink-0" ref={menuRef}>
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

      {/* Footer: dates */}
      <div className="flex items-center justify-between mt-auto pt-1">
        <p className="text-[12px] text-app-text-muted">
          <span className="font-medium text-app-text-secondary">Assigned on</span> : {formatDate(assignment.createdAt)}
        </p>
        <p className="text-[12px] text-app-text-muted">
          <span className="font-medium text-app-text-secondary">Due</span> : {formatDate(assignment.dueDate)}
        </p>
      </div>
    </div>
  );
}
