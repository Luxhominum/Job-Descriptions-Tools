import React from 'react';
import clsx from 'clsx';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'neutral' | 'outline';
  size?: 'xs' | 'sm' | 'md';
  className?: string;
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'sm',
  className,
  icon,
}) => {
  const variantStyles = {
    primary: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-zinc-800 dark:text-zinc-200 dark:border-zinc-700',
    secondary: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-zinc-800 dark:text-zinc-200 dark:border-zinc-700',
    warning: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700',
    danger: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-zinc-800 dark:text-zinc-100 dark:border-zinc-700',
    neutral: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700',
    outline: 'bg-transparent text-slate-600 border-slate-300 dark:text-zinc-400 dark:border-zinc-700',
  };

  const sizeStyles = {
    xs: 'text-[10px] px-1.5 py-0.5 font-medium rounded',
    sm: 'text-xs px-2 py-0.5 font-medium rounded-md',
    md: 'text-sm px-2.5 py-1 font-semibold rounded-lg',
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 border transition-colors',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {icon && <span className="inline-flex shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};
