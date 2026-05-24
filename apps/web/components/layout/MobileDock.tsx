'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, BookOpen, Monitor, Library } from 'lucide-react';

const NAV_ITEMS = [
  { href: '/dashboard',   label: 'Home',       icon: LayoutDashboard },
  { href: '/groups',      label: 'My Groups',  icon: Users           },
  { href: '/assignments', label: 'Assignments', icon: BookOpen        },
  { href: '/toolkit',     label: 'AI Teacher', icon: Monitor         },
  { href: '/library',     label: 'Library',    icon: Library         },
];

function isActive(pathname: string, href: string) {
  if (href === '/dashboard') return pathname === '/dashboard' || pathname === '/';
  if (href === '/assignments') return pathname.startsWith('/assignments');
  return pathname.startsWith(href);
}

export default function MobileDock() {
  const pathname = usePathname();

  return (
    <div className="md:hidden fixed bottom-5 left-4 right-4 z-50 no-print">
      <nav className="
        bg-[#0a0a0a] dark:bg-white
        rounded-[22px]
        flex items-stretch
        overflow-hidden
        shadow-[0_2px_4px_rgba(0,0,0,0.30),0_8px_20px_rgba(0,0,0,0.36),0_20px_50px_rgba(0,0,0,0.32),0_40px_90px_rgba(0,0,0,0.26)]
        dark:shadow-[0_0_0_1px_rgba(0,0,0,0.07),0_4px_12px_rgba(0,0,0,0.12),0_16px_48px_rgba(0,0,0,0.16),0_36px_88px_rgba(0,0,0,0.12)]
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
                  ? 'text-brand-orange bg-white/[0.10] dark:bg-orange-500/[0.10]'
                  : 'text-zinc-500 dark:text-zinc-500 hover:text-zinc-300 dark:hover:text-zinc-700'
                }
              `}
            >
              <Icon className="w-[21px] h-[21px]" strokeWidth={active ? 2.5 : 1.8} />
              <span className={`text-[9.5px] leading-none tracking-wide uppercase ${active ? 'font-bold' : 'font-medium'}`}>
                {label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
