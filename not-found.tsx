import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-surface">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">404</h1>
      <p className="mt-2 text-gray-500 dark:text-gray-400">Страница не найдена</p>
      <Link
        href="/dashboard"
        className="mt-6 px-4 py-2 rounded-lg bg-[var(--accent)] text-white font-medium hover:opacity-90 transition"
      >
        На главную
      </Link>
    </div>
  );
}
