import React, { useEffect, useState } from 'react';
import { AlertTriangle, Flame, RefreshCw, Clock, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { NewsAlert, NewsEvent } from '../../types';
import { fetchEconomicNews, getNewsAlerts } from '../../utils/news';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { clsx } from 'clsx';

export const EconomicNewsWidget: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const [events, setEvents] = useState<NewsEvent[]>([]);
  const [alerts, setAlerts] = useState<NewsAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  const loadNews = async () => {
    setIsLoading(true);
    const data = await fetchEconomicNews();
    setEvents(data);
    setAlerts(getNewsAlerts(data));
    setLastRefreshed(new Date());
    setIsLoading(false);
  };

  useEffect(() => {
    loadNews();

    // Recheck alerts every 30 seconds
    const interval = setInterval(() => {
      setAlerts((prev) => getNewsAlerts(events));
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const urgentAlert = alerts.find((a) => a.level === 'urgent' || a.level === 'warning');

  return (
    <div className="space-y-2.5">
      {/* Alert Banner if High Impact Event is within 60/30/15m */}
      {urgentAlert ? (
        <div
          className={clsx(
            'p-3 rounded-lg border flex items-start gap-2.5 animate-pulse-slow',
            urgentAlert.level === 'urgent'
              ? 'bg-destructive/15 border-destructive/50 shadow-glow-destructive text-destructive'
              : 'bg-warning/15 border-warning/50 shadow-glow-warning text-warning'
          )}
        >
          <Flame size={18} className="shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold uppercase tracking-wider">
                {urgentAlert.level === 'urgent' ? 'HIGH VOLATILITY WARNING' : 'UPCOMING HIGH IMPACT NEWS'}
              </span>
              <Badge variant={urgentAlert.level === 'urgent' ? 'destructive' : 'warning'} size="xs">
                {urgentAlert.minutesRemaining <= 0 ? 'NOW' : `${urgentAlert.minutesRemaining}m`}
              </Badge>
            </div>
            <p className="text-xs text-foreground font-semibold mt-1">
              {urgentAlert.message}
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              Refrain from opening impulsive positions around red folder news releases.
            </p>
          </div>
        </div>
      ) : (
        <div className="p-2.5 rounded-lg border border-border/60 bg-card/60 flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <ShieldAlert size={14} className="text-accent" />
            <span>No imminent high impact news release (&lt; 30m)</span>
          </div>
          <Badge variant="accent" size="xs">
            Clear Radar
          </Badge>
        </div>
      )}

      {/* Header with Refresh */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-foreground">High Impact Calendar</span>
          <Badge variant="destructive" size="xs">
            High Impact Only
          </Badge>
        </div>

        <Button
          variant="ghost"
          size="xs"
          onClick={loadNews}
          disabled={isLoading}
          icon={<RefreshCw size={11} className={isLoading ? 'animate-spin' : ''} />}
        >
          Refresh
        </Button>
      </div>

      {/* Event Cards List */}
      <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1">
        {events.length === 0 ? (
          <div className="text-center py-6 text-xs text-muted-foreground">
            {isLoading ? 'Fetching economic calendar...' : 'No high impact events scheduled today.'}
          </div>
        ) : (
          events.map((event) => {
            const isPast = event.timestamp < Date.now() - 5 * 60 * 1000;
            const isImminent = Math.abs(event.timestamp - Date.now()) <= 30 * 60 * 1000;

            return (
              <div
                key={event.id}
                className={clsx(
                  'p-2.5 rounded-lg border transition-all duration-150',
                  isImminent
                    ? 'bg-red-950/20 border-destructive/50 shadow-glow-destructive'
                    : isPast
                    ? 'bg-slate-950/40 border-border/40 opacity-60'
                    : 'bg-card border-border/70 hover:border-slate-600'
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-200 font-mono text-[11px] font-bold border border-slate-700">
                      {event.currency}
                    </span>
                    <span className="text-xs font-semibold text-foreground leading-tight">
                      {event.title}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <Badge variant="destructive" size="xs">
                      HIGH
                    </Badge>
                    <span className="font-mono text-xs font-semibold text-slate-300">
                      {event.timeStr}
                    </span>
                  </div>
                </div>

                {(event.forecast || event.previous) && (
                  <div className="flex items-center gap-3 mt-1.5 pt-1 border-t border-border/40 text-[10px] font-mono text-muted-foreground">
                    {event.forecast && (
                      <span>
                        Forecast: <span className="text-slate-200 font-semibold">{event.forecast}</span>
                      </span>
                    )}
                    {event.previous && (
                      <span>
                        Previous: <span className="text-slate-200">{event.previous}</span>
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
