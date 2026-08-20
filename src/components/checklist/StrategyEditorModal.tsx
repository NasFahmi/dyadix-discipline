import React, { useState } from 'react';
import { X, Plus, Trash2, ArrowUp, ArrowDown, RotateCcw, Check, Sparkles } from 'lucide-react';
import { StageType } from '../../types';
import { useDisciplineStore } from '../../store/useDisciplineStore';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Tabs } from '../ui/Tabs';
import { clsx } from 'clsx';

interface StrategyEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StrategyEditorModal: React.FC<StrategyEditorModalProps> = ({ isOpen, onClose }) => {
  const { strategy, addItem, updateItem, deleteItem, moveItem, resetChecklist } = useDisciplineStore();
  const [activeStage, setActiveStage] = useState<StageType>('preMarket');
  const [newItemTitle, setNewItemTitle] = useState('');
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  if (!isOpen) return null;

  const currentItems = strategy[activeStage] || [];

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (newItemTitle.trim()) {
      addItem(activeStage, newItemTitle);
      setNewItemTitle('');
    }
  };

  const handleStartEdit = (id: string, title: string) => {
    setEditingItemId(id);
    setEditingTitle(title);
  };

  const handleSaveEdit = (id: string) => {
    if (editingTitle.trim()) {
      updateItem(activeStage, id, editingTitle);
      setEditingItemId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-card border border-border rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 border-b border-border/80 flex items-center justify-between bg-slate-900/60">
          <div>
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Sparkles size={16} className="text-accent" />
              Customize Trading Strategy Checklist
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Manage your rules for Pre-Market, Market, and After-Market processes.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-slate-800"
          >
            <X size={16} />
          </button>
        </div>

        {/* Stage Selector Tabs */}
        <div className="p-3 border-b border-border/40 bg-slate-950/50">
          <Tabs<StageType>
            tabs={[
              { id: 'preMarket', label: '1. Pre-Market', badge: strategy.preMarket.length },
              { id: 'market', label: '2. Market', badge: strategy.market.length },
              { id: 'afterMarket', label: '3. After-Market', badge: strategy.afterMarket.length },
            ]}
            activeTab={activeStage}
            onChange={(tab) => {
              setActiveStage(tab);
              setEditingItemId(null);
            }}
          />
        </div>

        {/* Modal Body: Items List */}
        <div className="p-4 flex-1 overflow-y-auto space-y-2">
          {/* Add New Item Form */}
          <form onSubmit={handleAddItem} className="flex gap-2 mb-3">
            <input
              type="text"
              value={newItemTitle}
              onChange={(e) => setNewItemTitle(e.target.value)}
              placeholder={`Add rule to ${activeStage.replace(/([A-Z])/g, ' $1').toLowerCase()}...`}
              className="flex-1 bg-slate-950 border border-slate-700 rounded-md px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent"
            />
            <Button type="submit" variant="accent" size="sm" icon={<Plus size={14} />}>
              Add
            </Button>
          </form>

          {/* List of Stage Items */}
          <div className="space-y-1.5">
            {currentItems.length === 0 ? (
              <div className="text-center py-8 text-xs text-muted-foreground">
                No items configured in this stage yet. Add your first rule above!
              </div>
            ) : (
              currentItems.map((item, idx) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-2.5 rounded-lg border border-border/70 bg-slate-950/60 text-xs"
                >
                  <div className="flex-1 flex items-center gap-2 mr-2">
                    <span className="text-muted-foreground font-mono text-[10px] w-4 text-center">
                      {idx + 1}.
                    </span>

                    {editingItemId === item.id ? (
                      <div className="flex-1 flex items-center gap-1.5">
                        <input
                          type="text"
                          value={editingTitle}
                          onChange={(e) => setEditingTitle(e.target.value)}
                          className="flex-1 bg-slate-900 border border-accent rounded px-2 py-0.5 text-xs text-foreground focus:outline-none"
                          autoFocus
                        />
                        <button
                          onClick={() => handleSaveEdit(item.id)}
                          className="p-1 text-accent hover:bg-slate-800 rounded"
                        >
                          <Check size={14} />
                        </button>
                        <button
                          onClick={() => setEditingItemId(null)}
                          className="p-1 text-muted-foreground hover:bg-slate-800 rounded"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <span
                        onClick={() => handleStartEdit(item.id, item.title)}
                        className="cursor-pointer hover:text-accent select-none"
                        title="Click to edit"
                      >
                        {item.title}
                      </span>
                    )}
                  </div>

                  {/* Reorder and Delete Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      title="Move Up"
                      disabled={idx === 0}
                      onClick={() => moveItem(activeStage, item.id, 'up')}
                      className="p-1 rounded text-slate-400 hover:text-foreground hover:bg-slate-800 disabled:opacity-20"
                    >
                      <ArrowUp size={12} />
                    </button>
                    <button
                      title="Move Down"
                      disabled={idx === currentItems.length - 1}
                      onClick={() => moveItem(activeStage, item.id, 'down')}
                      className="p-1 rounded text-slate-400 hover:text-foreground hover:bg-slate-800 disabled:opacity-20"
                    >
                      <ArrowDown size={12} />
                    </button>
                    <button
                      title="Delete"
                      onClick={() => deleteItem(activeStage, item.id)}
                      className="p-1 rounded text-slate-400 hover:text-destructive hover:bg-slate-800"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3 border-t border-border/80 bg-slate-900/60 flex items-center justify-between">
          <Button
            variant="ghost"
            size="xs"
            onClick={() => {
              if (confirm('Reset all checklist progress for today?')) {
                resetChecklist();
              }
            }}
            icon={<RotateCcw size={12} />}
          >
            Reset Today Progress
          </Button>

          <Button variant="accent" size="sm" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    </div>
  );
};
