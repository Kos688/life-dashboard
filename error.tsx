'use client';

/**
 * Global error boundary. Catches runtime errors in the app and shows a fallback UI.
 */
import { useEffect } from 'react';
import { Button } from '@/components/ui/Button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      console.error('App error:', error);
    }
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-surface">
      <div className="text-center max-w-md">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">
          Что-то пошло не так
        </h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Произошла ошибка. Попробуйте обновить страницу или вернуться на главную.
        </p>
        <div className="mt-6 flex gap-3 justify-center">
          <Button onClick={reset}>Попробовать снова</Button>
          <Button variant="secondary" onClick={() => (window.location.href = '/dashboard')}>
            На главную
          </Button>
        </div>
      </div>
    </div>
  );
}
