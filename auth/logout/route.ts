/**
 * POST /api/auth/logout
 * Clear auth cookie.
 */
import { NextResponse } from 'next/server';
import { COOKIE_NAME } from '@/lib/auth';
import { apiSuccess } from '@/lib/api';

export async function POST() {
  const response = apiSuccess({ ok: true });
  response.cookies.set({
    name: COOKIE_NAME,
    value: '',
    path: '/',
    maxAge: 0,
  });
  return response;
}
