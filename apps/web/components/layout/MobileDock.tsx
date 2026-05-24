'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutGrid, FileText, Library, Sparkles } from 'lucide-react';

const NAV_ITEMS = [
  { href: '/dashboard',   label: 'Home',       icon: LayoutGrid },
  { href: '/assignments', label: 'Assignments', icon: FileText   },
  { href: '/library',     label: 'Library',     icon: Library    },
  { href: '/toolkit',     label: 'AI Toolkit',  icon: Sparkles   },
];

function isActive(pathname: string, href: string) {
  if (href === '/dashboard') return pathname === '/dashboard' || pathname === '/';
  if (href === '/assignments') return pathname.startsWith('/assignments');
  return pathname.startsWith(href);
}

interface Props {
  sidebarOpen?: boolean;
}

export default function MobileDock({ sidebarOpen }: Props) {
  const pathname = usePathname();

  return (
    <div
      className={`md:hidden fixed bottom-4 left-4 right-4 z-50 no-print transition-[opacity,transform] duration-200 ${
        sidebarOpen ? 'opacity-0 pointer-events-none translate-y-2' : 'opacity-100 translate-y-0'
      }`}
    >
      <nav className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-zinc-200/70 dark:border-zinc-700/50 rounded-[22px] flex items-center px-1.5 py-1.5 shadow-[0_4px_12px_rgba(0,0,0,0.08),0_12px_32px_rgba(0,0,0,0.12),0_24px_64px_rgba(0,0,0,0.10)] dark:shadow-[0_4px_12px_rgba(0,0,0,0.30),0_12px_32px_rgba(0,0,0,0.40),0_24px_64px_rgba(0,0,0,0.35)]">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = isActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              className="flex-1 flex flex-col items-center active:scale-95 transition-transform duration-100"
            >
              <div
                className={`w-full flex flex-col items-center gap-[4px] py-2.5 px-1 rounded-[16px] transition-colors duration-150 ${
                  active
                    ? 'bg-brand-orange/10 dark:bg-brand-orange/15'
                    : ''
                }`}
              >
                <Icon
                  className={`w-[19px] h-[19px] transition-colors duration-150 ${
                    active ? 'text-brand-orange' : 'text-zinc-400 dark:text-zinc-500'
                  }`}
                  strokeWidth={active ? 2.5 : 1.8}
                />
                <span
                  className={`text-[10px] leading-none font-medium transition-colors duration-150 ${
                    active ? 'text-brand-orange' : 'text-zinc-400 dark:text-zinc-500'
                  }`}
                >
                  {label}
                </span>
              </div>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
