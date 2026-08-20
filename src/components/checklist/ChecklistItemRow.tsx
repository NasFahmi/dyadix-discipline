import React, { useState } from 'react';
import { Check, CheckCircle2, Circle, Edit2, Trash2, ArrowUp, ArrowDown, X, CheckCheck } from 'lucide-react';
import { ChecklistItem, StageType } from '../../types';
import { useDisciplineStore } from '../../store/useDisciplineStore';
import { clsx } from 'clsx';

interface ChecklistItemRowProps {
  item: ChecklistItem;
  stage: StageType;
  index: number;
  totalInStage: number;
  isUnlocked: boolean;
  compact?: boolean;
}

export const ChecklistItemRow: React.FC<ChecklistItemRowProps> = ({
  item,
  stage,
  index,
  totalInStage,
  isUnlocked,
  compact = false,
}) => {
  const { toggleItem, updateItem, deleteItem, moveItem } = useDisciplineStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(item.title);

  const handleToggle = () => {
    if (!isUnlocked) return;
    toggleItem(stage, item.id);
  };

  const handleSaveEdit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (editTitle.trim()) {
      updateItem(stage, item.id, editTitle);
      setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
    setEditTitle(item.title);
    setIsEditing(false);
  };

  return (
    <div
      className={clsx(
        'group relative flex items-center justify-between gap-2.5 rounded-md border transition-all duration-150',
        compact ? 'p-2 text-xs' : 'p-2.5 text-xs',
        item.completed
          ? 'bg-slate-900/40 border-slate-800 text-muted-foreground'
          : 'bg-card border-border/70 text-foreground hover:border-slate-600',
        !isUnlocked && 'opacity-60 cursor-not-allowed'
      )}
    >
      {/* Checkbox & Label */}
      <div
        onClick={handleToggle}
        className={clsx(
          'flex-1 flex items-start gap-2.5 cursor-pointer select-none',
          !isUnlocked && 'pointer-events-none'
        )}
      >
        <button
          type="button"
          disabled={!isUnlocked}
          className={clsx(
            'mt-0.5 w-4 h-4 rounded flex items-center justify-center transition-all duration-200 shrink-0',
            item.completed
              ? 'bg-accent text-accent-foreground shadow-glow-accent'
              : 'border border-slate-600 hover:border-accent bg-slate-950/60'
          )}
        >
          {item.completed && <Check size={12} strokeWidth={3} />}
        </button>

        {isEditing ? (
          <form
            onSubmit={handleSaveEdit}
            onClick={(e) => e.stopPropagation()}
            className="flex-1 flex items-center gap-1.5"
          >
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="flex-1 bg-slate-950 border border-accent rounded px-2 py-0.5 text-xs text-foreground focus:outline-none"
              autoFocus
            />
            <button
              type="submit"
              className="text-accent hover:text-accent-hover p-1 rounded hover:bg-slate-800"
            >
              <Check size={14} />
            </button>
            <button
              type="button"
              onClick={handleCancelEdit}
              className="text-muted-foreground hover:text-foreground p-1 rounded hover:bg-slate-800"
            >
              <X size={14} />
            </button>
          </form>
        ) : (
          <span
            className={clsx(
              'leading-snug transition-all',
              item.completed && 'line-through text-slate-500 font-normal'
            )}
          >
            {item.title}
          </span>
        )}
      </div>

      {/* Row Actions on Hover (Edit, Delete, Move) */}
      {!isEditing && (
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button
            title="Move Up"
            disabled={index === 0}
            onClick={(e) => {
              e.stopPropagation();
              moveItem(stage, item.id, 'up');
            }}
            className="p-1 rounded text-slate-400 hover:text-foreground hover:bg-slate-800 disabled:opacity-20 disabled:hover:bg-transparent"
          >
            <ArrowUp size={11} />
          </button>
          <button
            title="Move Down"
            disabled={index === totalInStage - 1}
            onClick={(e) => {
              e.stopPropagation();
              moveItem(stage, item.id, 'down');
            }}
            className="p-1 rounded text-slate-400 hover:text-foreground hover:bg-slate-800 disabled:opacity-20 disabled:hover:bg-transparent"
          >
            <ArrowDown size={11} />
          </button>
          <button
            title="Edit item"
            onClick={(e) => {
              e.stopPropagation();
              setIsEditing(true);
            }}
            className="p-1 rounded text-slate-400 hover:text-accent hover:bg-slate-800"
          >
            <Edit2 size={11} />
          </button>
          <button
            title="Delete item"
            onClick={(e) => {
              e.stopPropagation();
              deleteItem(stage, item.id);
            }}
            className="p-1 rounded text-slate-400 hover:text-destructive hover:bg-slate-800"
          >
            <Trash2 size={11} />
          </button>
        </div>
      )}
    </div>
  );
};
