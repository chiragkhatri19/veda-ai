'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, FileText } from 'lucide-react';

const FUN_FACTS = [
  "The average teacher spends 3–5 hours crafting a single question paper by hand. VedaAI does it in seconds.",
  "Students who practise retrieval testing retain up to 50% more information than those who simply re-read notes.",
  "Bloom's Taxonomy — published in 1956 — remains the global gold standard for designing fair, rigorous assessments.",
  "Multiple choice questions were first used at scale in World War I to screen 1.7 million US Army recruits in just six weeks.",
  "CBSE is one of the world's largest examination bodies, overseeing assessments across more than 27,000 affiliated schools.",
  "Research shows that varying difficulty — easy, moderate, hard — can improve class average scores by up to 20%.",
  "India has over 1.5 million schools, serving approximately 260 million students — more than any other country.",
  "Teachers who use structured rubrics produce grades that are up to 40% more consistent across different evaluators.",
  "Students perform measurably better when they know the marking criteria before the exam begins.",
  "The word 'examination' comes from the Latin examinare — meaning 'to test the weight or balance of something'.",
];

interface Props {
  status: 'loading' | 'processing' | 'completed' | 'failed';
  progress: number;
  message?: string;
  error?: string;
  title?: string;
  subject?: string;
  grade?: string;
}

function VedaAIMark() {
  return (
    <svg width="32" height="32" viewBox="0 0 30 30" fill="none" aria-hidden="true">
      <rect width="30" height="30" rx="8" fill="#F97316" />
      <path d="M7 8h16M11 8l4 13 4-13" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* Skeleton line — reuses the skeletonPulse keyframe from globals.css */
function SkLine({ w, delay, opacity = 1 }: { w: string; delay: number; opacity?: number }) {
  return (
    <div
      className="h-[5px] rounded-full bg-app-border"
      style={{
        width: w,
        opacity,
        animation: `skeletonPulse 1.8s cubic-bezier(0.4,0,0.6,1) infinite`,
        animationDelay: `${delay}ms`,
      }}
    />
  );
}

/* The document preview that fills in as the paper generates */
function DocumentPreview({ progress }: { progress: number }) {
  return (
    <div className="w-[178px] bg-app-surface dark:bg-[rgb(22,22,26)] border border-app-border rounded-xl shadow-card overflow-hidden">
      {/* Paper header */}
      <div className="px-4 py-3 border-b border-app-border/60 bg-app-surface-2/50 space-y-2">
        <SkLine w="58%" delay={0} />
        <SkLine w="40%" delay={100} opacity={0.7} />
      </div>

      {/* Section A */}
      <div className="px-4 pt-3 pb-1 space-y-2">
        <SkLine w="28%" delay={180} opacity={0.55} />
        <div className="space-y-1.5 pl-2">
          <SkLine w="96%" delay={260} />
          <SkLine w="72%" delay={340} opacity={0.8} />
        </div>
        <div className="space-y-1.5 pl-2">
          <SkLine w="90%" delay={420} />
          <SkLine w="64%" delay={500} opacity={0.8} />
        </div>
      </div>

      {/* Dashed section divider */}
      <div className="mx-4 my-2 border-t border-dashed border-app-border/50" />

      {/* Section B */}
      <div className="px-4 pb-3 space-y-2">
        <SkLine w="28%" delay={560} opacity={0.55} />
        <div className="space-y-1.5 pl-2">
          <SkLine w="88%" delay={640} />
          <SkLine w="56%" delay={720} opacity={0.8} />
        </div>
        <div className="space-y-1.5 pl-2">
          <SkLine w="93%" delay={800} />
          <SkLine w="70%" delay={880} opacity={0.8} />
        </div>
      </div>

      {/* Progress fill strip at the bottom of the document */}
      <div className="h-[3px] bg-app-surface-2">
        <div
          className="h-full bg-brand-orange/60 transition-all duration-700 ease-out"
          style={{ width: `${Math.max(progress, 3)}%` }}
        />
      </div>
    </div>
  );
}

export default function GenerationScreen({
  status, progress, message, error, title, subject, grade,
}: Props) {
  const [factIdx, setFactIdx] = useState(() => Math.floor(Math.random() * FUN_FACTS.length));
  const [factVisible, setFactVisible] = useState(true);

  useEffect(() => {
    if (status !== 'processing' && status !== 'loading') return;
    const id = setInterval(() => {
      setFactVisible(false);
      const t = setTimeout(() => {
        setFactIdx((i) => (i + 1) % FUN_FACTS.length);
        setFactVisible(true);
      }, 380);
      return () => clearTimeout(t);
    }, 5800);
    return () => clearInterval(id);
  }, [status]);

  /* ── Completed ───────────────────────────────────────────────── */
  if (status === 'completed') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[65vh] gap-5 animate-fade-in">
        <div className="w-24 h-24 rounded-3xl bg-emerald-500/10 dark:bg-emerald-500/[.12] flex items-center justify-center ring-8 ring-emerald-500/10">
          <CheckCircle2 className="w-11 h-11 text-emerald-500" strokeWidth={1.5} />
        </div>
        <div className="text-center">
          <h2 className="text-[20px] font-bold text-app-text-primary">Paper is ready</h2>
          <p className="text-[13px] text-app-text-muted mt-1">Loading your question paper…</p>
        </div>
      </div>
    );
  }

  /* ── Failed ──────────────────────────────────────────────────── */
  if (status === 'failed') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[65vh] gap-5 animate-fade-in">
        <div className="w-24 h-24 rounded-3xl bg-red-500/10 dark:bg-red-500/[.12] flex items-center justify-center ring-8 ring-red-500/10">
          <XCircle className="w-11 h-11 text-red-500" strokeWidth={1.5} />
        </div>
        <div className="text-center max-w-xs">
          <h2 className="text-[20px] font-bold text-app-text-primary mb-2">Generation failed</h2>
          <p className="text-[13px] text-app-text-secondary leading-relaxed">
            {error ?? 'An unexpected error occurred. Please try again.'}
          </p>
        </div>
      </div>
    );
  }

  /* ── Generating ──────────────────────────────────────────────── */
  const displayProgress = Math.max(progress, status === 'loading' ? 2 : 4);

  return (
    <div className="flex flex-col items-center justify-center min-h-[72vh] px-6 py-10 select-none">

      {/* Context pill */}
      {(subject || title) && (
        <div className="mb-9 animate-fade-in">
          <div className="inline-flex items-center gap-2 text-[12px] font-medium text-app-text-secondary bg-app-surface border border-app-border rounded-full px-4 py-2">
            <FileText className="w-3.5 h-3.5 text-brand-orange shrink-0" />
            {title && <span className="truncate max-w-[180px] sm:max-w-[260px]">{title}</span>}
            {subject && title && <span className="text-app-text-muted/60">·</span>}
            {subject && <span>{subject}</span>}
            {grade && <span className="text-app-text-muted">· Grade {grade}</span>}
          </div>
        </div>
      )}

      {/* Document visual */}
      <div className="mb-10 flex flex-col items-center gap-4 animate-fade-in">
        <VedaAIMark />
        <DocumentPreview progress={displayProgress} />
      </div>

      {/* Heading + progress + facts */}
      <div className="w-full max-w-[340px] space-y-5">
        <div className="text-center animate-slide-up">
          <h2 className="text-[20px] font-bold text-app-text-primary leading-tight">
            {status === 'loading' ? 'Preparing your paper…' : 'Generating your paper…'}
          </h2>
          <p className="text-[13px] text-app-text-muted mt-1.5">
            This usually takes 20–40 seconds
          </p>
        </div>

        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-app-text-muted truncate pr-3">{message || 'Processing…'}</span>
            <span className="font-bold text-app-text-secondary tabular-nums shrink-0">
              {Math.round(displayProgress)}%
            </span>
          </div>
          <div className="h-1 bg-app-surface-2 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-brand-orange to-orange-400 transition-all duration-700 ease-out"
              style={{ width: `${displayProgress}%` }}
            />
          </div>
        </div>

        {/* Fun fact */}
        <div
          className="rounded-xl border border-app-border bg-app-surface-2 px-4 py-3.5"
          style={{ opacity: factVisible ? 1 : 0, transition: 'opacity 380ms ease' }}
        >
          <p className="text-[10px] font-bold text-brand-orange uppercase tracking-widest mb-1.5">
            Did you know?
          </p>
          <p className="text-[12px] text-app-text-secondary leading-relaxed">
            {FUN_FACTS[factIdx]}
          </p>
        </div>
      </div>
    </div>
  );
}
