import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { persist } from 'zustand/middleware';

export type NotificationType = 'assignment_ready' | 'assignment_failed' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  href?: string;
  read: boolean;
  createdAt: string;
}

interface NotificationState {
  notifications: Notification[];
}

interface NotificationActions {
  addNotification: (n: Omit<Notification, 'read'>) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  dismiss: (id: string) => void;
  clearAll: () => void;
  /** Called by useAssignments to sync completed/failed assignments as notifications. */
  syncFromAssignments: (
    assignments: Array<{ id: string; title: string; jobStatus: string; updatedAt?: string; createdAt: string }>,
  ) => void;
}

export const useNotificationStore = create<NotificationState & NotificationActions>()(
  persist(
    immer((set, get) => ({
      notifications: [],

      addNotification: (n) =>
        set((state) => {
          const exists = state.notifications.some((x) => x.id === n.id);
          if (!exists) {
            state.notifications.unshift({ ...n, read: false });
            // Cap at 50
            if (state.notifications.length > 50) {
              state.notifications.length = 50;
            }
          }
        }),

      markRead: (id) =>
        set((state) => {
          const n = state.notifications.find((x) => x.id === id);
          if (n) n.read = true;
        }),

      markAllRead: () =>
        set((state) => {
          state.notifications.forEach((n) => { n.read = true; });
        }),

      dismiss: (id) =>
        set((state) => {
          const idx = state.notifications.findIndex((x) => x.id === id);
          if (idx !== -1) state.notifications.splice(idx, 1);
        }),

      clearAll: () =>
        set((state) => {
          state.notifications = [];
        }),

      syncFromAssignments: (assignments) => {
        const { notifications, addNotification } = get();
        const seen = new Set(notifications.map((n) => n.id));

        for (const a of assignments) {
          if (a.jobStatus === 'completed') {
            const id = `assignment_ready_${a.id}`;
            if (!seen.has(id)) {
              addNotification({
                id,
                type: 'assignment_ready',
                title: 'Paper ready',
                body: `"${a.title}" has finished generating.`,
                href: `/assignments/${a.id}`,
                createdAt: a.updatedAt ?? a.createdAt,
              });
            }
          } else if (a.jobStatus === 'failed') {
            const id = `assignment_failed_${a.id}`;
            if (!seen.has(id)) {
              addNotification({
                id,
                type: 'assignment_failed',
                title: 'Generation failed',
                body: `"${a.title}" could not be generated.`,
                href: `/assignments/${a.id}`,
                createdAt: a.updatedAt ?? a.createdAt,
              });
            }
          }
        }
      },
    })),
    {
      name: 'vedaai-notifications',
      skipHydration: true,
      partialize: (state) => ({ notifications: state.notifications }),
    },
  ),
);

export function useUnreadCount() {
  return useNotificationStore((s) => s.notifications.filter((n) => !n.read).length);
}
