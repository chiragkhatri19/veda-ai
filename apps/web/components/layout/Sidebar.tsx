'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Users, BookOpen, Wrench,
  Library, Settings, X, Plus, ChevronsLeft, ChevronsRight,
} from 'lucide-react';
import { useAssignmentStore } from '@/store/assignmentStore';
import { useUserStore } from '@/store/userStore';
import { getSocket } from '@/lib/socket';
import ThemeToggle from './ThemeToggle';

export const SIDEBAR_COLLAPSED = 60;
export const SIDEBAR_EXPANDED_MIN = 180;
export const SIDEBAR_DEFAULT = 220;
export const SIDEBAR_MAX = 320;
const SNAP_THRESHOLD = 120;

const NAV_ITEMS = [
  { href: '/dashboard',   label: 'Home',                icon: LayoutDashboard },
  { href: '/groups',      label: 'My Groups',           icon: Users           },
  { href: '/assignments', label: 'Assignments',          icon: BookOpen        },
  { href: '/toolkit',     label: "AI Teacher's Toolkit", icon: Wrench          },
  { href: '/library',     label: 'My Library',          icon: Library         },
];

function VedaAILogo() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <rect width="32" height="32" rx="9" fill="#F97316" />
      <path
        d="M8 10h16M12 10l4 13 4-13"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
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

  const completedCount = assignments.filter((a) => a.jobStatus === 'completed').length;

  return (
    <div className="h-full w-full bg-transparent flex flex-col items-center pt-5 pb-4 gap-1">
      {/* Logo + collapse toggle — generous top space */}
      <div className="flex flex-col items-center gap-3 mb-5">
        <VedaAILogo />
        {onExpand && (
          <button
            onClick={onExpand}
            title="Expand sidebar"
            className="w-7 h-7 flex items-center justify-center rounded-lg text-app-text-muted hover:bg-white/20 dark:hover:bg-white/10 hover:text-app-text-primary transition-colors"
          >
            <ChevronsRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Create button — prominent, separated from nav */}
      <Link
        href="/assignments/create"
        title="New Assignment"
        className="w-9 h-9 flex items-center justify-center rounded-xl bg-brand-dark text-white hover:opacity-90 active:scale-90 active:opacity-75 transition-[opacity,transform] duration-150 mb-5 shrink-0 shadow-[0_2px_8px_rgba(0,0,0,0.20)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.5)]"
      >
        <Plus className="w-4 h-4" strokeWidth={2.5} />
      </Link>

      {/* Subtle divider */}
      <div className="w-6 border-t border-app-border/40 mb-3" />

      {/* Nav */}
      <nav className="flex flex-col gap-1.5 flex-1 w-full px-2">
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
                  : 'text-app-text-muted hover:bg-white/30 dark:hover:bg-white/10 hover:text-app-text-primary'
              }`}
            >
              <Icon className="w-[16px] h-[16px]" />
              {label === 'Assignments' && completedCount > 0 && (
                <span className="absolute -top-1 -right-1 text-[9px] font-bold text-white bg-emerald-500 rounded-full min-w-[15px] h-[15px] flex items-center justify-center px-[3px] leading-none shadow-sm">
                  {completedCount > 99 ? '99+' : completedCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="flex flex-col items-center gap-1.5 w-full px-2 pt-3">
        <ThemeToggle />
        <Link
          href="/settings"
          title="Settings"
          className={`flex items-center justify-center w-9 h-9 rounded-xl transition-colors ${
            pathname === '/settings'
              ? 'bg-orange-50/90 dark:bg-orange-950/40 text-brand-orange'
              : 'text-app-text-muted hover:bg-white/30 dark:hover:bg-white/10 hover:text-app-text-primary'
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

  const completedCount = assignments.filter((a) => a.jobStatus === 'completed').length;
  const showLabels = width >= 160;

  return (
    <div className="h-full w-full bg-transparent flex flex-col overflow-hidden">

      {/* Logo — generous top padding, breathing room */}
      <div className="px-5 pt-6 pb-5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <VedaAILogo />
          {showLabels && (
            <span className="text-[15px] font-bold text-app-text-primary tracking-tight truncate">VedaAI</span>
          )}
        </div>
        <div className="flex items-center gap-0.5 shrink-0">
          {onCollapse && (
            <button
              onClick={onCollapse}
              title="Collapse sidebar"
              className="hidden md:flex w-7 h-7 items-center justify-center rounded-lg text-app-text-muted hover:bg-white/20 dark:hover:bg-white/10 hover:text-app-text-primary transition-colors"
            >
              <ChevronsLeft className="w-3.5 h-3.5" />
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="md:hidden p-1.5 rounded-lg text-app-text-muted hover:text-app-text-primary hover:bg-white/20 dark:hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Create Assignment — prominent, high-contrast, own visual zone */}
      <div className="px-3 mb-1 shrink-0">
        <Link
          href="/assignments/create"
          onClick={onClose}
          className="flex items-center justify-center gap-2 w-full bg-brand-dark text-white text-[13px] font-semibold py-3 rounded-2xl hover:opacity-90 active:scale-[0.97] active:opacity-80 transition-[opacity,transform] duration-150 shadow-[0_2px_8px_rgba(0,0,0,0.20)] dark:shadow-[0_2px_10px_rgba(0,0,0,0.5)]"
        >
          <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
          {showLabels && 'Create Assignment'}
        </Link>
      </div>

      {/* Divider separates the primary CTA from the navigation */}
      <div className="mx-4 mt-5 mb-3 border-t border-app-border/40 shrink-0" />

      {/* Nav — lighter weight, more space between items */}
      <nav className="flex-1 px-2 space-y-1 overflow-y-auto scrollbar-hide">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = isActive(pathname, href);
          const badge = label === 'Assignments' && completedCount > 0 ? completedCount : null;

          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              title={showLabels ? undefined : label}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-[12.5px] font-medium active:scale-[0.98] transition-[background-color,color,transform] duration-100 ${
                active
                  ? 'bg-orange-50/90 dark:bg-orange-950/40 text-brand-orange'
                  : 'text-app-text-secondary hover:bg-white/30 dark:hover:bg-white/10 hover:text-app-text-primary'
              }`}
            >
              <Icon className={`w-[15px] h-[15px] shrink-0 ${active ? 'text-brand-orange' : ''}`} />
              {showLabels && (
                <>
                  <span className="flex-1 truncate">{label}</span>
                  {badge && (
                    <span className="bg-emerald-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-none shrink-0">
                      {badge > 99 ? '99+' : badge}
                    </span>
                  )}
                </>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom section — settings + theme + profile */}
      <div className="px-2 pb-4 pt-3 shrink-0">
        <Link
          href="/settings"
          onClick={onClose}
          title={showLabels ? undefined : 'Settings'}
          className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-[12.5px] font-medium active:scale-[0.98] transition-[background-color,color,transform] duration-100 ${
            pathname === '/settings'
              ? 'bg-orange-50/90 dark:bg-orange-950/40 text-brand-orange'
              : 'text-app-text-secondary hover:bg-white/30 dark:hover:bg-white/10 hover:text-app-text-primary'
          }`}
        >
          <Settings className={`w-[15px] h-[15px] shrink-0 ${pathname === '/settings' ? 'text-brand-orange' : ''}`} />
          {showLabels && <span>Settings</span>}
        </Link>

        {showLabels && (
          <div className="flex items-center gap-2.5 px-3 py-2">
            <span className="text-[12.5px] font-medium text-app-text-secondary flex-1">Theme</span>
            <ThemeToggle />
          </div>
        )}

        <Link
          href="/settings"
          onClick={onClose}
          title={showLabels ? undefined : `${school} · ${city}`}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/30 dark:hover:bg-white/10 active:scale-[0.98] transition-[background-color,transform] duration-100 mt-1"
        >
          <div className="w-8 h-8 rounded-full bg-brand-orange flex items-center justify-center text-white text-[11px] font-bold shrink-0 shadow-sm">
            {avatarInitials}
          </div>
          {showLabels && (
            <div className="min-w-0 flex-1">
              <p className="text-[12px] font-semibold text-app-text-primary leading-tight truncate">{school}</p>
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
      {/* ── Desktop: floating glass card ────────────────────────────────── */}
      <div
        className="hidden md:block shrink-0 relative transition-[width] duration-150 ease-out pl-3 py-3"
        style={{ width: displayWidth }}
      >
        {/* Glass card — bg-app-surface at 85% lets canvas gradient show through */}
        <div className="h-full w-full rounded-2xl overflow-hidden bg-app-surface/85 backdrop-blur-xl shadow-sidebar dark:bg-app-surface/80 dark:shadow-[0_0_0_1px_rgba(255,255,255,0.07),0_4px_20px_rgba(0,0,0,0.5),0_24px_60px_rgba(0,0,0,0.5)]">
          {collapsed ? (
            <CollapsedSidebar onExpand={toggleCollapse} />
          ) : (
            <ExpandedSidebar width={width} onCollapse={toggleCollapse} />
          )}
        </div>

        {/* Drag handle aligned to card edges via top-3 bottom-3 */}
        <div
          className="absolute top-3 right-0 bottom-3 w-4 z-20 cursor-col-resize group flex items-center justify-end"
          onMouseDown={handleDragStart}
          onDoubleClick={toggleCollapse}
          title="Drag to resize · Double-click to collapse"
        >
          <div className="w-px h-full bg-transparent group-hover:bg-brand-orange/60 group-active:bg-brand-orange transition-colors" />
        </div>
      </div>

      {/* ── Mobile drawer — solid bg, no glass ──────────────────────────── */}
      <div
        className={`md:hidden fixed inset-y-0 left-0 z-40 bg-app-surface transition-transform duration-200 ease-in-out shadow-[4px_0_32px_rgba(0,0,0,0.14)] dark:shadow-[4px_0_32px_rgba(0,0,0,0.6)] ${
          open ? 'translate-x-0' : '-translate-x-full'
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
