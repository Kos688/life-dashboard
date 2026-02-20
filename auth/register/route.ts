/**
 * POST /api/auth/register
 * Create new user account.
 */
import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
import { createToken, getAuthCookieOptions } from '@/lib/auth';
import { apiError, apiSuccess } from '@/lib/api';
import { isValidEmail, isValidPassword, sanitizeName } from '@/lib/validation';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { email, password, name } = body;

    if (!email || !password || !name) {
      return apiError('Укажите email, пароль и имя', 400);
    }

    const emailNorm = String(email).trim().toLowerCase();
    if (!isValidEmail(emailNorm)) {
      return apiError('Некорректный email', 400);
    }
    if (!isValidPassword(password)) {
      return apiError('Пароль не менее 6 символов', 400);
    }

    const nameSafe = sanitizeName(name);
    if (!nameSafe) return apiError('Укажите имя', 400);

    const existing = await prisma.user.findUnique({ where: { email: emailNorm } });
    if (existing) {
      return apiError('Пользователь с таким email уже существует', 409);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email: emailNorm,
        password: hashedPassword,
        name: nameSafe,
      },
    });

    const token = await createToken({ userId: user.id, email: user.email });
    const response = apiSuccess(
      { user: { id: user.id, email: user.email, name: user.name } },
      201
    );

    response.cookies.set({
      ...getAuthCookieOptions(),
      value: token,
    });

    return response;
  } catch (e) {
    logger.error('Register error', { err: e });
    return apiError('Ошибка регистрации', 500);
  }
}
