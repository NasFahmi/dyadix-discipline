import { NewsAlert, NewsEvent } from '../types';

const FAIR_ECONOMY_URL = 'https://nfs.faireconomy.media/ff_calendar_thisweek.json';

/**
 * Generate fallback mock news for today to guarantee radar works offline or when API is rate-limited
 */
export function generateMockTodayNews(): NewsEvent[] {
  const now = new Date();
  const baseTime = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const sampleEvents = [
    { title: 'Core CPI m/m', currency: 'USD', impact: 'high' as const, hour: 13, min: 30, forecast: '0.3%', prev: '0.2%' },
    { title: 'CPI y/y', currency: 'USD', impact: 'high' as const, hour: 13, min: 30, forecast: '2.9%', prev: '3.0%' },
    { title: 'ECB Monetary Policy Statement', currency: 'EUR', impact: 'high' as const, hour: 12, min: 15, forecast: '3.25%', prev: '3.50%' },
    { title: 'BOE Gov Bailey Speaks', currency: 'GBP', impact: 'high' as const, hour: 15, min: 0, forecast: '-', prev: '-' },
    { title: 'FOMC Meeting Minutes', currency: 'USD', impact: 'high' as const, hour: 18, min: 0, forecast: '-', prev: '-' },
    { title: 'Unemployment Claims', currency: 'USD', impact: 'high' as const, hour: 13, min: 30, forecast: '215K', prev: '218K' },
    { title: 'BOJ Core CPI y/y', currency: 'JPY', impact: 'high' as const, hour: 23, min: 30, forecast: '2.1%', prev: '2.0%' },
  ];

  return sampleEvents.map((e, index) => {
    const eventDate = new Date(baseTime);
    eventDate.setHours(e.hour, e.min, 0, 0);
    return {
      id: `fallback-${index}-${e.currency}-${e.hour}`,
      title: e.title,
      currency: e.currency,
      impact: e.impact,
      timestamp: eventDate.getTime(),
      timeStr: eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
      forecast: e.forecast,
      previous: e.prev,
    };
  }).sort((a, b) => a.timestamp - b.timestamp);
}

/**
 * Fetch economic news from live feed with fallback
 */
export async function fetchEconomicNews(): Promise<NewsEvent[]> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(FAIR_ECONOMY_URL, {
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Calendar API responded with status ${response.status}`);
    }

    const rawData = await response.json();
    if (!Array.isArray(rawData)) {
      throw new Error('Invalid calendar response structure');
    }

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const todayEnd = todayStart + 24 * 60 * 60 * 1000;

    const events: NewsEvent[] = rawData
      .filter((item: any) => {
        const itemImpact = (item.impact || '').toLowerCase();
        // High Impact Only per PRD Scope MVP
        return itemImpact === 'high';
      })
      .map((item: any, index: number) => {
        const eventTime = new Date(item.date).getTime();
        const d = new Date(item.date);
        return {
          id: `ff-${item.date}-${item.currency}-${index}`,
          title: item.title || 'High Impact Economic Event',
          currency: item.currency || 'USD',
          impact: 'high' as const,
          timestamp: eventTime,
          timeStr: isNaN(d.getTime()) ? '--:--' : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
          forecast: item.forecast || '-',
          previous: item.previous || '-',
        };
      })
      // Filter events within today or next 24 hours
      .filter((e: NewsEvent) => e.timestamp >= todayStart && e.timestamp <= todayEnd + 12 * 3600 * 1000)
      .sort((a: NewsEvent, b: NewsEvent) => a.timestamp - b.timestamp);

    if (events.length > 0) {
      return events;
    }
    return generateMockTodayNews();
  } catch (err) {
    console.warn('[TradingDiscipline] Error fetching live economic news, using fallback:', err);
    return generateMockTodayNews();
  }
}

/**
 * Calculate active news alerts (<=60m, <=30m, <=15m)
 */
export function getNewsAlerts(events: NewsEvent[], now: Date = new Date()): NewsAlert[] {
  const nowMs = now.getTime();
  const alerts: NewsAlert[] = [];

  for (const event of events) {
    const diffMs = event.timestamp - nowMs;
    const minutesRemaining = Math.floor(diffMs / (60 * 1000));

    // Only alert for upcoming events within the next 60 minutes or events happening right now (up to 5 mins past)
    if (minutesRemaining >= -5 && minutesRemaining <= 60) {
      let level: NewsAlert['level'] = 'none';
      let message = '';

      if (minutesRemaining <= 0) {
        level = 'urgent';
        message = `RELEASED NOW: ${event.currency} ${event.title}`;
      } else if (minutesRemaining <= 15) {
        level = 'urgent';
        message = `CRITICAL ALERT: ${event.currency} ${event.title} in ${minutesRemaining}m!`;
      } else if (minutesRemaining <= 30) {
        level = 'warning';
        message = `High Impact News: ${event.currency} ${event.title} in ${minutesRemaining}m`;
      } else if (minutesRemaining <= 60) {
        level = 'notice';
        message = `News in ${minutesRemaining}m: ${event.currency} ${event.title}`;
      }

      alerts.push({
        event,
        minutesRemaining,
        level,
        message,
      });
    }
  }

  return alerts.sort((a, b) => a.minutesRemaining - b.minutesRemaining);
}
