'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Users, BookOpen, Monitor, Library } from 'lucide-react';

const NAV_ITEMS = [
  { href: '/groups',      label: 'My Groups',  icon: Users    },
  { href: '/assignments', label: 'Assignments', icon: BookOpen },
  { href: '/toolkit',     label: 'AI Teacher', icon: Monitor  },
  { href: '/library',     label: 'Library',    icon: Library  },
];

function isActive(pathname: string, href: string) {
  if (href === '/assignments') return pathname.startsWith('/assignments');
  return pathname.startsWith(href);
}

export default function MobileDock() {
  const pathname = usePathname();

  return (
    <div className="md:hidden fixed bottom-5 left-4 right-4 z-50 no-print">
      {/*
       * Inverted surface: black in light mode, white in dark mode.
       * This gives the dock visual contrast against the app background in both themes.
       */}
      <nav className="
        bg-zinc-900 dark:bg-white
        rounded-[22px]
        flex items-stretch
        overflow-hidden
        shadow-[0_4px_10px_rgba(0,0,0,0.22),0_12px_36px_rgba(0,0,0,0.26),0_28px_72px_rgba(0,0,0,0.22)]
        dark:shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_4px_12px_rgba(0,0,0,0.10),0_16px_48px_rgba(0,0,0,0.14),0_32px_80px_rgba(0,0,0,0.10)]
      ">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = isActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              className={`
                flex flex-col items-center justify-center gap-[5px] flex-1 py-4
                transition-all duration-150 active:scale-95 active:opacity-60
                ${active
                  ? 'text-brand-orange bg-white/[0.08] dark:bg-orange-500/[0.10]'
                  : 'text-zinc-500 dark:text-zinc-500 hover:text-zinc-300 dark:hover:text-zinc-700'
                }
              `}
            >
              <Icon
                className="w-[22px] h-[22px]"
                strokeWidth={active ? 2.5 : 1.8}
              />
              <span className={`text-[10px] leading-none tracking-wide uppercase ${active ? 'font-bold' : 'font-medium'}`}>
                {label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
