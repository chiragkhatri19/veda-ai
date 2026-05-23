import Link from 'next/link';
import { Plus } from 'lucide-react';

function EmptyIllustration() {
  return (
    <svg
      width="160"
      height="160"
      viewBox="0 0 160 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="mb-6 animate-float"
    >
      {/* Document behind */}
      <rect x="22" y="18" width="72" height="90" rx="8" className="fill-app-surface-2 stroke-app-border" strokeWidth="1.5" />
      {/* Document lines */}
      <rect x="34" y="34" width="48" height="3.5" rx="1.75" className="fill-app-border" />
      <rect x="34" y="44" width="38" height="3" rx="1.5" className="fill-app-border" opacity="0.8" />
      <rect x="34" y="52" width="42" height="3" rx="1.5" className="fill-app-border" opacity="0.7" />
      <rect x="34" y="60" width="30" height="3" rx="1.5" className="fill-app-border" opacity="0.6" />
      <rect x="34" y="68" width="35" height="3" rx="1.5" className="fill-app-border" opacity="0.5" />
      {/* Minus symbol on doc */}
      <rect x="50" y="80" width="16" height="2.5" rx="1.25" className="fill-app-text-muted" opacity="0.5" />
      {/* Curved pen accent */}
      <path
        d="M28 26 C40 16, 58 22, 54 36"
        stroke="rgb(var(--c-text3))"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        opacity="0.6"
      />
      {/* Magnifying glass outer circle */}
      <circle cx="100" cy="100" r="36" className="fill-app-surface-2 stroke-app-border" strokeWidth="1.5" />
      {/* Magnifying glass inner */}
      <circle cx="100" cy="100" r="24" className="fill-app-surface stroke-app-border" strokeWidth="1.5" />
      {/* Red X */}
      <path d="M91 91 L109 109" stroke="#EF4444" strokeWidth="3" strokeLinecap="round" />
      <path d="M109 91 L91 109" stroke="#EF4444" strokeWidth="3" strokeLinecap="round" />
      {/* Handle */}
      <path d="M120 120 L135 135" stroke="rgb(var(--c-text3))" strokeWidth="5" strokeLinecap="round" />
      {/* Accent dots */}
      <circle cx="44" cy="118" r="4" fill="#3B82F6" opacity="0.5" />
      <circle cx="140" cy="68" r="4" fill="#3B82F6" opacity="0.5" />
    </svg>
  );
}

interface Props {
  hasSearch?: boolean;
}

export default function EmptyState({ hasSearch }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <EmptyIllustration />
      <div className="animate-slide-up">
        <h3 className="text-[18px] font-semibold text-app-text-primary mb-3">
          {hasSearch ? 'No results found' : 'No assignments yet'}
        </h3>
        <p className="text-[13px] text-app-text-secondary mb-8 max-w-[320px] leading-relaxed">
          {hasSearch
            ? 'Try a different search term or clear the filter.'
            : 'Create your first assignment to start collecting and grading student submissions. You can set up rubrics, define marking criteria, and let AI assist with grading.'}
        </p>
        {!hasSearch && (
          <Link
            href="/assignments/create"
            className="inline-flex items-center gap-2 bg-brand-dark text-white text-[13px] font-semibold px-6 py-3 rounded-full hover:opacity-90 active:scale-[0.97] transition-[opacity,transform] duration-150 shadow-sm"
          >
            <Plus className="w-4 h-4" strokeWidth={2.5} />
            Create Your First Assignment
          </Link>
        )}
      </div>
    </div>
  );
}
