'use client';

import { useState } from 'react';
import { Menu } from 'lucide-react';
import { Sidebar } from '@/components/layout/Sidebar';
import { cn } from '@/lib/utils';

/**
 * Wrapper for dashboard: sidebar + main. On mobile, sidebar is overlay and toggled by hamburger.
 */
export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-surface">
      {/* Mobile menu button */}
      <button
        type="button"
        onClick={() => setMobileOpen((o) => !o)}
        className="md:hidden fixed top-4 left-4 z-20 p-2 rounded-lg bg-surface-elevated border border-border text-gray-700 dark:text-gray-300 hover:bg-surface-muted transition"
        aria-label="Меню"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Overlay when sidebar open on mobile */}
      {mobileOpen && (
        <button
          type="button"
          aria-label="Закрыть"
          className="md:hidden fixed inset-0 z-10 bg-black/50"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={cn(
          'fixed md:relative inset-y-0 left-0 z-20 w-56 min-h-screen border-r border-border bg-surface-elevated flex flex-col shrink-0 transition-transform duration-200 ease-out',
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
      >
        <Sidebar onNavigate={() => setMobileOpen(false)} />
      </aside>

      <main className="flex-1 overflow-auto min-w-0 pt-14 md:pt-0">
        {children}
      </main>
    </div>
  );
}
