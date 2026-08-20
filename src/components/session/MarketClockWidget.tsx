import React, { useEffect, useState } from 'react';
import { Clock, Globe, Zap, AlertCircle } from 'lucide-react';
import { getMarketSessions } from '../../utils/session';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';
import { clsx } from 'clsx';

export const MarketClockWidget: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const [sessionData, setSessionData] = useState(() => getMarketSessions());

  useEffect(() => {
    // Update clock every second
    const interval = setInterval(() => {
      setSessionData(getMarketSessions());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const { sessions, activeSummary, isOverlap, utcTimeStr, localTimeStr } = sessionData;

  return (
    <div className="space-y-2.5">
      {/* Active Session Hero Card */}
      <Card
        glow={isOverlap ? 'accent' : 'none'}
        className={clsx(
          'p-3 relative overflow-hidden',
          isOverlap ? 'bg-gradient-to-r from-slate-900 via-emerald-950/40 to-slate-900 border-accent/60' : 'bg-card'
        )}
      >
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-accent"></span>
            </span>
            <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-accent">
              ACTIVE SESSION
            </span>
          </div>

          {/* Clock values */}
          <div className="flex items-center gap-2 font-mono text-[11px] text-muted-foreground">
            <span className="bg-slate-950 px-2 py-0.5 rounded border border-border/60 text-slate-300">
              {utcTimeStr}
            </span>
            <span className="bg-slate-950 px-2 py-0.5 rounded border border-border/60 text-slate-300">
              {localTimeStr} Local
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <Zap size={15} className={isOverlap ? 'text-accent animate-pulse' : 'text-slate-400'} />
            <span>{activeSummary}</span>
          </div>
          {isOverlap && (
            <Badge variant="accent" size="xs" dot>
              High Volume Overlap
            </Badge>
          )}
        </div>
      </Card>

      {/* Grid of Global Sessions */}
      <div className="space-y-2">
        {sessions.map((session) => {
          return (
            <div
              key={session.id}
              className={clsx(
                'flex items-center justify-between p-2.5 rounded-lg border transition-all duration-200',
                session.isActive
                  ? 'bg-slate-900/80 border-accent/50 shadow-glow-accent'
                  : 'bg-card/70 border-border/60 text-muted-foreground'
              )}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={clsx(
                    'w-2 h-2 rounded-full',
                    session.isActive ? 'bg-accent shadow-glow-accent animate-pulse' : 'bg-slate-700'
                  )}
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={clsx(
                        'text-xs font-semibold',
                        session.isActive ? 'text-foreground font-bold' : 'text-slate-400'
                      )}
                    >
                      {session.name}
                    </span>
                    {session.isActive && (
                      <Badge variant="accent" size="xs">
                        Open
                      </Badge>
                    )}
                  </div>
                  <div className="text-[10px] font-mono text-muted-foreground mt-0.5">
                    {session.badgeText}
                  </div>
                </div>
              </div>

              <div className="text-right font-mono text-xs">
                <span
                  className={clsx(
                    'px-2 py-0.5 rounded text-[11px] font-medium border',
                    session.isActive
                      ? 'bg-emerald-950/60 text-accent border-accent/40'
                      : 'bg-slate-950/60 text-slate-400 border-slate-800'
                  )}
                >
                  {session.timeRemainingStr}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
