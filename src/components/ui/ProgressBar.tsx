import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface ProgressBarProps {
  value: number; // 0 to 100
  size?: 'xs' | 'sm' | 'md';
  showLabel?: boolean;
  className?: string;
  variant?: 'accent' | 'warning' | 'destructive' | 'auto';
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  size = 'sm',
  showLabel = false,
  className,
  variant = 'auto',
}) => {
  const clamped = Math.min(100, Math.max(0, value));

  const heightClasses = {
    xs: 'h-1',
    sm: 'h-1.5',
    md: 'h-2.5',
  };

  let barColor = 'bg-accent';
  if (variant === 'auto') {
    if (clamped === 100) {
      barColor = 'bg-accent shadow-glow-accent';
    } else if (clamped >= 50) {
      barColor = 'bg-emerald-400';
    } else if (clamped > 0) {
      barColor = 'bg-amber-400';
    } else {
      barColor = 'bg-slate-600';
    }
  } else if (variant === 'destructive') {
    barColor = 'bg-destructive shadow-glow-destructive';
  } else if (variant === 'warning') {
    barColor = 'bg-warning shadow-glow-warning';
  }

  return (
    <div className={twMerge('w-full', className)}>
      <div className={clsx('w-full bg-slate-800/80 rounded-full overflow-hidden border border-slate-700/40', heightClasses[size])}>
        <div
          className={clsx('h-full transition-all duration-300 ease-out rounded-full', barColor)}
          style={{ width: `${clamped}%` }}
        />
      </div>
      {showLabel && (
        <div className="flex justify-between items-center mt-1 text-[11px] font-mono text-muted-foreground">
          <span>Progress</span>
          <span className="font-semibold text-foreground">{clamped}%</span>
        </div>
      )}
    </div>
  );
};
