import React, { useEffect, useState } from 'react';
import {
  ShieldCheck,
  Clock,
  Flame,
  CheckCircle2,
  Settings,
  RotateCcw,
  Sparkles,
  ExternalLink,
  Zap,
  Info,
  Sliders,
  ShieldAlert,
} from 'lucide-react';
import { useDisciplineStore } from '../../src/store/useDisciplineStore';
import { ChecklistStage } from '../../src/components/checklist/ChecklistStage';
import { MarketClockWidget } from '../../src/components/session/MarketClockWidget';
import { EconomicNewsWidget } from '../../src/components/news/EconomicNewsWidget';
import { StrategyEditorModal } from '../../src/components/checklist/StrategyEditorModal';
import { Tabs } from '../../src/components/ui/Tabs';
import { Badge } from '../../src/components/ui/Badge';
import { Button } from '../../src/components/ui/Button';
import { ProgressBar } from '../../src/components/ui/ProgressBar';
import { Card } from '../../src/components/ui/Card';
import { clsx } from 'clsx';

interface AppProps {
  isSidePanel?: boolean;
}

export default function App({ isSidePanel = false }: AppProps) {
  const {
    isInitialized,
    initialize,
    strategy,
    activeTab,
    setActiveTab,
    resetChecklist,
    getTotalProgress,
    getStageProgress,
    isStageUnlocked,
  } = useDisciplineStore();

  const [isEditorOpen, setIsEditorOpen] = useState(false);

  useEffect(() => {
    initialize();
  }, []);

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center h-full min-h-[500px] bg-background text-muted-foreground text-xs">
        Initializing Discipline OS...
      </div>
    );
  }

  const totalProgress = getTotalProgress();
  const isPreMarketDone = isStageUnlocked('market');
  const isMarketDone = isStageUnlocked('afterMarket');
  const isAllComplete = totalProgress.percentage === 100;

  return (
    <div
      className={clsx(
        'bg-background text-foreground flex flex-col font-sans border-border/80',
        isSidePanel ? 'w-full h-screen min-h-screen border-l' : 'w-[420px] min-h-[580px] border'
      )}
    >
      {/* Header */}
      <header className="p-3.5 bg-slate-950 border-b border-border flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-accent/15 border border-accent/40 flex items-center justify-center text-accent shadow-glow-accent">
            <Sparkles size={16} />
          </div>
          <div>
            <h1 className="text-xs font-bold font-mono tracking-wider text-foreground flex items-center gap-1.5">
              TRADING DISCIPLINE OS
              <Badge variant="accent" size="xs">
                MVP v1
              </Badge>
            </h1>
            <p className="text-[10px] text-muted-foreground">
              Process-First Execution Engine
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="xs"
            onClick={() => setIsEditorOpen(true)}
            title="Edit Strategy Checklist"
            icon={<Sliders size={13} />}
          >
            Customize
          </Button>

          <Button
            variant="ghost"
            size="xs"
            onClick={() => {
              if (confirm('Reset today\'s checklist progress?')) {
                resetChecklist();
              }
            }}
            title="Reset Today Progress"
            icon={<RotateCcw size={13} />}
          />
        </div>
      </header>

      {/* Hero Process Compliance Banner */}
      <div className="p-3.5 bg-slate-900/60 border-b border-border/60">
        <div className="flex items-center justify-between mb-2">
          <div>
            <span className="text-[10px] uppercase font-mono tracking-wider text-muted-foreground block">
              Discipline Compliance
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xl font-bold font-mono text-foreground">
                {totalProgress.percentage}%
              </span>
              <Badge
                variant={isAllComplete ? 'accent' : isPreMarketDone ? 'warning' : 'destructive'}
                size="xs"
                dot
              >
                {isAllComplete
                  ? 'All Process Steps Verified'
                  : isPreMarketDone
                  ? 'Pre-Market Complete • Trading Stage Active'
                  : 'Pre-Market Incomplete • Do Not Enter Market'}
              </Badge>
            </div>
          </div>

          <div className="text-right font-mono text-[11px] text-slate-400">
            <span className="text-foreground font-semibold">{totalProgress.completed}</span> /{' '}
            {totalProgress.total} Rules Verified
          </div>
        </div>

        <ProgressBar value={totalProgress.percentage} size="sm" />
      </div>

      {/* Tabs */}
      <div className="p-2.5 bg-slate-950/40 border-b border-border/60">
        <Tabs<'checklist' | 'session' | 'news' | 'settings'>
          tabs={[
            {
              id: 'checklist',
              label: 'Checklist',
              icon: <CheckCircle2 size={12} />,
              badge: `${totalProgress.completed}/${totalProgress.total}`,
            },
            { id: 'session', label: 'Sessions', icon: <Clock size={12} /> },
            { id: 'news', label: 'News Radar', icon: <Flame size={12} /> },
            { id: 'settings', label: 'Settings', icon: <Settings size={12} /> },
          ]}
          activeTab={activeTab}
          onChange={setActiveTab}
        />
      </div>

      {/* Content Area */}
      <main className={clsx('flex-1 p-3.5 space-y-3 overflow-y-auto', !isSidePanel && 'max-h-[420px]')}>
        {activeTab === 'checklist' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
              <span className="font-semibold text-slate-300">Sequential Process Stages</span>
              <span className="text-[10px] font-mono">1 Global Strategy</span>
            </div>

            <ChecklistStage
              stage="preMarket"
              title="1. Pre-Market Preparation"
              subtitle="Economic news, daily directional bias, key S&R levels, risk limit confirmation"
            />

            <ChecklistStage
              stage="market"
              title="2. Market Execution Rules"
              subtitle="POI entry trigger, LTF confirmation, RR ratio verification, zero FOMO"
            />

            <ChecklistStage
              stage="afterMarket"
              title="3. After-Market Reflection"
              subtitle="Trade review, chart screenshot archive, psychological & execution log"
            />
          </div>
        )}

        {activeTab === 'session' && <MarketClockWidget />}

        {activeTab === 'news' && <EconomicNewsWidget />}

        {activeTab === 'settings' && (
          <div className="space-y-3">
            <Card className="p-3 bg-card border-border/80">
              <h3 className="text-xs font-bold text-foreground mb-1 flex items-center gap-1.5">
                <Sliders size={14} className="text-accent" />
                Strategy Configuration
              </h3>
              <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                Active Strategy: <strong className="text-foreground">{strategy.name}</strong>
              </p>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsEditorOpen(true)}
                  className="flex-1"
                >
                  Manage Checklist Items
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    if (confirm('Reset today checklist progress to 0%?')) {
                      resetChecklist();
                    }
                  }}
                >
                  Reset Daily
                </Button>
              </div>
            </Card>

            {/* TradingView Integration Info */}
            <Card className="p-3 bg-slate-900/50 border-border/60">
              <h3 className="text-xs font-semibold text-foreground flex items-center gap-1.5 mb-1">
                <ExternalLink size={13} className="text-accent" />
                TradingView Overlay HUD
              </h3>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                The overlay automatically injects when you visit{' '}
                <code className="text-slate-300 bg-slate-950 px-1 py-0.5 rounded font-mono text-[10px]">
                  tradingview.com/chart
                </code>
                . It provides a draggable, collapsible floating discipline HUD so you never miss a checklist step while analyzing charts.
              </p>
            </Card>

            {/* Core Principle Callout */}
            <Card className="p-3 bg-emerald-950/20 border-accent/40 shadow-glow-accent">
              <div className="flex items-start gap-2">
                <ShieldCheck size={16} className="text-accent shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-accent">Core Product Principle</h4>
                  <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                    Trading Discipline OS does not give trading signals. It forces you to strictly execute your pre-defined systematic process before risking capital.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="p-2.5 bg-slate-950 border-t border-border/80 text-[10px] text-muted-foreground flex items-center justify-between">
        <span className="font-mono">Process &gt; Emotion</span>
        <span className="font-mono text-accent">Trading Discipline OS</span>
      </footer>

      {/* Strategy Editor Modal */}
      <StrategyEditorModal
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
      />
    </div>
  );
}
