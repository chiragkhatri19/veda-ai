import axios from 'axios';
import type { Assignment, CreateAssignmentInput } from '@veda/shared';

export interface CreateAssignmentResponse {
  message: string;
  assignmentId: string;
  status: string;
  links: { status: string; websocket: string };
}

export interface PaginatedAssignments {
  data: Assignment[];
  total: number;
  page: number;
  totalPages: number;
}

const http = axios.create({
  baseURL: '',
  headers: { 'Content-Type': 'application/json' },
});

http.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error) && error.response?.data?.message) {
      throw new Error(error.response.data.message as string);
    }
    throw error;
  },
);

export const api = {
  assignments: {
    list: (page = 1, limit = 12) =>
      http.get<PaginatedAssignments>('/api/assignments', { params: { page, limit } }).then((r) => r.data),
    get: (id: string) => http.get<Assignment>(`/api/assignments/${id}`).then((r) => r.data),
    create: (data: CreateAssignmentInput) =>
      http.post<CreateAssignmentResponse>('/api/assignments', data).then((r) => r.data),
    delete: (id: string) => http.delete(`/api/assignments/${id}`),
    regenerate: (id: string) =>
      http.post<Assignment>(`/api/assignments/${id}/regenerate`).then((r) => r.data),
    downloadPdf: (id: string) =>
      http.get<Blob>(`/api/assignments/${id}/pdf`, { responseType: 'blob' }).then((r) => r.data),
  },
  toolkit: {
    generateRubric: (data: object) =>
      http.post<{ jobId: string; status: string }>('/api/toolkit/rubric', data).then((r) => r.data),
    getRubricStatus: (jobId: string) =>
      http.get<{ status: string; result?: object; error?: string }>(`/api/toolkit/rubric/status/${jobId}`).then((r) => r.data),
  },
};
