import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldAlert,
  Clock,
  Flame,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Minimize2,
  Maximize2,
  Move,
  Lock,
  Unlock,
  Settings,
  Sparkles,
  Zap,
} from 'lucide-react';
import { useDisciplineStore } from '../../store/useDisciplineStore';
import { getMarketSessions } from '../../utils/session';
import { fetchEconomicNews, getNewsAlerts } from '../../utils/news';
import { NewsAlert, NewsEvent, StageType } from '../../types';
import { ChecklistStage } from '../checklist/ChecklistStage';
import { ActiveSessionBanner } from '../session/ActiveSessionBanner';
import { MarketClockWidget } from '../session/MarketClockWidget';
import { EconomicNewsWidget } from '../news/EconomicNewsWidget';
import { StrategyEditorModal } from '../checklist/StrategyEditorModal';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { ProgressBar } from '../ui/ProgressBar';
import { Tabs } from '../ui/Tabs';
import { clsx } from 'clsx';

export const TradingViewOverlay: React.FC = () => {
  const {
    isInitialized,
    initialize,
    strategy,
    overlayPosition,
    setOverlayPosition,
    overlayMinimized,
    toggleOverlayMinimize,
    overlayLocked,
    toggleOverlayLock,
    getTotalProgress,
    getStageProgress,
  } = useDisciplineStore();

  const [activeTab, setActiveTab] = useState<'checklist' | 'session' | 'news'>('checklist');
  const [isStrategyModalOpen, setIsStrategyModalOpen] = useState(false);
  const [sessionData, setSessionData] = useState(() => getMarketSessions());
  const [newsAlerts, setNewsAlerts] = useState<NewsAlert[]>([]);

  // Dragging state
  const [isDragging, setIsDragging] = useState(false);
  const dragOffsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    initialize();

    const interval = setInterval(() => {
      setSessionData(getMarketSessions());
    }, 1000);

    // Initial news alert load
    fetchEconomicNews().then((events) => {
      setNewsAlerts(getNewsAlerts(events));
    });

    const newsInterval = setInterval(() => {
      fetchEconomicNews().then((events) => {
        setNewsAlerts(getNewsAlerts(events));
      });
    }, 60000);

    return () => {
      clearInterval(interval);
      clearInterval(newsInterval);
    };
  }, []);

  const totalProgress = getTotalProgress();
  const preMarketProgress = getStageProgress('preMarket');
  const marketProgress = getStageProgress('market');
  const urgentAlert = newsAlerts.find((a) => a.level === 'urgent' || a.level === 'warning');

  // Compute actual X position (default to right side: window.innerWidth - 400)
  const getInitialRightX = () => {
    if (typeof window !== 'undefined') {
      return Math.max(10, window.innerWidth - 400);
    }
    return 880;
  };

  const actualX =
    overlayPosition.x < 0 || overlayPosition.x === 24
      ? getInitialRightX()
      : Math.min(typeof window !== 'undefined' ? window.innerWidth - 390 : 880, Math.max(10, overlayPosition.x));

  const actualY = Math.min(typeof window !== 'undefined' ? window.innerHeight - 80 : 600, Math.max(10, overlayPosition.y));

  // Snap actions
  const snapToRight = () => {
    setOverlayPosition({ x: getInitialRightX(), y: actualY });
  };

  const snapToLeft = () => {
    setOverlayPosition({ x: 20, y: actualY });
  };

  // Handle Dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    if (overlayLocked) return;
    setIsDragging(true);
    dragOffsetRef.current = {
      x: e.clientX - actualX,
      y: e.clientY - actualY,
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const newX = Math.max(10, Math.min(window.innerWidth - 390, e.clientX - dragOffsetRef.current.x));
      const newY = Math.max(10, Math.min(window.innerHeight - 80, e.clientY - dragOffsetRef.current.y));
      setOverlayPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
      }
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  if (!isInitialized) return null;

  return (
    <div
      style={{
        position: 'fixed',
        left: `${actualX}px`,
        top: `${actualY}px`,
        zIndex: 999999,
      }}
      className="font-sans antialiased text-foreground select-none"
    >
      {overlayMinimized ? (
        /* MINIMIZED FLOATING PILL */
        <div
          onMouseDown={handleMouseDown}
          onClick={(e) => {
            if (!isDragging) toggleOverlayMinimize();
          }}
          className={clsx(
            'flex items-center gap-2.5 px-3 py-2 rounded-full glass-panel cursor-pointer shadow-2xl transition-all duration-200 border hover:scale-105 group',
            urgentAlert
              ? 'border-destructive/80 shadow-glow-destructive bg-red-950/80 animate-pulse-slow'
              : totalProgress.percentage === 100
              ? 'border-accent/80 shadow-glow-accent bg-slate-900/90'
              : 'border-slate-700/80 bg-slate-900/90 hover:border-accent'
          )}
        >
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-accent animate-ping" />
            <span className="text-[11px] font-mono font-bold tracking-wider text-slate-200">
              DISCIPLINE OS
            </span>
          </div>

          <div className="h-3 w-px bg-slate-700" />

          {/* Quick Progress Badge */}
          <span className="font-mono text-xs font-semibold text-accent">
            {totalProgress.completed}/{totalProgress.total} ({totalProgress.percentage}%)
          </span>

          {/* Session Tag */}
          <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
            {sessionData.activeSummary.split(' ')[0]}
          </span>

          {urgentAlert && (
            <span className="flex items-center gap-1 text-[10px] font-bold text-destructive animate-bounce">
              <Flame size={12} />
              {urgentAlert.minutesRemaining <= 0 ? 'NEWS NOW' : `${urgentAlert.minutesRemaining}m`}
            </span>
          )}

          <div className="p-1 rounded-full text-slate-400 group-hover:text-foreground">
            <Maximize2 size={12} />
          </div>
        </div>
      ) : (
        /* EXPANDED FLOATING HUD */
        <div
          className={clsx(
            'w-[380px] rounded-xl glass-panel shadow-2xl border border-slate-700/80 overflow-hidden flex flex-col transition-shadow duration-200',
            urgentAlert ? 'shadow-glow-destructive' : 'shadow-panel'
          )}
        >
          {/* Draggable Header */}
          <div
            onMouseDown={handleMouseDown}
            className={clsx(
              'p-2.5 bg-slate-950/90 border-b border-border/80 flex items-center justify-between',
              overlayLocked ? 'cursor-default' : 'cursor-grab active:cursor-grabbing'
            )}
          >
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded bg-accent/20 border border-accent/40 flex items-center justify-center text-accent">
                <Sparkles size={12} />
              </div>
              <div>
                <span className="text-xs font-bold font-mono tracking-wide text-foreground">
                  TRADING DISCIPLINE OS
                </span>
              </div>
            </div>

            {/* Header Control Actions */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (actualX > window.innerWidth / 2) {
                    snapToLeft();
                  } else {
                    snapToRight();
                  }
                }}
                title={actualX > window.innerWidth / 2 ? 'Dock to Left Side' : 'Dock to Right Side'}
                className="p-1 text-slate-400 hover:text-accent rounded hover:bg-slate-800 transition-colors text-[11px] font-mono"
              >
                {actualX > window.innerWidth / 2 ? '← Left' : 'Right →'}
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsStrategyModalOpen(true);
                }}
                title="Edit Strategy Checklist"
                className="p-1 text-slate-400 hover:text-accent rounded hover:bg-slate-800 transition-colors"
              >
                <Settings size={13} />
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleOverlayLock();
                }}
                title={overlayLocked ? 'Unlock Position' : 'Lock Position'}
                className={clsx(
                  'p-1 rounded transition-colors',
                  overlayLocked ? 'text-accent bg-accent/10' : 'text-slate-400 hover:text-foreground hover:bg-slate-800'
                )}
              >
                {overlayLocked ? <Lock size={13} /> : <Unlock size={13} />}
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleOverlayMinimize();
                }}
                title="Minimize Overlay"
                className="p-1 text-slate-400 hover:text-foreground rounded hover:bg-slate-800 transition-colors"
              >
                <Minimize2 size={13} />
              </button>
            </div>
          </div>

          {/* Quick Status Bar */}
          <div className="px-3 py-2 bg-slate-900/60 border-b border-border/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-muted-foreground font-mono">Process Completion:</span>
              <span className="text-xs font-mono font-bold text-accent">
                {totalProgress.percentage}%
              </span>
            </div>

            {/* Quick Session Indicator */}
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              <span className="text-[11px] font-mono text-slate-300 truncate max-w-[150px]">
                {sessionData.activeSummary}
              </span>
            </div>
          </div>

          {/* Overall Process Progress Bar */}
          <ProgressBar value={totalProgress.percentage} size="xs" />

          {/* Urgent High Impact News Banner if imminent */}
          {urgentAlert && (
            <div className="px-3 py-1.5 bg-destructive/20 border-b border-destructive/40 flex items-center justify-between text-xs text-destructive animate-pulse-slow">
              <div className="flex items-center gap-1.5 truncate">
                <Flame size={13} className="shrink-0" />
                <span className="font-semibold truncate">{urgentAlert.message}</span>
              </div>
              <Badge variant="destructive" size="xs">
                {urgentAlert.minutesRemaining <= 0 ? 'NOW' : `${urgentAlert.minutesRemaining}m`}
              </Badge>
            </div>
          )}

          {/* Navigation Tabs */}
          <div className="p-2 border-b border-border/40 bg-slate-950/40">
            <Tabs<'checklist' | 'session' | 'news'>
              tabs={[
                { id: 'checklist', label: 'Checklist', icon: <CheckCircle2 size={12} />, badge: `${totalProgress.completed}/${totalProgress.total}` },
                { id: 'session', label: 'Session Clock', icon: <Clock size={12} /> },
                { id: 'news', label: 'News Radar', icon: <Flame size={12} />, badge: newsAlerts.length > 0 ? newsAlerts.length : undefined },
              ]}
              activeTab={activeTab}
              onChange={setActiveTab}
            />
          </div>

          {/* Tab Content Body */}
          <div className="p-3 max-h-[380px] overflow-y-auto space-y-3">
            {activeTab === 'checklist' && (
              <div className="space-y-2.5">
                {/* Active Trading Session Banner */}
                <ActiveSessionBanner compact />

                <ChecklistStage
                  stage="preMarket"
                  title="Pre-Market Checklist"
                  subtitle="News, daily bias, POI levels, risk limits"
                  compact
                />
                <ChecklistStage
                  stage="market"
                  title="Market Execution Checklist"
                  subtitle="POI trigger, confirmation, RR, no FOMO"
                  compact
                />
                <ChecklistStage
                  stage="afterMarket"
                  title="After-Market Review"
                  subtitle="Trade review, journal screenshot, psychology"
                  compact
                />
              </div>
            )}

            {activeTab === 'session' && <MarketClockWidget compact />}

            {activeTab === 'news' && <EconomicNewsWidget compact />}
          </div>
        </div>
      )}

      {/* Strategy Customization Modal */}
      <StrategyEditorModal
        isOpen={isStrategyModalOpen}
        onClose={() => setIsStrategyModalOpen(false)}
      />
    </div>
  );
};
