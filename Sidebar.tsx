'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  CheckSquare,
  Target,
  Flame,
  Wallet,
  StickyNote,
  BarChart3,
  Settings,
  History,
  LogOut,
  Moon,
  Sun,
  Monitor,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';
import { useThemeStore, type Theme } from '@/stores/themeStore';

const nav = [
  { href: '/dashboard', label: 'Главная', icon: LayoutDashboard },
  { href: '/dashboard/tasks', label: 'Задачи', icon: CheckSquare },
  { href: '/dashboard/goals', label: 'Цели', icon: Target },
  { href: '/dashboard/habits', label: 'Привычки', icon: Flame },
  { href: '/dashboard/finance', label: 'Финансы', icon: Wallet },
  { href: '/dashboard/notes', label: 'Заметки', icon: StickyNote },
  { href: '/dashboard/analytics', label: 'Аналитика', icon: BarChart3 },
  { href: '/dashboard/activity', label: 'История', icon: History },
  { href: '/dashboard/settings', label: 'Настройки', icon: Settings },
];

interface SidebarProps {
  /** Called when user navigates (e.g. close mobile menu) */
  onNavigate?: () => void;
}

export function Sidebar({ onNavigate }: SidebarProps) {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const theme = useThemeStore((s) => s.theme);
  const setTheme = useThemeStore((s) => s.setTheme);

  async function handleLogout() {
    await logout();
    window.location.href = '/login';
  }

  const cycleTheme = () => {
    const next: Theme = theme === 'system' ? 'dark' : theme === 'dark' ? 'light' : 'system';
    setTheme(next);
  };

  return (
    <aside className="w-56 min-h-screen border-r border-border bg-surface-elevated flex flex-col shrink-0 transition-transform duration-200 ease-out">
      <div className="p-4 border-b border-border">
        <Link href="/dashboard" className="font-semibold text-lg text-gray-900 dark:text-white">
          Life Dashboard
        </Link>
      </div>
      <nav className="flex-1 p-2 space-y-0.5">
        {nav.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-[var(--accent)]/10 text-[var(--accent)]'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-surface-muted hover:text-gray-900 dark:hover:text-white'
              )}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-2 border-t border-border space-y-1">
        <button
          type="button"
          onClick={cycleTheme}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-surface-muted hover:text-gray-900 dark:hover:text-white transition"
        >
          {theme === 'dark' ? <Moon className="w-5 h-5" /> : theme === 'light' ? <Sun className="w-5 h-5" /> : <Monitor className="w-5 h-5" />}
          <span>{theme === 'system' ? 'Система' : theme === 'dark' ? 'Тёмная' : 'Светлая'}</span>
        </button>
        {user && (
          <div className="px-3 py-2 text-xs text-gray-500 dark:text-gray-400 truncate">
            {user.email}
          </div>
        )}
        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-600 dark:text-red-400 hover:bg-red-500/10 transition"
        >
          <LogOut className="w-5 h-5" />
          Выйти
        </button>
      </div>
    </aside>
  );
}
