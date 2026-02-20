/**
 * GET /api/analytics - extended stats for Analytics page (trends, activity over time)
 */
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { unauthorized, apiSuccess } from '@/lib/api';
import { logger } from '@/lib/logger';

function getDaysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  try {
    const { searchParams } = new URL(request.url);
    const days = Math.min(90, Math.max(7, parseInt(searchParams.get('days') ?? '30', 10) || 30));

    const since = getDaysAgo(days);

    const [tasks, goals, habits, finances, activityLogs] = await Promise.all([
      prisma.task.findMany({
        where: { userId: user.userId },
        select: { completed: true, createdAt: true, updatedAt: true },
      }),
      prisma.goal.findMany({
        where: { userId: user.userId },
        select: { progress: true, status: true, createdAt: true },
      }),
      prisma.habit.findMany({
        where: { userId: user.userId },
        include: { logs: { where: { date: { gte: since } } } },
      }),
      prisma.finance.findMany({
        where: { userId: user.userId, date: { gte: new Date(since) } },
        select: { type: true, amount: true, date: true, category: true },
      }),
      prisma.activityLog.findMany({
        where: { userId: user.userId, createdAt: { gte: new Date(since) } },
        orderBy: { createdAt: 'desc' },
        take: 200,
      }),
    ]);

    const dayKeys = Array.from({ length: days }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (days - 1 - i));
      return d.toISOString().slice(0, 10);
    });

    const tasksByDay: Record<string, number> = {};
    const habitsByDay: Record<string, number> = {};
    const incomeByDay: Record<string, number> = {};
    const expenseByDay: Record<string, number> = {};
    dayKeys.forEach((key) => {
      tasksByDay[key] = 0;
      habitsByDay[key] = 0;
      incomeByDay[key] = 0;
      expenseByDay[key] = 0;
    });

    for (const t of tasks) {
      if (t.completed && t.updatedAt) {
        const key = new Date(t.updatedAt).toISOString().slice(0, 10);
        if (key in tasksByDay) tasksByDay[key]++;
      }
    }

    for (const h of habits) {
      for (const log of h.logs) {
        if (log.completed && log.date in habitsByDay) habitsByDay[log.date]++;
      }
    }

    for (const f of finances) {
      const key = new Date(f.date).toISOString().slice(0, 10);
      if (f.type === 'income') incomeByDay[key] = (incomeByDay[key] ?? 0) + f.amount;
      else expenseByDay[key] = (expenseByDay[key] ?? 0) + f.amount;
    }

    const taskTrend = dayKeys.map((date) => ({ date, count: tasksByDay[date] ?? 0 }));
    const habitTrend = dayKeys.map((date) => ({ date, count: habitsByDay[date] ?? 0 }));
    const incomeTrend = dayKeys.map((date) => ({ date, amount: incomeByDay[date] ?? 0 }));
    const expenseTrend = dayKeys.map((date) => ({ date, amount: expenseByDay[date] ?? 0 }));

    const actionCounts: Record<string, number> = {};
    for (const log of activityLogs) {
      actionCounts[log.action] = (actionCounts[log.action] ?? 0) + 1;
    }

    return apiSuccess({
      days,
      taskTrend,
      habitTrend,
      incomeTrend,
      expenseTrend,
      actionCounts,
      summary: {
        tasksTotal: tasks.length,
        tasksCompleted: tasks.filter((t) => t.completed).length,
        goalsTotal: goals.length,
        habitsTotal: habits.length,
        activityTotal: activityLogs.length,
      },
    });
  } catch (e) {
    logger.error('Analytics error', { err: e });
    return apiSuccess({
      days: 0,
      taskTrend: [],
      habitTrend: [],
      incomeTrend: [],
      expenseTrend: [],
      actionCounts: {},
      summary: { tasksTotal: 0, tasksCompleted: 0, goalsTotal: 0, habitsTotal: 0, activityTotal: 0 },
    });
  }
}
