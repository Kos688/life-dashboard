/**
 * GET /api/dashboard/stats - aggregated stats for dashboard home
 */
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { unauthorized, apiSuccess } from '@/lib/api';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const [tasks, goals, habits, finances] = await Promise.all([
    prisma.task.findMany({ where: { userId: user.userId }, select: { completed: true } }),
    prisma.goal.findMany({ where: { userId: user.userId }, select: { progress: true, status: true } }),
    prisma.habit.findMany({
      where: { userId: user.userId },
      include: { logs: { where: { date: { gte: getDaysAgo(30) } } } },
    }),
    prisma.finance.findMany({ where: { userId: user.userId }, select: { type: true, amount: true, date: true } }),
  ]);

  const tasksTotal = tasks.length;
  const tasksCompleted = tasks.filter((t) => t.completed).length;
  const goalsActive = goals.filter((g) => g.status === 'active').length;
  const goalsCompleted = goals.filter((g) => g.status === 'completed').length;
  const avgGoalProgress =
    goals.length > 0 ? Math.round(goals.reduce((a, g) => a + g.progress, 0) / goals.length) : 0;

  let income = 0;
  let expense = 0;
  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const byCategory: Record<string, number> = {};
  for (const f of finances) {
    if (f.type === 'income') income += f.amount;
    else {
      expense += f.amount;
      if (f.date >= thisMonthStart) {
        byCategory[f.category] = (byCategory[f.category] || 0) + f.amount;
      }
    }
  }
  const balance = income - expense;

  const habitStreaks = habits.map((h) => {
    const dates = new Set(h.logs.filter((l) => l.completed).map((l) => l.date));
    let streak = 0;
    const today = new Date().toISOString().slice(0, 10);
    for (let d = new Date(); d >= new Date(Date.now() - 365 * 24 * 60 * 60 * 1000); d.setDate(d.getDate() - 1)) {
      const key = d.toISOString().slice(0, 10);
      if (dates.has(key)) streak++;
      else if (key !== today) break;
    }
    return { habitId: h.id, name: h.name, streak };
  });

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().slice(0, 10);
  });
  const activityByDay = last7Days.map((date) => {
    const taskCount = 0; // could count tasks completed that day if we had completedAt
    const habitCount = habits.reduce(
      (acc, h) => acc + (h.logs.some((l) => l.date === date) ? 1 : 0),
      0
    );
    return { date, tasks: taskCount, habits: habitCount, total: taskCount + habitCount };
  });

  return apiSuccess({
    tasks: { total: tasksTotal, completed: tasksCompleted },
    goals: { total: goals.length, active: goalsActive, completed: goalsCompleted, avgProgress: avgGoalProgress },
    habits: { total: habits.length, streaks: habitStreaks },
    finance: { balance, income, expense, byCategory: Object.entries(byCategory).map(([name, value]) => ({ name, value })) },
    activity: activityByDay,
  });
}

function getDaysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}
