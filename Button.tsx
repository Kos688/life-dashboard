import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export function Button({
  className,
  variant = 'primary',
  size = 'md',
  loading,
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--surface)] disabled:opacity-50 disabled:pointer-events-none',
        variant === 'primary' &&
          'bg-[var(--accent)] text-white hover:opacity-90 focus:ring-[var(--accent)]',
        variant === 'secondary' &&
          'bg-surface-elevated border border-border text-gray-700 dark:text-gray-200 hover:bg-surface-muted focus:ring-gray-400',
        variant === 'ghost' &&
          'hover:bg-surface-muted text-gray-700 dark:text-gray-200 focus:ring-gray-400',
        variant === 'danger' &&
          'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
        size === 'sm' && 'px-3 py-1.5 text-sm',
        size === 'md' && 'px-4 py-2 text-sm',
        size === 'lg' && 'px-6 py-3 text-base',
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        children
      )}
    </button>
  );
}
