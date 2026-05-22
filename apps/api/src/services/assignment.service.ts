import { Assignment } from '../models/assignment.model.js';
import type { CreateAssignmentInput, Assignment as AssignmentType } from '@veda/shared';

export interface PaginatedResult {
  data: AssignmentType[];
  total: number;
  page: number;
  totalPages: number;
}

function toApiShape(doc: unknown): AssignmentType {
  return doc as AssignmentType;
}

export const assignmentService = {
  async findAllPaginated(page: number, limit: number): Promise<PaginatedResult> {
    const skip = (page - 1) * limit;
    const [docs, total] = await Promise.all([
      Assignment.find().sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
      Assignment.countDocuments().exec(),
    ]);
    return {
      data: docs.map((d) => toApiShape(d.toJSON())),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  },

  async findById(id: string): Promise<AssignmentType | null> {
    const doc = await Assignment.findById(id).exec();
    return doc ? toApiShape(doc.toJSON() as Record<string, unknown>) : null;
  },

  async create(data: CreateAssignmentInput): Promise<AssignmentType> {
    const doc = await Assignment.create({
      title: data.title,
      subject: data.subject,
      grade: data.grade,
      dueDate: data.dueDate,
      schoolName: data.schoolName ?? null,
      groupId: data.groupId ?? null,
      questionTypes: data.questionTypes,
      additionalInstructions: data.additionalInstructions ?? null,
      uploadedFileText: data.uploadedFileText ?? null,
      jobStatus: 'queued',
    });
    return toApiShape(doc.toJSON() as Record<string, unknown>);
  },

  async deleteById(id: string): Promise<boolean> {
    const result = await Assignment.findByIdAndDelete(id).exec();
    return result !== null;
  },

  async resetForRegeneration(id: string): Promise<AssignmentType | null> {
    const doc = await Assignment.findByIdAndUpdate(
      id,
      { jobStatus: 'queued', questionPaper: null },
      { new: true },
    ).exec();
    return doc ? toApiShape(doc.toJSON() as Record<string, unknown>) : null;
  },
};
