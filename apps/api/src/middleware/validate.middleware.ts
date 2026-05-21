import { z } from 'zod';

export const QuestionTypeSchema = z.object({
  type: z.string().min(1),
  count: z.number().int().min(1),
  marksPerQuestion: z.number().int().min(1),
});

export const CreateAssignmentSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  subject: z.string().min(1, 'Subject is required'),
  grade: z.string().min(1, 'Grade is required'),
  dueDate: z.string().min(1, 'Due date is required'),
  schoolName: z.string().max(200).optional().nullable(),
  questionTypes: z
    .array(QuestionTypeSchema)
    .min(1, 'At least one question type is required')
    .max(6),
  additionalInstructions: z.string().max(1000).optional().nullable(),
  uploadedFileText: z.string().optional().nullable(),
});

export type CreateAssignmentInput = z.infer<typeof CreateAssignmentSchema>;
