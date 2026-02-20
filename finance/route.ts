/**
 * GET /api/finance - list finance entries (optional: filter by type)
 * POST /api/finance - create income/expense
 */
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { unauthorized, apiError, apiSuccess } from '@/lib/api';
import { oneOf } from '@/lib/validation';
import { parseAmount } from '@/lib/validation';
import { FINANCE_TYPES, type FinanceType } from '@/lib/constants';
import { sanitizeTitle, sanitizeString } from '@/lib/validation';
import { logActivity } from '@/lib/activity';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const limit = Math.min(500, Math.max(1, parseInt(searchParams.get('limit') ?? '100', 10) || 100));

  const where: { userId: string; type?: FinanceType } = { userId: user.userId };
  if (oneOf(type, FINANCE_TYPES)) where.type = type;

  const finances = await prisma.finance.findMany({
    where,
    orderBy: { date: 'desc' },
    take: limit,
  });
  return apiSuccess(finances);
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  try {
    const body = await request.json().catch(() => ({}));
    const type: FinanceType | undefined = oneOf(body.type, FINANCE_TYPES) ? body.type : undefined;
    if (!type) return apiError('Укажите тип: доход или расход', 400);

    const amount = parseAmount(body.amount);
    if (amount === null) return apiError('Укажите корректную сумму', 400);

    const category = sanitizeTitle(body.category);
    if (!category) return apiError('Укажите категорию', 400);

    const description = body.description != null ? sanitizeString(body.description, 1000) : null;
    const date = body.date ? new Date(body.date) : new Date();
    if (Number.isNaN(date.getTime())) return apiError('Некорректная дата', 400);

    const finance = await prisma.finance.create({
      data: {
        userId: user.userId,
        type,
        amount,
        category,
        description: description || null,
        date,
      },
    });

    await logActivity(user.userId, 'finance_created', finance.id, { type, amount: finance.amount });

    return apiSuccess(finance, 201);
  } catch (e) {
    logger.error('Create finance error', { err: e });
    return apiError('Не удалось добавить запись', 500);
  }
}
