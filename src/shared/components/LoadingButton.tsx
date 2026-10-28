import React from 'react';

interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  variant?: 'primary' | 'brand' | 'secondary';
}

const variantClasses: Record<NonNullable<LoadingButtonProps['variant']>, string> = {
  primary: 'text-white',
  brand: 'text-white bg-brand-primary hover:shadow-glow-primary',
  secondary: 'text-slate-700 bg-slate-200/70 hover:bg-slate-300/70 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600',
};

export const LoadingButton: React.FC<LoadingButtonProps> = ({
  loading = false,
  disabled,
  className = '',
  children,
  variant = 'primary',
  ...props
}) => {
  const isDisabled = Boolean(disabled || loading);
  const base = 'inline-flex items-center justify-center gap-2 px-3 py-1.5 text-xs font-bold rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed';
  // Respect an explicit background class supplied by the consumer (e.g. bg-red-600
  // for destructive confirms) instead of overriding it with the inline primary color.
  const hasOwnBackground = /(^|\s)(bg-|bg\[)/.test(className);
  const primaryStyle = variant === 'primary' && !hasOwnBackground ? { backgroundColor: 'var(--primary-color)' } : {};
  const focusStyle = { '--tw-ring-color': 'var(--primary-color)' } as React.CSSProperties;
  const spinner = (
    <svg className="h-4 w-4 animate-spin text-current" viewBox="0 0 24 24" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  );
  return (
    <button
      {...props}
      disabled={isDisabled}
      aria-busy={loading}
      className={`${base} ${variantClasses[variant]} ${loading ? 'cursor-wait' : ''} ${className}`}
      style={{ ...primaryStyle, ...focusStyle }}
    >
      {loading && spinner}
      <span>{children}</span>
    </button>
  );
};

export default LoadingButton;
