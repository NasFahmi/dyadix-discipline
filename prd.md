# PRD — Trading Discipline OS (MVP v1)

## 1. Executive Summary

Trading Discipline OS adalah browser extension yang dirancang untuk mengurangi trading impulsif, FOMO, dan pelanggaran trading plan dengan memaksa trader menjalankan checklist proses sebelum berinteraksi dengan market.

MVP v1 berfokus pada satu masalah utama:

> Trader sudah memiliki strategi, tetapi gagal menjalankannya secara konsisten ketika market sedang bergerak.

Extension akan aktif saat pengguna membuka TradingView dan menampilkan tiga komponen utama:

1. Strategy Checklist
2. Market Session Clock
3. Economic News Dashboard

Target utama MVP bukan meningkatkan profitabilitas, melainkan meningkatkan kepatuhan terhadap proses trading.

---

# 2. Problem Statement

## Kondisi Saat Ini

User melakukan analisis dengan baik di luar jam trading.

Namun ketika membuka TradingView:

* Fokus berpindah ke candle
* Trading plan terlupakan
* FOMO meningkat
* Entry dilakukan di luar sistem

Akibatnya:

* Overtrading
* Revenge trading
* Pelanggaran risk management
* Inkonsistensi eksekusi

---

## Root Cause

Masalah bukan kekurangan strategi.

Masalah utama adalah:

```text
Emotional Execution > Systematic Execution
```

TradingView menjadi pemicu perilaku impulsif.

---

# 3. Goals

## Business Goal

Membentuk kebiasaan trading yang disiplin dan berbasis proses.

---

## Product Goal

Memastikan user melihat dan menyelesaikan checklist sebelum fokus ke market.

---

## Success Metrics

### Primary Metrics

* Checklist completion rate ≥ 80%
* User membuka checklist setiap hari trading
* Semua sesi trading dimulai dari Pre-Market

### Secondary Metrics

* Pengurangan entry impulsif
* Peningkatan kepatuhan terhadap trading plan

---

# 4. Non Goals

Tidak termasuk dalam MVP:

* Multi Strategy
* Multi Website Rules
* Trade Journal
* Analytics Dashboard
* Broker Integration
* TradingView API Integration
* Position Tracking
* AI Analysis
* Trade Execution

---

# 5. User Persona

## Persona 1

### Retail Trader

Karakteristik:

* Trading intraday
* Menggunakan TradingView
* Sudah memiliki strategi
* Sering melanggar aturan sendiri

Pain Points:

* FOMO
* Overtrading
* Tidak disiplin checklist
* Tidak memperhatikan news

---

# 6. Scope MVP

## Feature 1 — Strategy Checklist

### Purpose

Memastikan user menjalankan proses trading secara berurutan.

---

### Structure

#### Pre-Market

Contoh default:

* Check economic news
* Define daily bias
* Mark key levels
* Confirm risk parameters

---

#### Market

Contoh default:

* Price reached POI
* Confirmation valid
* RR meets minimum criteria
* Entry follows strategy
* No FOMO entry

---

#### After-Market

Contoh default:

* Trade reviewed
* Screenshot saved
* Mistakes documented

---

### Rules

#### Sequential Progression

Flow:

```text
Pre-Market
    ↓
Market
    ↓
After-Market
```

Market checklist tidak dapat diakses sebelum Pre-Market selesai.

After-Market tidak dapat diakses sebelum Market selesai.

---

### CRUD Strategy

User dapat:

* Create checklist item
* Edit checklist item
* Delete checklist item
* Reorder checklist item

Scope MVP:

```text
1 Global Strategy
```

Berlaku untuk seluruh penggunaan extension.

---

# Feature 2 — Market Session Clock

### Purpose

Menampilkan status market global secara real-time.

---

### Sessions

#### Asia

Jam aktif

```text
Tokyo Session
```

---

#### London

Jam aktif

```text
London Session
```

---

#### New York

Jam aktif

```text
New York Session
```

---

### Information Display

Menampilkan:

* Session name
* Start time
* End time
* Current active session

---

### Active Status

Contoh:

```text
ACTIVE NOW

London Session
```

atau

```text
ACTIVE NOW

London + New York Overlap
```

---

# Feature 3 — Economic News Dashboard

### Purpose

Mengurangi entry saat volatilitas tinggi akibat news.

---

### Data Display

Menampilkan:

* Event Name
* Currency
* Event Time
* Impact Level

---

### Filter

MVP:

```text
High Impact Only
```

---

### Alerts

Status:

```text
News in 60 minutes
```

```text
News in 30 minutes
```

```text
News in 15 minutes
```

---

# Feature 4 — TradingView Overlay

### Purpose

Menampilkan Trading Discipline Panel ketika TradingView dibuka.

---

### Trigger

URL:

```text
*.tradingview.com/*
```

---

### Overlay Content

Menampilkan:

* Current Session
* Today's News
* Checklist Progress

---

### User Flow

User membuka TradingView

↓

Extension mendeteksi TradingView

↓

Overlay muncul

↓

Checklist ditampilkan

↓

User melanjutkan aktivitas trading

---

# 7. User Flow

## First Time Setup

Install Extension

↓

Open Popup

↓

Create Checklist

↓

Save Strategy

↓

Done

---

## Daily Trading Flow

Open TradingView

↓

View Dashboard

↓

Complete Pre-Market

↓

Market Session

↓

Complete Market Checklist

↓

Complete After-Market

↓

End Trading Day

---

# 8. Technical Requirements

## Platform

Chrome Extension Manifest V3

---

## Stack

### Frontend

* React
* TypeScript
* TailwindCSS
* shadcn/ui

---

### Extension Framework

* WXT

---

### State Management

* Zustand

---

### Storage

* chrome.storage.local

---

### News API

Provider akan ditentukan saat implementasi.

Contoh:

* Forex Factory API wrapper
* Financial Modeling Prep
* Trading Economics

---

# 9. Data Model

## Strategy

```typescript
interface Strategy {
  id: string;
  name: string;

  preMarket: ChecklistItem[];
  market: ChecklistItem[];
  afterMarket: ChecklistItem[];
}
```

---

## Checklist Item

```typescript
interface ChecklistItem {
  id: string;
  title: string;
  completed: boolean;
}
```

---

## News Event

```typescript
interface NewsEvent {
  id: string;
  title: string;
  currency: string;
  impact: 'high';
  timestamp: number;
}
```

---

# 10. Future Roadmap

## V2

* Multiple Strategies
* Website Trigger Rules
* Binance Support
* Bybit Support
* Hyperliquid Support
* Custom Website Rules

---

## V3

* Trading Journal
* Compliance Analytics
* Behavioral Tracking
* Discipline Score
* Weekly Review

---

# 11. Core Product Principle

Trading Discipline OS tidak bertujuan membantu user mencari entry.

Trading Discipline OS bertujuan memastikan user hanya mengambil entry yang sesuai dengan sistem yang telah ditetapkan sebelumnya.

Keberhasilan produk diukur dari peningkatan kepatuhan terhadap proses, bukan dari profit trading.
