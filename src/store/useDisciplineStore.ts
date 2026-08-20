import { create } from 'zustand';
import { ChecklistItem, DisciplineState, StageType, Strategy } from '../types';

const STORAGE_KEY = 'dyadix_discipline_state_v1';

const DEFAULT_STRATEGY: Strategy = {
  id: 'global-strategy-default',
  name: 'XAUUSD Disciplined Execution',
  preMarket: [
    { id: 'pm-1', title: 'Mental Check: Tenang & siap menerima risiko Stop Loss', completed: false, createdAt: Date.now() },
    { id: 'pm-2', title: 'Risk Limits: Risk 0.5%, Max 2 trade, Max loss 1%', completed: false, createdAt: Date.now() },
    { id: 'pm-3', title: 'H4 Bias & Key Levels (Supply/Demand & Swing S&R)', completed: false, createdAt: Date.now() },
    { id: 'pm-4', title: 'News Radar: Cek jadwal high impact news', completed: false, createdAt: Date.now() },
  ],
  market: [
    { id: 'm-1', title: 'Harga memasuki Working Area H1 (searah H4 bias)', completed: false, createdAt: Date.now() },
    { id: 'm-2', title: 'Konfirmasi M15 valid (Rejection / Engulfing / BOS)', completed: false, createdAt: Date.now() },
    { id: 'm-3', title: 'Validasi M5: SL di luar invalidasi & TP berbasis struktur', completed: false, createdAt: Date.now() },
    { id: 'm-4', title: 'Risk Reward memenuhi syarat (Minimal 1:2 / Ideal 1:3)', completed: false, createdAt: Date.now() },
    { id: 'm-5', title: 'Lot size dihitung fix 0.5% (No emotion sizing)', completed: false, createdAt: Date.now() },
    { id: 'm-6', title: 'Zero FOMO & Trade Management: Biarkan sentuh TP/SL', completed: false, createdAt: Date.now() },
  ],
  afterMarket: [
    { id: 'am-1', title: 'Simpan Screenshot (H4, H1, M15, Entry, Exit)', completed: false, createdAt: Date.now() },
    { id: 'am-2', title: 'Catat Jurnal (Pair, Bias, Rationale 1-2 kalimat, Risk, RR, Result)', completed: false, createdAt: Date.now() },
    { id: 'am-3', title: 'Refleksi Kepatuhan: "Apakah saya mengikuti sistem 100%?"', completed: false, createdAt: Date.now() },
  ],
  updatedAt: Date.now(),
};

function getTodayString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const INITIAL_STATE: DisciplineState = {
  strategy: DEFAULT_STRATEGY,
  lastResetDate: getTodayString(),
  overlayPosition: { x: -1, y: 70 }, // -1 indicates default right-aligned
  overlayMinimized: false,
  overlayLocked: false,
  newsFilter: 'high',
  activeTab: 'checklist',
};

interface DisciplineStore extends DisciplineState {
  isInitialized: boolean;
  initialize: () => Promise<void>;
  
  // Checklist Actions
  toggleItem: (stage: StageType, itemId: string) => void;
  addItem: (stage: StageType, title: string) => void;
  updateItem: (stage: StageType, itemId: string, newTitle: string) => void;
  deleteItem: (stage: StageType, itemId: string) => void;
  moveItem: (stage: StageType, itemId: string, direction: 'up' | 'down') => void;
  resetChecklist: () => void;
  
  // Overlay Actions
  setOverlayPosition: (pos: { x: number; y: number }) => void;
  toggleOverlayMinimize: () => void;
  toggleOverlayLock: () => void;
  setActiveTab: (tab: DisciplineState['activeTab']) => void;
  
  // Helpers
  isStageUnlocked: (stage: StageType) => boolean;
  getStageProgress: (stage: StageType) => { completed: number; total: number; percentage: number };
  getTotalProgress: () => { completed: number; total: number; percentage: number };
}

// Storage helpers with fallback
async function saveToStorage(state: Partial<DisciplineState>) {
  try {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      await chrome.storage.local.set({ [STORAGE_KEY]: state });
    } else if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  } catch (err) {
    console.warn('[DisciplineStore] Error saving to storage:', err);
  }
}

async function loadFromStorage(): Promise<Partial<DisciplineState> | null> {
  try {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      const res = await chrome.storage.local.get(STORAGE_KEY);
      return res[STORAGE_KEY] || null;
    } else if (typeof localStorage !== 'undefined') {
      const val = localStorage.getItem(STORAGE_KEY);
      return val ? JSON.parse(val) : null;
    }
  } catch (err) {
    console.warn('[DisciplineStore] Error loading from storage:', err);
  }
  return null;
}

function enforceSequentialConsistency(strategy: Strategy): Strategy {
  const isPreMarketDone =
    strategy.preMarket.length > 0 && strategy.preMarket.every((i) => i.completed);

  let market = strategy.market;
  let afterMarket = strategy.afterMarket;

  if (!isPreMarketDone) {
    // If Pre-Market is incomplete, reset Market and After-Market
    market = market.map((i) => (i.completed ? { ...i, completed: false } : i));
    afterMarket = afterMarket.map((i) => (i.completed ? { ...i, completed: false } : i));
  } else {
    const isMarketDone =
      market.length > 0 && market.every((i) => i.completed);

    if (!isMarketDone) {
      // If Market is incomplete, reset After-Market
      afterMarket = afterMarket.map((i) => (i.completed ? { ...i, completed: false } : i));
    }
  }

  return {
    ...strategy,
    market,
    afterMarket,
  };
}

export const useDisciplineStore = create<DisciplineStore>((set, get) => ({
  ...INITIAL_STATE,
  isInitialized: false,

  initialize: async () => {
    if (get().isInitialized) return;
    
    const saved = await loadFromStorage();
    const today = getTodayString();

    if (saved) {
      let strategy = saved.strategy || DEFAULT_STRATEGY;

      // Check for daily auto-reset of checklist completion (keeping the custom items)
      if (saved.lastResetDate && saved.lastResetDate !== today) {
        strategy = {
          ...strategy,
          preMarket: strategy.preMarket.map((item) => ({ ...item, completed: false })),
          market: strategy.market.map((item) => ({ ...item, completed: false })),
          afterMarket: strategy.afterMarket.map((item) => ({ ...item, completed: false })),
        };
      }

      // Enforce sequential consistency
      strategy = enforceSequentialConsistency(strategy);

      set({
        ...saved,
        strategy,
        lastResetDate: today,
        isInitialized: true,
      });
    } else {
      set({
        ...INITIAL_STATE,
        lastResetDate: today,
        isInitialized: true,
      });
    }

    // Listen for storage changes across popup and content script overlay
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.onChanged) {
      chrome.storage.onChanged.addListener((changes, areaName) => {
        if (areaName === 'local' && changes[STORAGE_KEY]?.newValue) {
          const newState = changes[STORAGE_KEY].newValue;
          if (newState.strategy) {
            newState.strategy = enforceSequentialConsistency(newState.strategy);
          }
          set((state) => ({
            ...state,
            ...newState,
          }));
        }
      });
    }
  },

  isStageUnlocked: (stage: StageType) => {
    const { strategy } = get();
    if (stage === 'preMarket') return true;

    const isPreMarketDone =
      strategy.preMarket.length > 0 &&
      strategy.preMarket.every((item) => item.completed);

    if (stage === 'market') {
      return isPreMarketDone;
    }

    if (stage === 'afterMarket') {
      const isMarketDone =
        strategy.market.length > 0 &&
        strategy.market.every((item) => item.completed);
      return isPreMarketDone && isMarketDone;
    }

    return false;
  },

  getStageProgress: (stage: StageType) => {
    const { strategy } = get();
    const items = strategy[stage] || [];
    const total = items.length;
    const completed = items.filter((i) => i.completed).length;
    const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);
    return { completed, total, percentage };
  },

  getTotalProgress: () => {
    const { strategy } = get();
    const allItems = [...strategy.preMarket, ...strategy.market, ...strategy.afterMarket];
    const total = allItems.length;
    const completed = allItems.filter((i) => i.completed).length;
    const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);
    return { completed, total, percentage };
  },

  toggleItem: (stage: StageType, itemId: string) => {
    // Verify sequential progression before toggling
    if (!get().isStageUnlocked(stage)) {
      return;
    }

    set((state) => {
      const stageItems = state.strategy[stage].map((item) =>
        item.id === itemId ? { ...item, completed: !item.completed } : item
      );

      let newStrategy: Strategy = {
        ...state.strategy,
        [stage]: stageItems,
        updatedAt: Date.now(),
      };

      // Cascade reset invalid downstream stages if an earlier stage becomes incomplete
      newStrategy = enforceSequentialConsistency(newStrategy);

      const updatedState = { ...state, strategy: newStrategy };
      saveToStorage(updatedState);
      return updatedState;
    });
  },

  addItem: (stage: StageType, title: string) => {
    if (!title.trim()) return;

    set((state) => {
      const newItem: ChecklistItem = {
        id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        title: title.trim(),
        completed: false,
        createdAt: Date.now(),
      };

      let newStrategy: Strategy = {
        ...state.strategy,
        [stage]: [...state.strategy[stage], newItem],
        updatedAt: Date.now(),
      };

      // If added to preMarket or market, check if stage completion changed
      newStrategy = enforceSequentialConsistency(newStrategy);

      const updatedState = { ...state, strategy: newStrategy };
      saveToStorage(updatedState);
      return updatedState;
    });
  },

  updateItem: (stage: StageType, itemId: string, newTitle: string) => {
    if (!newTitle.trim()) return;

    set((state) => {
      const newStrategy = {
        ...state.strategy,
        [stage]: state.strategy[stage].map((item) =>
          item.id === itemId ? { ...item, title: newTitle.trim() } : item
        ),
        updatedAt: Date.now(),
      };

      const updatedState = { ...state, strategy: newStrategy };
      saveToStorage(updatedState);
      return updatedState;
    });
  },

  deleteItem: (stage: StageType, itemId: string) => {
    set((state) => {
      let newStrategy: Strategy = {
        ...state.strategy,
        [stage]: state.strategy[stage].filter((item) => item.id !== itemId),
        updatedAt: Date.now(),
      };

      // Enforce sequential consistency
      newStrategy = enforceSequentialConsistency(newStrategy);

      const updatedState = { ...state, strategy: newStrategy };
      saveToStorage(updatedState);
      return updatedState;
    });
  },

  moveItem: (stage: StageType, itemId: string, direction: 'up' | 'down') => {
    set((state) => {
      const items = [...state.strategy[stage]];
      const index = items.findIndex((i) => i.id === itemId);
      if (index === -1) return state;

      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= items.length) return state;

      // Swap
      const temp = items[index];
      items[index] = items[targetIndex];
      items[targetIndex] = temp;

      const newStrategy = {
        ...state.strategy,
        [stage]: items,
        updatedAt: Date.now(),
      };

      const updatedState = { ...state, strategy: newStrategy };
      saveToStorage(updatedState);
      return updatedState;
    });
  },

  resetChecklist: () => {
    set((state) => {
      const newStrategy = {
        ...state.strategy,
        preMarket: state.strategy.preMarket.map((i) => ({ ...i, completed: false })),
        market: state.strategy.market.map((i) => ({ ...i, completed: false })),
        afterMarket: state.strategy.afterMarket.map((i) => ({ ...i, completed: false })),
        updatedAt: Date.now(),
      };

      const updatedState = { ...state, strategy: newStrategy, lastResetDate: getTodayString() };
      saveToStorage(updatedState);
      return updatedState;
    });
  },

  setOverlayPosition: (pos: { x: number; y: number }) => {
    set((state) => {
      const updatedState = { ...state, overlayPosition: pos };
      saveToStorage(updatedState);
      return updatedState;
    });
  },

  toggleOverlayMinimize: () => {
    set((state) => {
      const updatedState = { ...state, overlayMinimized: !state.overlayMinimized };
      saveToStorage(updatedState);
      return updatedState;
    });
  },

  toggleOverlayLock: () => {
    set((state) => {
      const updatedState = { ...state, overlayLocked: !state.overlayLocked };
      saveToStorage(updatedState);
      return updatedState;
    });
  },

  setActiveTab: (tab: DisciplineState['activeTab']) => {
    set((state) => {
      const updatedState = { ...state, activeTab: tab };
      saveToStorage(updatedState);
      return updatedState;
    });
  },
}));
