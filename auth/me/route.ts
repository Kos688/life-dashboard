/**
 * GET /api/auth/me
 * Return current user from JWT (for session check).
 */
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { unauthorized, apiSuccess, apiError } from '@/lib/api';
import { logger } from '@/lib/logger';

export async function GET() {
  const payload = await getCurrentUser();
  if (!payload) return unauthorized();

  try {
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, name: true },
    });
    if (!user) return unauthorized();
    return apiSuccess({ user });
  } catch (e) {
    logger.error('Me error', { err: e });
    return apiError('Не удалось загрузить пользователя', 500);
  }
}
