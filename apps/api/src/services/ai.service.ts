import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import type { Schema } from '@google/generative-ai';
import { env } from '../config/env.js';
import { buildGenerationPrompt } from '../utils/promptBuilder.js';
import type { IAssignment } from '../models/assignment.model.js';

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);

const questionSchema: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    id: { type: SchemaType.STRING, description: 'Unique identifier for the question' },
    questionNumber: { type: SchemaType.INTEGER, description: '1-based sequential index' },
    text: { type: SchemaType.STRING, description: 'The question text' },
    type: { type: SchemaType.STRING, description: 'E.g., MCQ, Short Answer, True/False, Essay' },
    difficulty: { type: SchemaType.STRING, enum: ['easy', 'moderate', 'hard'] },
    marks: { type: SchemaType.INTEGER, description: 'Marks assigned to this question' },
    answer: { type: SchemaType.STRING, description: 'Correct answer or marking guide' },
    hint: { type: SchemaType.STRING, description: 'Optional student hint; empty string if none' },
  },
  required: ['id', 'questionNumber', 'text', 'type', 'difficulty', 'marks', 'answer'],
};

const sectionSchema: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    id: { type: SchemaType.STRING },
    label: { type: SchemaType.STRING, description: 'E.g., A, B, C' },
    title: { type: SchemaType.STRING, description: 'E.g., Multiple Choice Questions' },
    instruction: { type: SchemaType.STRING },
    totalMarks: { type: SchemaType.INTEGER },
    questions: { type: SchemaType.ARRAY, items: questionSchema },
  },
  required: ['id', 'label', 'title', 'instruction', 'totalMarks', 'questions'],
};

const questionPaperSchema: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    schoolName: { type: SchemaType.STRING },
    subject: { type: SchemaType.STRING },
    grade: { type: SchemaType.STRING },
    timeAllowed: { type: SchemaType.STRING, description: 'E.g., 2 Hours' },
    maximumMarks: { type: SchemaType.INTEGER },
    totalQuestions: { type: SchemaType.INTEGER },
    generatedAt: { type: SchemaType.STRING, description: 'ISO 8601 timestamp' },
    sections: { type: SchemaType.ARRAY, items: sectionSchema },
  },
  required: ['schoolName', 'subject', 'grade', 'timeAllowed', 'maximumMarks', 'totalQuestions', 'generatedAt', 'sections'],
};

const model = genAI.getGenerativeModel({
  model: 'gemini-2.5-flash',
  generationConfig: {
    responseMimeType: 'application/json',
    responseSchema: questionPaperSchema,
  },
});

export const aiService = {
  async generateQuestionPaper(assignment: IAssignment): Promise<string> {
    const prompt = buildGenerationPrompt({
      title: assignment.title,
      subject: assignment.subject,
      grade: assignment.grade,
      dueDate: assignment.dueDate,
      schoolName: assignment.schoolName,
      questionTypes: assignment.questionTypes,
      additionalInstructions: assignment.additionalInstructions,
      uploadedFileText: assignment.uploadedFileText,
    });

    try {
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      if (!text || !text.trim()) {
        throw new Error('AI returned an empty response. The model may have been blocked or failed silently.');
      }
      return text;
    } catch (err) {
      const message = (err as Error).message ?? '';
      if (
        message.includes('429') ||
        message.toUpperCase().includes('RESOURCE_EXHAUSTED') ||
        message.toLowerCase().includes('quota')
      ) {
        throw new Error('GEMINI_RATE_LIMIT: Model execution quota exhausted. Retrying via queue backoff.');
      }
      if (
        message.toUpperCase().includes('SAFETY') ||
        message.toLowerCase().includes('blocked') ||
        message.toLowerCase().includes('recitation')
      ) {
        throw new Error('GEMINI_SAFETY_BLOCK: Prompt was flagged by safety filters. Please revise the topic or instructions.');
      }
      throw new Error(`AI generation failed: ${message}`);
    }
  },
};
