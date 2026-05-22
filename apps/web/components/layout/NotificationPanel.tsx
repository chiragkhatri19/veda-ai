'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { CheckCircle2, XCircle, Info, X, BellOff } from 'lucide-react';
import { useNotificationStore, useUnreadCount, type Notification } from '@/store/notificationStore';

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return 'just now';
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

const TYPE_CONFIG = {
  assignment_ready: { icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  assignment_failed: { icon: XCircle,     color: 'text-red-500',     bg: 'bg-red-500/10'     },
  info:              { icon: Info,         color: 'text-blue-500',    bg: 'bg-blue-500/10'    },
} as const;

function NotificationRow({ notification: n, onClose }: { notification: Notification; onClose: () => void }) {
  const { markRead, dismiss } = useNotificationStore();
  const cfg = TYPE_CONFIG[n.type];
  const Icon = cfg.icon;

  const content = (
    <div
      className={`flex items-start gap-3 px-4 py-3 transition-colors duration-100 group/row relative ${
        n.read ? 'bg-transparent' : 'bg-brand-orange/[0.04]'
      } hover:bg-app-surface-2`}
      onClick={() => markRead(n.id)}
    >
      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${cfg.bg}`}>
        <Icon className={`w-3.5 h-3.5 ${cfg.color}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-[12px] font-semibold leading-snug ${n.read ? 'text-app-text-secondary' : 'text-app-text-primary'}`}>
          {n.title}
        </p>
        <p className="text-[11px] text-app-text-muted mt-0.5 leading-relaxed">{n.body}</p>
        <p className="text-[10px] text-app-text-muted/60 mt-1">{relativeTime(n.createdAt)}</p>
      </div>
      {!n.read && (
        <span className="w-1.5 h-1.5 rounded-full bg-brand-orange mt-2 shrink-0" />
      )}
      <button
        onClick={(e) => { e.stopPropagation(); e.preventDefault(); dismiss(n.id); }}
        className="absolute right-3 top-3 opacity-0 group-hover/row:opacity-100 w-5 h-5 flex items-center justify-center rounded text-app-text-muted hover:text-app-text-primary hover:bg-app-border transition-[opacity,background-color,color] duration-100"
        aria-label="Dismiss"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );

  if (n.href) {
    return (
      <Link href={n.href} onClick={onClose} className="block cursor-pointer">
        {content}
      </Link>
    );
  }
  return <div className="cursor-default">{content}</div>;
}

interface Props {
  onClose: () => void;
}

export default function NotificationPanel({ onClose }: Props) {
  const { notifications, markAllRead, clearAll } = useNotificationStore();
  const unread = useUnreadCount();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [onClose]);

  return (
    <div
      ref={panelRef}
      className="absolute right-0 top-full mt-2 w-[340px] max-h-[480px] bg-app-surface/95 backdrop-blur-xl rounded-2xl shadow-dropdown dark:shadow-[0_0_0_1px_rgba(255,255,255,0.07),0_8px_32px_rgba(0,0,0,0.5),0_24px_56px_rgba(0,0,0,0.4)] flex flex-col overflow-hidden z-50 animate-fade-in"
      role="dialog"
      aria-label="Notifications"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-app-border shrink-0">
        <div className="flex items-center gap-2">
          <p className="text-[13px] font-semibold text-app-text-primary">Notifications</p>
          {unread > 0 && (
            <span className="text-[10px] font-bold text-white bg-brand-orange rounded-full px-1.5 py-0.5 leading-none tabular-nums">
              {unread > 99 ? '99+' : unread}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {unread > 0 && (
            <button
              onClick={markAllRead}
              className="text-[11px] font-medium text-brand-orange hover:underline px-1.5 py-1 rounded transition-colors duration-100"
            >
              Mark all read
            </button>
          )}
          {notifications.length > 0 && (
            <button
              onClick={clearAll}
              className="text-[11px] font-medium text-app-text-muted hover:text-app-text-primary px-1.5 py-1 rounded hover:bg-app-surface-2 transition-colors duration-100"
            >
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto overscroll-contain divide-y divide-app-border/60">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <BellOff className="w-8 h-8 text-app-text-muted mb-3" />
            <p className="text-[13px] font-medium text-app-text-secondary">All caught up</p>
            <p className="text-[11px] text-app-text-muted mt-1">Notifications from paper generation will appear here.</p>
          </div>
        ) : (
          notifications.map((n) => (
            <NotificationRow key={n.id} notification={n} onClose={onClose} />
          ))
        )}
      </div>
    </div>
  );
}
