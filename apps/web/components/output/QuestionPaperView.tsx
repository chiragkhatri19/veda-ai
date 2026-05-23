'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import SectionBlock from './SectionBlock';
import ActionBar from './ActionBar';
import type { Assignment } from '@veda/shared';

interface Props {
  assignment: Assignment;
  onRegenerate: () => void;
}

export default function QuestionPaperView({ assignment, onRegenerate }: Props) {
  const [showAnswers, setShowAnswers] = useState(false);
  const paper = assignment.questionPaper!;
  const subjectLabel = paper.subject || assignment.subject;
  const gradeLabel = paper.grade || assignment.grade;

  return (
    <div className="px-6 py-6 max-w-4xl print:px-0 print:py-0 print:max-w-none question-paper-print">
      <ActionBar
        assignmentId={assignment.id}
        assignmentTitle={assignment.title}
        generatedAt={paper.generatedAt}
        onRegenerate={onRegenerate}
      />

      {/* Paper card */}
      <div className="bg-white dark:bg-app-surface rounded-[24px] shadow-[0px_4px_18px_rgba(16,24,40,0.04),0px_1px_4px_rgba(16,24,40,0.08)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.2),0_8px_24px_rgba(0,0,0,0.28)] print:shadow-none print:rounded-none print:bg-white">
        <div className="p-8 sm:p-12 print:p-0 max-w-3xl mx-auto print:max-w-none print:mx-0">

          {/* School / exam header */}
          <div className="text-center pb-6 mb-6 border-b-2 border-app-text-primary/10">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-app-text-muted mb-2">
              Question Paper
            </p>
            <h1 className="font-serif text-[22px] font-extrabold text-app-text-primary tracking-tight leading-tight">
              {paper.schoolName}
            </h1>
            <div className="mt-2.5 flex items-center justify-center gap-3 flex-wrap font-serif text-[13px] text-app-text-secondary font-medium">
              <span>Subject: <span className="text-app-text-primary">{subjectLabel}</span></span>
              <span className="text-app-text-muted">·</span>
              <span>Class: <span className="text-app-text-primary">{gradeLabel}</span></span>
            </div>
          </div>

          {/* Time + Marks row */}
          <div className="flex items-center justify-between font-serif text-[12px] font-medium mb-5 pb-4 border-b border-dashed border-app-border">
            <span className="text-app-text-secondary">
              Time Allowed: <span className="font-semibold text-app-text-primary">{paper.timeAllowed}</span>
            </span>
            <span className="text-app-text-secondary">
              Maximum Marks: <span className="font-bold text-app-text-primary text-[14px]">{paper.maximumMarks}</span>
            </span>
          </div>

          {/* General instructions */}
          <div className="mb-7 pb-5 border-b border-app-border/50">
            <p className="text-[11px] font-semibold text-app-text-secondary uppercase tracking-wider mb-1.5">
              General Instructions
            </p>
            <ul className="list-disc list-inside space-y-0.5 font-serif text-[13px] text-app-text-secondary leading-relaxed">
              <li>All questions are compulsory unless stated otherwise.</li>
              <li>Write your answers neatly and clearly.</li>
              <li>Marks are indicated against each question.</li>
            </ul>
          </div>

          {/* Student info */}
          <div className="mb-8 space-y-3.5">
            <div className="flex items-end gap-3">
              <span className="font-serif text-[12px] font-semibold text-app-text-primary whitespace-nowrap shrink-0 pb-1">
                Name:
              </span>
              <div className="flex-1 border-b-2 border-app-text-secondary pb-1" />
            </div>
            <div className="flex gap-8">
              <div className="flex items-end gap-3 flex-1">
                <span className="font-serif text-[12px] font-semibold text-app-text-primary whitespace-nowrap shrink-0 pb-1">
                  Roll No.:
                </span>
                <div className="flex-1 border-b-2 border-app-text-secondary pb-1" />
              </div>
              <div className="flex items-end gap-3 flex-1">
                <span className="font-serif text-[12px] font-semibold text-app-text-primary whitespace-nowrap shrink-0 pb-1">
                  Section:
                </span>
                <div className="flex-1 border-b-2 border-app-text-secondary pb-1" />
              </div>
            </div>
          </div>

          {/* Sections */}
          <div className="space-y-0">
            {paper.sections.map((section, idx) => (
              <div key={section.id}>
                {idx > 0 && (
                  <div className="my-10 flex items-center gap-3 section-divider">
                    <div className="flex-1 border-t border-app-border" />
                    <div className="flex-1 border-t border-app-border" />
                  </div>
                )}
                <SectionBlock section={section} showAnswers={showAnswers} />
              </div>
            ))}
          </div>

          {/* End of paper */}
          <div className="mt-14 pt-6 border-t-2 border-dashed border-app-border text-center">
            <p className="text-[11px] font-bold text-app-text-muted uppercase tracking-[0.25em]">
              End of Question Paper
            </p>
          </div>

          {/* Answer key — hidden on print */}
          <div className="mt-6 no-print">
            <button
              onClick={() => setShowAnswers((p) => !p)}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-app-border hover:bg-app-surface-2 active:scale-[0.99] transition-[background-color,transform] duration-100 text-[13px] font-medium text-app-text-secondary"
            >
              <span>{showAnswers ? 'Hide Answer Key' : 'Show Answer Key'}</span>
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showAnswers ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
