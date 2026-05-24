import type { Metadata } from 'next';
import { Bricolage_Grotesque, JetBrains_Mono, Lora } from 'next/font/google';
import { Toaster } from 'sonner';
import ShellLayout from '@/components/layout/ShellLayout';
import './globals.css';

const sans = Bricolage_Grotesque({ subsets: ['latin'], display: 'swap', variable: '--font-sans', weight: ['400', '500', '600', '700', '800'] });
const mono = JetBrains_Mono({ subsets: ['latin'], display: 'swap', variable: '--font-mono', weight: ['400', '500', '600', '700'] });
const serif = Lora({ subsets: ['latin'], display: 'swap', variable: '--font-serif', weight: ['400', '500', '600', '700'] });

export const metadata: Metadata = {
  title: 'VedaAI - Assessment Engine',
  description: 'AI-powered engine for generating print-ready, curriculum-aligned assessments at scale',
  icons: {
    icon: [
      { url: '/logo.png', sizes: '32x32', type: 'image/png' },
      { url: '/logo.png', sizes: '48x48', type: 'image/png' },
    ],
    shortcut: '/logo.png',
    apple: { url: '/logo.png', sizes: '180x180', type: 'image/png' },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/logo.png" sizes="32x32" type="image/png" />
        {/* FOUC prevention: dark is default; only opt out explicitly */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('vedaai-theme')||localStorage.getItem('caliber-theme')||localStorage.getItem('veda-theme');if(t==='dark')document.documentElement.classList.add('dark');}catch(e){}})()`,
          }}
        />
      </head>
      <body className={`${sans.variable} ${mono.variable} ${serif.variable} font-sans bg-app-bg text-app-text-primary antialiased`}>
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
