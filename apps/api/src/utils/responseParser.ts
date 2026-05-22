import { z } from 'zod';
import type { GeneratedQuestionPaper } from '@veda/shared';

const QuestionSchema = z.object({
  id: z.string(),
  questionNumber: z.number(),
  text: z.string(),
  type: z.string(),
  difficulty: z.enum(['easy', 'moderate', 'hard']),
  marks: z.number(),
  answer: z.string().nullish().transform((v) => v ?? null),
  hint: z.string().nullish().transform((v) => v ?? null),
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

export function parseAndValidateLLMResponse(raw: string): GeneratedQuestionPaper {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    throw new Error(`AI returned invalid JSON: ${(err as Error).message}`);
  }

  const result = QuestionPaperSchema.safeParse(parsed);
  if (!result.success) {
    throw new Error(`AI response failed schema validation: ${result.error.message}`);
  }

  return result.data as GeneratedQuestionPaper;
}
