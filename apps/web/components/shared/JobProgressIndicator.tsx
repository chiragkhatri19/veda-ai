'use client';

import { CheckCircle2, XCircle, Circle } from 'lucide-react';

interface Props {
  status: 'idle' | 'processing' | 'completed' | 'failed';
  progress: number;
  message: string;
  error?: string;
  subject?: string;
  grade?: string;
}

const STEPS = [
  { key: 'received',   label: 'Request received',         threshold: 0  },
  { key: 'building',   label: 'Building AI prompt',       threshold: 25 },
  { key: 'generating', label: 'Generating questions',      threshold: 70 },
  { key: 'saving',     label: 'Saving paper',              threshold: 90 },
] as const;

function VedaSpinner() {
  return (
    <div className="relative w-14 h-14 shrink-0">
      <svg className="w-14 h-14 animate-spin-slow" viewBox="0 0 56 56" fill="none">
        <circle cx="28" cy="28" r="26" className="stroke-app-border" strokeWidth="3" />
        <path
          d="M54 28A26 26 0 0 0 28 2"
          stroke="#F97316"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M4 4h12M7 4l3 11 3-11" stroke="#F97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  );
}

export default function JobProgressIndicator({ status, progress, message, error, subject, grade }: Props) {
  if (status === 'completed') {
    return (
      <div className="bg-app-surface/[0.97] rounded-2xl p-10 text-center shadow-card dark:shadow-[0_2px_8px_rgba(0,0,0,0.2),0_8px_24px_rgba(0,0,0,0.28)] max-w-lg mx-auto">
        <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8 text-emerald-500" />
        </div>
        <h3 className="text-[17px] font-bold text-app-text-primary mb-1">Paper is ready</h3>
        <p className="text-[13px] text-app-text-muted">Loading your question paper…</p>
      </div>
    );
  }

  if (status === 'failed') {
    return (
      <div className="bg-app-surface/[0.97] rounded-2xl p-10 text-center shadow-card dark:shadow-[0_2px_8px_rgba(0,0,0,0.2),0_8px_24px_rgba(0,0,0,0.28)] max-w-lg mx-auto">
        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <XCircle className="w-8 h-8 text-red-500" />
        </div>
        <h3 className="text-[17px] font-bold text-app-text-primary mb-2">Generation failed</h3>
        <p className="text-[13px] text-app-text-secondary leading-relaxed max-w-xs mx-auto">
          {error ?? 'An unexpected error occurred. Please try again.'}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-app-surface/[0.97] rounded-2xl p-8 shadow-card dark:shadow-[0_2px_8px_rgba(0,0,0,0.2),0_8px_24px_rgba(0,0,0,0.28)] max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <VedaSpinner />
        <div>
          <h3 className="text-[16px] font-bold text-app-text-primary leading-tight">
            Generating your paper…
          </h3>
          <p className="text-[12px] text-app-text-secondary mt-0.5">
            {subject && grade
              ? `${subject} · Grade ${grade}`
              : 'This usually takes 20–40 seconds'}
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between text-[11px] text-app-text-muted mb-2">
          <span>{message || 'Processing…'}</span>
          <span className="font-semibold tabular-nums">{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-app-surface-2 rounded-full h-1.5 overflow-hidden">
          <div
            className="h-full rounded-full bg-brand-orange transition-all duration-700 ease-out"
            style={{ width: `${Math.max(progress, 4)}%` }}
          />
        </div>
      </div>

      {/* Step pipeline */}
      <div className="flex items-center gap-0">
        {STEPS.map((step, idx) => {
          const done = progress > step.threshold && progress < 100;
          const actuallyDone = progress >= (STEPS[idx + 1]?.threshold ?? 100);
          const active = done && !actuallyDone;
          const completed = actuallyDone;
          const isLast = idx === STEPS.length - 1;

          return (
            <div key={step.key} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-1.5 shrink-0">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                  completed
                    ? 'bg-emerald-500'
                    : active
                      ? 'bg-brand-orange ring-4 ring-brand-orange/20'
                      : 'bg-app-surface-2'
                }`}>
                  {completed ? (
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  ) : active ? (
                    <div className="w-2 h-2 rounded-full bg-app-surface animate-pulse" />
                  ) : (
                    <Circle className="w-3 h-3 text-app-text-muted" />
                  )}
                </div>
                <span className={`text-[10px] text-center leading-tight max-w-[60px] ${
                  completed || active ? 'text-app-text-secondary font-medium' : 'text-app-text-muted'
                }`}>
                  {step.label}
                </span>
              </div>
              {!isLast && (
                <div className={`h-px flex-1 mx-1 mb-4 transition-colors ${
                  completed ? 'bg-emerald-500/50' : active ? 'bg-brand-orange/40' : 'bg-app-border'
                }`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
