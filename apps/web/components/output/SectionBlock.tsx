import QuestionItem from './QuestionItem';
import type { GeneratedSection } from '@veda/shared';

interface Props {
  section: GeneratedSection;
  showAnswers: boolean;
}

export default function SectionBlock({ section, showAnswers }: Props) {
  return (
    <div>
      <div className="text-center mb-6 section-block-header">
        <h3 className="font-serif text-[15px] font-bold text-app-text-primary uppercase tracking-widest underline underline-offset-4 decoration-app-border">
          Section {section.label}: {section.title}
        </h3>
        <p className="font-serif text-[13px] italic text-app-text-secondary mt-2 leading-relaxed">
          {section.instruction}
        </p>
      </div>

      <div className="space-y-6">
        {section.questions.map((question) => (
          <QuestionItem key={question.id} question={question} showAnswer={showAnswers} />
        ))}
      </div>
    </div>
  );
}
