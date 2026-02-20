'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Target, Trash2, Calendar } from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { SkeletonList } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { cn } from '@/lib/utils';
import type { Goal } from '@/types';
import { formatDate } from '@/lib/utils';

const STATUS_LABEL: Record<string, string> = {
  active: 'Активна',
  completed: 'Завершена',
  paused: 'На паузе',
};

export function GoalsView() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<'active' | 'completed' | 'paused'>('active');
  const [deadline, setDeadline] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function fetchGoals() {
    try {
      const res = await fetch('/api/goals', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setGoals(data);
    } catch {
      toast.error('Не удалось загрузить цели');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchGoals();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title: title.trim(),
          progress: Math.min(100, Math.max(0, progress)),
          status,
          deadline: deadline || undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Ошибка');
      }
      const goal = await res.json();
      setGoals((prev) => [goal, ...prev]);
      setTitle('');
      setProgress(0);
      setStatus('active');
      setDeadline('');
      toast.success('Цель создана');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Ошибка создания');
    } finally {
      setSubmitting(false);
    }
  }

  async function updateProgress(goal: Goal, newProgress: number) {
    try {
      const res = await fetch(`/api/goals/${goal.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ progress: Math.min(100, Math.max(0, newProgress)) }),
      });
      if (!res.ok) throw new Error('Failed');
      const updated = await res.json();
      setGoals((prev) => prev.map((g) => (g.id === goal.id ? updated : g)));
      toast.success('Прогресс обновлён');
    } catch {
      toast.error('Ошибка обновления');
    }
  }

  async function updateStatus(goal: Goal, newStatus: 'active' | 'completed' | 'paused') {
    try {
      const res = await fetch(`/api/goals/${goal.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error('Failed');
      const updated = await res.json();
      setGoals((prev) => prev.map((g) => (g.id === goal.id ? updated : g)));
      toast.success('Статус обновлён');
    } catch {
      toast.error('Ошибка обновления');
    }
  }

  async function deleteGoal(id: string) {
    try {
      const res = await fetch(`/api/goals/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed');
      setGoals((prev) => prev.filter((g) => g.id !== id));
      toast.success('Цель удалена');
    } catch {
      toast.error('Ошибка удаления');
    }
  }

  if (loading) {
    return (
      <div className="p-6 lg:p-8">
        <Skeleton className="h-8 w-48 mb-6" />
        <SkeletonList rows={6} />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        Цели
      </h1>

      <Card>
        <CardHeader>
          <h2 className="font-semibold text-gray-900 dark:text-white">
            Новая цель
          </h2>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="space-y-4">
            <Input
              placeholder="Название цели"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <div className="flex flex-wrap gap-4 items-end">
              <div className="w-32">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Прогресс %
                </label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={progress}
                  onChange={(e) => setProgress(Number(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-[var(--surface)] text-gray-900 dark:text-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Статус
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as 'active' | 'completed' | 'paused')}
                  className="px-3 py-2 rounded-lg border border-border bg-[var(--surface)] text-gray-900 dark:text-gray-100 text-sm"
                >
                  <option value="active">Активна</option>
                  <option value="completed">Завершена</option>
                  <option value="paused">На паузе</option>
                </select>
              </div>
              <Input
                type="date"
                label="Дедлайн"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-40"
              />
              <Button type="submit" loading={submitting} disabled={!title.trim()}>
                Добавить
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {goals.length === 0 ? (
        <Card>
          <EmptyState
            title="Нет целей"
            description="Добавьте первую цель выше"
            icon={<Target className="w-6 h-6" />}
          />
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-gray-900 dark:text-white">
              Список ({goals.length})
            </h2>
          </CardHeader>
          <CardContent className="p-0">
            <ul className="divide-y divide-border">
              {goals.map((goal) => (
                <li key={goal.id} className="px-5 py-4 hover:bg-surface-muted/50 transition">
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {goal.title}
                        </span>
                        <span
                          className={cn(
                            'text-xs px-2 py-0.5 rounded-full',
                            goal.status === 'active' && 'bg-green-500/20 text-green-600 dark:text-green-400',
                            goal.status === 'completed' && 'bg-gray-500/20 text-gray-600 dark:text-gray-400',
                            goal.status === 'paused' && 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                          )}
                        >
                          {STATUS_LABEL[goal.status]}
                        </span>
                        {goal.deadline && (
                          <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {formatDate(goal.deadline)}
                          </span>
                        )}
                      </div>
                      <div className="mt-2 flex items-center gap-3">
                        <div className="flex-1 max-w-xs h-2 bg-surface-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[var(--accent)] rounded-full transition-all"
                            style={{ width: `${goal.progress}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-500 dark:text-gray-400 w-10">
                          {goal.progress}%
                        </span>
                        <div className="flex gap-1">
                          {[0, 25, 50, 75, 100].map((p) => (
                            <button
                              key={p}
                              type="button"
                              onClick={() => updateProgress(goal, p)}
                              className="text-xs px-1.5 py-0.5 rounded bg-surface-muted hover:bg-[var(--accent)]/20 text-gray-600 dark:text-gray-400 hover:text-[var(--accent)]"
                            >
                              {p}%
                            </button>
                          ))}
                        </div>
                        <select
                          value={goal.status}
                          onChange={(e) => updateStatus(goal, e.target.value as 'active' | 'completed' | 'paused')}
                          className="text-xs px-2 py-1 rounded border border-border bg-[var(--surface)] text-gray-700 dark:text-gray-300"
                        >
                          <option value="active">Активна</option>
                          <option value="completed">Завершена</option>
                          <option value="paused">На паузе</option>
                        </select>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteGoal(goal.id)}
                      className="text-red-500 hover:text-red-600 hover:bg-red-500/10 shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
