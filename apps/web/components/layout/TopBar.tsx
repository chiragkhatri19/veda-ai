'use client';

import { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { ArrowLeft, Bell, ChevronDown, LayoutGrid, Menu } from 'lucide-react';
import Link from 'next/link';
import { useUserStore } from '@/store/userStore';
import { useUnreadCount } from '@/store/notificationStore';
import ThemeToggle from './ThemeToggle';
import NotificationPanel from './NotificationPanel';

const ROUTES: Record<string, { parent?: { label: string; href: string }; label: string }> = {
  '/dashboard':          { label: 'Dashboard' },
  '/assignments':        { label: 'Assignment' },
  '/assignments/create': { parent: { label: 'Assignment', href: '/assignments' }, label: 'Create Paper' },
  '/groups':             { label: 'My Groups' },
  '/toolkit':            { label: "AI Teacher's Toolkit" },
  '/toolkit/rubric':     { parent: { label: "AI Teacher's Toolkit", href: '/toolkit' }, label: 'Rubric Generator' },
  '/library':            { label: 'My Library' },
  '/settings':           { label: 'Settings' },
};

function resolveCrumb(pathname: string) {
  if (ROUTES[pathname]) return ROUTES[pathname];
  if (/^\/assignments\/[^/]+$/.test(pathname)) {
    return { parent: { label: 'Assignment', href: '/assignments' }, label: 'View Paper' };
  }
  if (/^\/groups\/[^/]+$/.test(pathname)) {
    return { parent: { label: 'My Groups', href: '/groups' }, label: 'Group Detail' };
  }
  return { label: 'VedaAI' };
}


interface Props {
  onMenuToggle?: () => void;
}

export default function TopBar({ onMenuToggle }: Props) {
  const pathname = usePathname();
  const { name, avatarInitials } = useUserStore();
  const { parent, label } = resolveCrumb(pathname);
  const unread = useUnreadCount();

  const [panelOpen, setPanelOpen] = useState(false);
  const bellRef = useRef<HTMLDivElement>(null);

  const closePanel = useCallback(() => setPanelOpen(false), []);

  const BellButton = (
    <div ref={bellRef} className="relative">
      <button
        onClick={() => setPanelOpen((p) => !p)}
        aria-label="Notifications"
        aria-expanded={panelOpen}
        className={`relative p-2 rounded-lg transition-[background-color,color,transform] duration-100 active:scale-90 ${
          panelOpen
            ? 'bg-app-surface-2 text-app-text-primary'
            : 'text-app-text-muted hover:bg-app-surface-2 hover:text-app-text-primary'
        }`}
      >
        <Bell strokeWidth={1.8} style={{ width: 18, height: 18 }} />
        {unread > 0 && (
          <span className="absolute top-1.5 right-1.5 min-w-[8px] h-2 flex items-center justify-center">
            {unread <= 9 ? (
              <span className="w-2 h-2 bg-brand-orange rounded-full border-[1.5px] border-app-surface block" />
            ) : (
              <span className="text-[9px] font-bold text-white bg-brand-orange rounded-full px-1 leading-none py-px border border-app-surface">
                {unread}
              </span>
            )}
          </span>
        )}
      </button>
      {panelOpen && <NotificationPanel onClose={closePanel} />}
    </div>
  );

  return (
    <div className="sticky top-3 z-30 no-print mx-3 shrink-0">
      <header className="h-16 flex items-center px-4 gap-3 bg-white dark:bg-app-surface rounded-2xl shadow-topbar dark:shadow-[0_2px_8px_rgba(0,0,0,0.22),0_8px_28px_rgba(0,0,0,0.34),0_16px_52px_rgba(0,0,0,0.26)]">

        {/* ── Mobile: back button or logo ─────────────────────────────────── */}
        <div className="md:hidden flex items-center gap-2 flex-1 min-w-0">
          {parent ? (
            <>
              <Link
                href={parent.href}
                className="p-1.5 rounded-lg text-app-text-muted hover:text-app-text-primary hover:bg-app-surface-2 active:scale-90 transition-[background-color,color,transform] duration-100 shrink-0"
                aria-label="Go back"
              >
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <span className="text-[14px] font-semibold text-app-text-primary truncate">{label}</span>
            </>
          ) : (
            <>
              <Image src="/logo.png" alt="VedaAI" width={28} height={28} className="rounded-[8px]" priority />
              <span className="text-[15px] font-bold text-app-text-primary tracking-tight">VedaAI</span>
            </>
          )}
        </div>

        {/* ── Desktop: breadcrumb ─────────────────────────────────────────── */}
        <div className="hidden md:flex items-center gap-1.5 flex-1 min-w-0">
          {parent && (
            <Link
              href={parent.href}
              className="p-1.5 rounded-lg text-app-text-muted hover:text-app-text-primary hover:bg-app-surface-2 active:scale-90 transition-[background-color,color,transform] duration-100 shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
          )}
          <LayoutGrid className="w-3.5 h-3.5 text-app-text-muted shrink-0" />
          {parent && (
            <>
              <Link
                href={parent.href}
                className="text-[13px] text-app-text-muted hover:text-app-text-primary transition-colors truncate"
              >
                {parent.label}
              </Link>
              <span className="text-[13px] text-app-text-muted shrink-0">/</span>
            </>
          )}
          <span className="text-[13px] font-semibold text-app-text-primary truncate">{label}</span>
        </div>

        {/* ── Right cluster ───────────────────────────────────────────────── */}
        <div className="flex items-center gap-1 shrink-0">

          <div className="hidden md:block">
            <ThemeToggle />
          </div>

          {BellButton}

          {/* Desktop: divider + full user pill */}
          <div className="hidden md:flex items-center gap-1">
            <div className="w-px h-5 bg-app-border mx-1 shrink-0" />
            <Link
              href="/settings"
              className="flex items-center gap-2 pl-1 pr-2.5 py-1.5 rounded-xl hover:bg-app-surface-2 active:scale-[0.98] transition-[background-color,transform] duration-100"
            >
              <div className="w-7 h-7 rounded-full bg-brand-orange flex items-center justify-center shrink-0 shadow-sm">
                <span className="text-white text-[11px] font-bold">{avatarInitials}</span>
              </div>
              <span className="text-[13px] font-medium text-app-text-primary hidden sm:block">{name}</span>
              <ChevronDown className="w-3.5 h-3.5 text-app-text-muted hidden sm:block" />
            </Link>
          </div>

          {/* Mobile: compact avatar circle */}
          <Link
            href="/settings"
            className="md:hidden w-8 h-8 rounded-full bg-brand-orange flex items-center justify-center shadow-sm active:scale-90 transition-transform duration-100"
          >
            <span className="text-white text-[11px] font-bold">{avatarInitials}</span>
          </Link>

          <button
            onClick={onMenuToggle}
            className="md:hidden p-2 rounded-lg text-app-text-muted hover:bg-app-surface-2 hover:text-app-text-primary active:scale-90 transition-[background-color,color,transform] duration-100"
            aria-label="Toggle navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

        </div>
      </header>
    </div>
  );
}
