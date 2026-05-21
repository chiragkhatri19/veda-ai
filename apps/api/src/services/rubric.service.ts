import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import type { Schema } from '@google/generative-ai';
import { env } from '../config/env.js';

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);

const rubricCriterionSchema: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    criterion: { type: SchemaType.STRING, description: 'Name of the assessment criterion' },
    maxMarks: { type: SchemaType.INTEGER, description: 'Maximum marks for this criterion' },
    excellent: { type: SchemaType.STRING, description: 'Descriptor for excellent performance' },
    good: { type: SchemaType.STRING, description: 'Descriptor for good performance' },
    satisfactory: { type: SchemaType.STRING, description: 'Descriptor for satisfactory performance' },
    needsWork: { type: SchemaType.STRING, description: 'Descriptor for below-standard performance' },
  },
  required: ['criterion', 'maxMarks', 'excellent', 'good', 'satisfactory', 'needsWork'],
};

const rubricSchema: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    topic: { type: SchemaType.STRING },
    subject: { type: SchemaType.STRING },
    grade: { type: SchemaType.STRING },
    assessmentType: { type: SchemaType.STRING },
    totalMarks: { type: SchemaType.INTEGER },
    generatedAt: { type: SchemaType.STRING, description: 'ISO 8601 timestamp' },
    criteria: { type: SchemaType.ARRAY, items: rubricCriterionSchema },
  },
  required: ['topic', 'subject', 'grade', 'assessmentType', 'totalMarks', 'generatedAt', 'criteria'],
};

const model = genAI.getGenerativeModel({
  model: 'gemini-2.5-flash',
  generationConfig: {
    responseMimeType: 'application/json',
    responseSchema: rubricSchema,
  },
});

export interface RubricCriterion {
  criterion: string;
  maxMarks: number;
  excellent: string;
  good: string;
  satisfactory: string;
  needsWork: string;
}

export interface GeneratedRubric {
  topic: string;
  subject: string;
  grade: string;
  assessmentType: string;
  totalMarks: number;
  generatedAt: string;
  criteria: RubricCriterion[];
}

export interface RubricInput {
  topic: string;
  subject: string;
  grade: string;
  assessmentType: string;
  totalMarks: number;
  numCriteria: number;
}

function buildRubricPrompt(input: RubricInput): string {
  return `You are an expert Indian school assessment designer (CBSE/ICSE).

Create a detailed marking rubric for the following assessment:
- Topic: ${input.topic}
- Subject: ${input.subject}
- Grade/Class: ${input.grade}
- Assessment Type: ${input.assessmentType}
- Total Marks: ${input.totalMarks}
- Number of Criteria: ${input.numCriteria}

Distribute the total marks evenly across exactly ${input.numCriteria} criteria. Each criterion must have four performance level descriptors (excellent, good, satisfactory, needsWork). Set generatedAt to the current ISO 8601 timestamp.`;
}

export const rubricService = {
  async generate(input: RubricInput): Promise<GeneratedRubric> {
    const prompt = buildRubricPrompt(input);

    let raw: string;
    try {
      const result = await model.generateContent(prompt);
      raw = result.response.text();
      if (!raw || !raw.trim()) {
        throw new Error('AI returned an empty response. The model may have been blocked or failed silently.');
      }
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

    let parsed: GeneratedRubric;
    try {
      parsed = JSON.parse(raw) as GeneratedRubric;
    } catch (err) {
      throw new Error(`AI returned invalid JSON: ${(err as Error).message}`);
    }

    // LLM cannot know the real current time; overwrite with server timestamp
    parsed.generatedAt = new Date().toISOString();

    return parsed;
  },
};
