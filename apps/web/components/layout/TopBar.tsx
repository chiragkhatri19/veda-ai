'use client';

import { useState, useRef, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { ArrowLeft, Menu, Bell, ChevronDown, LayoutGrid } from 'lucide-react';
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

  return (
    /*
     * Outer wrapper: sticky + canvas background fill
     * The py-3 px-3 creates the visible gap between the floating card and the
     * viewport edges — the bg-app-bg shows through, matching the canvas layer.
     * This mirrors the sidebar's pl-3 py-3 floating layout exactly.
     */
    /* Wrapper: semi-transparent canvas fill so scrolled content blurs through the gap areas */
    <div className="sticky top-0 z-30 no-print bg-app-bg/80 backdrop-blur-md py-3 px-3 shrink-0">
      {/* Glass card — same elevation and glass token as sidebar */}
      <header className="h-14 bg-app-surface/85 dark:bg-app-surface/80 backdrop-blur-xl rounded-2xl flex items-center px-4 gap-3 shadow-topbar dark:shadow-[0_0_0_1px_rgba(255,255,255,0.07),0_4px_16px_rgba(0,0,0,0.4),0_16px_40px_rgba(0,0,0,0.4)]">

        {/* Mobile hamburger */}
        <button
          onClick={onMenuToggle}
          className="md:hidden p-2 rounded-lg text-app-text-muted hover:bg-app-surface-2 hover:text-app-text-primary active:scale-90 transition-[background-color,color,transform] duration-100"
          aria-label="Toggle navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Breadcrumb — flex-1 so it fills and truncates gracefully */}
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
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

        {/* Right cluster — fixed-size items, no flex growth */}
        <div className="flex items-center gap-1 shrink-0">
          <ThemeToggle />

          {/* Notification bell */}
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
                    <span className="w-2 h-2 bg-red-500 rounded-full border-[1.5px] border-app-surface block" />
                  ) : (
                    <span className="text-[9px] font-bold text-white bg-red-500 rounded-full px-1 leading-none py-px border border-app-surface">
                      {unread}
                    </span>
                  )}
                </span>
              )}
            </button>

            {panelOpen && <NotificationPanel onClose={closePanel} />}
          </div>

          {/* Divider */}
          <div className="w-px h-5 bg-app-border mx-1 shrink-0" />

          {/* User pill */}
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
      </header>
    </div>
  );
}
