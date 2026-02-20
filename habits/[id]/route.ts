/**
 * PATCH /api/habits/[id] - update habit name
 * DELETE /api/habits/[id] - delete habit
 */
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { unauthorized, notFound, apiError, apiSuccess } from '@/lib/api';
import { sanitizeTitle } from '@/lib/validation';
import { logActivity } from '@/lib/activity';
import { logger } from '@/lib/logger';

export async function PATCH(
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
    const name = sanitizeTitle(body.name);
    if (name) {
      const updated = await prisma.habit.update({ where: { id }, data: { name } });
      return apiSuccess(updated);
    }
    return apiSuccess(habit);
  } catch (e) {
    logger.error('Update habit error', { err: e });
    return apiError('Не удалось обновить привычку', 500);
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const { id } = await params;
  const habit = await prisma.habit.findFirst({ where: { id, userId: user.userId } });
  if (!habit) return notFound('Привычка не найдена');

  await prisma.habit.delete({ where: { id } });
  await logActivity(user.userId, 'habit_deleted', id, { name: habit.name });
  return apiSuccess({ ok: true });
}
