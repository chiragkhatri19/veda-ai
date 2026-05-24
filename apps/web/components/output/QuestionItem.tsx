import DifficultyBadge from './DifficultyBadge';
import DiagramChart from './DiagramChart';
import type { GeneratedQuestion } from '@veda/shared';

interface Props {
  question: GeneratedQuestion;
  showAnswer: boolean;
}

export default function QuestionItem({ question, showAnswer }: Props) {
  const hasDiagram = question.type === 'diagram_graph' || !!question.diagramDescription;

  return (
    <div className="flex gap-3.5 print:break-inside-avoid">
      <span className="font-serif text-[14px] font-bold text-app-text-primary min-w-[24px] pt-px shrink-0 tabular-nums">
        {question.questionNumber}.
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-4">
          <p className="font-serif text-[14px] text-app-text-primary leading-relaxed flex-1">
            {question.text}
          </p>
          <div className="flex items-center gap-2 shrink-0 pt-0.5">
            <DifficultyBadge difficulty={question.difficulty} />
            <span className="text-[11px] font-semibold text-app-text-secondary whitespace-nowrap bg-app-surface-2 border border-app-border px-2 py-0.5 rounded print:bg-white print:border-gray-400 print:text-black">
              [{question.marks} {question.marks === 1 ? 'mark' : 'marks'}]
            </span>
          </div>
        </div>

        {hasDiagram && (
          <div className="mt-3 rounded-lg border border-dashed border-app-border dark:border-zinc-600 print:border-gray-400 overflow-hidden">
            <div className="px-3 py-1.5 border-b border-dashed border-app-border dark:border-zinc-600 print:border-gray-400 bg-app-surface-2 dark:bg-zinc-800/40 print:bg-gray-50">
              <span className="text-[10px] font-bold text-app-text-secondary uppercase tracking-wider">
                Figure {question.questionNumber}
              </span>
            </div>
            {question.diagramDescription && (
              <div className="px-3 pt-2 pb-1">
                <p className="font-serif text-[11px] text-app-text-secondary italic leading-relaxed">
                  {question.diagramDescription}
                </p>
              </div>
            )}
            <div className="px-3 py-3">
              {question.diagramData ? (
                <DiagramChart diagramData={question.diagramData} />
              ) : (
                <div className="h-40 rounded border border-dashed border-app-border dark:border-zinc-700 print:border-gray-300 flex items-center justify-center bg-app-bg/40 print:bg-white">
                  <span className="text-[11px] text-app-text-muted italic select-none print:text-gray-400">
                    [Diagram / Figure space]
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {showAnswer && question.answer && (
          <div className="mt-3 rounded-lg overflow-hidden border border-blue-500/20 dark:border-blue-800/60">
            <div className="bg-blue-500/10 px-3 py-1.5">
              <span className="text-[10px] font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider">
                Model Answer
              </span>
            </div>
            <div className="bg-app-surface px-3 py-2.5">
              <p className="font-serif text-[13px] text-app-text-primary leading-relaxed whitespace-pre-wrap">
                {question.answer}
              </p>
              {question.hint && (
                <p className="font-serif text-[11px] text-app-text-muted italic mt-2 pt-2 border-t border-app-border/50">
                  Hint: {question.hint}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
