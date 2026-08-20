import React from 'react';
import { clsx } from 'clsx';

export interface TabItem<T extends string = string> {
  id: T;
  label: string;
  icon?: React.ReactNode;
  badge?: string | number;
}

interface TabsProps<T extends string = string> {
  tabs: TabItem<T>[];
  activeTab: T;
  onChange: (tabId: T) => void;
  className?: string;
}

export function Tabs<T extends string>({
  tabs,
  activeTab,
  onChange,
  className,
}: TabsProps<T>) {
  return (
    <div className={clsx('flex items-center gap-1 p-1 bg-slate-950/70 rounded-lg border border-border/60', className)}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={clsx(
              'flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md text-xs font-medium transition-all duration-200 cursor-pointer select-none',
              isActive
                ? 'bg-secondary text-foreground font-semibold shadow-sm border border-slate-700/50'
                : 'text-muted-foreground hover:text-foreground hover:bg-slate-900/50'
            )}
          >
            {tab.icon && <span className={clsx('shrink-0', isActive ? 'text-accent' : 'text-muted-foreground')}>{tab.icon}</span>}
            <span className="truncate">{tab.label}</span>
            {tab.badge !== undefined && (
              <span
                className={clsx(
                  'text-[10px] font-mono px-1 rounded-full',
                  isActive ? 'bg-accent/20 text-accent font-bold' : 'bg-slate-800 text-muted-foreground'
                )}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
