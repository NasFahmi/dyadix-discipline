import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'accent' | 'destructive' | 'warning' | 'info' | 'outline';
  size?: 'xs' | 'sm';
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  className,
  variant = 'default',
  size = 'xs',
  dot = false,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center font-mono font-medium rounded-full uppercase tracking-wider select-none';

  const variants = {
    default: 'bg-muted text-muted-foreground border border-border/60',
    accent: 'bg-accent/15 text-accent border border-accent/40 shadow-glow-accent',
    destructive: 'bg-destructive/15 text-destructive border border-destructive/40 shadow-glow-destructive',
    warning: 'bg-warning/15 text-warning border border-warning/40 shadow-glow-warning',
    info: 'bg-info/15 text-info border border-info/40 shadow-glow-info',
    outline: 'bg-transparent text-muted-foreground border border-border',
  };

  const sizes = {
    xs: 'text-[10px] px-1.5 py-0.5 gap-1',
    sm: 'text-xs px-2 py-0.5 gap-1.5',
  };

  const dotColors = {
    default: 'bg-muted-foreground',
    accent: 'bg-accent animate-pulse',
    destructive: 'bg-destructive animate-pulse',
    warning: 'bg-warning animate-pulse',
    info: 'bg-info animate-pulse',
    outline: 'bg-muted-foreground',
  };

  return (
    <span className={twMerge(clsx(baseStyles, variants[variant], sizes[size], className))} {...props}>
      {dot && <span className={clsx('w-1.5 h-1.5 rounded-full shrink-0', dotColors[variant])} />}
      {children}
    </span>
  );
};
