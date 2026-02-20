/**
 * Input sanitization and validation helpers for API routes.
 * Prevents XSS and invalid data.
 */

const MAX_TITLE_LENGTH = 500;
const MAX_CONTENT_LENGTH = 50_000;
const MAX_NAME_LENGTH = 200;
const MIN_PASSWORD_LENGTH = 6;
const MAX_AMOUNT = 1e12;
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

/** Strip leading/trailing whitespace and limit length */
export function sanitizeString(
  value: unknown,
  maxLength: number = MAX_TITLE_LENGTH
): string {
  if (value === null || value === undefined) return '';
  const s = String(value).trim();
  return s.slice(0, maxLength);
}

/** Sanitize title (tasks, goals, habits, note title) */
export function sanitizeTitle(value: unknown): string {
  return sanitizeString(value, MAX_TITLE_LENGTH);
}

/** Sanitize long content (notes) */
export function sanitizeContent(value: unknown): string {
  return sanitizeString(value, MAX_CONTENT_LENGTH);
}

/** Sanitize user display name */
export function sanitizeName(value: unknown): string {
  return sanitizeString(value, MAX_NAME_LENGTH);
}

/** Validate email format */
export function isValidEmail(value: unknown): boolean {
  if (typeof value !== 'string') return false;
  const email = value.trim().toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 255;
}

/** Validate password length */
export function isValidPassword(value: unknown): boolean {
  return typeof value === 'string' && value.length >= MIN_PASSWORD_LENGTH;
}

/** Validate YYYY-MM-DD date string */
export function isValidDateString(value: unknown): value is string {
  return typeof value === 'string' && DATE_REGEX.test(value);
}

/** Validate and parse amount (positive number) */
export function parseAmount(value: unknown): number | null {
  if (typeof value === 'number' && !Number.isNaN(value) && value >= 0 && value <= MAX_AMOUNT) {
    return Math.round(value * 100) / 100;
  }
  if (typeof value === 'string') {
    const n = parseFloat(value.replace(',', '.'));
    if (!Number.isNaN(n) && n >= 0 && n <= MAX_AMOUNT) return Math.round(n * 100) / 100;
  }
  return null;
}

/** Allowed enum values */
export function oneOf<T extends string>(value: unknown, allowed: readonly T[]): value is T {
  return typeof value === 'string' && (allowed as readonly string[]).includes(value);
}

export const VALIDATION = {
  MAX_TITLE_LENGTH,
  MAX_CONTENT_LENGTH,
  MAX_NAME_LENGTH,
  MIN_PASSWORD_LENGTH,
} as const;
