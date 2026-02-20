'use client';

import { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { BarChart3 } from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { cn } from '@/lib/utils';
import type { AnalyticsData } from '@/types';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

const ACTION_LABELS: Record<string, string> = {
  task_created: 'Задачи созданы',
  task_completed: 'Задачи выполнены',
  task_deleted: 'Задачи удалены',
  goal_created: 'Цели созданы',
  goal_updated: 'Цели обновлены',
  goal_deleted: 'Цели удалены',
  habit_created: 'Привычки созданы',
  habit_logged: 'Привычки отмечены',
  habit_deleted: 'Привычки удалены',
  finance_created: 'Финансы добавлены',
  finance_deleted: 'Финансы удалены',
  note_created: 'Заметки созданы',
  note_updated: 'Заметки обновлены',
  note_deleted: 'Заметки удалены',
  settings_updated: 'Настройки обновлены',
};

export function AnalyticsView() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [days, setDays] = useState(30);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`/api/analytics?days=${days}`, { credentials: 'include' });
        if (!res.ok) throw new Error('Failed to load');
        const json = await res.json();
        if (!cancelled) setData(json);
      } catch {
        if (!cancelled) setError('Не удалось загрузить аналитику');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [days]);

  if (loading) {
    return (
      <div className="p-6 lg:p-8 space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 lg:p-8">
        <EmptyState
          title={error || 'Нет данных'}
          description="Попробуйте обновить страницу"
          icon={<BarChart3 className="w-6 h-6" />}
        />
      </div>
    );
  }

  const taskTrendFormatted = data.taskTrend.map((d) => ({
    ...d,
    label: format(new Date(d.date), 'dd MMM', { locale: ru }),
  }));
  const habitTrendFormatted = data.habitTrend.map((d) => ({
    ...d,
    label: format(new Date(d.date), 'dd MMM', { locale: ru }),
  }));
  const incomeFormatted = data.incomeTrend.map((d) => ({
    ...d,
    label: format(new Date(d.date), 'dd MMM', { locale: ru }),
  }));
  const expenseFormatted = data.expenseTrend.map((d) => ({
    ...d,
    label: format(new Date(d.date), 'dd MMM', { locale: ru }),
  }));
  const actionData = Object.entries(data.actionCounts).map(([action, count]) => ({
    action: ACTION_LABELS[action] ?? action,
    count,
  }));

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Аналитика
        </h1>
        <select
          value={days}
          onChange={(e) => setDays(Number(e.target.value))}
          className="px-3 py-2 rounded-lg border border-border bg-[var(--surface)] text-gray-900 dark:text-gray-100 text-sm"
        >
          <option value={7}>7 дней</option>
          <option value={30}>30 дней</option>
          <option value={90}>90 дней</option>
        </select>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="pt-5">
            <p className="text-sm text-gray-500 dark:text-gray-400">Задачи (выполнено)</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {data.summary.tasksCompleted} / {data.summary.tasksTotal}
            </p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="pt-5">
            <p className="text-sm text-gray-500 dark:text-gray-400">Цели</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {data.summary.goalsTotal}
            </p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="pt-5">
            <p className="text-sm text-gray-500 dark:text-gray-400">Привычки</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {data.summary.habitsTotal}
            </p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="pt-5">
            <p className="text-sm text-gray-500 dark:text-gray-400">Активность (действия)</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {data.summary.activityTotal}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <h2 className="font-semibold text-gray-900 dark:text-white">
            Выполненные задачи по дням
          </h2>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={taskTrendFormatted} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--surface-elevated)',
                    border: '1px solid var(--border)',
                    borderRadius: 8,
                  }}
                />
                <Line type="monotone" dataKey="count" stroke="var(--accent)" strokeWidth={2} name="Задачи" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <h2 className="font-semibold text-gray-900 dark:text-white">
            Привычки по дням
          </h2>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={habitTrendFormatted} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--surface-elevated)',
                    border: '1px solid var(--border)',
                    borderRadius: 8,
                  }}
                />
                <Bar dataKey="count" fill="var(--accent)" radius={[4, 4, 0, 0]} name="Отметки" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <h2 className="font-semibold text-gray-900 dark:text-white">Доход по дням</h2>
          </CardHeader>
          <CardContent>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={incomeFormatted} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(value: number) => [`${value.toLocaleString('ru-RU')} ₽`, '']}
                    contentStyle={{
                      backgroundColor: 'var(--surface-elevated)',
                      border: '1px solid var(--border)',
                      borderRadius: 8,
                    }}
                  />
                  <Line type="monotone" dataKey="amount" stroke="#22c55e" strokeWidth={2} name="Доход" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <h2 className="font-semibold text-gray-900 dark:text-white">Расход по дням</h2>
          </CardHeader>
          <CardContent>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={expenseFormatted} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(value: number) => [`${value.toLocaleString('ru-RU')} ₽`, '']}
                    contentStyle={{
                      backgroundColor: 'var(--surface-elevated)',
                      border: '1px solid var(--border)',
                      borderRadius: 8,
                    }}
                  />
                  <Line type="monotone" dataKey="amount" stroke="#ef4444" strokeWidth={2} name="Расход" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {actionData.length > 0 && (
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <h2 className="font-semibold text-gray-900 dark:text-white">
              Действия по типам
            </h2>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={actionData}
                  layout="vertical"
                  margin={{ top: 8, right: 8, left: 120, bottom: 0 }}
                >
                  <XAxis type="number" tick={{ fontSize: 12 }} />
                  <YAxis type="category" dataKey="action" tick={{ fontSize: 11 }} width={110} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--surface-elevated)',
                      border: '1px solid var(--border)',
                      borderRadius: 8,
                    }}
                  />
                  <Bar dataKey="count" fill="var(--accent)" radius={[0, 4, 4, 0]} name="Кол-во" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
