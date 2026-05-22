import { describe, it, expect } from 'vitest';
import { buildGenerationPrompt } from './promptBuilder.js';

const BASE_INPUT = {
  title: 'Mid-Term Exam',
  subject: 'Mathematics',
  grade: '8',
  dueDate: '2026-06-01',
  questionTypes: [
    { type: 'multiple_choice', count: 4, marksPerQuestion: 1 },
    { type: 'short_answer', count: 3, marksPerQuestion: 2 },
  ],
};

describe('buildGenerationPrompt', () => {
  it('calculates total marks correctly', () => {
    const prompt = buildGenerationPrompt(BASE_INPUT);
    // 4×1 + 3×2 = 10
    expect(prompt).toContain('Total Marks: 10');
  });

  it('calculates total questions correctly', () => {
    const prompt = buildGenerationPrompt(BASE_INPUT);
    expect(prompt).toContain('Total Questions: 7');
  });

  it('assigns section labels A and B for two question types', () => {
    const prompt = buildGenerationPrompt(BASE_INPUT);
    expect(prompt).toContain('Section A');
    expect(prompt).toContain('Section B');
  });

  it('omits REFERENCE MATERIAL when uploadedFileText is absent', () => {
    const prompt = buildGenerationPrompt(BASE_INPUT);
    expect(prompt).not.toContain('REFERENCE MATERIAL');
  });

  it('includes REFERENCE MATERIAL when uploadedFileText is provided', () => {
    const prompt = buildGenerationPrompt({ ...BASE_INPUT, uploadedFileText: 'Chapter 3 notes' });
    expect(prompt).toContain('REFERENCE MATERIAL');
    expect(prompt).toContain('Chapter 3 notes');
  });

  it('truncates reference material to 3000 characters', () => {
    const longText = 'x'.repeat(5000);
    const prompt = buildGenerationPrompt({ ...BASE_INPUT, uploadedFileText: longText });
    // The truncated portion appears; the full 5000-char string does not
    expect(prompt).not.toContain('x'.repeat(3001));
  });

  it('includes additional instructions when provided', () => {
    const prompt = buildGenerationPrompt({
      ...BASE_INPUT,
      additionalInstructions: 'Focus on algebra topics',
    });
    expect(prompt).toContain('ADDITIONAL INSTRUCTIONS');
    expect(prompt).toContain('Focus on algebra topics');
  });

  it('embeds subject and grade in the prompt', () => {
    const prompt = buildGenerationPrompt(BASE_INPUT);
    expect(prompt).toContain('Mathematics');
    expect(prompt).toContain('Grade/Class: 8');
  });

  it('ends with the required JSON-start instruction', () => {
    const prompt = buildGenerationPrompt(BASE_INPUT);
    expect(prompt.trimEnd()).toMatch(/Start your response with `\{`\.$/);
  });
});
