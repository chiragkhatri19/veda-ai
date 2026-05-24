import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface UserProfile {
  name: string;
  email: string;
  school: string;
  city: string;
  subjectSpecialty: string;
  defaultGrade: string;
  avatarInitials: string;
}

interface UserStore extends UserProfile {
  updateProfile: (updates: Partial<UserProfile>) => void;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

const DEFAULT_PROFILE: UserProfile = {
  name: 'John Doe',
  email: 'teacher@dps.edu.in',
  school: 'Delhi Public School',
  city: 'Bokaro Steel City',
  subjectSpecialty: 'Science',
  defaultGrade: '8',
  avatarInitials: 'JD',
};

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      ...DEFAULT_PROFILE,
      updateProfile: (updates) =>
        set((state) => {
          const merged = { ...state, ...updates };
          merged.avatarInitials = getInitials(merged.name);
          return merged;
        }),
    }),
    {
      name: 'vedaai-user-profile',
      skipHydration: true,
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
