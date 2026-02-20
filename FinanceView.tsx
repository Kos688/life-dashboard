'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { Wallet, Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { SkeletonList } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { cn } from '@/lib/utils';
import type { Finance } from '@/types';
import { format } from 'date-fns';

const CATEGORIES = [
  'Еда',
  'Транспорт',
  'Жильё',
  'Развлечения',
  'Здоровье',
  'Одежда',
  'Другое',
];

export function FinanceView() {
  const [entries, setEntries] = useState<Finance[]>([]);
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function fetchFinance() {
    try {
      const res = await fetch('/api/finance?limit=200', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setEntries(data);
    } catch {
      toast.error('Не удалось загрузить данные');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchFinance();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const num = parseFloat(amount.replace(',', '.'));
    if (Number.isNaN(num) || num <= 0) {
      toast.error('Введите корректную сумму');
      return;
    }
    if (!category.trim()) {
      toast.error('Выберите категорию');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/finance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          type,
          amount: num,
          category: category.trim(),
          description: description.trim() || undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Ошибка');
      }
      const entry = await res.json();
      setEntries((prev) => [entry, ...prev]);
      setAmount('');
      setDescription('');
      toast.success(type === 'income' ? 'Доход добавлен' : 'Расход добавлен');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Ошибка');
    } finally {
      setSubmitting(false);
    }
  }

  async function deleteEntry(id: string) {
    try {
      const res = await fetch(`/api/finance/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed');
      setEntries((prev) => prev.filter((e) => e.id !== id));
      toast.success('Запись удалена');
    } catch {
      toast.error('Ошибка удаления');
    }
  }

  const income = entries.filter((e) => e.type === 'income').reduce((a, e) => a + e.amount, 0);
  const expense = entries.filter((e) => e.type === 'expense').reduce((a, e) => a + e.amount, 0);
  const balance = income - expense;

  const now = new Date();
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (6 - i));
    const dayStr = format(d, 'yyyy-MM-dd');
    const dayIncome = entries
      .filter((e) => e.type === 'income' && format(new Date(e.date), 'yyyy-MM-dd') === dayStr)
      .reduce((a, e) => a + e.amount, 0);
    const dayExpense = entries
      .filter((e) => e.type === 'expense' && format(new Date(e.date), 'yyyy-MM-dd') === dayStr)
      .reduce((a, e) => a + e.amount, 0);
    return {
      date: format(d, 'dd.MM'),
      income: dayIncome,
      expense: dayExpense,
    };
  });

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
        Финансы
      </h1>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-5">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
              Доход
            </p>
            <p className="mt-1 text-xl font-bold text-green-600 dark:text-green-400">
              +{income.toLocaleString('ru-RU')} ₽
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-red-500" />
              Расход
            </p>
            <p className="mt-1 text-xl font-bold text-red-600 dark:text-red-400">
              −{expense.toLocaleString('ru-RU')} ₽
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2">
              <Wallet className="w-4 h-4" />
              Баланс
            </p>
            <p
              className={cn(
                'mt-1 text-xl font-bold',
                balance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
              )}
            >
              {balance >= 0 ? '' : '−'}
              {Math.abs(balance).toLocaleString('ru-RU')} ₽
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <h2 className="font-semibold text-gray-900 dark:text-white">
            Добавить запись
          </h2>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="flex flex-col sm:flex-row gap-3 flex-wrap">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setType('income')}
                className={cn(
                  'px-3 py-2 rounded-lg text-sm font-medium transition',
                  type === 'income'
                    ? 'bg-green-500 text-white'
                    : 'bg-surface-muted text-gray-600 dark:text-gray-400 hover:bg-surface-muted/80'
                )}
              >
                Доход
              </button>
              <button
                type="button"
                onClick={() => setType('expense')}
                className={cn(
                  'px-3 py-2 rounded-lg text-sm font-medium transition',
                  type === 'expense'
                    ? 'bg-red-500 text-white'
                    : 'bg-surface-muted text-gray-600 dark:text-gray-400 hover:bg-surface-muted/80'
                )}
              >
                Расход
              </button>
            </div>
            <Input
              type="number"
              step="0.01"
              min="0"
              placeholder="Сумма"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-28"
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="px-3 py-2 rounded-lg border border-border bg-[var(--surface)] text-gray-900 dark:text-gray-100 text-sm min-w-[140px]"
            >
              <option value="">Категория</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <Input
              placeholder="Описание (необяз.)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="flex-1 min-w-[160px]"
            />
            <Button type="submit" loading={submitting} disabled={!amount || !category.trim()}>
              Добавить
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="font-semibold text-gray-900 dark:text-white">
            Динамика за 7 дней
          </h2>
        </CardHeader>
        <CardContent>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={last7} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--surface-elevated)',
                    border: '1px solid var(--border)',
                    borderRadius: 8,
                  }}
                  formatter={(value: number) => [`${value.toLocaleString('ru-RU')} ₽`, '']}
                />
                <Bar dataKey="income" fill="#22c55e" radius={[4, 4, 0, 0]} name="Доход" />
                <Bar dataKey="expense" fill="#ef4444" radius={[4, 4, 0, 0]} name="Расход" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {entries.length === 0 ? (
        <Card>
          <EmptyState
            title="Нет записей"
            description="Добавьте доход или расход выше"
            icon={<Wallet className="w-6 h-6" />}
          />
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-gray-900 dark:text-white">
              История ({entries.length})
            </h2>
          </CardHeader>
          <CardContent className="p-0">
            <ul className="divide-y divide-border max-h-96 overflow-y-auto">
              {entries.slice(0, 50).map((entry) => (
                <li
                  key={entry.id}
                  className="flex items-center gap-3 px-5 py-3 hover:bg-surface-muted/50 transition"
                >
                  <span
                    className={cn(
                      'font-medium w-20',
                      entry.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                    )}
                  >
                    {entry.type === 'income' ? '+' : '−'}
                    {entry.amount.toLocaleString('ru-RU')} ₽
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400 w-24">
                    {entry.category}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400 flex-1 truncate">
                    {entry.description || '—'}
                  </span>
                  <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0">
                    {format(new Date(entry.date), 'dd.MM.yyyy')}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteEntry(entry.id)}
                    className="text-red-500 hover:text-red-600 hover:bg-red-500/10 shrink-0"
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
