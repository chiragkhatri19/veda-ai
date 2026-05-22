import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { Assignment, CreateAssignmentInput } from '@veda/shared';

interface AssignmentState {
  assignments: Assignment[];
  currentAssignment: Assignment | null;
  createFormData: Partial<CreateAssignmentInput>;
  activeStep: number;
  isLoading: boolean;
  error: string | null;
  lastFetchedAt: number | null;
}

interface AssignmentActions {
  setAssignments: (assignments: Assignment[]) => void;
  setCurrentAssignment: (assignment: Assignment | null) => void;
  updateAssignment: (assignment: Assignment) => void;
  setCreateFormData: (data: Partial<CreateAssignmentInput>) => void;
  setActiveStep: (step: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setLastFetchedAt: (ts: number) => void;
  reset: () => void;
}

const initialState: AssignmentState = {
  assignments: [],
  currentAssignment: null,
  createFormData: {},
  activeStep: 1,
  isLoading: false,
  error: null,
  lastFetchedAt: null,
};

export const useAssignmentStore = create<AssignmentState & AssignmentActions>()(
  immer((set) => ({
    ...initialState,

    setAssignments: (assignments) =>
      set((state) => {
        state.assignments = assignments;
      }),

    setCurrentAssignment: (assignment) =>
      set((state) => {
        state.currentAssignment = assignment;
      }),

    updateAssignment: (assignment) =>
      set((state) => {
        const idx = state.assignments.findIndex((a) => a.id === assignment.id);
        if (idx !== -1) {
          state.assignments[idx] = assignment;
        }
        if (state.currentAssignment?.id === assignment.id) {
          state.currentAssignment = assignment;
        }
      }),

    setCreateFormData: (data) =>
      set((state) => {
        state.createFormData = { ...state.createFormData, ...data };
      }),

    setActiveStep: (step) =>
      set((state) => {
        state.activeStep = step;
      }),

    setLoading: (loading) =>
      set((state) => {
        state.isLoading = loading;
      }),

    setError: (error) =>
      set((state) => {
        state.error = error;
      }),

    setLastFetchedAt: (ts) =>
      set((state) => {
        state.lastFetchedAt = ts;
      }),

    reset: () => set(initialState),
  })),
);
