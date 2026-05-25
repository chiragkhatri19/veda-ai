import { z } from 'zod';
import type { GeneratedQuestionPaper } from '@veda/shared';

const DifficultySchema = z.string()
  .transform((v) => {
    const n = v.toLowerCase().trim();
    if (n === 'medium') return 'moderate';
    if (n === 'difficult') return 'hard';
    return n;
  })
  .pipe(z.enum(['easy', 'moderate', 'hard']));

const DiagramDataPointSchema = z.object({
  name: z.union([z.string(), z.number()]).transform(String),
  value: z.number(),
});

const DiagramDataSchema = z.object({
  type: z.enum(['line', 'bar', 'scatter']),
  title: z.string().nullish().transform((v) => v ?? null),
  xLabel: z.string().nullish().transform((v) => v ?? null),
  yLabel: z.string().nullish().transform((v) => v ?? null),
  data: z.array(DiagramDataPointSchema),
}).nullish().transform((v) => v ?? null);

const QuestionSchema = z.object({
  id: z.string(),
  questionNumber: z.number(),
  text: z.string(),
  type: z.string(),
  difficulty: DifficultySchema,
  marks: z.number(),
  answer: z.string().nullish().transform((v) => v ?? null),
  hint: z.string().nullish().transform((v) => v ?? null),
  diagramDescription: z.string().nullish().transform((v) => v ?? null),
  diagramData: DiagramDataSchema,
});

const SectionSchema = z.object({
  id: z.string(),
  label: z.string(),
  title: z.string(),
  instruction: z.string(),
  totalMarks: z.number(),
  questions: z.array(QuestionSchema),
});

const QuestionPaperSchema = z.object({
  schoolName: z.string(),
  subject: z.string(),
  grade: z.string(),
  timeAllowed: z.string(),
  maximumMarks: z.number(),
  totalQuestions: z.number(),
  generatedAt: z.string(),
  sections: z.array(SectionSchema),
});

function stripCodeFences(raw: string): string {
  return raw.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
}

// Safety net: Gemini sometimes returns null diagramData for diagram_graph
// questions despite the prompt. Synthesize a clean linear dataset so a chart
// always renders instead of the empty figure placeholder.
function fillMissingDiagrams(paper: GeneratedQuestionPaper): GeneratedQuestionPaper {
  for (const section of paper.sections) {
    for (const q of section.questions) {
      if (q.type === 'diagram_graph' && !q.diagramData) {
        q.diagramData = {
          type: 'line',
          title: q.diagramDescription ? null : 'Figure',
          xLabel: null,
          yLabel: null,
          data: Array.from({ length: 6 }, (_, i) => ({
            name: String(i),
            value: i * 10,
          })),
        };
      }
    }
  }
  return paper;
}

export function parseAndValidateLLMResponse(raw: string): GeneratedQuestionPaper {
  const cleaned = stripCodeFences(raw);

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch (err) {
    throw new Error(`AI returned invalid JSON: ${(err as Error).message}`);
  }

  const result = QuestionPaperSchema.safeParse(parsed);
  if (!result.success) {
    throw new Error(`AI response failed schema validation: ${result.error.message}`);
  }

  return fillMissingDiagrams(result.data as GeneratedQuestionPaper);
}
