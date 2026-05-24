'use client';

import { create } from 'zustand';

type Theme = 'light' | 'dark';

interface ThemeStore {
  theme: Theme;
  toggle: () => void;
  setTheme: (t: Theme) => void;
}

function getInitialTheme(): Theme {
  // Always start as 'light' to match SSR. ThemeToggle syncs from DOM after mount.
  return 'light';
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.add('theme-transition');
  if (theme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
  localStorage.setItem('vedaai-theme', theme);
  setTimeout(() => root.classList.remove('theme-transition'), 250);
}

export const useTheme = create<ThemeStore>((set) => ({
  theme: getInitialTheme(),
  toggle: () =>
    set((state) => {
      const next = state.theme === 'light' ? 'dark' : 'light';
      applyTheme(next);
      return { theme: next };
    }),
  setTheme: (theme) => {
    applyTheme(theme);
    set({ theme });
  },
}));
