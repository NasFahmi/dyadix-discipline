export type StageType = 'preMarket' | 'market' | 'afterMarket';

export interface ChecklistItem {
  id: string;
  title: string;
  completed: boolean;
  createdAt?: number;
}

export interface Strategy {
  id: string;
  name: string;
  preMarket: ChecklistItem[];
  market: ChecklistItem[];
  afterMarket: ChecklistItem[];
  updatedAt?: number;
}

export interface MarketSession {
  id: 'tokyo' | 'london' | 'newyork' | 'overlap';
  name: string;
  city: string;
  startHourUtc: number; // 0-23
  endHourUtc: number;   // 0-23
  isActive: boolean;
  isUpcoming: boolean;
  timeRemainingStr: string;
  badgeText: string;
}

export interface NewsEvent {
  id: string;
  title: string;
  currency: string;
  impact: 'high' | 'medium' | 'low';
  timestamp: number; // epoch ms
  timeStr: string;
  forecast?: string;
  previous?: string;
  actual?: string;
}

export type NewsAlertLevel = 'urgent' | 'warning' | 'notice' | 'none';

export interface NewsAlert {
  event: NewsEvent;
  minutesRemaining: number;
  level: NewsAlertLevel; // <=15m: urgent, <=30m: warning, <=60m: notice
  message: string;
}

export interface OverlayPosition {
  x: number;
  y: number;
}

export interface DisciplineState {
  strategy: Strategy;
  lastResetDate: string; // YYYY-MM-DD
  overlayPosition: OverlayPosition;
  overlayMinimized: boolean;
  overlayLocked: boolean;
  newsFilter: 'high' | 'all';
  activeTab: 'checklist' | 'session' | 'news' | 'settings';
}
