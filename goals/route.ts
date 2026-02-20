/**
 * GET /api/goals - list goals
 * POST /api/goals - create goal
 */
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { unauthorized, apiError, apiSuccess } from '@/lib/api';
import { sanitizeTitle, oneOf, isValidDateString } from '@/lib/validation';
import { GOAL_STATUSES, type GoalStatus } from '@/lib/constants';
import { logActivity } from '@/lib/activity';
import { logger } from '@/lib/logger';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const goals = await prisma.goal.findMany({
    where: { userId: user.userId },
    orderBy: { createdAt: 'desc' },
  });
  return apiSuccess(goals);
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  try {
    const body = await request.json().catch(() => ({}));
    const title = sanitizeTitle(body.title);
    if (!title) return apiError('Укажите название цели', 400);

    const progress = Math.min(100, Math.max(0, Number(body.progress) || 0));
    const status: GoalStatus = oneOf(body.status, GOAL_STATUSES) ? body.status : 'active';
    const deadline = body.deadline != null && isValidDateString(body.deadline)
      ? new Date(body.deadline)
      : null;

    const goal = await prisma.goal.create({
      data: { userId: user.userId, title, progress, status, deadline },
    });

    await logActivity(user.userId, 'goal_created', goal.id, { title: goal.title });

    return apiSuccess(goal, 201);
  } catch (e) {
    logger.error('Create goal error', { err: e });
    return apiError('Не удалось создать цель', 500);
  }
}
