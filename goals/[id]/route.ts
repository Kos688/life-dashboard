/**
 * PATCH /api/goals/[id] - update goal
 * DELETE /api/goals/[id] - delete goal
 */
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { unauthorized, notFound, apiError, apiSuccess } from '@/lib/api';
import { sanitizeTitle, oneOf, isValidDateString } from '@/lib/validation';
import { GOAL_STATUSES, type GoalStatus } from '@/lib/constants';
import { logActivity } from '@/lib/activity';
import { logger } from '@/lib/logger';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const { id } = await params;
  const goal = await prisma.goal.findFirst({ where: { id, userId: user.userId } });
  if (!goal) return notFound('Цель не найдена');

  try {
    const body = await request.json().catch(() => ({}));
    const data: { title?: string; progress?: number; status?: GoalStatus; deadline?: Date | null } = {};
    const title = sanitizeTitle(body.title);
    if (title) data.title = title;
    if (typeof body.progress === 'number') data.progress = Math.min(100, Math.max(0, body.progress));
    if (oneOf(body.status, GOAL_STATUSES)) data.status = body.status;
    if (body.deadline !== undefined) {
      data.deadline = body.deadline && isValidDateString(body.deadline) ? new Date(body.deadline) : null;
    }

    const updated = await prisma.goal.update({ where: { id }, data });
    await logActivity(user.userId, 'goal_updated', id, {});
    return apiSuccess(updated);
  } catch (e) {
    logger.error('Update goal error', { err: e });
    return apiError('Не удалось обновить цель', 500);
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const { id } = await params;
  const goal = await prisma.goal.findFirst({ where: { id, userId: user.userId } });
  if (!goal) return notFound('Цель не найдена');

  await prisma.goal.delete({ where: { id } });
  await logActivity(user.userId, 'goal_deleted', id, { title: goal.title });
  return apiSuccess({ ok: true });
}
