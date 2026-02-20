'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Flame, Trash2 } from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { SkeletonList } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { cn } from '@/lib/utils';
import type { Habit } from '@/types';
import { format, subDays, addDays, isSameMonth, startOfMonth, endOfMonth, eachDayOfInterval, isToday } from 'date-fns';
import { ru } from 'date-fns/locale';

export function HabitsView() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(new Date());

  async function fetchHabits() {
    try {
      const res = await fetch('/api/habits', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setHabits(data);
    } catch {
      toast.error('Не удалось загрузить привычки');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchHabits();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/habits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name: name.trim() }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Ошибка');
      }
      const habit = await res.json();
      setHabits((prev) => [{ ...habit, logs: [] }, ...prev]);
      setName('');
      toast.success('Привычка добавлена');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Ошибка создания');
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleLog(habitId: string, date: string) {
    try {
      const res = await fetch(`/api/habits/${habitId}/log`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ date }),
      });
      if (!res.ok) throw new Error('Failed');
      await fetchHabits();
      toast.success('Отметка обновлена');
    } catch {
      toast.error('Ошибка обновления');
    }
  }

  function getStreak(habit: Habit): number {
    const dates = new Set(habit.logs.filter((l) => l.completed).map((l) => l.date));
    let streak = 0;
    const today = format(new Date(), 'yyyy-MM-dd');
    for (let d = new Date(); d >= subDays(new Date(), 365); d.setDate(d.getDate() - 1)) {
      const key = format(d, 'yyyy-MM-dd');
      if (dates.has(key)) streak++;
      else if (key !== today) break;
    }
    return streak;
  }

  async function deleteHabit(id: string) {
    try {
      const res = await fetch(`/api/habits/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed');
      setHabits((prev) => prev.filter((h) => h.id !== id));
      toast.success('Привычка удалена');
    } catch {
      toast.error('Ошибка удаления');
    }
  }

  const monthStart = startOfMonth(calendarMonth);
  const monthEnd = endOfMonth(calendarMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const logSet = (habitId: string) => {
    const h = habits.find((x) => x.id === habitId);
    return new Set(h?.logs.filter((l) => l.completed).map((l) => l.date) ?? []);
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-8">
        <Skeleton className="h-8 w-48 mb-6" />
        <SkeletonList rows={5} />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        Привычки
      </h1>

      <Card>
        <CardHeader>
          <h2 className="font-semibold text-gray-900 dark:text-white">
            Новая привычка
          </h2>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="flex gap-3 flex-wrap">
            <Input
              placeholder="Название привычки"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="max-w-xs"
            />
            <Button type="submit" loading={submitting} disabled={!name.trim()}>
              Добавить
            </Button>
          </form>
        </CardContent>
      </Card>

      {habits.length === 0 ? (
        <Card>
          <EmptyState
            title="Нет привычек"
            description="Добавьте первую привычку и отмечайте выполнение каждый день"
            icon={<Flame className="w-6 h-6" />}
          />
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <h2 className="font-semibold text-gray-900 dark:text-white">
                Календарь
              </h2>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCalendarMonth((m) => subDays(m, 31))}
                >
                  ←
                </Button>
                <span className="py-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  {format(calendarMonth, 'LLLL yyyy', { locale: ru })}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCalendarMonth((m) => addDays(m, 31))}
                >
                  →
                </Button>
              </div>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 text-sm font-medium text-gray-500 dark:text-gray-400 w-40">
                      Привычка
                    </th>
                    {days.map((d) => (
                      <th
                        key={d.toISOString()}
                        className={cn(
                          'text-center py-2 text-xs w-8',
                          isToday(d) && 'bg-[var(--accent)]/10 text-[var(--accent)] font-semibold'
                        )}
                      >
                        {format(d, 'd')}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {habits.map((habit) => {
                    const set = logSet(habit.id);
                    return (
                      <tr key={habit.id} className="border-b border-border hover:bg-surface-muted/30">
                        <td className="py-2">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-medium text-gray-900 dark:text-white truncate">
                              {habit.name}
                            </span>
                            <span className="text-xs text-amber-500 dark:text-amber-400 shrink-0">
                              🔥 {getStreak(habit)}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteHabit(habit.id)}
                              className="text-red-500 hover:text-red-600 hover:bg-red-500/10 shrink-0 p-1"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                        {days.map((d) => {
                          const dateStr = format(d, 'yyyy-MM-dd');
                          const checked = set.has(dateStr);
                          return (
                            <td key={dateStr} className="py-1 text-center">
                              <button
                                type="button"
                                onClick={() => toggleLog(habit.id, dateStr)}
                                className={cn(
                                  'w-6 h-6 rounded mx-auto flex items-center justify-center text-xs transition',
                                  checked
                                    ? 'bg-green-500 text-white'
                                    : 'bg-surface-muted hover:bg-surface-muted/80 text-gray-400 dark:text-gray-500'
                                )}
                              >
                                {checked ? '✓' : ''}
                              </button>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
