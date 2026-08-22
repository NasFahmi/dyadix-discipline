import React, { useEffect, useState } from 'react';
import {
  Globe,
  Clock,
  Zap,
  ChevronDown,
  Sparkles,
  Check,
  RotateCcw,
  BookOpen,
} from 'lucide-react';
import { getCurrentTradingSession, ActiveTradingSessionInfo } from '../../utils/session';
import { useDisciplineStore } from '../../store/useDisciplineStore';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';
import { clsx } from 'clsx';

interface ActiveSessionBannerProps {
  compact?: boolean;
}

const SESSION_OPTIONS = [
  { id: 'auto', label: '⚡ Auto Detect (Live Clock)' },
  { id: 'london', label: '🇬🇧 London Session (08:00 - 17:00 UTC)' },
  { id: 'newyork', label: '🇺🇸 New York Session (13:00 - 22:00 UTC)' },
  { id: 'tokyo', label: '🇯🇵 Tokyo Session (00:00 - 09:00 UTC)' },
];

export const ActiveSessionBanner: React.FC<ActiveSessionBannerProps> = ({ compact = false }) => {
  const {
    currentSession,
    selectedSessionOverride,
    setCurrentSession,
    setSessionOverride,
  } = useDisciplineStore();

  const [sessionInfo, setSessionInfo] = useState<ActiveTradingSessionInfo>(() =>
    getCurrentTradingSession(selectedSessionOverride)
  );
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Sync and update real-time clock every second
  useEffect(() => {
    const update = () => {
      const info = getCurrentTradingSession(selectedSessionOverride);
      setSessionInfo(info);
      if (currentSession !== info.name) {
        setCurrentSession(info.name);
      }
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [selectedSessionOverride, currentSession]);

  const handleSelectOption = (optionId: string) => {
    if (optionId === 'auto') {
      setSessionOverride(null);
    } else {
      setSessionOverride(optionId);
    }
    setIsDropdownOpen(false);
  };

  const isOverlap = sessionInfo.isOverlap;
  const isActive = sessionInfo.isActive;
  const isOverride = sessionInfo.isCustomOverride;

  if (compact) {
    return (
      <div className="relative mb-2">
        <div
          className={clsx(
            'p-2 rounded-lg border transition-all duration-200',
            isOverlap
              ? 'bg-gradient-to-r from-slate-950 via-emerald-950/30 to-slate-950 border-accent/60 shadow-glow-accent'
              : isActive
              ? 'bg-slate-900/90 border-accent/40 shadow-glow-accent'
              : 'bg-card/90 border-border/80'
          )}
        >
          {/* Top Row: Tag & Clocks */}
          <div className="flex items-center justify-between gap-1 mb-1.5">
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span
                  className={clsx(
                    'animate-ping absolute inline-flex h-full w-full rounded-full opacity-75',
                    isActive ? 'bg-accent' : 'bg-slate-500'
                  )}
                />
                <span
                  className={clsx(
                    'relative inline-flex rounded-full h-2 w-2',
                    isActive ? 'bg-accent' : 'bg-slate-500'
                  )}
                />
              </span>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-accent flex items-center gap-1">
                Active Session
                {isOverride && (
                  <span className="text-[9px] text-amber-400 lowercase font-normal">(manual)</span>
                )}
              </span>
            </div>

            <div className="flex items-center gap-1.5 font-mono text-[10px] text-muted-foreground">
              <span className="text-slate-300 bg-slate-950/80 px-1.5 py-0.2 rounded border border-border/60">
                {sessionInfo.utcTimeStr}
              </span>
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="text-[10px] text-slate-400 hover:text-accent flex items-center gap-0.5"
                title="Change Session Mode"
              >
                <ChevronDown size={11} className={clsx('transition-transform', isDropdownOpen && 'rotate-180')} />
              </button>
            </div>
          </div>

          {/* Session Title & Time Remaining */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 truncate">
              {isOverlap ? (
                <Zap size={13} className="text-accent animate-pulse shrink-0" />
              ) : (
                <Globe size={13} className={clsx('shrink-0', isActive ? 'text-accent' : 'text-slate-400')} />
              )}
              <span className="text-xs font-bold text-foreground truncate">
                {sessionInfo.name}
              </span>
            </div>

            <span
              className={clsx(
                'text-[10px] font-mono px-1.5 py-0.5 rounded border shrink-0',
                isActive
                  ? 'bg-emerald-950/60 text-accent border-accent/40'
                  : 'bg-slate-950 text-slate-400 border-slate-800'
              )}
            >
              {sessionInfo.timeRemainingStr}
            </span>
          </div>

          {/* Journal Tag helper */}
          <div className="mt-1.5 pt-1 border-t border-border/40 flex items-center justify-between text-[10px] font-mono text-muted-foreground">
            <span className="flex items-center gap-1 text-slate-400">
              <BookOpen size={10} className="text-accent" />
              Journal Tag:
            </span>
            <span className="text-slate-200 font-semibold bg-slate-950 px-1 rounded border border-border/40">
              {sessionInfo.shortName}
            </span>
          </div>
        </div>

        {/* Dropdown Selector */}
        {isDropdownOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 z-30 bg-slate-950 border border-slate-700 rounded-lg shadow-2xl p-1.5 space-y-1">
            <div className="text-[10px] font-mono text-muted-foreground px-2 py-0.5">
              Select Active Session:
            </div>
            {SESSION_OPTIONS.map((opt) => {
              const isSelected =
                (opt.id === 'auto' && !selectedSessionOverride) ||
                selectedSessionOverride === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleSelectOption(opt.id)}
                  className={clsx(
                    'w-full text-left px-2 py-1 rounded text-xs flex items-center justify-between transition-colors',
                    isSelected
                      ? 'bg-accent/15 text-accent font-semibold'
                      : 'text-slate-300 hover:bg-slate-900'
                  )}
                >
                  <span>{opt.label}</span>
                  {isSelected && <Check size={12} className="text-accent" />}
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // Full Standard View for Popup / SidePanel
  return (
    <div className="relative mb-3">
      <Card
        glow={isOverlap ? 'accent' : 'none'}
        className={clsx(
          'p-3 relative overflow-hidden transition-all duration-200 border',
          isOverlap
            ? 'bg-gradient-to-r from-slate-900 via-emerald-950/30 to-slate-900 border-accent/60 shadow-glow-accent'
            : isActive
            ? 'bg-slate-900/90 border-accent/40 shadow-glow-accent'
            : 'bg-card border-border/80'
        )}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span
                className={clsx(
                  'animate-ping absolute inline-flex h-full w-full rounded-full opacity-75',
                  isActive ? 'bg-accent' : 'bg-slate-500'
                )}
              />
              <span
                className={clsx(
                  'relative inline-flex rounded-full h-2.5 w-2.5',
                  isActive ? 'bg-accent' : 'bg-slate-500'
                )}
              />
            </span>
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-accent flex items-center gap-1.5">
              CURRENT TRADING SESSION
              {isOverride && (
                <Badge variant="warning" size="xs">
                  Manual
                </Badge>
              )}
            </span>
          </div>

          {/* Clocks */}
          <div className="flex items-center gap-1.5 font-mono text-[11px]">
            <span className="bg-slate-950 px-2 py-0.5 rounded border border-border/60 text-slate-300">
              {sessionInfo.utcTimeStr}
            </span>
            <span className="bg-slate-950 px-2 py-0.5 rounded border border-border/60 text-slate-300 hidden sm:inline-block">
              {sessionInfo.localTimeStr} Local
            </span>
          </div>
        </div>

        {/* Main Session Banner Info */}
        <div className="flex items-center justify-between gap-3 mb-2">
          <div>
            <div className="flex items-center gap-2">
              <div
                className={clsx(
                  'w-7 h-7 rounded-lg flex items-center justify-center border shrink-0',
                  isOverlap
                    ? 'bg-emerald-950/60 border-accent/50 text-accent shadow-glow-accent'
                    : isActive
                    ? 'bg-accent/15 border-accent/40 text-accent'
                    : 'bg-slate-950 border-border text-slate-400'
                )}
              >
                {isOverlap ? <Zap size={16} className="animate-pulse" /> : <Globe size={16} />}
              </div>

              <div>
                <h3 className="text-sm font-bold text-foreground leading-tight">
                  {sessionInfo.name}
                </h3>
                <p className="text-[10px] text-muted-foreground font-mono mt-0.5">
                  {sessionInfo.description}
                </p>
              </div>
            </div>
          </div>

          {/* Status Badge & Countdown */}
          <div className="text-right shrink-0">
            <Badge
              variant={isOverlap || isActive ? 'accent' : 'outline'}
              size="xs"
              dot={isActive}
            >
              {sessionInfo.statusLabel}
            </Badge>
            <div className="text-[11px] font-mono font-medium text-slate-300 mt-1">
              {sessionInfo.timeRemainingStr}
            </div>
          </div>
        </div>

        {/* Footer Meta & Controls */}
        <div className="pt-2 border-t border-border/50 flex items-center justify-between text-xs">
          {/* Journal Attribution Preview */}
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-muted-foreground">
            <BookOpen size={12} className="text-accent" />
            <span>Journal Tag:</span>
            <span className="text-foreground font-semibold bg-slate-950 px-1.5 py-0.5 rounded border border-border/60">
              {sessionInfo.name}
            </span>
          </div>

          {/* Session Switcher Button */}
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-accent hover:bg-slate-800/80 px-2 py-0.5 rounded transition-colors font-mono"
          >
            <span>{isOverride ? 'Override Active' : 'Auto (Live)'}</span>
            <ChevronDown size={12} className={clsx('transition-transform', isDropdownOpen && 'rotate-180')} />
          </button>
        </div>
      </Card>

      {/* Session Selection Dropdown */}
      {isDropdownOpen && (
        <div className="absolute top-full left-0 right-0 mt-1.5 z-30 bg-slate-950 border border-slate-700 rounded-lg shadow-2xl p-2 space-y-1 backdrop-blur-md">
          <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground px-2 py-1 border-b border-border/40 mb-1">
            <span>Trading Session Context</span>
            {isOverride && (
              <button
                type="button"
                onClick={() => handleSelectOption('auto')}
                className="text-accent hover:underline flex items-center gap-1 text-[10px]"
              >
                <RotateCcw size={10} /> Reset to Auto
              </button>
            )}
          </div>

          {SESSION_OPTIONS.map((opt) => {
            const isSelected =
              (opt.id === 'auto' && !selectedSessionOverride) ||
              selectedSessionOverride === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => handleSelectOption(opt.id)}
                className={clsx(
                  'w-full text-left px-2.5 py-1.5 rounded-md text-xs flex items-center justify-between transition-colors',
                  isSelected
                    ? 'bg-accent/15 text-accent font-semibold border border-accent/30'
                    : 'text-slate-300 hover:bg-slate-900 border border-transparent'
                )}
              >
                <span>{opt.label}</span>
                {isSelected && <Check size={14} className="text-accent" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
