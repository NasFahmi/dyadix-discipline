import React, { useState } from 'react';
import { Lock, CheckCircle2, Plus, Sparkles } from 'lucide-react';
import { StageType } from '../../types';
import { useDisciplineStore } from '../../store/useDisciplineStore';
import { ChecklistItemRow } from './ChecklistItemRow';
import { ProgressBar } from '../ui/ProgressBar';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { clsx } from 'clsx';

interface ChecklistStageProps {
  stage: StageType;
  title: string;
  subtitle: string;
  defaultExpanded?: boolean;
  compact?: boolean;
}

export const ChecklistStage: React.FC<ChecklistStageProps> = ({
  stage,
  title,
  subtitle,
  compact = false,
}) => {
  const { strategy, addItem, isStageUnlocked, getStageProgress } = useDisciplineStore();
  const [newItemTitle, setNewItemTitle] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const items = strategy[stage] || [];
  const isUnlocked = isStageUnlocked(stage);
  const progress = getStageProgress(stage);
  const isCompleted = progress.percentage === 100 && items.length > 0;

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (newItemTitle.trim()) {
      addItem(stage, newItemTitle);
      setNewItemTitle('');
      setIsAdding(false);
    }
  };

  const stageBadgeLabel = {
    preMarket: 'Step 1 • Required First',
    market: 'Step 2 • Active Trading',
    afterMarket: 'Step 3 • Post-Session',
  }[stage];

  return (
    <div
      className={clsx(
        'relative rounded-lg border transition-all duration-200 overflow-hidden',
        isUnlocked
          ? isCompleted
            ? 'bg-slate-950/60 border-accent/40 shadow-glow-accent'
            : 'bg-card border-border/80 hover:border-slate-600'
          : 'bg-slate-950/40 border-slate-800/80 opacity-75'
      )}
    >
      {/* Header */}
      <div className="p-3 border-b border-border/40 bg-slate-900/40">
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <div className="flex items-center gap-2">
            <span
              className={clsx(
                'w-5 h-5 rounded flex items-center justify-center text-xs font-bold font-mono',
                isCompleted
                  ? 'bg-accent text-accent-foreground shadow-glow-accent'
                  : isUnlocked
                  ? 'bg-slate-800 text-slate-200 border border-slate-700'
                  : 'bg-slate-900 text-slate-500 border border-slate-800'
              )}
            >
              {isCompleted ? '✓' : stage === 'preMarket' ? '1' : stage === 'market' ? '2' : '3'}
            </span>
            <div>
              <h3 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                {title}
                {isCompleted && (
                  <Badge variant="accent" size="xs">
                    Completed
                  </Badge>
                )}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <Badge variant={isUnlocked ? 'outline' : 'default'} size="xs">
              {stageBadgeLabel}
            </Badge>
            <span className="font-mono text-xs font-semibold text-slate-300">
              {progress.completed}/{progress.total}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <ProgressBar value={progress.percentage} size="xs" />
      </div>

      {/* Content Area */}
      <div className="p-2.5 relative">
        {/* Locked Overlay if locked */}
        {!isUnlocked && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center p-4 text-center rounded-b-lg">
            <div className="w-8 h-8 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-slate-400 mb-2">
              <Lock size={15} />
            </div>
            <p className="text-xs font-semibold text-slate-200">
              {stage === 'market'
                ? 'Pre-Market Checklist Incomplete'
                : 'Market Checklist Incomplete'}
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5 max-w-[240px]">
              Complete all {stage === 'market' ? 'Pre-Market' : 'Market'} tasks to unlock this stage.
            </p>
          </div>
        )}

        {/* Item List */}
        <div className="space-y-1.5">
          {items.length === 0 ? (
            <div className="text-center py-4 text-xs text-muted-foreground">
              No checklist items in this stage.
            </div>
          ) : (
            items.map((item, idx) => (
              <ChecklistItemRow
                key={item.id}
                item={item}
                stage={stage}
                index={idx}
                totalInStage={items.length}
                isUnlocked={isUnlocked}
                compact={compact}
              />
            ))
          )}
        </div>

        {/* Add Item Trigger */}
        {isUnlocked && (
          <div className="mt-2.5 pt-2 border-t border-border/40">
            {isAdding ? (
              <form onSubmit={handleAddItem} className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={newItemTitle}
                  onChange={(e) => setNewItemTitle(e.target.value)}
                  placeholder="New checklist rule (e.g. Max 1% risk)..."
                  className="flex-1 bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent"
                  autoFocus
                />
                <Button type="submit" variant="accent" size="xs">
                  Add
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="xs"
                  onClick={() => {
                    setIsAdding(false);
                    setNewItemTitle('');
                  }}
                >
                  Cancel
                </Button>
              </form>
            ) : (
              <button
                type="button"
                onClick={() => setIsAdding(true)}
                className="w-full flex items-center justify-center gap-1.5 py-1 text-xs text-muted-foreground hover:text-accent hover:bg-slate-900/60 rounded border border-dashed border-slate-800 hover:border-accent/40 transition-colors"
              >
                <Plus size={13} />
                <span>Add Item</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
