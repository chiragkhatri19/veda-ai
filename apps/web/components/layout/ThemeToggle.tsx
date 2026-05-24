'use client';

import { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/store/themeStore';

export default function ThemeToggle() {
  const { theme, toggle, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Sync theme store from DOM — the inline script in layout.tsx may have
    // already applied 'dark' before React hydrated.
    if (document.documentElement.classList.contains('dark')) setTheme('dark');
  }, [setTheme]);

  return (
    <button
      onClick={toggle}
      className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-app-surface-2 active:scale-90 transition-[background-color,color,transform] duration-100 text-app-text-muted hover:text-app-text-primary"
      aria-label={!mounted ? 'Toggle theme' : (theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode')}
      title={!mounted ? 'Toggle theme' : (theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode')}
    >
      {mounted && (theme === 'dark'
        ? <Sun  className="w-[16px] h-[16px]" />
        : <Moon className="w-[16px] h-[16px]" />
      )}
    </button>
  );
}
