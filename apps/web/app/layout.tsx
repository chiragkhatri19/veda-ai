import type { Metadata } from 'next';
import { Inter, JetBrains_Mono, Lora } from 'next/font/google';
import { Toaster } from 'sonner';
import ShellLayout from '@/components/layout/ShellLayout';
import './globals.css';

const inter = Inter({ subsets: ['latin'], display: 'swap', variable: '--font-sans' });
const mono = JetBrains_Mono({ subsets: ['latin'], display: 'swap', variable: '--font-mono', weight: ['400', '500', '600', '700'] });
const serif = Lora({ subsets: ['latin'], display: 'swap', variable: '--font-serif', weight: ['400', '500', '600', '700'] });

export const metadata: Metadata = {
  title: 'VedaAI - Assessment Engine',
  description: 'AI-powered engine for generating print-ready, curriculum-aligned assessments at scale',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* FOUC prevention: dark is default; only opt out explicitly */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('vedaai-theme')||localStorage.getItem('caliber-theme')||localStorage.getItem('veda-theme');if(t==='dark')document.documentElement.classList.add('dark');}catch(e){}})()`,
          }}
        />
      </head>
      <body className={`${inter.className} ${mono.variable} ${serif.variable} bg-app-bg text-app-text-primary antialiased`}>
        <ShellLayout>{children}</ShellLayout>
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: { fontFamily: 'inherit', fontSize: '13px' },
          }}
        />
      </body>
    </html>
  );
}
