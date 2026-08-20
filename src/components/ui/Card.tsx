import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  glow?: 'none' | 'accent' | 'destructive' | 'warning';
  active?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  glow = 'none',
  active = false,
  ...props
}) => {
  const glowStyles = {
    none: '',
    accent: 'border-accent/40 shadow-glow-accent',
    destructive: 'border-destructive/40 shadow-glow-destructive',
    warning: 'border-warning/40 shadow-glow-warning',
  };

  return (
    <div
      className={twMerge(
        clsx(
          'bg-card rounded-lg border border-border/80 p-3.5 transition-all duration-200',
          active && 'border-accent/50 bg-card-hover',
          glowStyles[glow],
          className
        )
      )}
      {...props}
    >
      {children}
    </div>
  );
};
