'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

export default function NavigationProgress() {
  const pathname = usePathname();
  const [navigating, setNavigating] = useState(false);
  const prevPath = useRef(pathname);
  const hideTimer = useRef<ReturnType<typeof setTimeout>>();

  // Fires the moment any internal link is clicked — before the route loads
  useEffect(() => {
    function handleLinkClick(e: MouseEvent) {
      const anchor = (e.target as Element).closest('a[href]') as HTMLAnchorElement | null;
      if (!anchor) return;

      const href = anchor.getAttribute('href') ?? '';
      // Only trigger for internal paths that differ from the current page
      if (href.startsWith('/') && !href.startsWith('//') && href !== pathname) {
        clearTimeout(hideTimer.current);
        setNavigating(true);
      }
    }

    // Capture phase so we fire before React's onClick handlers
    document.addEventListener('click', handleLinkClick, true);
    return () => document.removeEventListener('click', handleLinkClick, true);
  }, [pathname]);

  // Stop the bar once the new page has rendered (pathname changed)
  useEffect(() => {
    if (prevPath.current === pathname) return;
    prevPath.current = pathname;

    // Keep bar visible briefly so the transition feels complete
    hideTimer.current = setTimeout(() => setNavigating(false), 200);
    return () => clearTimeout(hideTimer.current);
  }, [pathname]);

  return (
    <div
      aria-hidden="true"
      className="no-print pointer-events-none fixed inset-x-0 top-0 z-[200] h-[2px] overflow-hidden"
    >
      <div
        className={`h-full w-1/3 rounded-full bg-brand-orange transition-opacity duration-300 ${
          navigating ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          animation: navigating ? 'nav-progress 1.1s cubic-bezier(0.4,0,0.2,1) infinite' : 'none',
        }}
      />
    </div>
  );
}
