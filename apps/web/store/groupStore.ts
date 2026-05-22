import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface Group {
  id: string;
  name: string;
  subject: string;
  grade: string;
  studentCount: number;
  color: string;
  createdAt: string;
}

const PALETTE = [
  '#F97316', '#3B82F6', '#10B981', '#8B5CF6',
  '#EF4444', '#F59E0B', '#06B6D4', '#EC4899',
];

interface GroupStore {
  groups: Group[];
  addGroup: (group: Omit<Group, 'id' | 'createdAt' | 'color'>) => void;
  updateGroup: (id: string, updates: Partial<Group>) => void;
  deleteGroup: (id: string) => void;
}

export const useGroupStore = create<GroupStore>()(
  persist(
    (set, get) => ({
      groups: [],

      addGroup: (group) => {
        const idx = get().groups.length % PALETTE.length;
        set((state) => ({
          groups: [
            ...state.groups,
            {
              ...group,
              id: crypto.randomUUID(),
              color: PALETTE[idx],
              createdAt: new Date().toISOString(),
            },
          ],
        }));
      },

      updateGroup: (id, updates) =>
        set((state) => ({
          groups: state.groups.map((g) => (g.id === id ? { ...g, ...updates } : g)),
        })),

      deleteGroup: (id) =>
        set((state) => ({ groups: state.groups.filter((g) => g.id !== id) })),
    }),
    {
      name: 'veda-groups',
      storage: createJSONStorage(() => {
        if (typeof window === 'undefined') {
          return { getItem: () => null, setItem: () => {}, removeItem: () => {} };
        }
        return localStorage;
      }),
    },
  ),
);
