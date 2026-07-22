# SupplAi Prototype Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an interactive hackathon prototype with 5 pages (Landing, Dashboard, Heatmap, Redistribusi, Alerts) using dummy data, deployed to Vercel.

**Architecture:** Next.js 15 App Router with route groups — landing page at `/` without sidebar, dashboard pages in `(dashboard)` route group with shared sidebar layout. Dummy data in TypeScript files served via API routes.

**Tech Stack:** Next.js 15, TypeScript, Tailwind CSS, shadcn/ui, Recharts, React Simple Maps, Framer Motion

**Spec:** `docs/superpowers/specs/2026-03-18-supplai-prototype-design.md`

---

## File Structure

```
src/
├── app/
│   ├── globals.css
│   ├── layout.tsx                    # Root layout (no sidebar)
│   ├── page.tsx                      # Landing page
│   ├── (dashboard)/
│   │   ├── layout.tsx                # Dashboard layout WITH sidebar
│   │   ├── dashboard/page.tsx        # Dashboard Prediksi
│   │   ├── heatmap/page.tsx          # Heatmap / Price Matrix
│   │   ├── redistribusi/page.tsx     # Match Redistribusi
│   │   └── alerts/page.tsx           # Alert Center
│   └── api/
│       ├── predictions/route.ts
│       ├── heatmap/route.ts
│       ├── redistribution/route.ts
│       ├── alerts/route.ts
│       ├── commodities/route.ts
│       └── regions/route.ts
├── components/
│   ├── ui/                           # shadcn components (button, card, select, badge, etc.)
│   ├── layout/
│   │   ├── sidebar.tsx               # Desktop sidebar
│   │   ├── bottom-nav.tsx            # Mobile bottom nav
│   │   └── filter-bar.tsx            # Shared filter bar (komoditas, wilayah, rentang)
│   ├── landing/
│   │   ├── hero-section.tsx
│   │   ├── stats-counter.tsx
│   │   ├── modules-section.tsx
│   │   └── mini-map.tsx
│   ├── dashboard/
│   │   ├── summary-cards.tsx
│   │   ├── price-line-chart.tsx
│   │   └── region-bar-chart.tsx
│   ├── heatmap/
│   │   ├── price-matrix.tsx
│   │   └── top-critical.tsx
│   ├── redistribusi/
│   │   ├── indonesia-map.tsx
│   │   ├── route-table.tsx
│   │   └── info-panels.tsx
│   └── alerts/
│       ├── alert-list.tsx
│       ├── alert-card.tsx
│       └── alert-filters.tsx
├── data/
│   ├── commodities.ts
│   ├── regions.ts
│   ├── prices.ts
│   ├── alerts.ts
│   └── redistribution.ts
├── lib/
│   ├── utils.ts                      # shadcn cn() utility
│   ├── format.ts                     # formatRupiah, formatDate, formatPercent
│   └── types.ts                      # Shared TypeScript types
└── hooks/
    └── use-api.ts                    # Simple fetch hook with loading state
public/
└── indonesia-topo.json               # Provinsi-level TopoJSON
```

---

## Chunk 1: Project Setup & Data

### Task 1: Initialize Next.js Project

**Files:**
- Create: `package.json`, `tsconfig.json`, `tailwind.config.ts`, `next.config.ts`

- [ ] **Step 1: Create Next.js 15 project**

```bash
cd /Volumes/Richjuliano/playground_personal/supplai
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm
```

Select defaults. If prompted about existing files, proceed (only docs/ exists).

- [ ] **Step 2: Install dependencies**

```bash
npm install recharts react-simple-maps topojson-client framer-motion
npm install -D @types/topojson-client @types/react-simple-maps
```

- [ ] **Step 3: Install shadcn/ui**

```bash
npx shadcn@latest init -d
npx shadcn@latest add button card badge select dropdown-menu separator skeleton toast sonner tabs table
```

- [ ] **Step 4: Set up design tokens in globals.css**

Update `src/app/globals.css` — add CSS custom properties matching the spec's color palette:
```css
:root {
  --sidebar-bg: #1a1f37;
  --primary-blue: #2563eb;
  --accent-green: #22c55e;
  --accent-yellow: #eab308;
  --accent-orange: #f97316;
  --accent-red: #ef4444;
  --bg-main: #f8fafc;
  --card-bg: #ffffff;
  --text-primary: #1e293b;
  --text-secondary: #64748b;
}
```

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: initialize Next.js 15 project with dependencies"
```

### Task 2: Shared Types & Utilities

**Files:**
- Create: `src/lib/types.ts`
- Create: `src/lib/format.ts`
- Create: `src/lib/utils.ts` (already from shadcn, extend if needed)

- [ ] **Step 1: Create types**

`src/lib/types.ts`:
```ts
export interface Commodity {
  id: string
  name: string
  unit: string
}

export interface Region {
  id: string
  name: string
  province: string
  lat: number
  lng: number
}

export interface PricePoint {
  date: string
  actual: number | null
  predicted: number | null
  upper: number | null
  lower: number | null
}

export interface PredictionSummary {
  currentPrice: number
  priceChange: number
  predictedPrice: number
  mape: number
}

export interface PredictionResponse {
  summary: PredictionSummary
  timeseries: PricePoint[]
  comparison: { region: string; price: number }[]
}

export interface HeatmapCell {
  date: string
  price: number
  change: number
}

export interface HeatmapRow {
  region: string
  data: HeatmapCell[]
}

export interface HeatmapResponse {
  summary: { totalRegions: number; avgIncrease: number; alertCount: number }
  matrix: HeatmapRow[]
  topCritical: { region: string; commodity: string; change: number }[]
}

export interface RedistributionProvince {
  id: string
  name: string
  status: "surplus" | "deficit"
  stock: number
}

export interface RedistributionRoute {
  from: string
  to: string
  commodity: string
  volume: number
  distance: number
  cost: number
  priority: "high" | "medium" | "low"
}

export interface RedistributionResponse {
  summary: { totalRoutes: number; totalVolume: number; activeRoutes: string; estimatedCost: number }
  provinces: RedistributionProvince[]
  routes: RedistributionRoute[]
}

export interface Alert {
  id: string
  severity: "kritis" | "tinggi" | "sedang" | "rendah"
  title: string
  region: string
  commodity: string
  timestamp: string
  status: "aktif" | "ditangani" | "selesai"
  confidence: number
  detail: {
    recommendation: string
    history: { status: string; timestamp: string }[]
  }
}

export interface AlertResponse {
  summary: { active: number; thisMonth: number; avgResponseTime: number; resolved: number }
  alerts: Alert[]
}
```

- [ ] **Step 2: Create format utilities**

`src/lib/format.ts`:
```ts
export function formatRupiah(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("id-ID").format(value)
}

export function formatPercent(value: number): string {
  return `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
  })
}

export function formatShortDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "2-digit",
  })
}
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/types.ts src/lib/format.ts
git commit -m "feat: add shared types and format utilities"
```

### Task 3: Dummy Data Files

**Files:**
- Create: `src/data/commodities.ts`
- Create: `src/data/regions.ts`
- Create: `src/data/prices.ts`
- Create: `src/data/alerts.ts`
- Create: `src/data/redistribution.ts`

- [ ] **Step 1: Create commodities data**

`src/data/commodities.ts`:
```ts
import { Commodity } from "@/lib/types"

export const commodities: Commodity[] = [
  { id: "beras", name: "Beras", unit: "kg" },
  { id: "cabai-rawit", name: "Cabai Rawit", unit: "kg" },
  { id: "bawang-merah", name: "Bawang Merah", unit: "kg" },
  { id: "bawang-putih", name: "Bawang Putih", unit: "kg" },
  { id: "gula-pasir", name: "Gula Pasir", unit: "kg" },
]
```

- [ ] **Step 2: Create regions data**

`src/data/regions.ts`:
```ts
import { Region } from "@/lib/types"

export const regions: Region[] = [
  { id: "jakarta", name: "DKI Jakarta", province: "DKI Jakarta", lat: -6.2, lng: 106.85 },
  { id: "bandung", name: "Kota Bandung", province: "Jawa Barat", lat: -6.91, lng: 107.61 },
  { id: "surabaya", name: "Kota Surabaya", province: "Jawa Timur", lat: -7.25, lng: 112.75 },
  { id: "semarang", name: "Kota Semarang", province: "Jawa Tengah", lat: -6.97, lng: 110.42 },
  { id: "yogyakarta", name: "Kota Yogyakarta", province: "DI Yogyakarta", lat: -7.8, lng: 110.36 },
  { id: "medan", name: "Kota Medan", province: "Sumatera Utara", lat: 3.59, lng: 98.67 },
  { id: "palembang", name: "Kota Palembang", province: "Sumatera Selatan", lat: -2.99, lng: 104.76 },
  { id: "padang", name: "Kota Padang", province: "Sumatera Barat", lat: -0.95, lng: 100.35 },
  { id: "makassar", name: "Kota Makassar", province: "Sulawesi Selatan", lat: -5.14, lng: 119.43 },
  { id: "manado", name: "Kota Manado", province: "Sulawesi Utara", lat: 1.47, lng: 124.84 },
  { id: "palu", name: "Kota Palu", province: "Sulawesi Tengah", lat: -0.9, lng: 119.87 },
  { id: "balikpapan", name: "Kota Balikpapan", province: "Kalimantan Timur", lat: -1.27, lng: 116.83 },
  { id: "pontianak", name: "Kota Pontianak", province: "Kalimantan Barat", lat: -0.03, lng: 109.34 },
  { id: "kupang", name: "Kota Kupang", province: "Nusa Tenggara Timur", lat: -10.17, lng: 123.61 },
  { id: "ambon", name: "Kota Ambon", province: "Maluku", lat: -3.7, lng: 128.18 },
  { id: "jayapura", name: "Kota Jayapura", province: "Papua", lat: -2.53, lng: 140.72 },
  { id: "merauke", name: "Kabupaten Merauke", province: "Papua Selatan", lat: -8.47, lng: 140.4 },
  { id: "sorong", name: "Kota Sorong", province: "Papua Barat Daya", lat: -0.88, lng: 131.25 },
  { id: "manokwari", name: "Kabupaten Manokwari", province: "Papua Barat", lat: -0.86, lng: 134.08 },
  { id: "denpasar", name: "Kota Denpasar", province: "Bali", lat: -8.65, lng: 115.22 },
]
```

- [ ] **Step 3: Create price generator**

`src/data/prices.ts` — generates 90 days historical + 14 days prediction programmatically using seeded random walk. Key logic:

```ts
// Base prices per commodity per region type
const BASE_PRICES: Record<string, { jawa: number; papua: number; volatility: number }> = {
  beras: { jawa: 14700, papua: 54000, volatility: 0.02 },
  "cabai-rawit": { jawa: 60000, papua: 130000, volatility: 0.08 },
  "bawang-merah": { jawa: 42000, papua: 62000, volatility: 0.05 },
  "bawang-putih": { jawa: 37000, papua: 57000, volatility: 0.04 },
  "gula-pasir": { jawa: 17000, papua: 25000, volatility: 0.02 },
}

// Distance factor: 0.0 (Jawa) to 1.0 (Papua) per region
const DISTANCE_FACTORS: Record<string, number> = {
  jakarta: 0.0, bandung: 0.0, surabaya: 0.0, semarang: 0.0, yogyakarta: 0.0,
  medan: 0.2, palembang: 0.15, padang: 0.2, denpasar: 0.1,
  makassar: 0.35, manado: 0.45, palu: 0.4,
  balikpapan: 0.3, pontianak: 0.25,
  kupang: 0.6, ambon: 0.7,
  jayapura: 1.0, merauke: 0.95, sorong: 0.9, manokwari: 0.85,
}
```

Generate using seeded pseudo-random (mulberry32) so data is deterministic. Add seasonal spike around mid-March (simulating approaching Ramadan). Store as a function `getPriceData(commodityId, regionId, range)` that returns `PredictionResponse`.

- [ ] **Step 4: Create alerts data**

`src/data/alerts.ts` — ~30 hardcoded alerts with mixed severity/status/commodity/region. Include realistic titles like "Lonjakan Cabai Rawit di Kab. Jayapura naik >30%".

- [ ] **Step 5: Create redistribution data**

`src/data/redistribution.ts` — 8 surplus provinces, deficit regions, ~15 routes with realistic volumes and costs.

- [ ] **Step 6: Commit**

```bash
git add src/data/
git commit -m "feat: add dummy data generators for all modules"
```

### Task 4: API Routes

**Files:**
- Create: `src/app/api/predictions/route.ts`
- Create: `src/app/api/heatmap/route.ts`
- Create: `src/app/api/redistribution/route.ts`
- Create: `src/app/api/alerts/route.ts`
- Create: `src/app/api/commodities/route.ts`
- Create: `src/app/api/regions/route.ts`

- [ ] **Step 1: Create all 6 API route handlers**

Each route reads query params, calls the corresponding data function, filters as needed, returns JSON. Example pattern:

```ts
// src/app/api/predictions/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getPriceData } from "@/data/prices"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const commodity = searchParams.get("commodity") || "beras"
  const region = searchParams.get("region") || "jakarta"
  const range = parseInt(searchParams.get("range") || "14")

  const data = getPriceData(commodity, region, range)
  return NextResponse.json(data)
}
```

Same pattern for all routes. `/api/commodities` and `/api/regions` just return the static arrays.

- [ ] **Step 2: Verify API routes work**

```bash
npm run dev
# In another terminal:
curl http://localhost:3000/api/commodities
curl http://localhost:3000/api/predictions?commodity=beras&region=jakarta&range=14
```

- [ ] **Step 3: Commit**

```bash
git add src/app/api/
git commit -m "feat: add API routes for all data endpoints"
```

---

## Chunk 2: Layout & Landing Page

### Task 5: Fetch Hook

**Files:**
- Create: `src/hooks/use-api.ts`

- [ ] **Step 1: Create reusable fetch hook**

```ts
"use client"
import { useState, useEffect } from "react"

export function useApi<T>(url: string | null) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!url) return
    setLoading(true)
    fetch(url)
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [url])

  return { data, loading }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/hooks/
git commit -m "feat: add useApi fetch hook"
```

### Task 6: Sidebar & Dashboard Layout

**Files:**
- Create: `src/components/layout/sidebar.tsx`
- Create: `src/components/layout/bottom-nav.tsx`
- Create: `src/app/(dashboard)/layout.tsx`
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Create sidebar component**

Dark navy sidebar (#1a1f37) with:
- SupplAi logo/text at top
- Nav links with icons (use Lucide icons from shadcn): LayoutDashboard, Grid3x3, Map, Bell
- Active state highlight (primary blue left border + bg opacity)
- Alert badge count on Bell icon
- Responsive: hidden on mobile (replaced by bottom-nav)

- [ ] **Step 2: Create bottom nav for mobile**

Fixed bottom bar visible only on `md:hidden`. Same 4 nav items as sidebar with icons + labels.

- [ ] **Step 3: Create dashboard layout**

`src/app/(dashboard)/layout.tsx`:
```tsx
import { Sidebar } from "@/components/layout/sidebar"
import { BottomNav } from "@/components/layout/bottom-nav"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-[#f8fafc]">
      <Sidebar />
      <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
```

- [ ] **Step 4: Update root layout**

Clean root layout with Inter font, no sidebar. Just `<html>` + `<body>` + `{children}` + Toaster from sonner.

- [ ] **Step 5: Verify layout renders**

```bash
npm run dev
# Visit http://localhost:3000/dashboard — should show sidebar + empty content
# Visit http://localhost:3000 — should show no sidebar
```

- [ ] **Step 6: Commit**

```bash
git add src/components/layout/ src/app/layout.tsx "src/app/(dashboard)/layout.tsx"
git commit -m "feat: add sidebar, bottom nav, and dashboard layout"
```

### Task 7: Landing Page

**Files:**
- Create: `src/components/landing/hero-section.tsx`
- Create: `src/components/landing/stats-counter.tsx`
- Create: `src/components/landing/modules-section.tsx`
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Create stats counter component**

Animated counting-up numbers using Framer Motion `useMotionValue` + `useTransform` + `animate`. Props: `value: number`, `prefix?: string`, `suffix?: string`, `label: string`.

- [ ] **Step 2: Create hero section**

Full-screen section with:
- SupplAi logo (text-based, styled)
- Tagline: "Sistem Peringatan Dini Inflasi Pangan Berbasis AI"
- 4 StatsCounter cards in a row: Rp4.5T, 514 kabupaten, 542 TPID, 5 komoditas
- Fade-in animation via Framer Motion

- [ ] **Step 3: Create modules section**

3 cards explaining Predict, Match, Agent modules with icons (TrendingUp, GitBranch, Bot from Lucide). Brief descriptions from the proposal.

- [ ] **Step 4: Assemble landing page**

`src/app/page.tsx`:
```tsx
import { HeroSection } from "@/components/landing/hero-section"
import { ModulesSection } from "@/components/landing/modules-section"
import Link from "next/link"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1f37] to-[#2563eb] text-white">
      <HeroSection />
      <ModulesSection />
      <div className="text-center pb-12">
        <Link href="/dashboard"
          className="inline-block bg-white text-[#1a1f37] font-bold px-8 py-4 rounded-lg text-lg hover:bg-gray-100 transition">
          Masuk ke Dashboard
        </Link>
      </div>
      <footer className="text-center pb-8 text-white/60 text-sm">
        SupplAi — Tim PIDI 2026
      </footer>
    </div>
  )
}
```

- [ ] **Step 5: Verify landing page**

```bash
npm run dev
# Visit http://localhost:3000 — should show hero with animated counters, modules, CTA button
# Click "Masuk ke Dashboard" → should navigate to /dashboard with sidebar
```

- [ ] **Step 6: Commit**

```bash
git add src/components/landing/ src/app/page.tsx
git commit -m "feat: add landing page with animated stats and modules"
```

---

## Chunk 3: Dashboard Prediksi & Heatmap

### Task 8: Filter Bar Component

**Files:**
- Create: `src/components/layout/filter-bar.tsx`

- [ ] **Step 1: Create filter bar**

Reusable filter bar with:
- Komoditas select (from `/api/commodities`)
- Wilayah select (from `/api/regions`)
- Rentang waktu buttons (7/14/30 hari)
- Props: `onFilterChange({ commodity, region, range })`
- Uses shadcn Select components

- [ ] **Step 2: Commit**

```bash
git add src/components/layout/filter-bar.tsx
git commit -m "feat: add reusable filter bar component"
```

### Task 9: Dashboard Prediksi Page

**Files:**
- Create: `src/components/dashboard/summary-cards.tsx`
- Create: `src/components/dashboard/price-line-chart.tsx`
- Create: `src/components/dashboard/region-bar-chart.tsx`
- Create: `src/app/(dashboard)/dashboard/page.tsx`

- [ ] **Step 1: Create summary cards**

4 cards using shadcn Card. Each shows: label, value (large), change indicator with arrow + color (green up = bad for price, red = also bad since it's inflation). Use Skeleton when loading.

- [ ] **Step 2: Create price line chart**

Recharts `ComposedChart` with:
- `Area` for confidence interval (upper/lower, light blue fill)
- `Line` for actual prices (solid blue)
- `Line` for predicted prices (dashed orange)
- Custom tooltip showing date + price
- Responsive via `ResponsiveContainer`

- [ ] **Step 3: Create region bar chart**

Recharts `BarChart` showing price comparison across regions. Horizontal bars sorted by price. Color bars by severity (green < yellow < red). onClick handler to navigate to heatmap.

- [ ] **Step 4: Assemble dashboard page**

`src/app/(dashboard)/dashboard/page.tsx` — client component that:
- Manages filter state (default: beras, jakarta, 14)
- Fetches from `/api/predictions?commodity=...&region=...&range=...`
- Renders FilterBar, SummaryCards, PriceLineChart, RegionBarChart
- Shows Skeleton loading states

- [ ] **Step 5: Verify dashboard**

```bash
npm run dev
# Visit /dashboard — should show filter bar, 4 cards, line chart, bar chart
# Change komoditas → data should update
# Change wilayah → data should update
```

- [ ] **Step 6: Commit**

```bash
git add src/components/dashboard/ "src/app/(dashboard)/dashboard/"
git commit -m "feat: add dashboard prediksi page with charts"
```

### Task 10: Heatmap / Price Matrix Page

**Files:**
- Create: `src/components/heatmap/price-matrix.tsx`
- Create: `src/components/heatmap/top-critical.tsx`
- Create: `src/app/(dashboard)/heatmap/page.tsx`

- [ ] **Step 1: Create price matrix component**

Styled HTML table:
- Rows = regions, columns = dates
- Cell background interpolated: green (#22c55e) at 0% change → yellow (#eab308) at +5% → red (#ef4444) at +15%
- Hover cell → show absolute positioned tooltip with details
- Sticky first column (region name)
- Sortable header click (by region name or by max change)

- [ ] **Step 2: Create top critical panel**

Right-side panel listing top 5 regions with highest price increase. Each item shows region name, commodity, % change with colored badge. Click navigates to `/dashboard?region=...`.

- [ ] **Step 3: Assemble heatmap page**

Client component with:
- Filter bar (komoditas, rentang waktu, aktual/prediksi toggle)
- 3 summary cards
- Main content: price matrix (left ~70%) + top critical panel (right ~30%)
- Fetch from `/api/heatmap`

- [ ] **Step 4: Verify heatmap**

```bash
npm run dev
# Visit /heatmap — should show colored matrix, hover cells for tooltips
# Change komoditas → matrix updates
```

- [ ] **Step 5: Commit**

```bash
git add src/components/heatmap/ "src/app/(dashboard)/heatmap/"
git commit -m "feat: add heatmap price matrix page"
```

---

## Chunk 4: Redistribusi & Alerts

### Task 11: Indonesia TopoJSON

**Files:**
- Create: `public/indonesia-topo.json`

- [ ] **Step 1: Download and add Indonesia provinsi-level TopoJSON**

Download a simplified Indonesia provinsi TopoJSON. Use the Natural Earth / GADM simplified version. Place in `public/indonesia-topo.json`. If no suitable file found online, create a simplified GeoJSON with province boundaries manually converted to TopoJSON.

Alternative approach: use `@react-simple-maps/indonesia` or fetch from a CDN. If the TopoJSON is hard to source, use a simplified GeoJSON directly with React Simple Maps (it supports both).

- [ ] **Step 2: Commit**

```bash
git add public/indonesia-topo.json
git commit -m "feat: add Indonesia provinsi-level TopoJSON"
```

### Task 12: Match Redistribusi Page

**Files:**
- Create: `src/components/redistribusi/indonesia-map.tsx`
- Create: `src/components/redistribusi/route-table.tsx`
- Create: `src/components/redistribusi/info-panels.tsx`
- Create: `src/app/(dashboard)/redistribusi/page.tsx`

- [ ] **Step 1: Create Indonesia map component**

Using React Simple Maps:
- Load TopoJSON from `/indonesia-topo.json`
- Color provinces: green for surplus, red for deficit, gray for neutral
- Add `Marker` components at province centroids for surplus/deficit labels
- Add `Line` components for redistribution routes (from → to using lat/lng)
- Animate lines with CSS dashed animation (`stroke-dashoffset` keyframes)
- Tooltip on hover (province name, status, stock)
- Responsive via container width

- [ ] **Step 2: Create route table**

shadcn Table showing redistribution routes:
- Columns: Asal, Tujuan, Komoditas, Volume (ton), Jarak (km), Biaya, Prioritas
- Priority badge: high=red, medium=orange, low=blue
- Sortable columns
- Format numbers with formatRupiah

- [ ] **Step 3: Create info panels**

Left panel: komoditas filter + surplus region list
Right panel: "Linear Programming" info card + action summary

- [ ] **Step 4: Assemble redistribusi page**

Client component with:
- 4 summary cards
- Map (center) with panels (left/right) on desktop, stacked on mobile
- Route table below
- Fetch from `/api/redistribution`

- [ ] **Step 5: Verify redistribusi**

```bash
npm run dev
# Visit /redistribusi — should show map with colored provinces and route lines
# Hover provinces and routes for tooltips
# Table below with sortable columns
```

- [ ] **Step 6: Commit**

```bash
git add src/components/redistribusi/ "src/app/(dashboard)/redistribusi/" public/indonesia-topo.json
git commit -m "feat: add match redistribusi page with map and routes"
```

### Task 13: Alert Center Page

**Files:**
- Create: `src/components/alerts/alert-card.tsx`
- Create: `src/components/alerts/alert-list.tsx`
- Create: `src/components/alerts/alert-filters.tsx`
- Create: `src/app/(dashboard)/alerts/page.tsx`

- [ ] **Step 1: Create alert card component**

Card displaying single alert:
- Left: severity color stripe (vertical bar)
- Badge for severity (Kritis/Tinggi/Sedang/Rendah with colors)
- Title, region, commodity, timestamp (relative: "2 jam lalu")
- Status badge (Aktif=red, Ditangani=yellow, Selesai=green)
- Confidence meter (small progress bar)
- Expandable: click to show recommendation text + status history timeline
- Toggle status button (simulate TPID changing status)

- [ ] **Step 2: Create alert filters**

Filter row with:
- Severity filter buttons (toggle each)
- Komoditas select
- Wilayah select
- Status select
- All filters update a query string, parent re-fetches

- [ ] **Step 3: Create alert list**

Container that maps alerts array to AlertCard components. Handles empty state. Sorts by severity (kritis first) then timestamp.

- [ ] **Step 4: Assemble alerts page**

Client component with:
- 4 summary cards (active, this month, avg response time, resolved)
- AlertFilters
- AlertList
- Fetch from `/api/alerts`
- Toast notification on mount: "1 peringatan baru terdeteksi" (simulate real-time)

- [ ] **Step 5: Verify alerts**

```bash
npm run dev
# Visit /alerts — should show summary cards, filters, alert cards
# Click alert card to expand details
# Toggle severity filters to filter list
# Toast should appear on page load
```

- [ ] **Step 6: Commit**

```bash
git add src/components/alerts/ "src/app/(dashboard)/alerts/"
git commit -m "feat: add alert center page with filters and expandable cards"
```

---

## Chunk 5: Polish & Deploy

### Task 14: Animations & Polish

**Files:**
- Modify: various components

- [ ] **Step 1: Add page transition animations**

Wrap each page content in a Framer Motion `motion.div` with fade + slight slide-up:
```tsx
<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
  {/* page content */}
</motion.div>
```

- [ ] **Step 2: Add loading skeletons**

Use shadcn Skeleton in summary cards and chart areas when `loading` is true from useApi hook. Show skeleton cards (same dimensions) and a skeleton rectangle for charts.

- [ ] **Step 3: Add animated counter to summary cards**

Use the same counting animation from landing page StatsCounter for the summary cards on each dashboard page. Animate from 0 to value on mount.

- [ ] **Step 4: Add notification badge to sidebar**

Show a red badge with "3" on the Alert Center nav item in sidebar and bottom nav. Hardcoded count.

- [ ] **Step 5: Add export PDF button**

On dashboard page, add a "Export Laporan" button in the filter bar area. onClick: show sonner toast "Laporan berhasil diunduh".

- [ ] **Step 6: Verify all animations**

```bash
npm run dev
# Navigate between pages — should see smooth transitions
# Loading states should show skeletons before data loads
# Summary card numbers should animate counting up
# Export button should show toast
```

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: add animations, skeletons, and polish"
```

### Task 15: Build Verification & Deploy

**Files:**
- Modify: `next.config.ts` (if needed)
- Create: `.gitignore` updates if needed

- [ ] **Step 1: Verify production build**

```bash
npm run build
```

Fix any TypeScript errors or build warnings.

- [ ] **Step 2: Test production server locally**

```bash
npm start
# Visit http://localhost:3000 — test all 5 pages, verify all features work
```

- [ ] **Step 3: Initialize GitHub repo and push**

```bash
git remote add origin https://github.com/Richjuliano20/supplai.git
git branch -M main
git push -u origin main
```

Note: Create the repo on GitHub first at https://github.com/new (name: `supplai`, public).

- [ ] **Step 4: Deploy to Vercel**

```bash
npx vercel --prod
```

Or connect the GitHub repo to the Vercel project at https://vercel.com/richard-julianos-projects for automatic deploys.

- [ ] **Step 5: Verify deployed site**

Visit the Vercel deployment URL. Test all 5 pages on desktop and mobile. Verify:
- Landing page animations work
- Dashboard charts render
- Heatmap colors display correctly
- Redistribusi map shows routes
- Alerts expand and filter
- Mobile bottom nav works

- [ ] **Step 6: Final commit with deploy URL**

Update README or just note the URL. Commit any final fixes.

```bash
git add -A
git commit -m "feat: production build and deploy to Vercel"
git push
```
