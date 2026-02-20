/**
 * PATCH /api/finance/[id] - update entry
 * DELETE /api/finance/[id] - delete entry
 */
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { unauthorized, notFound, apiError, apiSuccess } from '@/lib/api';
import { oneOf, parseAmount, sanitizeString } from '@/lib/validation';
import { FINANCE_TYPES, type FinanceType } from '@/lib/constants';
import { logActivity } from '@/lib/activity';
import { logger } from '@/lib/logger';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const { id } = await params;
  const entry = await prisma.finance.findFirst({ where: { id, userId: user.userId } });
  if (!entry) return notFound('Запись не найдена');

  try {
    const body = await request.json().catch(() => ({}));
    const data: { type?: FinanceType; amount?: number; category?: string; description?: string | null; date?: Date } = {};
    if (oneOf(body.type, FINANCE_TYPES)) data.type = body.type;
    const amount = parseAmount(body.amount);
    if (amount !== null) data.amount = amount;
    if (typeof body.category === 'string' && body.category.trim()) data.category = body.category.trim();
    if (body.description !== undefined) data.description = body.description ? sanitizeString(body.description, 1000) : null;
    if (body.date) {
      const d = new Date(body.date);
      if (!Number.isNaN(d.getTime())) data.date = d;
    }

    const updated = await prisma.finance.update({ where: { id }, data });
    return apiSuccess(updated);
  } catch (e) {
    logger.error('Update finance error', { err: e });
    return apiError('Не удалось обновить запись', 500);
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const { id } = await params;
  const entry = await prisma.finance.findFirst({ where: { id, userId: user.userId } });
  if (!entry) return notFound('Запись не найдена');

  await prisma.finance.delete({ where: { id } });
  await logActivity(user.userId, 'finance_deleted', id, {});
  return apiSuccess({ ok: true });
}
