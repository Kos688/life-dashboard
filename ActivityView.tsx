'use client';

import { useEffect, useState } from 'react';
import { History } from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { SkeletonList } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import type { ActivityLogItem } from '@/types';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

const ACTION_LABELS: Record<string, string> = {
  task_created: 'Создана задача',
  task_completed: 'Задача выполнена',
  task_deleted: 'Задача удалена',
  goal_created: 'Создана цель',
  goal_updated: 'Цель обновлена',
  goal_deleted: 'Цель удалена',
  habit_created: 'Добавлена привычка',
  habit_logged: 'Отмечена привычка',
  habit_deleted: 'Привычка удалена',
  finance_created: 'Добавлена запись в финансах',
  finance_deleted: 'Запись в финансах удалена',
  note_created: 'Создана заметка',
  note_updated: 'Заметка обновлена',
  note_deleted: 'Заметка удалена',
  settings_updated: 'Настройки обновлены',
};

export function ActivityView() {
  const [items, setItems] = useState<ActivityLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);

  async function load(cursor?: string) {
    const url = cursor ? `/api/activity?cursor=${cursor}&limit=30` : '/api/activity?limit=30';
    const res = await fetch(url, { credentials: 'include' });
    if (!res.ok) {
      setError('Не удалось загрузить историю');
      return;
    }
    const data = await res.json();
    setItems((prev) => (cursor ? [...prev, ...data.items] : data.items));
    setNextCursor(data.nextCursor);
    setHasMore(data.hasMore ?? false);
  }

  useEffect(() => {
    let cancelled = false;
    load().then(() => {
      if (!cancelled) setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading && items.length === 0) {
    return (
      <div className="p-6 lg:p-8">
        <Skeleton className="h-8 w-48 mb-6" />
        <SkeletonList rows={10} />
      </div>
    );
  }

  if (error && items.length === 0) {
    return (
      <div className="p-6 lg:p-8">
        <EmptyState
          title={error}
          description="Попробуйте обновить страницу"
          icon={<History className="w-6 h-6" />}
        />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        История действий
      </h1>

      <Card>
        <CardHeader>
          <h2 className="font-semibold text-gray-900 dark:text-white">
            Лента активности
          </h2>
        </CardHeader>
        <CardContent className="p-0">
          {items.length === 0 ? (
            <EmptyState
              title="Пока нет действий"
              description="Ваши действия будут отображаться здесь"
              icon={<History className="w-6 h-6" />}
            />
          ) : (
            <>
              <ul className="divide-y divide-border">
                {items.map((log) => (
                  <li
                    key={log.id}
                    className="px-5 py-3 hover:bg-surface-muted/50 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {ACTION_LABELS[log.action] ?? log.action}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {format(new Date(log.createdAt), 'dd MMM yyyy, HH:mm', { locale: ru })}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
              {hasMore && nextCursor && (
                <div className="p-4 border-t border-border">
                  <button
                    type="button"
                    onClick={() => load(nextCursor)}
                    className="text-sm text-[var(--accent)] hover:underline"
                  >
                    Загрузить ещё
                  </button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
