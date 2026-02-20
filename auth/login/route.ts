/**
 * POST /api/auth/login
 * Authenticate user and set JWT cookie.
 */
import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
import { createToken, getAuthCookieOptions } from '@/lib/auth';
import { apiError, apiSuccess } from '@/lib/api';
import { isValidEmail } from '@/lib/validation';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { email, password } = body;

    if (!email || !password) {
      return apiError('Укажите email и пароль', 400);
    }

    const emailNorm = String(email).trim().toLowerCase();
    if (!isValidEmail(emailNorm)) {
      return apiError('Некорректный email', 400);
    }

    const user = await prisma.user.findUnique({ where: { email: emailNorm } });
    if (!user) {
      return apiError('Неверный email или пароль', 401);
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return apiError('Неверный email или пароль', 401);
    }

    const token = await createToken({ userId: user.id, email: user.email });
    const response = apiSuccess({
      user: { id: user.id, email: user.email, name: user.name },
    });

    response.cookies.set({
      ...getAuthCookieOptions(),
      value: token,
    });

    return response;
  } catch (e) {
    logger.error('Login error', { err: e });
    return apiError('Ошибка входа', 500);
  }
}
