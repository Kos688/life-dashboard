/**
 * GET /api/habits - list habits with recent logs
 * POST /api/habits - create habit
 */
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { unauthorized, apiError, apiSuccess } from '@/lib/api';
import { sanitizeTitle } from '@/lib/validation';
import { logActivity } from '@/lib/activity';
import { logger } from '@/lib/logger';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const habits = await prisma.habit.findMany({
    where: { userId: user.userId },
    orderBy: { createdAt: 'desc' },
    include: { logs: { orderBy: { date: 'desc' }, take: 90 } },
  });
  return apiSuccess(habits);
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  try {
    const body = await request.json().catch(() => ({}));
    const name = sanitizeTitle(body.name);
    if (!name) return apiError('Укажите название привычки', 400);

    const habit = await prisma.habit.create({
      data: { userId: user.userId, name },
    });
    await logActivity(user.userId, 'habit_created', habit.id, { name: habit.name });
    return apiSuccess(habit, 201);
  } catch (e) {
    logger.error('Create habit error', { err: e });
    return apiError('Не удалось создать привычку', 500);
  }
}
