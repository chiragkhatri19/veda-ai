'use client';

import { useState, useEffect, useCallback } from 'react';
import Sidebar, { SIDEBAR_DEFAULT } from './Sidebar';
import TopBar from './TopBar';
import MobileDock from './MobileDock';
import NavigationProgress from './NavigationProgress';
import { useUserStore } from '@/store/userStore';
import { useNotificationStore } from '@/store/notificationStore';
import { useGroupStore } from '@/store/groupStore';

export default function ShellLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(SIDEBAR_DEFAULT);

  useEffect(() => {
    // Rehydrate persist stores after React hydration completes.
    useUserStore.persist.rehydrate();
    useNotificationStore.persist.rehydrate();
    useGroupStore.persist.rehydrate();

    const stored = localStorage.getItem('vedaai-sidebar-width') ?? localStorage.getItem('caliber-sidebar-width') ?? localStorage.getItem('veda-sidebar-width');
    if (stored) setSidebarWidth(Number(stored));
  }, []);

  const handleSidebarResize = useCallback((w: number) => {
    setSidebarWidth(w);
    localStorage.setItem('vedaai-sidebar-width', String(w));
  }, []);

  return (
    <div className="shell-root flex min-h-screen bg-app-bg print:block">
      <NavigationProgress />
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        width={sidebarWidth}
        onResize={handleSidebarResize}
      />

      <div
        className={`md:hidden fixed inset-0 z-30 bg-black/40 backdrop-blur-sm transition-opacity duration-200 no-print ${
          sidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setSidebarOpen(false)}
        aria-hidden="true"
      />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden print:block print:overflow-visible">
        <TopBar onMenuToggle={() => setSidebarOpen((o) => !o)} />
        <main className="flex-1 overflow-y-auto print:overflow-visible bg-app-bg pb-24 md:pb-0 print:pb-0">
          {children}
        </main>
      </div>

      <MobileDock sidebarOpen={sidebarOpen} />
    </div>
  );
}
