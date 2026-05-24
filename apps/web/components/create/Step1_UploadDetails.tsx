'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  CloudUpload, X, Plus, Minus, ChevronDown,
  ArrowLeft, ArrowRight, CalendarDays, Mic, Check,
} from 'lucide-react';
import Link from 'next/link';
import { useCreateAssignment } from '@/hooks/useCreateAssignment';
import { useGroupStore } from '@/store/groupStore';
import { useUserStore } from '@/store/userStore';

const QUESTION_TYPES = [
  { value: 'multiple_choice', label: 'Multiple Choice Questions' },
  { value: 'short_answer',    label: 'Short Questions' },
  { value: 'long_answer',     label: 'Long Answer Questions' },
  { value: 'diagram_graph',   label: 'Diagram/Graph-Based Questions' },
  { value: 'numerical',       label: 'Numerical Problems' },
  { value: 'true_false',      label: 'True / False' },
];

const SUBJECTS = [
  'Mathematics', 'Science', 'Physics', 'Chemistry', 'Biology',
  'English', 'Hindi', 'Social Studies', 'History', 'Geography',
  'Computer Science', 'Economics',
];

const GRADE_OPTIONS = Array.from({ length: 12 }, (_, i) => `${i + 1}`);

const formSchema = z.object({
  title:       z.string().min(1, 'Title is required').max(200),
  subject:     z.string().min(1, 'Subject is required'),
  grade:       z.string().min(1, 'Grade is required'),
  dueDate:     z.string().min(1, 'Due date is required'),
  groupId:     z.string().optional(),
  questionTypes: z
    .array(z.object({
      type:             z.string().min(1),
      count:            z.number().int().min(1),
      marksPerQuestion: z.number().int().min(1),
    }))
    .min(1, 'Add at least one question type'),
  additionalInstructions: z.string().max(1000).optional(),
  uploadedFileText:       z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const inputCls = 'w-full px-3 py-2.5 text-[13px] text-app-text-primary bg-app-surface border border-app-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange/25 focus:border-brand-orange/60 transition-colors placeholder:text-app-text-muted';
const selectCls = `${inputCls} appearance-none pr-8`;
const labelCls = 'block text-[11px] font-semibold text-app-text-secondary mb-1.5 uppercase tracking-wide';

function Stepper({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center gap-1 w-24">
      <button
        type="button"
        disabled={value <= 1}
        onClick={() => onChange(Math.max(1, value - 1))}
        className="w-8 h-8 flex items-center justify-center rounded-full border border-app-border text-app-text-muted hover:bg-app-surface-2 active:bg-app-border disabled:opacity-30 transition-[background-color] duration-100 bg-app-surface"
      >
        <Minus className="w-3 h-3" />
      </button>
      <span className="flex-1 text-center text-[13px] font-semibold text-app-text-primary">{value}</span>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        className="w-8 h-8 flex items-center justify-center rounded-full border border-app-border text-app-text-muted hover:bg-app-surface-2 active:bg-app-border transition-[background-color] duration-100 bg-app-surface"
      >
        <Plus className="w-3 h-3" />
      </button>
    </div>
  );
}

export default function Step1_UploadDetails() {
  const { submitAssignment, isSubmitting, submitError } = useCreateAssignment();
  const { groups } = useGroupStore();
  const { subjectSpecialty, defaultGrade } = useUserStore();
  const [step, setStep] = useState<1 | 2>(1);
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const today = new Date().toISOString().split('T')[0];

  const {
    register, control, handleSubmit, watch, setValue, trigger,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      subject: subjectSpecialty,
      grade: defaultGrade,
      dueDate: '',
      groupId: '',
      questionTypes: [
        { type: 'multiple_choice', count: 4, marksPerQuestion: 1 },
        { type: 'short_answer',    count: 3, marksPerQuestion: 2 },
      ],
      additionalInstructions: '',
      uploadedFileText: '',
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'questionTypes' });
  const questionTypes = watch('questionTypes');
  const selectedGroupId = watch('groupId');

  useEffect(() => {
    if (!selectedGroupId) return;
    const group = groups.find((g) => g.id === selectedGroupId);
    if (!group) return;
    setValue('subject', group.subject, { shouldDirty: true });
    setValue('grade', group.grade, { shouldDirty: true });
  }, [selectedGroupId, groups, setValue]);

  const totalQuestions = questionTypes.reduce((s, q) => s + (q.count || 0), 0);
  const totalMarks     = questionTypes.reduce((s, q) => s + (q.count || 0) * (q.marksPerQuestion || 0), 0);

  const handleFileDrop = useCallback((file: File) => {
    setFileName(file.name);
    if (file.type.startsWith('text/') || file.name.endsWith('.txt')) {
      const reader = new FileReader();
      reader.onload = (e) => setValue('uploadedFileText', (e.target?.result as string) ?? '');
      reader.readAsText(file);
    }
  }, [setValue]);

  async function goToStep2() {
    const valid = await trigger(['title', 'subject', 'grade', 'dueDate']);
    if (valid) setStep(2);
  }

  const onSubmit = async (data: FormValues) => {
    if (step !== 2) return;
    await submitAssignment({
      title:                  data.title,
      subject:                data.subject,
      grade:                  data.grade,
      dueDate:                data.dueDate,
      groupId:                data.groupId || null,
      questionTypes:          data.questionTypes,
      additionalInstructions: data.additionalInstructions || null,
      uploadedFileText:       data.uploadedFileText || null,
    });
  };

  return (
    <form onSubmit={(e) => e.preventDefault()}>
      {/* Step indicator */}
      <div className="mb-6 flex items-center gap-0">
        <div className="flex items-center gap-2 shrink-0">
          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold transition-colors duration-200 ${step >= 1 ? 'bg-brand-dark text-white' : 'bg-app-surface-2 text-app-text-muted'}`}>
            {step > 1 ? <Check className="w-3.5 h-3.5" /> : '1'}
          </div>
          <span className={`text-[12px] font-medium transition-colors duration-200 ${step === 1 ? 'text-app-text-primary' : 'text-app-text-muted'}`}>
            Details
          </span>
        </div>
        <div className={`flex-1 mx-3 h-px transition-colors duration-300 ${step >= 2 ? 'bg-brand-dark' : 'bg-app-border'}`} />
        <div className="flex items-center gap-2 shrink-0">
          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold transition-colors duration-200 ${step >= 2 ? 'bg-brand-dark text-white' : 'bg-app-surface-2 text-app-text-muted'}`}>
            2
          </div>
          <span className={`text-[12px] font-medium transition-colors duration-200 ${step === 2 ? 'text-app-text-primary' : 'text-app-text-muted'}`}>
            Question Types
          </span>
        </div>
      </div>

      {/* ── Step 1: Assignment Details ────────────────────────────── */}
      {step === 1 && (
        <div className="bg-white dark:bg-app-surface rounded-2xl overflow-hidden shadow-[0_2px_8px_rgba(16,24,40,0.08),0_8px_28px_rgba(16,24,40,0.12),0_20px_56px_-8px_rgba(16,24,40,0.10)] dark:shadow-[0_2px_10px_rgba(0,0,0,0.28),0_12px_36px_rgba(0,0,0,0.42),0_28px_72px_rgba(0,0,0,0.36)] animate-fade-in">
          <div className="px-6 py-5 border-b border-app-border bg-app-surface-2/50">
            <h2 className="text-[15px] font-semibold text-app-text-primary">Assignment Details</h2>
            <p className="text-[12px] text-app-text-muted mt-0.5">Basic information about your assignment</p>
          </div>

          <div className="p-6 space-y-6">
            <div>
              <label className={labelCls}>Title</label>
              <input
                {...register('title')}
                type="text"
                placeholder="e.g. Mid-Term Exam: Chapter 5 & 6"
                className={inputCls}
              />
              {errors.title && <p className="text-[11px] text-red-500 mt-1">{errors.title.message}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Subject</label>
                <div className="relative">
                  <select {...register('subject')} className={selectCls}>
                    <option value="">Select subject</option>
                    {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-app-text-muted pointer-events-none" />
                </div>
                {errors.subject && <p className="text-[11px] text-red-500 mt-1">{errors.subject.message}</p>}
              </div>
              <div>
                <label className={labelCls}>Grade / Class</label>
                <div className="relative">
                  <select {...register('grade')} className={selectCls}>
                    <option value="">Select grade</option>
                    {GRADE_OPTIONS.map((g) => <option key={g} value={g}>Grade {g}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-app-text-muted pointer-events-none" />
                </div>
                {errors.grade && <p className="text-[11px] text-red-500 mt-1">{errors.grade.message}</p>}
              </div>
            </div>

            <div>
              <label className={labelCls}>Due Date</label>
              <div className="relative max-w-xs">
                <input
                  {...register('dueDate')}
                  type="date"
                  min={today}
                  className={`${inputCls} pr-10`}
                />
                <CalendarDays className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-app-text-muted pointer-events-none" />
              </div>
              {errors.dueDate && <p className="text-[11px] text-red-500 mt-1">{errors.dueDate.message}</p>}
            </div>

            {groups.length > 0 && (
              <div>
                <label className={labelCls}>
                  Assign to Group <span className="text-app-text-muted font-normal normal-case">(optional)</span>
                </label>
                <div className="relative max-w-xs">
                  <select {...register('groupId')} className={selectCls}>
                    <option value="">No group</option>
                    {groups.map((g) => (
                      <option key={g.id} value={g.id}>{g.name}: Grade {g.grade} · {g.subject}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-app-text-muted pointer-events-none" />
                </div>
              </div>
            )}

            <div>
              {fileName ? (
                <div className="flex items-center justify-between bg-app-surface-2 border border-app-border rounded-lg px-4 py-3">
                  <span className="text-[13px] text-app-text-primary truncate mr-3">{fileName}</span>
                  <button
                    type="button"
                    onClick={() => { setFileName(null); setValue('uploadedFileText', ''); if (fileRef.current) fileRef.current.value = ''; }}
                    className="text-app-text-muted hover:text-red-500 active:scale-90 transition-[color,transform] duration-100 shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <>
                  <div
                    onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                    onDragLeave={() => setDragActive(false)}
                    onDrop={(e) => { e.preventDefault(); setDragActive(false); const f = e.dataTransfer.files[0]; if (f) handleFileDrop(f); }}
                    onClick={() => fileRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl py-10 text-center transition-colors cursor-pointer ${dragActive ? 'border-brand-orange bg-orange-500/5' : 'border-app-border hover:border-app-text-muted bg-app-surface-2'}`}
                  >
                    <CloudUpload className="w-8 h-8 text-app-text-muted mx-auto mb-3" />
                    <p className="text-[13px] text-app-text-secondary mb-1 font-medium">
                      Choose a file or drag &amp; drop it here
                    </p>
                    <p className="text-[11px] text-app-text-muted mb-4">TXT files for reference material</p>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); fileRef.current?.click(); }}
                      className="text-[12px] font-medium border border-app-border px-5 py-1.5 rounded-lg hover:bg-app-surface-2 active:scale-[0.97] transition-[background-color,transform] duration-100 text-app-text-secondary bg-app-surface shadow-sm"
                    >
                      Browse Files
                    </button>
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*,.txt,text/plain"
                      className="hidden"
                      onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileDrop(f); }}
                    />
                  </div>
                  <p className="text-[11px] text-app-text-muted mt-2 text-center">
                    Optional: upload reference material to guide question generation
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Step 2: Question Types ────────────────────────────────── */}
      {step === 2 && (
        <div className="bg-white dark:bg-app-surface rounded-2xl overflow-hidden shadow-[0_2px_8px_rgba(16,24,40,0.08),0_8px_28px_rgba(16,24,40,0.12),0_20px_56px_-8px_rgba(16,24,40,0.10)] dark:shadow-[0_2px_10px_rgba(0,0,0,0.28),0_12px_36px_rgba(0,0,0,0.42),0_28px_72px_rgba(0,0,0,0.36)] animate-fade-in">
          <div className="px-6 py-5 border-b border-app-border bg-app-surface-2/50">
            <h2 className="text-[15px] font-semibold text-app-text-primary">Question Types</h2>
            <p className="text-[12px] text-app-text-muted mt-0.5">Configure the structure of your question paper</p>
          </div>

          <div className="p-6 space-y-6">
            <div>
              <label className={labelCls}>Question Type</label>

              <div className="hidden sm:grid sm:grid-cols-12 gap-3 text-[10px] font-semibold text-app-text-muted uppercase tracking-wide mb-2 px-1">
                <div className="col-span-5">Type</div>
                <div className="col-span-1" />
                <div className="col-span-3 text-center">Questions</div>
                <div className="col-span-3 text-center">Marks</div>
              </div>

              <div className="space-y-2">
                {fields.map((field, index) => (
                  <div key={field.id}>
                    <div className="hidden sm:grid sm:grid-cols-12 gap-3 items-center border border-app-border rounded-lg px-3 py-2 bg-app-surface">
                      <div className="col-span-5">
                        <Controller
                          control={control}
                          name={`questionTypes.${index}.type`}
                          render={({ field: f }) => (
                            <div className="relative">
                              <select {...f} className="w-full px-3 py-2 text-[13px] text-app-text-primary border border-app-border rounded-lg appearance-none bg-app-surface focus:outline-none focus:border-app-text-muted pr-8 transition-colors">
                                {QUESTION_TYPES.map((qt) => <option key={qt.value} value={qt.value}>{qt.label}</option>)}
                              </select>
                              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-app-text-muted pointer-events-none" />
                            </div>
                          )}
                        />
                      </div>
                      <div className="col-span-1 flex justify-center">
                        <button
                          type="button"
                          onClick={() => fields.length > 1 && remove(index)}
                          disabled={fields.length === 1}
                          className="p-1 text-app-text-muted hover:text-red-500 disabled:opacity-0 transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="col-span-3 flex justify-center">
                        <Controller
                          control={control}
                          name={`questionTypes.${index}.count`}
                          render={({ field: f }) => <Stepper value={f.value} onChange={f.onChange} />}
                        />
                      </div>
                      <div className="col-span-3 flex justify-center">
                        <Controller
                          control={control}
                          name={`questionTypes.${index}.marksPerQuestion`}
                          render={({ field: f }) => <Stepper value={f.value} onChange={f.onChange} />}
                        />
                      </div>
                    </div>

                    <div className="sm:hidden bg-app-surface-2 border border-app-border rounded-lg p-3 space-y-3">
                      <div className="flex items-center gap-2">
                        <Controller
                          control={control}
                          name={`questionTypes.${index}.type`}
                          render={({ field: f }) => (
                            <div className="relative flex-1">
                              <select {...f} className="w-full px-3 py-2 text-[13px] border border-app-border rounded-lg appearance-none bg-app-surface focus:outline-none focus:border-app-text-muted pr-8 transition-colors text-app-text-primary">
                                {QUESTION_TYPES.map((qt) => <option key={qt.value} value={qt.value}>{qt.label}</option>)}
                              </select>
                              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-app-text-muted pointer-events-none" />
                            </div>
                          )}
                        />
                        <button
                          type="button"
                          onClick={() => fields.length > 1 && remove(index)}
                          disabled={fields.length === 1}
                          className="p-2 text-app-text-muted hover:text-red-500 disabled:opacity-0 transition-colors shrink-0"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <p className="text-[10px] font-semibold text-app-text-muted uppercase tracking-wide mb-1.5">Questions</p>
                          <Controller
                            control={control}
                            name={`questionTypes.${index}.count`}
                            render={({ field: f }) => <Stepper value={f.value} onChange={f.onChange} />}
                          />
                        </div>
                        <div className="flex-1">
                          <p className="text-[10px] font-semibold text-app-text-muted uppercase tracking-wide mb-1.5">Marks / Q</p>
                          <Controller
                            control={control}
                            name={`questionTypes.${index}.marksPerQuestion`}
                            render={({ field: f }) => <Stepper value={f.value} onChange={f.onChange} />}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex items-end justify-between gap-4">
                {fields.length < 6 ? (
                  <button
                    type="button"
                    onClick={() => append({ type: 'short_answer', count: 3, marksPerQuestion: 2 })}
                    className="flex items-center gap-2 text-[13px] font-medium text-app-text-secondary hover:text-app-text-primary active:scale-[0.98] transition-[color,transform] duration-100"
                  >
                    <span className="w-5 h-5 rounded-full bg-brand-dark text-white flex items-center justify-center shrink-0">
                      <Plus className="w-3 h-3" />
                    </span>
                    Add Question Type
                  </button>
                ) : <div />}
                <div className="text-right text-[12px] text-app-text-secondary space-y-0.5 shrink-0">
                  <p>Total Questions: <span className="font-semibold text-app-text-primary">{totalQuestions}</span></p>
                  <p>Total Marks: <span className="font-semibold text-app-text-primary">{totalMarks}</span></p>
                </div>
              </div>

              {errors.questionTypes && (
                <p className="text-[11px] text-red-500 mt-1">
                  {typeof errors.questionTypes.message === 'string' ? errors.questionTypes.message : 'Check question types'}
                </p>
              )}
            </div>

            <div>
              <label className={labelCls}>
                Additional Instructions{' '}
                <span className="text-app-text-muted font-normal normal-case">(optional)</span>
              </label>
              <div className="relative">
                <textarea
                  {...register('additionalInstructions')}
                  rows={3}
                  maxLength={1000}
                  placeholder="e.g. Focus on chapters 4 and 5, include one case study question..."
                  className="w-full px-3 py-2.5 text-[13px] text-app-text-primary bg-app-surface border border-app-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange/25 focus:border-brand-orange/60 resize-none transition-colors placeholder:text-app-text-muted pr-10"
                />
                <Mic className="absolute right-3 bottom-3 w-4 h-4 text-app-text-muted pointer-events-none" />
              </div>
            </div>
          </div>
        </div>
      )}

      {submitError && (
        <div className="mt-4 border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20 rounded-lg px-4 py-3">
          <p className="text-[12px] text-red-600 dark:text-red-400">{submitError}</p>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between mt-6 pb-4">
        {step === 1 ? (
          <Link
            href="/assignments"
            className="inline-flex items-center gap-2 px-5 py-2.5 text-[13px] font-medium text-app-text-secondary border border-app-border rounded-full hover:bg-app-surface-2 active:scale-[0.97] transition-[background-color,transform] duration-100 bg-app-surface"
          >
            <ArrowLeft className="w-4 h-4" />
            Cancel
          </Link>
        ) : (
          <button
            type="button"
            onClick={() => setStep(1)}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-[13px] font-medium text-app-text-secondary border border-app-border rounded-full hover:bg-app-surface-2 active:scale-[0.97] transition-[background-color,transform] duration-100 bg-app-surface"
          >
            <ArrowLeft className="w-4 h-4" />
            Previous
          </button>
        )}

        {step === 1 ? (
          <button
            type="button"
            onClick={goToStep2}
            className="inline-flex items-center gap-2 px-6 py-2.5 text-[13px] font-semibold text-white bg-brand-dark rounded-full hover:opacity-90 active:scale-[0.97] active:opacity-80 transition-[opacity,transform] duration-150 shadow-sm"
          >
            Next
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleSubmit(onSubmit)}
            className="inline-flex items-center gap-2 px-6 py-2.5 text-[13px] font-semibold text-white bg-brand-dark rounded-full hover:opacity-90 active:scale-[0.97] active:opacity-80 disabled:opacity-60 transition-[opacity,transform] duration-150 shadow-sm"
          >
            {isSubmitting ? 'Generating...' : 'Generate Paper'}
          </button>
        )}
      </div>
    </form>
  );
}
