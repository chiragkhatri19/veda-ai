'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Users, BookOpen, Monitor,
  Library, Settings, X, Plus, ChevronsLeft, ChevronsRight, Sparkles,
} from 'lucide-react';
import { useAssignmentStore } from '@/store/assignmentStore';
import { useUserStore } from '@/store/userStore';
import { getSocket } from '@/lib/socket';

export const SIDEBAR_COLLAPSED = 60;
export const SIDEBAR_EXPANDED_MIN = 180;
export const SIDEBAR_DEFAULT = 220;
export const SIDEBAR_MAX = 320;
const SNAP_THRESHOLD = 120;

const NAV_ITEMS = [
  { href: '/dashboard',   label: 'Home',                icon: LayoutDashboard },
  { href: '/groups',      label: 'My Groups',           icon: Users           },
  { href: '/assignments', label: 'Assignments',          icon: BookOpen        },
  { href: '/toolkit',     label: "AI Teacher's Toolkit", icon: Monitor         },
  { href: '/library',     label: 'My Library',          icon: Library         },
];

function VedaAILogo({ size = 32 }: { size?: number }) {
  return (
    <Image src="/logo.png" alt="VedaAI" width={size} height={size} className="rounded-[9px] block shrink-0" />
  );
}

function useWsConnected() {
  const [connected, setConnected] = useState(false);
  useEffect(() => {
    try {
      const s = getSocket();
      setConnected(s.connected);
      const on = () => setConnected(true);
      const off = () => setConnected(false);
      s.on('connect', on);
      s.on('disconnect', off);
      return () => { s.off('connect', on); s.off('disconnect', off); };
    } catch { /* SSR */ }
  }, []);
  return connected;
}

function isActive(pathname: string, href: string) {
  if (href === '/dashboard') return pathname === '/dashboard' || pathname === '/';
  if (href === '/assignments') return pathname.startsWith('/assignments');
  return pathname.startsWith(href);
}

function CollapsedSidebar({ onExpand }: { onExpand?: () => void }) {
  const pathname = usePathname();
  const { assignments } = useAssignmentStore();
  const { avatarInitials, school, city } = useUserStore();

  const completedCount = assignments.length;

  return (
    <div className="h-full w-full bg-transparent flex flex-col items-center pt-5 pb-4 gap-1">
      <div className="flex flex-col items-center gap-3 mb-5">
        <VedaAILogo size={36} />
        {onExpand && (
          <button
            onClick={onExpand}
            title="Expand sidebar"
            className="w-7 h-7 flex items-center justify-center rounded-lg text-app-text-muted hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-app-text-primary transition-colors"
          >
            <ChevronsRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <Link
        href="/assignments/create"
        title="New Assignment"
        className="w-9 h-9 flex items-center justify-center rounded-xl bg-brand-dark text-white border-2 border-brand-orange/50 hover:opacity-90 active:scale-90 active:opacity-75 transition-[opacity,transform] duration-150 mb-5 shrink-0 shadow-[0_2px_8px_rgba(0,0,0,0.20)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.5)]"
      >
        <Sparkles className="w-4 h-4" strokeWidth={2} />
      </Link>

      <div className="w-6 border-t border-app-border/40 mb-4" />

      <nav className="flex flex-col gap-1.5 flex-1 w-full px-2 pt-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = isActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              title={label}
              className={`relative flex items-center justify-center w-9 h-9 rounded-xl mx-auto transition-colors ${
                active
                  ? 'bg-orange-50/90 dark:bg-orange-950/40 text-brand-orange'
                  : 'text-app-text-muted hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-app-text-primary'
              }`}
            >
              <Icon className="w-[16px] h-[16px]" />
              {label === 'Assignments' && completedCount > 0 && (
                <span className="absolute -top-1 -right-1 text-[9px] font-bold text-white bg-brand-orange rounded-full min-w-[15px] h-[15px] flex items-center justify-center px-[3px] leading-none shadow-sm">
                  {completedCount > 99 ? '99+' : completedCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="flex flex-col items-center gap-1.5 w-full px-2 pt-3">
        <Link
          href="/settings"
          title="Settings"
          className={`flex items-center justify-center w-9 h-9 rounded-xl transition-colors ${
            pathname === '/settings'
              ? 'bg-orange-50/90 dark:bg-orange-950/40 text-brand-orange'
              : 'text-app-text-muted hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-app-text-primary'
          }`}
        >
          <Settings className="w-[16px] h-[16px]" />
        </Link>
        <Link
          href="/settings"
          title={`${school} · ${city}`}
          className="w-8 h-8 rounded-full bg-brand-orange flex items-center justify-center text-white text-[11px] font-bold shrink-0 hover:opacity-90 transition-opacity"
        >
          {avatarInitials}
        </Link>
      </div>
    </div>
  );
}

function ExpandedSidebar({ onClose, width, onCollapse }: { onClose?: () => void; width: number; onCollapse?: () => void }) {
  const pathname = usePathname();
  const { assignments } = useAssignmentStore();
  const { school, city, avatarInitials } = useUserStore();

  const completedCount = assignments.length;
  const showLabels = width >= 160;

  return (
    <div className="h-full w-full bg-transparent flex flex-col overflow-hidden">

      <div className="px-6 pt-5 pb-5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="mt-1 shrink-0">
            <VedaAILogo size={36} />
          </div>
          {showLabels && (
            <span className="text-[17px] font-extrabold text-app-text-primary tracking-tight leading-none truncate">VedaAI</span>
          )}
        </div>
        <div className="flex items-center gap-0.5 shrink-0">
          {onCollapse && (
            <button
              onClick={onCollapse}
              title="Collapse sidebar"
              className="hidden md:flex w-7 h-7 items-center justify-center rounded-lg text-app-text-muted hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-app-text-primary transition-colors"
            >
              <ChevronsLeft className="w-3.5 h-3.5" />
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="md:hidden p-1.5 rounded-lg text-app-text-muted hover:text-app-text-primary hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="px-3 mb-1 shrink-0">
        <Link
          href="/assignments/create"
          onClick={onClose}
          className="flex items-center justify-center gap-2 w-full bg-brand-dark text-white text-[13px] font-semibold py-3 rounded-2xl border-2 border-brand-orange/50 hover:opacity-90 active:scale-[0.97] active:opacity-80 transition-[opacity,transform] duration-150 shadow-[0_2px_8px_rgba(0,0,0,0.20)] dark:shadow-[0_2px_10px_rgba(0,0,0,0.5)]"
        >
          <Sparkles className="w-3.5 h-3.5" strokeWidth={2} />
          {showLabels && 'Create Assignment'}
        </Link>
      </div>

      <div className="mx-4 mt-5 mb-4 border-t border-app-border/40 shrink-0" />

      <nav className="flex-1 px-2 space-y-1 overflow-y-auto scrollbar-hide pt-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = isActive(pathname, href);
          const badge = label === 'Assignments' && completedCount > 0 ? completedCount : null;

          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              title={showLabels ? undefined : label}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] font-medium active:scale-[0.98] transition-[background-color,color,transform] duration-100 ${
                active
                  ? 'bg-orange-50/90 dark:bg-orange-950/40 text-brand-orange'
                  : 'text-app-text-secondary hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-app-text-primary'
              }`}
            >
              <Icon className={`w-[15px] h-[15px] shrink-0 ${active ? 'text-brand-orange' : ''}`} />
              {showLabels && (
                <>
                  <span className="flex-1 truncate">{label}</span>
                  {badge && (
                    <span className="bg-brand-orange text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-none shrink-0">
                      {badge > 99 ? '99+' : badge}
                    </span>
                  )}
                </>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="px-2 pb-4 pt-3 shrink-0">
        <Link
          href="/settings"
          onClick={onClose}
          title={showLabels ? undefined : 'Settings'}
          className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] font-medium active:scale-[0.98] transition-[background-color,color,transform] duration-100 ${
            pathname === '/settings'
              ? 'bg-orange-50/90 dark:bg-orange-950/40 text-brand-orange'
              : 'text-app-text-secondary hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-app-text-primary'
          }`}
        >
          <Settings className={`w-[15px] h-[15px] shrink-0 ${pathname === '/settings' ? 'text-brand-orange' : ''}`} />
          {showLabels && <span>Settings</span>}
        </Link>

        <Link
          href="/settings"
          onClick={onClose}
          title={showLabels ? undefined : `${school} · ${city}`}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 active:scale-[0.98] transition-[background-color,transform] duration-100 mt-1"
        >
          <div className="w-8 h-8 rounded-full bg-brand-orange flex items-center justify-center text-white text-[11px] font-bold shrink-0 shadow-sm">
            {avatarInitials}
          </div>
          {showLabels && (
            <div className="min-w-0 flex-1">
              <p className="text-[12px] font-semibold text-app-text-secondary leading-tight truncate">{school}</p>
              <p className="text-[11px] text-app-text-muted leading-tight truncate">{city}</p>
            </div>
          )}
        </Link>
      </div>
    </div>
  );
}

interface SidebarProps {
  open?: boolean;
  onClose?: () => void;
  width: number;
  onResize: (w: number) => void;
}

export default function Sidebar({ open, onClose, width, onResize }: SidebarProps) {
  const collapsed = width <= 80;
  const isDragging = useRef(false);
  const startX = useRef(0);
  const startWidth = useRef(width);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);

  const toggleCollapse = () => {
    onResize(collapsed ? SIDEBAR_DEFAULT : SIDEBAR_COLLAPSED);
  };

  const handleDragStart = (e: React.MouseEvent) => {
    e.preventDefault();
    isDragging.current = true;
    startX.current = e.clientX;
    startWidth.current = width;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      const raw = startWidth.current + (e.clientX - startX.current);
      const clamped = Math.max(SIDEBAR_COLLAPSED, Math.min(SIDEBAR_MAX, raw));
      onResize(clamped);
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (!isDragging.current) return;
      isDragging.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      const raw = startWidth.current + (e.clientX - startX.current);
      if (raw < SNAP_THRESHOLD) {
        onResize(SIDEBAR_COLLAPSED);
      } else if (raw < SIDEBAR_EXPANDED_MIN) {
        onResize(SIDEBAR_DEFAULT);
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [onResize]);

  const displayWidth = collapsed ? SIDEBAR_COLLAPSED : width;

  return (
    <>
      {/* ── Desktop: floating card sidebar ──────────────────────────────── */}
      <div
        className="hidden md:block shrink-0 relative bg-white dark:bg-app-surface rounded-3xl my-3 ml-3 shadow-sidebar dark:shadow-[0_4px_10px_rgba(0,0,0,0.25),0_12px_36px_rgba(0,0,0,0.38),0_28px_72px_rgba(0,0,0,0.32)] transition-[width] duration-150 ease-out overflow-hidden no-print"
        style={{ width: displayWidth }}
      >
        <div className="h-full w-full overflow-hidden">
          {collapsed ? (
            <CollapsedSidebar onExpand={toggleCollapse} />
          ) : (
            <ExpandedSidebar width={width} onCollapse={toggleCollapse} />
          )}
        </div>

        {/* Drag handle */}
        <div
          className="absolute top-0 right-0 bottom-0 w-4 z-20 cursor-col-resize group flex items-center justify-end"
          onMouseDown={handleDragStart}
          onDoubleClick={toggleCollapse}
          title="Drag to resize · Double-click to collapse"
        >
          <div className="w-px h-full bg-transparent group-hover:bg-brand-orange/60 group-active:bg-brand-orange transition-colors" />
        </div>
      </div>

      {/* ── Mobile drawer ───────────────────────────────────────────────── */}
      <div
        className={`md:hidden fixed inset-y-0 left-0 z-40 bg-white dark:bg-app-surface rounded-3xl my-3 ml-3 transition-transform duration-200 ease-in-out shadow-[0_4px_12px_rgba(0,0,0,0.08),0_12px_36px_rgba(0,0,0,0.12),0_28px_72px_rgba(0,0,0,0.10)] dark:shadow-[6px_0_14px_rgba(0,0,0,0.30),12px_0_40px_rgba(0,0,0,0.42),20px_0_72px_rgba(0,0,0,0.36)] no-print ${
          open ? 'translate-x-0' : '-translate-x-[calc(100%+0.75rem)]'
        }`}
        style={{ width: SIDEBAR_DEFAULT }}
        onTouchStart={(e) => {
          touchStartX.current = e.touches[0].clientX;
          touchStartY.current = e.touches[0].clientY;
        }}
        onTouchEnd={(e) => {
          const dx = e.changedTouches[0].clientX - touchStartX.current;
          const dy = e.changedTouches[0].clientY - touchStartY.current;
          if (dx < -50 && Math.abs(dx) > Math.abs(dy) && onClose) onClose();
        }}
      >
        <ExpandedSidebar onClose={onClose} width={SIDEBAR_DEFAULT} />
      </div>
    </>
  );
}
