# SupplAi — Prototype Demo Design Spec

## Overview

Interactive prototype demo for PIDI 2026 hackathon submission. SupplAi is an AI-based early warning system for food price volatility in Indonesia. The prototype uses dummy data to let judges experience the full product concept across 5 pages.

**Goal:** Impress judges with a polished, interactive, responsive prototype that demonstrates the SupplAi concept — predicting food prices, visualizing price disparities, recommending redistribution routes, and alerting regional officers (TPID).

## Tech Stack

- **Framework:** Next.js 15 (App Router) + TypeScript
- **Styling:** Tailwind CSS + shadcn/ui components
- **Charts:** Recharts (line chart, bar chart, area chart)
- **Price Matrix:** Custom styled HTML table with color-coded cells (no chart library needed)
- **Maps:** React Simple Maps (SVG-based Indonesia map) with provinsi-level TopoJSON (~200KB)
- **Animations:** Framer Motion (page transitions, counting numbers, route animations)
- **Data:** Dummy data served via Next.js API Routes, generated programmatically via seed script
- **Deploy:** Vercel (`next build` → serverless API routes, NOT static export)

## Design Tokens

**Color Palette:**
- Sidebar / Primary Dark: `#1a1f37`
- Primary Blue: `#2563eb`
- Accent Green (surplus/stable): `#22c55e`
- Accent Yellow (warning): `#eab308`
- Accent Orange (high alert): `#f97316`
- Accent Red (critical/deficit): `#ef4444`
- Background: `#f8fafc`
- Card Background: `#ffffff`
- Text Primary: `#1e293b`
- Text Secondary: `#64748b`

**Typography:** Inter (system font fallback: sans-serif). Headings bold, body regular.

## Pages

### 1. Landing Page (`/`)

Full-screen hero page **without sidebar**. This is a one-time entry point for judges.

**Content:**
- Logo + tagline: "Sistem Peringatan Dini Inflasi Pangan Berbasis AI"
- Animated counting-up stats: Rp4.5T potensi penghematan, 514 kabupaten, 542 TPID, 5 komoditas
- Mini Indonesia map with pulsing dots on critical regions
- Brief explanation of 3 modules (Predict, Match, Agent) with icons
- CTA button: "Masuk ke Dashboard" → navigates to `/dashboard`
- Team info footer (SupplAi - PIDI 2026)

### 2. Dashboard Prediksi (`/dashboard`)

Main prediction dashboard showing price forecasts per commodity per region.

**Default state:** Komoditas = Beras, Wilayah = Jakarta, Rentang = 14 hari.

**Filter bar:**
- Dropdown komoditas: beras, cabai rawit, bawang merah, bawang putih, gula pasir
- Dropdown wilayah: ~20 kabupaten/kota sample
- Selector rentang waktu: 7 hari, 14 hari, 30 hari

**Summary cards (4):**
- Harga saat ini (e.g. Rp14.731/kg for beras Jakarta)
- Perubahan harga (e.g. +147, arrow indicator)
- Prediksi 14 hari (e.g. Rp15.200/kg)
- MAPE / confidence (e.g. 4.8%)

**Charts:**
- Line chart: harga aktual (solid) vs prediksi (dashed) with confidence interval shading (area)
- Bar chart: perbandingan harga antarwilayah

**Interactivity:**
- Filter changes → smooth animated chart/card updates with loading skeleton
- Hover chart → tooltip with price detail
- Click bar chart region → navigate to heatmap for that region

### 3. Heatmap / Price Matrix (`/heatmap`)

Regional price matrix showing price changes across districts as a color-coded table (not a geographic heatmap).

**Summary cards (3):**
- Kabupaten/kota terpantau (514)
- Rata-rata kenaikan harga (+22.4%)
- Jumlah wilayah alert

**Price matrix grid (styled HTML table):**
- Table: rows = ~20 wilayah, columns = dates (7 or 14 days)
- Cell background color: green (stable/down) → yellow (slight increase) → red (spike)
- Hover cell → tooltip: wilayah, date, price, % change
- Sortable by region name / severity

**Right panel:**
- Top 5 Wilayah Kritis list
- Click → navigate to dashboard with that region selected

**Filters:**
- Komoditas dropdown
- Rentang waktu
- Toggle: Harga Aktual vs Prediksi

### 4. Match Redistribusi (`/redistribusi`)

Redistribution recommendation dashboard with Indonesia map.

**Summary cards (4):**
- Jumlah rute rekomendasi (32)
- Total volume redistribusi (845 ton)
- Rute aktif/total (5/13)
- Estimasi biaya logistik (Rp28.5M)

**Indonesia map (main content):**
- SVG map via React Simple Maps with **provinsi-level TopoJSON** (~200KB, 34 provinces)
- Surplus provinces highlighted green, deficit highlighted red
- Dashed lines with animated marker dots showing redistribution routes (simpler than full arc animation, still visually striking)
- Hover province → tooltip: name, surplus/deficit status, stock volume
- Hover route → tooltip: origin, destination, volume, cost

**Left panel:**
- Komoditas filter
- Surplus region list with stock volumes

**Right panel:**
- Linear Programming method info
- Latest recommendations

**Table below map:**
- Redistribution recommendations: origin → destination, commodity, volume (ton), distance, estimated cost, priority (high/medium/low)
- Sortable columns

**Dummy data:** 8 surplus provinces → 10+ deficit kabupaten, ~15 redistribution routes

### 5. Alert Center (`/alerts`)

Monitoring and alert management for TPID officers.

**Summary cards (4):**
- Total alert aktif (38)
- Alert bulan ini (214)
- Rata-rata waktu respons (2.3 hari)
- Alert terselesaikan (127)

**Filters:**
- Severity: Kritis (red), Tinggi (orange), Sedang (yellow), Rendah (blue)
- Komoditas, Wilayah, Status (Aktif/Ditangani/Selesai)

**Alert list:**
- Card-based list per alert:
  - Severity badge (colored)
  - Title (e.g. "Lonjakan Cabai Rawit di Kab. Jayapura naik >30%")
  - Region & commodity
  - Timestamp
  - Status badge
  - Model confidence level (e.g. 87%)
- Click → expand: mini price chart, recommended action, status history

**Interactivity:**
- Real-time filter updates
- Toggle alert status (simulate TPID handling)
- Sort by severity / time / region
- Toast notification simulating new alert arrival

## Shared Layout

**Sidebar (desktop) — only shown on `/dashboard`, `/heatmap`, `/redistribusi`, `/alerts`:**
- Dark navy (#1a1f37) background
- SupplAi logo at top
- Navigation links with icons: Dashboard Prediksi, Heatmap, Match Redistribusi, Alert Center
- Active page highlighted
- Notification badge count on Alert Center link
- Collapsible on tablet

**Landing page (`/`) has NO sidebar** — full-screen standalone hero.

**Responsive behavior:**
- Desktop: sidebar left, full layout per mockup
- Tablet: collapsible hamburger sidebar, charts full width
- Mobile: bottom navigation bar (app-style), cards single column, charts stacked vertical, map full width

## API Routes (Dummy Data)

### Endpoints

```
GET /api/predictions?commodity=beras&region=jakarta&range=14
GET /api/heatmap?commodity=beras&range=14
GET /api/redistribution?commodity=beras
GET /api/alerts?severity=kritis&status=aktif
GET /api/commodities
GET /api/regions
```

### Sample Response Shapes

**GET /api/predictions:**
```ts
{
  summary: {
    currentPrice: 14731,
    priceChange: 147,
    predictedPrice: 15200,
    mape: 4.8
  },
  timeseries: [
    { date: "2026-03-01", actual: 14500, predicted: null, upper: null, lower: null },
    { date: "2026-03-02", actual: 14580, predicted: null, upper: null, lower: null },
    // ... historical days (actual filled, predicted null)
    { date: "2026-03-18", actual: 14731, predicted: 14731, upper: 14900, lower: 14560 },
    { date: "2026-03-19", actual: null, predicted: 14800, upper: 15100, lower: 14500 },
    // ... future days (actual null, predicted filled with upper/lower bounds)
  ],
  comparison: [
    { region: "Jakarta", price: 14731 },
    { region: "Surabaya", price: 14200 },
    { region: "Jayapura", price: 54772 },
    // ...
  ]
}
```

**GET /api/heatmap:**
```ts
{
  summary: { totalRegions: 514, avgIncrease: 22.4, alertCount: 12 },
  matrix: [
    { region: "Jayapura", data: [
      { date: "2026-03-12", price: 54200, change: 2.1 },
      { date: "2026-03-13", price: 55100, change: 1.7 },
      // ...
    ]},
    // ...
  ],
  topCritical: [
    { region: "Jayapura", commodity: "Beras", change: 15.2 },
    // ...
  ]
}
```

**GET /api/redistribution:**
```ts
{
  summary: { totalRoutes: 32, totalVolume: 845, activeRoutes: "5/13", estimatedCost: 28500000 },
  provinces: [
    { id: "JT", name: "Jawa Timur", status: "surplus", stock: 2500 },
    { id: "PA", name: "Papua", status: "deficit", stock: 120 },
    // ...
  ],
  routes: [
    { from: "Jawa Timur", to: "Papua", commodity: "Beras", volume: 150, distance: 3200, cost: 4500000, priority: "high" },
    // ...
  ]
}
```

**GET /api/alerts:**
```ts
{
  summary: { active: 38, thisMonth: 214, avgResponseTime: 2.3, resolved: 127 },
  alerts: [
    {
      id: "ALT-001",
      severity: "kritis",
      title: "Lonjakan Cabai Rawit di Kab. Jayapura naik >30%",
      region: "Jayapura",
      commodity: "Cabai Rawit",
      timestamp: "2026-03-18T08:30:00Z",
      status: "aktif",
      confidence: 87,
      detail: {
        recommendation: "Segera koordinasi dengan TPID Jawa Timur untuk pengiriman 50 ton",
        history: [
          { status: "terdeteksi", timestamp: "2026-03-18T08:30:00Z" },
        ]
      }
    },
    // ...
  ]
}
```

## Dummy Data Generation

A TypeScript seed script (`scripts/generate-dummy-data.ts`) generates all dummy data programmatically:

**Price ranges per commodity (Rp/kg):**
| Commodity | Jawa Base | Papua Base | Volatility |
|-----------|-----------|------------|------------|
| Beras | 14,000-15,500 | 45,000-55,000 | Low |
| Cabai Rawit | 40,000-80,000 | 100,000-150,000 | High |
| Bawang Merah | 35,000-50,000 | 55,000-70,000 | Medium |
| Bawang Putih | 30,000-45,000 | 50,000-65,000 | Medium |
| Gula Pasir | 16,000-18,000 | 22,000-28,000 | Low |

Prices for other regions interpolated between Jawa and Papua extremes based on geographic distance. Daily prices generated with random walk + seasonal patterns (e.g. price spikes near Ramadan). Prediction data continues the trend with added noise for confidence intervals.

Output: TypeScript files in `src/data/` imported by API routes.

## Wow-Factor Polish

- Animated counting-up numbers on landing page and summary cards
- Framer Motion page transitions
- Loading skeletons when switching data (simulate real API feel)
- Smooth chart animations on filter change
- Pulsing dots on map for critical regions
- Dashed route lines with animated marker dots on redistribution map
- Toast notifications for simulated real-time alerts
- Export PDF button: shows toast "Laporan berhasil diunduh" (no actual PDF generation)
- Consistent dark navy theme matching mockups
- Fully responsive (mobile bottom nav)

## Deployment

- GitHub repo: Richjuliano20
- Vercel project: richard-julianos-projects
- Standard `next build` deployed to Vercel with serverless API routes
