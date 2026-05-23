import mongoose, { Schema } from 'mongoose';
import type { Document } from 'mongoose';
import type {
  QuestionTypeConfig,
  GeneratedQuestionPaper,
  JobStatus,
} from '@veda/shared';

export interface IAssignment extends Document {
  title: string;
  subject: string;
  grade: string;
  dueDate: string;
  schoolName: string | null;
  groupId: string | null;
  questionTypes: QuestionTypeConfig[];
  additionalInstructions: string | null;
  uploadedFileText: string | null;
  jobStatus: JobStatus;
  questionPaper: GeneratedQuestionPaper | null;
  createdAt: Date;
  updatedAt: Date;
}

const questionTypeSchema = new Schema(
  {
    type: { type: String, required: true },
    count: { type: Number, required: true },
    marksPerQuestion: { type: Number, required: true },
  },
  { _id: false },
);

const assignmentSchema = new Schema<IAssignment>(
  {
    title: { type: String, required: true },
    subject: { type: String, required: true },
    grade: { type: String, required: true },
    dueDate: { type: String, required: true },
    schoolName: { type: String, default: null },
    questionTypes: { type: [questionTypeSchema], required: true },
    groupId: { type: String, default: null },
    additionalInstructions: { type: String, default: null },
    uploadedFileText: { type: String, default: null },
    jobStatus: {
      type: String,
      enum: ['queued', 'processing', 'completed', 'failed'],
      default: 'queued',
    },
    questionPaper: { type: Schema.Types.Mixed, default: null },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret: Record<string, unknown>) => {
        ret.id = (ret._id as { toString(): string }).toString();
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        delete ret._id;
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        delete ret.__v;
        return ret;
      },
    },
  },
);

assignmentSchema.index({ createdAt: -1 });
assignmentSchema.index({ jobStatus: 1, createdAt: -1 });
assignmentSchema.index({ subject: 1, grade: 1, createdAt: -1 });

export const Assignment = mongoose.model<IAssignment>('Assignment', assignmentSchema);
