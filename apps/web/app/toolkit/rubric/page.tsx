'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Loader2, Printer, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { useUserStore } from '@/store/userStore';

const SUBJECT_OPTIONS = [
  'Mathematics', 'Science', 'Physics', 'Chemistry', 'Biology',
  'English', 'Hindi', 'History', 'Geography', 'Computer Science',
];
const GRADE_OPTIONS = Array.from({ length: 12 }, (_, i) => `${i + 1}`);
const ASSESSMENT_TYPES = [
  'Written Assignment', 'Project Work', 'Oral Presentation',
  'Practical / Lab Report', 'Group Activity', 'Research Essay',
];

interface RubricCriterion {
  criterion: string;
  maxMarks: number;
  excellent: string;
  good: string;
  satisfactory: string;
  needsWork: string;
}

interface GeneratedRubric {
  topic: string;
  subject: string;
  grade: string;
  assessmentType: string;
  totalMarks: number;
  generatedAt: string;
  criteria: RubricCriterion[];
}

const DIFFICULTY_HEADERS = [
  { key: 'excellent', label: 'Excellent', color: 'text-emerald-700 dark:text-emerald-400 bg-emerald-500/10' },
  { key: 'good', label: 'Good', color: 'text-blue-700 dark:text-blue-400 bg-blue-500/10' },
  { key: 'satisfactory', label: 'Satisfactory', color: 'text-amber-700 dark:text-amber-400 bg-amber-500/10' },
  { key: 'needsWork', label: 'Needs Work', color: 'text-red-700 dark:text-red-400 bg-red-500/10' },
] as const;

const POLL_INTERVAL_MS = 1500;
const POLL_TIMEOUT_MS = 120_000;

export default function RubricGeneratorPage() {
  const { school, subjectSpecialty, defaultGrade } = useUserStore();
  const [form, setForm] = useState({
    topic: '',
    subject: subjectSpecialty,
    grade: defaultGrade,
    assessmentType: 'Written Assignment',
    totalMarks: 20,
    numCriteria: 4,
  });
  const [rubric, setRubric] = useState<GeneratedRubric | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);

  const stopPolling = useCallback(() => {
    if (pollTimer.current) {
      clearTimeout(pollTimer.current);
      pollTimer.current = null;
    }
  }, []);

  const pollStatus = useCallback((jobId: string, startedAt: number) => {
    pollTimer.current = setTimeout(async () => {
      // Abort silently if the component has been unmounted
      if (!mountedRef.current) return;

      if (Date.now() - startedAt > POLL_TIMEOUT_MS) {
        stopPolling();
        setIsGenerating(false);
        setError('Generation timed out. Please try again.');
        toast.error('Generation timed out.');
        return;
      }

      try {
        const { status, result, error: jobError } = await api.toolkit.getRubricStatus(jobId);

        if (!mountedRef.current) return;

        if (status === 'completed' && result) {
          setRubric(result as GeneratedRubric);
          setIsGenerating(false);
          toast.success('Rubric generated');
          stopPolling();
        } else if (status === 'failed') {
          setError(jobError ?? 'Generation failed. Please try again.');
          setIsGenerating(false);
          toast.error(jobError ?? 'Generation failed.');
          stopPolling();
        } else {
          pollStatus(jobId, startedAt);
        }
      } catch {
        if (mountedRef.current) pollStatus(jobId, startedAt);
      }
    }, POLL_INTERVAL_MS);
  }, [stopPolling]);

  // Scrub poll timer and mark unmounted to prevent any post-unmount state writes
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      stopPolling();
    };
  }, [stopPolling]);

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.topic.trim()) return;

    stopPolling();
    setIsGenerating(true);
    setError(null);
    setRubric(null);

    try {
      const { jobId } = await api.toolkit.generateRubric(form);
      pollStatus(jobId, Date.now());
    } catch (err) {
      const msg = (err as Error).message || 'Something went wrong. Please try again.';
      setError(msg);
      setIsGenerating(false);
      toast.error(msg);
    }
  }

  const inputClass =
    'w-full h-10 px-3 rounded-lg border border-app-border text-[13px] text-app-text-primary placeholder:text-app-text-muted bg-app-surface focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange transition-colors';
  const selectClass =
    'w-full h-10 px-3 rounded-lg border border-app-border text-[13px] text-app-text-primary bg-app-surface focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange transition-colors';

  return (
    <div className="px-6 py-6 max-w-5xl space-y-6">
      {/* Landscape print style for rubric page */}
      <style>{`@media print { @page { size: A4 landscape; margin: 1cm; } }`}</style>

      <div className="no-print">
        <h1 className="text-[22px] font-bold text-app-text-primary">Rubric &amp; Marking Scheme</h1>
        <p className="text-[13px] text-app-text-secondary mt-0.5">
          Auto-generate a clear marking rubric with four performance descriptors for any assessment.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleGenerate} className="no-print bg-app-surface border border-app-border rounded-xl p-5 space-y-4">
        <h2 className="text-[14px] font-semibold text-app-text-primary">Assessment Details</h2>

        <div>
          <label className="block text-[12px] font-medium text-app-text-secondary mb-1.5">Topic / Title</label>
          <input
            type="text"
            value={form.topic}
            onChange={(e) => setForm({ ...form, topic: e.target.value })}
            placeholder="e.g. Photosynthesis Lab Report"
            className={inputClass}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-[12px] font-medium text-app-text-secondary mb-1.5">Subject</label>
            <select value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className={selectClass}>
              {SUBJECT_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[12px] font-medium text-app-text-secondary mb-1.5">Grade</label>
            <select value={form.grade} onChange={(e) => setForm({ ...form, grade: e.target.value })} className={selectClass}>
              {GRADE_OPTIONS.map((g) => <option key={g} value={g}>Grade {g}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[12px] font-medium text-app-text-secondary mb-1.5">Assessment Type</label>
            <select value={form.assessmentType} onChange={(e) => setForm({ ...form, assessmentType: e.target.value })} className={selectClass}>
              {ASSESSMENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 max-w-xs">
          <div>
            <label className="block text-[12px] font-medium text-app-text-secondary mb-1.5">Total Marks</label>
            <input
              type="number"
              min={5}
              max={100}
              value={form.totalMarks}
              onChange={(e) => setForm({ ...form, totalMarks: Number(e.target.value) })}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-[12px] font-medium text-app-text-secondary mb-1.5">No. of Criteria</label>
            <input
              type="number"
              min={2}
              max={8}
              value={form.numCriteria}
              onChange={(e) => setForm({ ...form, numCriteria: Number(e.target.value) })}
              className={inputClass}
            />
          </div>
        </div>

        {form.totalMarks < form.numCriteria && (
          <div className="bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-[13px] px-4 py-3 rounded-lg">
            Total marks ({form.totalMarks}) is less than the number of criteria ({form.numCriteria}). Some criteria will have 0 marks — consider increasing total marks or reducing criteria count.
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-[13px] px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="flex items-center gap-3 pt-1">
          {rubric && (
            <button
              type="button"
              onClick={() => { setRubric(null); setError(null); }}
              className="h-10 px-4 rounded-full border border-app-border text-[13px] font-medium text-app-text-secondary hover:bg-app-surface-2 active:scale-[0.97] inline-flex items-center gap-2 transition-[background-color,transform] duration-100"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
          )}
          <button
            type="submit"
            disabled={isGenerating || !form.topic.trim()}
            className="h-10 px-6 rounded-full bg-brand-dark text-white text-[13px] font-semibold hover:opacity-90 active:scale-[0.97] active:opacity-80 disabled:opacity-50 disabled:pointer-events-none inline-flex items-center gap-2 transition-[opacity,transform] duration-150"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating…
              </>
            ) : 'Generate Rubric'}
          </button>
        </div>
      </form>

      {/* Result */}
      {rubric && (
        <div className="space-y-4 pb-6 animate-slide-up">
          {/* Screen action bar */}
          <div className="no-print flex items-center justify-between flex-wrap gap-3">
            <div>
              <h2 className="text-[16px] font-bold text-app-text-primary">{rubric.topic}</h2>
              <p className="text-[12px] text-app-text-muted mt-0.5">
                {rubric.subject} · Grade {rubric.grade} · {rubric.assessmentType} · {rubric.totalMarks} marks
              </p>
            </div>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 bg-brand-dark text-white text-[13px] font-semibold px-4 py-2 rounded-full hover:opacity-90 active:scale-[0.97] active:opacity-80 transition-[opacity,transform] duration-150"
            >
              <Printer className="w-3.5 h-3.5" />
              Print / Save PDF
            </button>
          </div>

          {/* Print header (only visible in print) */}
          <div className="rubric-print-header hidden print:block">
            {school && (
              <p style={{ fontSize: '13px', fontWeight: 700, marginBottom: '4px' }}>{school}</p>
            )}
            <h1 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '2px' }}>{rubric.topic}</h1>
            <p style={{ fontSize: '11px', color: '#374151' }}>
              {rubric.subject} · Grade {rubric.grade} · {rubric.assessmentType} · Total Marks: {rubric.totalMarks}
            </p>
            <hr style={{ margin: '8px 0', borderColor: '#9ca3af' }} />
          </div>

          {/* Rubric table */}
          <div className="rubric-print-area bg-app-surface border border-app-border rounded-xl overflow-x-auto">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="border-b border-app-border bg-app-surface-2">
                  <th className="text-left px-4 py-3 font-semibold text-app-text-primary w-40 print:w-32">Criterion</th>
                  <th className="text-center px-3 py-3 font-semibold text-app-text-primary w-16">Marks</th>
                  {DIFFICULTY_HEADERS.map((h) => (
                    <th key={h.key} className="text-left px-4 py-3 font-semibold w-[22%]">
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${h.color}`}>
                        {h.label}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rubric.criteria.map((criterion, idx) => (
                  <tr
                    key={idx}
                    className={`${idx % 2 === 0 ? '' : 'bg-app-surface-2/50'} ${idx !== rubric.criteria.length - 1 ? 'border-b border-app-border' : ''}`}
                  >
                    <td className="px-4 py-3.5 font-semibold text-app-text-primary align-top text-[12px]">
                      {criterion.criterion}
                    </td>
                    <td className="px-3 py-3.5 text-center font-bold text-brand-orange align-top text-[13px]">
                      {criterion.maxMarks}
                    </td>
                    {DIFFICULTY_HEADERS.map((h) => (
                      <td key={h.key} className="px-4 py-3.5 text-[12px] text-app-text-secondary leading-relaxed align-top">
                        {criterion[h.key]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Print footer */}
          <div className="hidden print:block" style={{ marginTop: '12px', fontSize: '9px', color: '#6b7280', textAlign: 'center' }}>
            Generated by VedaAI
          </div>
        </div>
      )}
    </div>
  );
}
