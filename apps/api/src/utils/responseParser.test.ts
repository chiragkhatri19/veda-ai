import { describe, it, expect } from 'vitest';
import { parseAndValidateLLMResponse } from './responseParser.js';

const VALID_PAPER = {
  schoolName: 'Delhi Public School',
  subject: 'Mathematics',
  grade: '8',
  timeAllowed: '1 hour 30 minutes',
  maximumMarks: 10,
  totalQuestions: 2,
  generatedAt: '2024-01-01T00:00:00.000Z',
  sections: [
    {
      id: 'sec-a',
      label: 'A',
      title: 'Short Answer',
      instruction: 'Attempt all questions.',
      totalMarks: 10,
      questions: [
        {
          id: 'q1',
          questionNumber: 1,
          text: 'What is 2 + 2?',
          type: 'short_answer',
          difficulty: 'easy',
          marks: 5,
          answer: '4',
          hint: null,
        },
        {
          id: 'q2',
          questionNumber: 2,
          text: 'Solve: 3x = 9',
          type: 'short_answer',
          difficulty: 'moderate',
          marks: 5,
          answer: 'x = 3',
          hint: 'Divide both sides by 3',
        },
      ],
    },
  ],
};

describe('parseAndValidateLLMResponse', () => {
  it('parses a valid JSON string into a GeneratedQuestionPaper', () => {
    const result = parseAndValidateLLMResponse(JSON.stringify(VALID_PAPER));
    expect(result.subject).toBe('Mathematics');
    expect(result.sections).toHaveLength(1);
    expect(result.sections[0].questions).toHaveLength(2);
  });

  it('strips markdown JSON code fences before parsing', () => {
    const fenced = '```json\n' + JSON.stringify(VALID_PAPER) + '\n```';
    const result = parseAndValidateLLMResponse(fenced);
    expect(result.maximumMarks).toBe(10);
  });

  it('handles plain code fences without the json language tag', () => {
    const fenced = '```\n' + JSON.stringify(VALID_PAPER) + '\n```';
    const result = parseAndValidateLLMResponse(fenced);
    expect(result.totalQuestions).toBe(2);
  });

  it('throws a descriptive error on malformed JSON', () => {
    expect(() => parseAndValidateLLMResponse('{not valid json')).toThrow('AI returned invalid JSON');
  });

  it('throws when required top-level fields are missing', () => {
    const broken = { ...VALID_PAPER, schoolName: undefined };
    expect(() => parseAndValidateLLMResponse(JSON.stringify(broken))).toThrow('schema validation');
  });

  it('throws when a question has an invalid difficulty value', () => {
    const bad = {
      ...VALID_PAPER,
      sections: [
        {
          ...VALID_PAPER.sections[0],
          questions: [
            { ...VALID_PAPER.sections[0].questions[0], difficulty: 'very_hard' },
          ],
        },
      ],
    };
    expect(() => parseAndValidateLLMResponse(JSON.stringify(bad))).toThrow();
  });

  it('coerces null hint values through the transform', () => {
    const result = parseAndValidateLLMResponse(JSON.stringify(VALID_PAPER));
    expect(result.sections[0].questions[0].hint).toBeNull();
  });

  it('accepts all three valid difficulty values', () => {
    for (const difficulty of ['easy', 'moderate', 'hard'] as const) {
      const paper = {
        ...VALID_PAPER,
        sections: [
          {
            ...VALID_PAPER.sections[0],
            questions: [{ ...VALID_PAPER.sections[0].questions[0], difficulty }],
          },
        ],
      };
      expect(() => parseAndValidateLLMResponse(JSON.stringify(paper))).not.toThrow();
    }
  });

  it('normalises "Medium" (Gemini capitalisation) to "moderate"', () => {
    const paper = {
      ...VALID_PAPER,
      sections: [{ ...VALID_PAPER.sections[0], questions: [{ ...VALID_PAPER.sections[0].questions[0], difficulty: 'Medium' }] }],
    };
    const result = parseAndValidateLLMResponse(JSON.stringify(paper));
    expect(result.sections[0].questions[0].difficulty).toBe('moderate');
  });

  it('normalises "Hard" (Gemini capitalisation) to "hard"', () => {
    const paper = {
      ...VALID_PAPER,
      sections: [{ ...VALID_PAPER.sections[0], questions: [{ ...VALID_PAPER.sections[0].questions[0], difficulty: 'Hard' }] }],
    };
    const result = parseAndValidateLLMResponse(JSON.stringify(paper));
    expect(result.sections[0].questions[0].difficulty).toBe('hard');
  });
});
