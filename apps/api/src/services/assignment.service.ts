import { Assignment } from '../models/assignment.model.js';
import type { CreateAssignmentInput, Assignment as AssignmentType } from '@veda/shared';

function toApiShape(doc: unknown): AssignmentType {
  return doc as AssignmentType;
}

export const assignmentService = {
  async findAll(): Promise<AssignmentType[]> {
    const docs = await Assignment.find().sort({ createdAt: -1 }).exec();
    return docs.map((d) => toApiShape(d.toJSON()));
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
