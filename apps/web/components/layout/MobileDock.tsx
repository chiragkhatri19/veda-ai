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

export default function MobileDock() {
  const pathname = usePathname();

  return (
    <div className="md:hidden fixed bottom-4 left-3 right-3 z-50 no-print">
      <nav
        className="
          bg-[#0a0a0a] dark:bg-white
          rounded-[26px]
          flex items-center
          px-2 py-2
          shadow-[0_2px_6px_rgba(0,0,0,0.35),0_8px_24px_rgba(0,0,0,0.40),0_22px_56px_rgba(0,0,0,0.36),0_44px_100px_rgba(0,0,0,0.30)]
          dark:shadow-[0_0_0_1px_rgba(0,0,0,0.08),0_4px_14px_rgba(0,0,0,0.12),0_18px_52px_rgba(0,0,0,0.16),0_40px_96px_rgba(0,0,0,0.12)]
        "
      >
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = isActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              className="flex-1 flex flex-col items-center active:opacity-60 transition-opacity duration-100"
            >
              {/* Active: white pill chip. Inactive: transparent */}
              <div
                className={`
                  w-full flex flex-col items-center gap-[5px] py-2.5 rounded-[18px]
                  transition-all duration-200
                  ${active
                    ? 'bg-white dark:bg-zinc-200 shadow-[0_1px_4px_rgba(0,0,0,0.10)]'
                    : 'bg-transparent'
                  }
                `}
              >
                <Icon
                  className={`w-[20px] h-[20px] ${
                    active ? 'text-zinc-900 dark:text-zinc-900' : 'text-zinc-500 dark:text-zinc-400'
                  }`}
                  strokeWidth={active ? 2.5 : 1.8}
                />
                <span
                  className={`text-[10px] leading-none ${
                    active
                      ? 'text-zinc-900 dark:text-zinc-900 font-semibold'
                      : 'text-zinc-500 dark:text-zinc-400 font-medium'
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
