/**
 * POST /api/habits/[id]/log - toggle or set log for a date (YYYY-MM-DD)
 */
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { unauthorized, notFound, apiError, apiSuccess } from '@/lib/api';
import { isValidDateString } from '@/lib/validation';
import { logActivity } from '@/lib/activity';
import { logger } from '@/lib/logger';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const { id } = await params;
  const habit = await prisma.habit.findFirst({ where: { id, userId: user.userId } });
  if (!habit) return notFound('Привычка не найдена');

  try {
    const body = await request.json().catch(() => ({}));
    const date = body.date ?? new Date().toISOString().slice(0, 10);
    if (!isValidDateString(date)) {
      return apiError('Формат даты: YYYY-MM-DD', 400);
    }

    const existing = await prisma.habitLog.findUnique({
      where: { habitId_date: { habitId: id, date } },
    });

    if (existing) {
      await prisma.habitLog.delete({
        where: { habitId_date: { habitId: id, date } },
      });
      return apiSuccess({ date, completed: false });
    }

    await prisma.habitLog.create({
      data: { habitId: id, date, completed: true },
    });
    await logActivity(user.userId, 'habit_logged', id, { date });
    return apiSuccess({ date, completed: true });
  } catch (e) {
    logger.error('Habit log error', { err: e });
    return apiError('Не удалось обновить отметку', 500);
  }
}
