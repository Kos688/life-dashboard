/**
 * Activity logging: write user actions to ActivityLog for history and analytics.
 */
import { prisma } from '@/lib/db';
import type { ActivityAction } from '@/lib/constants';

export type ActivityMeta = Record<string, string | number | boolean | null>;

/** Log an action for a user. Fire-and-forget; errors are logged but do not fail the request. */
export async function logActivity(
  userId: string,
  action: ActivityAction,
  entityId?: string | null,
  meta?: ActivityMeta | null
): Promise<void> {
  try {
    await prisma.activityLog.create({
      data: {
        userId,
        action,
        entityId: entityId ?? null,
        meta: meta ? JSON.stringify(meta) : null,
      },
    });
  } catch (err) {
    // Don't fail the main request if logging fails
    const { logger } = await import('@/lib/logger');
    logger.error('Activity log failed', { userId, action, err });
  }
}
