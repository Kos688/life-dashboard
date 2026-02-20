import { clsx, type ClassValue } from 'clsx';

/** Merge class names with Tailwind-friendly handling */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}

/** Format date for display */
export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/** Format date as YYYY-MM-DD for inputs / habit logs */
export function formatDateISO(date: Date): string {
  return date.toISOString().slice(0, 10);
}
