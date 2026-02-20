'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Check, Trash2, Calendar } from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { SkeletonList } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { cn } from '@/lib/utils';
import type { Task } from '@/types';
import { formatDate } from '@/lib/utils';

const PRIORITY_LABEL: Record<string, string> = {
  low: 'Низкий',
  medium: 'Средний',
  high: 'Высокий',
};

export function TasksView() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [deadline, setDeadline] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function fetchTasks() {
    try {
      const res = await fetch('/api/tasks', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setTasks(data);
    } catch {
      toast.error('Не удалось загрузить задачи');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTasks();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title: title.trim(),
          priority,
          deadline: deadline || undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Ошибка');
      }
      const task = await res.json();
      setTasks((prev) => [task, ...prev]);
      setTitle('');
      setDeadline('');
      setPriority('medium');
      toast.success('Задача создана');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Ошибка создания');
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleComplete(task: Task) {
    try {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ completed: !task.completed }),
      });
      if (!res.ok) throw new Error('Failed');
      const updated = await res.json();
      setTasks((prev) => prev.map((t) => (t.id === task.id ? updated : t)));
      toast.success(task.completed ? 'Задача в работе' : 'Задача выполнена');
    } catch {
      toast.error('Ошибка обновления');
    }
  }

  async function deleteTask(id: string) {
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed');
      setTasks((prev) => prev.filter((t) => t.id !== id));
      toast.success('Задача удалена');
    } catch {
      toast.error('Ошибка удаления');
    }
  }

  if (loading) {
    return (
      <div className="p-6 lg:p-8">
        <Skeleton className="h-8 w-48 mb-6" />
        <SkeletonList rows={8} />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        Задачи
      </h1>

      <Card>
        <CardHeader>
          <h2 className="font-semibold text-gray-900 dark:text-white">
            Новая задача
          </h2>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="flex flex-col sm:flex-row gap-3 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder="Название задачи"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}
                className="px-3 py-2 rounded-lg border border-border bg-[var(--surface)] text-gray-900 dark:text-gray-100 text-sm"
              >
                <option value="low">Низкий</option>
                <option value="medium">Средний</option>
                <option value="high">Высокий</option>
              </select>
              <Input
                type="date"
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

      {tasks.length === 0 ? (
        <Card>
          <EmptyState
            title="Нет задач"
            description="Добавьте первую задачу выше"
            icon={<Check className="w-6 h-6" />}
          />
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-gray-900 dark:text-white">
              Список ({tasks.length})
            </h2>
          </CardHeader>
          <CardContent className="p-0">
            <ul className="divide-y divide-border">
              {tasks.map((task) => (
                <li
                  key={task.id}
                  className={cn(
                    'flex items-center gap-3 px-5 py-3 hover:bg-surface-muted/50 transition',
                    task.completed && 'opacity-70'
                  )}
                >
                  <button
                    type="button"
                    onClick={() => toggleComplete(task)}
                    className={cn(
                      'w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition',
                      task.completed
                        ? 'bg-green-500 border-green-500 text-white'
                        : 'border-gray-400 dark:border-gray-500 hover:border-[var(--accent)]'
                    )}
                  >
                    {task.completed && <Check className="w-4 h-4" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <span
                      className={cn(
                        'font-medium text-gray-900 dark:text-white',
                        task.completed && 'line-through text-gray-500 dark:text-gray-400'
                      )}
                    >
                      {task.title}
                    </span>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                      <span
                        className={cn(
                          task.priority === 'high' && 'text-red-500',
                          task.priority === 'medium' && 'text-amber-500',
                          task.priority === 'low' && 'text-gray-500'
                        )}
                      >
                        {PRIORITY_LABEL[task.priority]}
                      </span>
                      {task.deadline && (
                        <>
                          <Calendar className="w-3.5 h-3.5" />
                          {formatDate(task.deadline)}
                        </>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteTask(task.id)}
                    className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
