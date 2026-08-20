# Trading Discipline OS (MVP v1)

**Trading Discipline OS** is a Chrome Extension (Manifest V3) designed to eliminate emotional and impulsive trading by enforcing a strict checklist process, real-time market session clock, economic news radar, and an interactive TradingView overlay HUD.

---

## 🎯 Core Product Principle

> *Trading Discipline OS does not give trading signals.*
> *It forces traders to strictly execute their pre-defined systematic process before risking capital.*

---

## ✨ Features

1. **Sequential Strategy Checklist**:
   - **Step 1: Pre-Market Preparation** (News review, daily bias, POI levels, max risk limit).
   - **Step 2: Market Execution** (Locked until Pre-Market is 100% complete — POI trigger, confirmation, RR $\ge 1:2$, zero FOMO).
   - **Step 3: After-Market Reflection** (Locked until Market is 100% complete — trade review, chart screenshot, mistakes logged).
   - **Full CRUD & Reorder**: Add, edit, delete, and reorder checklist rules.
   - **Daily Auto-Reset**: Checklist status resets each day while preserving custom rules.

2. **Market Session Clock**:
   - Real-time status for **Tokyo (Asia)**, **London**, and **New York** sessions.
   - **High-Volume Overlap Detection** (e.g., London + New York Overlap).
   - Dynamic time countdowns (*"Closes in 2h 45m"*, *"Opens in 1h 10m"*).
   - Dual UTC and Local Time clocks.

3. **Economic News Radar**:
   - Filtered for **High-Impact Only** events.
   - Real-time time-proximity alerts ($\le 60$m notice, $\le 30$m warning, $\le 15$m urgent red alert).
   - Currency tags, forecast, and previous values.

4. **TradingView Overlay HUD (`*.tradingview.com/*`)**:
   - Automatically injects a floating discipline panel into TradingView via **Shadow DOM** (`createShadowRootUi`).
   - Draggable, lockable, and collapsible into a sleek floating status pill.
   - Synchronized in real-time with popup via `chrome.storage.local`.

---

## 🛠️ Tech Stack

- **Framework**: [WXT](https://wxt.dev/) (Vite + Web Extension MV3)
- **UI & Styling**: React 19, TypeScript, TailwindCSS, Lucide React icons
- **State Management**: Zustand with `chrome.storage.local` persistence
- **Design System**: UI/UX Pro Max OLED Dark Fintech Theme (`#020617`, `#0E1223`, `#22C55E`, `#EF4444`)

---

## 🚀 Getting Started

### 1. Installation

```bash
# Install dependencies
npm install
```

### 2. Development Mode

```bash
# Start WXT dev server with auto-reload
npm run dev
```

### 3. Production Build

```bash
# Build Chrome Extension
npm run build
```

The compiled extension will be placed in `.output/chrome-mv3/`.

### 4. Load into Google Chrome

1. Open Chrome and navigate to `chrome://extensions/`.
2. Enable **Developer mode** (toggle in the top-right corner).
3. Click **Load unpacked** and select the folder:
   ```text
   d:\Project\Python\Bot\dyadix-discipline\.output\chrome-mv3
   ```
4. Open [TradingView](https://www.tradingview.com/chart/) to see the floating Discipline Overlay HUD in action, or click the extension icon in Chrome toolbar to open the Popup dashboard!
