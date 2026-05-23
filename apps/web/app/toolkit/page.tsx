'use client';

import Link from 'next/link';
import { FileText, PenTool, ArrowRight, BookCheck } from 'lucide-react';

const TOOLS = [
  {
    id: 'question-paper',
    title: 'Question Paper Generator',
    description:
      'Generate complete, curriculum-aligned question papers in seconds. Configure question types, marks per question, difficulty split, and attach reference material. The AI handles the rest.',
    icon: FileText,
    iconBg: 'bg-orange-500/10',
    iconColor: 'text-brand-orange',
    href: '/assignments/create',
    badge: 'Flagship',
    badgeStyle: 'bg-orange-500/15 text-brand-orange',
    stats: ['6 question types', 'CBSE / ICSE aligned', 'PDF export'],
  },
  {
    id: 'rubric-maker',
    title: 'Rubric & Marking Scheme',
    description:
      'Define your assessment topic and the AI generates a structured marking rubric with four performance levels: Excellent, Good, Satisfactory, and Needs Work. Print-ready.',
    icon: PenTool,
    iconBg: 'bg-emerald-500/10',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    href: '/toolkit/rubric',
    badge: 'New',
    badgeStyle: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400',
    stats: ['Up to 8 criteria', 'Any assessment type', 'Print-ready'],
  },
] as const;

export default function ToolkitPage() {
  return (
    <div className="px-6 py-6 space-y-8">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <BookCheck className="w-5 h-5 text-brand-orange" />
          <h1 className="text-[22px] font-bold text-app-text-primary">AI Teacher&apos;s Toolkit</h1>
        </div>
        <p className="text-[13px] text-app-text-secondary">
          Purpose-built AI tools that save hours of prep time, every week.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {TOOLS.map((tool) => {
          const Icon = tool.icon;
          return (
            <Link
              key={tool.id}
              href={tool.href}
              className="group bg-app-surface/[0.97] rounded-2xl p-6 flex flex-col gap-5 shadow-card hover:shadow-card-hover dark:shadow-[0_2px_8px_rgba(0,0,0,0.2),0_8px_24px_rgba(0,0,0,0.28)] dark:hover:shadow-[0_4px_16px_rgba(0,0,0,0.32),0_16px_40px_rgba(0,0,0,0.44)] transition-shadow duration-200"
            >
              <div className="flex items-start justify-between gap-3">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${tool.iconBg} ${tool.iconColor}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide mt-0.5 shrink-0 ${tool.badgeStyle}`}>
                  {tool.badge}
                </span>
              </div>

              <div className="flex-1">
                <h2 className="text-[16px] font-bold text-app-text-primary leading-snug mb-2">
                  {tool.title}
                </h2>
                <p className="text-[13px] text-app-text-secondary leading-relaxed">
                  {tool.description}
                </p>
              </div>

              <div className="flex items-end justify-between gap-4">
                <div className="flex flex-wrap gap-2">
                  {tool.stats.map((stat) => (
                    <span
                      key={stat}
                      className="text-[11px] font-medium text-app-text-muted bg-app-surface-2 px-2.5 py-1 rounded-full"
                    >
                      {stat}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-1 text-[13px] font-semibold text-brand-orange shrink-0 group-hover:gap-2 transition-all">
                  Open
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="bg-app-surface-2/90 rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_10px_rgba(0,0,0,0.05)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.2)]">
        <p className="text-[13px] font-semibold text-app-text-primary">More tools are on the way</p>
        <p className="text-[12px] text-app-text-muted mt-0.5">
          Lesson Plan Builder, Student Feedback Writer, and Class Progress Analyser. Coming soon.
        </p>
      </div>
    </div>
  );
}
