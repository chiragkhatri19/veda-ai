import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './hooks/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
    './store/**/*.{ts,tsx}',
  ],
  safelist: ['duration-250', 'translate-x-0', '-translate-x-full'],
  theme: {
    extend: {
      colors: {
        brand: {
          orange: 'rgb(var(--c-orange) / <alpha-value>)',
          dark: 'rgb(var(--c-brand-dark) / <alpha-value>)',
          surface: '#F5F5F5',
        },
        app: {
          bg:             'rgb(var(--c-bg)      / <alpha-value>)',
          surface:        'rgb(var(--c-surface)  / <alpha-value>)',
          'surface-2':    'rgb(var(--c-surface2) / <alpha-value>)',
          border:         'rgb(var(--c-border)   / <alpha-value>)',
          'text-primary': 'rgb(var(--c-text1)    / <alpha-value>)',
          'text-secondary':'rgb(var(--c-text2)   / <alpha-value>)',
          'text-muted':   'rgb(var(--c-text3)    / <alpha-value>)',
        },
      },
      fontFamily: {
        sans:  ['var(--font-sans)', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        mono:  ['var(--font-mono)', 'ui-monospace', 'SFMono-Regular', 'monospace'],
        serif: ['var(--font-serif)', 'Georgia', 'serif'],
      },
      boxShadow: {
        /* Multi-layer, no border rings — pure shadow depth */
        card:        '0px 4px 18px rgba(16,24,40,0.03), 0px 1px 3px rgba(16,24,40,0.06)',
        'card-hover':'0px 8px 32px rgba(16,24,40,0.07), 0px 2px 8px rgba(16,24,40,0.10)',
        dropdown:    '0 4px 6px rgba(16,24,40,0.04), 0 10px 28px rgba(16,24,40,0.10), 0 24px 48px -8px rgba(16,24,40,0.06)',
        sidebar:     '0 2px 6px rgba(0,0,0,0.08), 0 8px 32px rgba(0,0,0,0.14), 0 32px 80px -8px rgba(0,0,0,0.20)',
        topbar:      '0 2px 4px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.08), 0 16px 40px -8px rgba(0,0,0,0.06)',
      },
      animation: {
        shimmer:     'shimmer 1.5s ease-in-out infinite',
        'spin-slow': 'spin 2s linear infinite',
        'fade-in':   'fadeIn 0.2s ease-out',
        'slide-up':  'slideUp 0.3s ease-out',
        float:       'float 3.5s ease-in-out infinite',
        'ping-ring': 'pingRing 2.6s cubic-bezier(0,0,0.2,1) infinite',
        orbit:       'orbit 5s linear infinite',
      },
      keyframes: {
        shimmer: {
          '0%':   { backgroundPosition: '-400px 0' },
          '100%': { backgroundPosition: '400px 0' },
        },
        fadeIn: {
          '0%':   { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-8px)' },
        },
        pingRing: {
          '0%':       { transform: 'scale(1)',   opacity: '0.55' },
          '80%, 100%':{ transform: 'scale(1.5)', opacity: '0' },
        },
        orbit: {
          from: { transform: 'rotate(0deg)' },
          to:   { transform: 'rotate(360deg)' },
        },
      },
      transitionDuration: { '250': '250ms' },
    },
  },
  plugins: [],
};

export default config;
