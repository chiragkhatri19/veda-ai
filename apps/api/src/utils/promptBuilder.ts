import type { QuestionTypeConfig } from '@veda/shared';

interface PromptInput {
  title: string;
  subject: string;
  grade: string;
  dueDate: string;
  schoolName?: string | null;
  questionTypes: QuestionTypeConfig[];
  additionalInstructions?: string | null;
  uploadedFileText?: string | null;
}

const QUESTION_TYPE_LABELS: Record<string, string> = {
  multiple_choice: 'Multiple Choice Questions',
  short_answer: 'Short Answer Questions',
  long_answer: 'Long Answer Questions',
  diagram_graph: 'Diagram/Graph Based Questions',
  numerical: 'Numerical Problems',
  true_false: 'True or False Questions',
};

const SECTION_LABELS = ['A', 'B', 'C', 'D', 'E', 'F'];

export function buildGenerationPrompt(input: PromptInput): string {
  const schoolName = input.schoolName?.trim() || 'School';
  const totalQuestions = input.questionTypes.reduce((sum, qt) => sum + qt.count, 0);
  const totalMarks = input.questionTypes.reduce(
    (sum, qt) => sum + qt.count * qt.marksPerQuestion,
    0,
  );

  const questionTypesDesc = input.questionTypes
    .map(
      (qt) =>
        `  - ${QUESTION_TYPE_LABELS[qt.type] ?? qt.type}: ${qt.count} questions x ${qt.marksPerQuestion} marks each`,
    )
    .join('\n');

  const sectionsDesc = input.questionTypes
    .map(
      (qt, i) =>
        `  Section ${SECTION_LABELS[i]}: ${QUESTION_TYPE_LABELS[qt.type] ?? qt.type} (${qt.count} questions, ${qt.marksPerQuestion} marks each)`,
    )
    .join('\n');

  const referenceSection = input.uploadedFileText
    ? `\n\nREFERENCE MATERIAL (use this content to generate relevant questions):\n${input.uploadedFileText.substring(0, 3000)}`
    : '';

  const additionalSection = input.additionalInstructions
    ? `\n\nADDITIONAL INSTRUCTIONS:\n${input.additionalInstructions}`
    : '';

  return `You are an expert academic question paper setter for Indian school curriculum (CBSE/ICSE).

ASSIGNMENT DETAILS:
- Title: ${input.title}
- Subject: ${input.subject}
- Grade/Class: ${input.grade}
- Total Questions: ${totalQuestions}
- Total Marks: ${totalMarks}

QUESTION TYPES REQUIRED:
${questionTypesDesc}

SECTIONS STRUCTURE:
${sectionsDesc}${additionalSection}${referenceSection}

DIFFICULTY DISTRIBUTION: Approximately 40% easy, 40% moderate, 20% hard questions.

RULES:
1. Return ONLY valid JSON. No markdown fences, no backticks, no preamble, no explanation.
2. The JSON must exactly match the schema below.
3. Generate real, curriculum-appropriate questions for ${input.subject}, Grade ${input.grade}.
4. Each question must have a complete, accurate answer in the "answer" field.
5. School name must be exactly "${schoolName}".
6. Time allowed should be appropriate for ${totalMarks} marks (roughly 1 minute per mark, rounded to nearest 15 min).
7. Question IDs must be unique strings like "q1", "q2", etc.
8. Section IDs must be unique like "sec-a", "sec-b", etc.
9. DIAGRAMS: For every question of type "diagram_graph", you MUST populate the "diagramDescription" field with a precise, detailed description of exactly what diagram, graph, chart, or figure should appear on the paper. Be specific — include axis labels, units, data ranges, key components to label, or structural parts to show. The question text must also reference the figure (e.g. "Study the diagram below and answer:" or "The graph below shows… Using it, answer:"). For all other question types, set "diagramDescription" to null.

REQUIRED JSON SCHEMA (return an object matching this exactly):
{
  "schoolName": "${schoolName}",
  "subject": "${input.subject}",
  "grade": "${input.grade}",
  "timeAllowed": "1 hour 30 minutes",
  "maximumMarks": ${totalMarks},
  "totalQuestions": ${totalQuestions},
  "generatedAt": "2024-01-01T00:00:00.000Z",
  "sections": [
    {
      "id": "sec-a",
      "label": "A",
      "title": "Short Answer Questions",
      "instruction": "Attempt all questions. Each question carries 2 marks.",
      "totalMarks": 10,
      "questions": [
        {
          "id": "q1",
          "questionNumber": 1,
          "text": "The actual question text goes here.",
          "type": "short_answer",
          "difficulty": "easy",
          "marks": 2,
          "answer": "The complete model answer goes here.",
          "hint": "Optional hint or null",
          "diagramDescription": null
        }
      ]
    }
  ]
}

Return ONLY the JSON object. No markdown fences. No explanation. No preamble. Start your response with \`{\`.`;
}
