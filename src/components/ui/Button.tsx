import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'destructive' | 'outline' | 'ghost';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = 'secondary',
  size = 'sm',
  icon,
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-md transition-all duration-200 cursor-pointer select-none focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-1 focus:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none active:scale-[0.98]';

  const variants = {
    primary: 'bg-primary text-foreground hover:bg-secondary border border-border/80 shadow-sm',
    secondary: 'bg-secondary text-foreground hover:bg-slate-800 border border-slate-700/60 shadow-sm',
    accent: 'bg-accent text-accent-foreground font-semibold hover:bg-accent-hover shadow-glow-accent',
    destructive: 'bg-destructive/15 text-destructive hover:bg-destructive/25 border border-destructive/40 shadow-glow-destructive',
    outline: 'bg-transparent text-foreground hover:bg-muted border border-border',
    ghost: 'bg-transparent text-muted-foreground hover:text-foreground hover:bg-muted/60',
  };

  const sizes = {
    xs: 'text-xs px-2 py-1 gap-1',
    sm: 'text-xs px-2.5 py-1.5 gap-1.5',
    md: 'text-sm px-3.5 py-2 gap-2',
    lg: 'text-base px-4 py-2.5 gap-2.5',
  };

  return (
    <button
      className={twMerge(clsx(baseStyles, variants[variant], sizes[size], className))}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </button>
  );
};
