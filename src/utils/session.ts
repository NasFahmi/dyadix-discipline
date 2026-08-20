import { MarketSession } from '../types';

export interface SessionConfig {
  id: 'tokyo' | 'london' | 'newyork';
  name: string;
  city: string;
  startHourUtc: number;
  endHourUtc: number;
}

export const SESSION_CONFIGS: SessionConfig[] = [
  {
    id: 'tokyo',
    name: 'Tokyo (Asia) Session',
    city: 'Tokyo',
    startHourUtc: 0,
    endHourUtc: 9,
  },
  {
    id: 'london',
    name: 'London Session',
    city: 'London',
    startHourUtc: 8,
    endHourUtc: 17,
  },
  {
    id: 'newyork',
    name: 'New York Session',
    city: 'New York',
    startHourUtc: 13,
    endHourUtc: 22,
  },
];

/**
 * Format hours and minutes as 2-digit HH:MM
 */
export function formatHHMM(hours: number, minutes: number = 0): string {
  const h = hours.toString().padStart(2, '0');
  const m = minutes.toString().padStart(2, '0');
  return `${h}:${m}`;
}

/**
 * Convert UTC hour to local time string
 */
export function utcToLocalTimeStr(utcHour: number): string {
  const d = new Date();
  d.setUTCHours(utcHour, 0, 0, 0);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
}

/**
 * Calculate active state and time remaining for each session
 */
export function getMarketSessions(now: Date = new Date()): {
  sessions: MarketSession[];
  activeSummary: string;
  isOverlap: boolean;
  utcTimeStr: string;
  localTimeStr: string;
} {
  const currentUtcHour = now.getUTCHours();
  const currentUtcMinute = now.getUTCMinutes();
  const currentDecimalUtc = currentUtcHour + currentUtcMinute / 60;

  const sessions: MarketSession[] = SESSION_CONFIGS.map((config) => {
    let isActive = false;
    let timeRemainingStr = '';

    if (config.startHourUtc < config.endHourUtc) {
      // Normal within-day range
      isActive = currentDecimalUtc >= config.startHourUtc && currentDecimalUtc < config.endHourUtc;
      
      if (isActive) {
        const remainingHours = Math.floor(config.endHourUtc - currentDecimalUtc);
        const remainingMins = Math.floor(((config.endHourUtc - currentDecimalUtc) - remainingHours) * 60);
        timeRemainingStr = `Closes in ${remainingHours}h ${remainingMins}m`;
      } else {
        let diff = config.startHourUtc - currentDecimalUtc;
        if (diff < 0) diff += 24;
        const untilHours = Math.floor(diff);
        const untilMins = Math.floor((diff - untilHours) * 60);
        timeRemainingStr = `Opens in ${untilHours}h ${untilMins}m`;
      }
    } else {
      // Overnight range
      isActive = currentDecimalUtc >= config.startHourUtc || currentDecimalUtc < config.endHourUtc;
      if (isActive) {
        let diff = config.endHourUtc - currentDecimalUtc;
        if (diff < 0) diff += 24;
        const remainingHours = Math.floor(diff);
        const remainingMins = Math.floor((diff - remainingHours) * 60);
        timeRemainingStr = `Closes in ${remainingHours}h ${remainingMins}m`;
      } else {
        const diff = config.startHourUtc - currentDecimalUtc;
        const untilHours = Math.floor(diff);
        const untilMins = Math.floor((diff - untilHours) * 60);
        timeRemainingStr = `Opens in ${untilHours}h ${untilMins}m`;
      }
    }

    const localStart = utcToLocalTimeStr(config.startHourUtc);
    const localEnd = utcToLocalTimeStr(config.endHourUtc);

    return {
      id: config.id,
      name: config.name,
      city: config.city,
      startHourUtc: config.startHourUtc,
      endHourUtc: config.endHourUtc,
      isActive,
      isUpcoming: !isActive,
      timeRemainingStr,
      badgeText: `${localStart} - ${localEnd} (${formatHHMM(config.startHourUtc)} - ${formatHHMM(config.endHourUtc)} UTC)`,
    };
  });

  const activeList = sessions.filter((s) => s.isActive);
  const isLondonActive = sessions.find((s) => s.id === 'london')?.isActive || false;
  const isNewYorkActive = sessions.find((s) => s.id === 'newyork')?.isActive || false;
  const isOverlap = isLondonActive && isNewYorkActive;

  let activeSummary = 'Off Hours / Asian Pre-Market';
  if (isOverlap) {
    activeSummary = 'London + New York Overlap';
  } else if (activeList.length > 0) {
    activeSummary = activeList.map((s) => s.name.replace(' (Asia)', '')).join(' + ');
  }

  const utcTimeStr = `${formatHHMM(now.getUTCHours(), now.getUTCMinutes())} UTC`;
  const localTimeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  return {
    sessions,
    activeSummary,
    isOverlap,
    utcTimeStr,
    localTimeStr,
  };
}
