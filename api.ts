/**
 * Shared API response helpers and types.
 */
import { NextResponse } from 'next/server';

export type ApiError = {
  error: string;
  code?: number;
};

/** Standard JSON error response */
export function apiError(message: string, status: number = 400): NextResponse<ApiError> {
  return NextResponse.json({ error: message }, { status });
}

/** Unauthorized (401) */
export function unauthorized(message: string = 'Unauthorized'): NextResponse<ApiError> {
  return apiError(message, 401);
}

/** Forbidden (403) */
export function forbidden(message: string = 'Forbidden'): NextResponse<ApiError> {
  return apiError(message, 403);
}

/** Not found (404) */
export function notFound(message: string = 'Not found'): NextResponse<ApiError> {
  return apiError(message, 404);
}

/** Success JSON with optional status */
export function apiSuccess<T>(data: T, status: number = 200): NextResponse<T> {
  return NextResponse.json(data, { status });
}
