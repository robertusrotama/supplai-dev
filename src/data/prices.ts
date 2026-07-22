import type { PredictionResponse, HeatmapResponse, HeatmapCell, HeatmapRow } from "@/lib/types"
import { regions } from "./regions"

// ---------------------------------------------------------------------------
// Seeded PRNG (mulberry32)
// ---------------------------------------------------------------------------
function mulberry32(seed: number) {
  return function () {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// ---------------------------------------------------------------------------
// Static config tables
// ---------------------------------------------------------------------------
interface CommodityConfig {
  javaMin: number
  javaMax: number
  papuaMin: number
  papuaMax: number
  volatility: number
  mapeMin: number
  mapeMax: number
}

const COMMODITY_CONFIG: Record<string, CommodityConfig> = {
  "beras": {
    javaMin: 14000, javaMax: 15500,
    papuaMin: 45000, papuaMax: 55000,
    volatility: 0.02,
    mapeMin: 3, mapeMax: 6,
  },
  "cabai-rawit": {
    javaMin: 40000, javaMax: 80000,
    papuaMin: 100000, papuaMax: 150000,
    volatility: 0.08,
    mapeMin: 7, mapeMax: 12,
  },
  "bawang-merah": {
    javaMin: 35000, javaMax: 50000,
    papuaMin: 55000, papuaMax: 70000,
    volatility: 0.05,
    mapeMin: 5, mapeMax: 9,
  },
  "bawang-putih": {
    javaMin: 30000, javaMax: 45000,
    papuaMin: 50000, papuaMax: 65000,
    volatility: 0.04,
    mapeMin: 4, mapeMax: 8,
  },
  "gula-pasir": {
    javaMin: 16000, javaMax: 18000,
    papuaMin: 22000, papuaMax: 28000,
    volatility: 0.02,
    mapeMin: 3, mapeMax: 5,
  },
}

const DISTANCE_FACTOR: Record<string, number> = {
  jakarta: 0.0,
  bandung: 0.0,
  surabaya: 0.0,
  semarang: 0.0,
  yogyakarta: 0.0,
  denpasar: 0.1,
  medan: 0.2,
  palembang: 0.15,
  padang: 0.2,
  makassar: 0.35,
  palu: 0.4,
  manado: 0.45,
  balikpapan: 0.3,
  pontianak: 0.25,
  kupang: 0.6,
  ambon: 0.7,
  manokwari: 0.85,
  sorong: 0.9,
  merauke: 0.95,
  jayapura: 1.0,
}

// ---------------------------------------------------------------------------
// Date helpers
// ---------------------------------------------------------------------------
function addDays(base: Date, n: number): string {
  const d = new Date(base)
  d.setUTCDate(d.getUTCDate() + n)
  return d.toISOString().slice(0, 10)
}

// Historical start: 2025-12-19, 90 days → ends 2026-03-18
// Prediction: 2026-03-19 → 2026-04-01 (14 days)
const HIST_START = new Date("2025-12-19T00:00:00Z")
const HIST_DAYS = 90
const PRED_DAYS = 14

// ---------------------------------------------------------------------------
// Core generator: returns full 104-day price array for one commodity + region
// ---------------------------------------------------------------------------
function generateFullSeries(
  commodityId: string,
  regionId: string
): { date: string; actual: number | null; predicted: number | null; upper: number | null; lower: number | null }[] {
  const cfg = COMMODITY_CONFIG[commodityId]
  if (!cfg) return []

  const distFactor = DISTANCE_FACTOR[regionId] ?? 0.5

  // Derive base price for the region (midpoint of java/papua range interpolated by distance)
  const javaMid = (cfg.javaMin + cfg.javaMax) / 2
  const papuaMid = (cfg.papuaMin + cfg.papuaMax) / 2
  const regionBase = javaMid + (papuaMid - javaMid) * distFactor

  // Seed is deterministic per commodity+region pair
  const seedStr = `${commodityId}-${regionId}`
  let seedNum = 0
  for (let i = 0; i < seedStr.length; i++) {
    seedNum = (seedNum * 31 + seedStr.charCodeAt(i)) >>> 0
  }
  const rand = mulberry32(seedNum + 123456)

  // Random-walk historical prices with upward trend (inflation narrative)
  const prices: number[] = []
  // Start ~8% below base so the chart rises toward and above base over 90 days
  let price = regionBase * (0.90 + rand() * 0.03)

  // Target price rises over time: starts low, ends ~5-10% above base
  // This creates a clear upward trend matching the inflation/Ramadan narrative
  const totalDays = HIST_DAYS + PRED_DAYS

  for (let d = 0; d < totalDays; d++) {
    // Base upward drift: ~0.1% per day → ~10% over 90 days
    let trendBias = regionBase * 0.001

    // Accelerating Ramadan spike: stronger in the last 25 days of historical + all prediction
    if (d >= 65) {
      // Ramp up: starts at 0.15%, peaks at 0.4% per day
      const rampProgress = Math.min((d - 65) / 30, 1)
      trendBias = regionBase * (0.0015 + 0.0025 * rampProgress)
    }

    // Prediction period: continue upward trend even more (the "warning" the system gives)
    if (d >= HIST_DAYS) {
      trendBias = regionBase * 0.004
    }

    // Light mean-reversion toward the TRENDING target, not the static base
    // Target rises linearly from 0.92*base to 1.08*base
    const trendTarget = regionBase * (0.92 + 0.18 * (d / totalDays))
    const meanReversion = (trendTarget - price) * 0.02

    // Random noise + mean reversion + trend bias
    const noise = (rand() - 0.50) * cfg.volatility * price
    const change = noise + meanReversion + trendBias

    // Floor at 85% of javaMin
    price = Math.max(price + change, cfg.javaMin * 0.85)
    prices.push(Math.round(price))
  }

  const result = []
  for (let d = 0; d < HIST_DAYS; d++) {
    result.push({
      date: addDays(HIST_START, d),
      actual: prices[d],
      predicted: null,
      upper: null,
      lower: null,
    })
  }
  for (let d = 0; d < PRED_DAYS; d++) {
    const p = prices[HIST_DAYS + d]
    result.push({
      date: addDays(HIST_START, HIST_DAYS + d),
      actual: null,
      predicted: p,
      upper: Math.round(p * 1.03),
      lower: Math.round(p * 0.97),
    })
  }
  return result
}

// ---------------------------------------------------------------------------
// Cache to avoid re-generating identical series
// ---------------------------------------------------------------------------
const seriesCache = new Map<string, ReturnType<typeof generateFullSeries>>()

function getCachedSeries(commodityId: string, regionId: string) {
  const key = `${commodityId}:${regionId}`
  if (!seriesCache.has(key)) {
    seriesCache.set(key, generateFullSeries(commodityId, regionId))
  }
  return seriesCache.get(key)!
}

// ---------------------------------------------------------------------------
// Public API: getPriceData
// ---------------------------------------------------------------------------
export function getPriceData(
  commodityId: string,
  regionId: string,
  range: number = 30
): PredictionResponse {
  const full = getCachedSeries(commodityId, regionId)
  const cfg = COMMODITY_CONFIG[commodityId] ?? COMMODITY_CONFIG["beras"]

  // Last `range` historical days + all prediction days
  const histSlice = full.slice(Math.max(0, HIST_DAYS - range), HIST_DAYS)
  const predSlice = full.slice(HIST_DAYS)
  const timeseries = [...histSlice, ...predSlice]

  // Summary
  const lastActual = full[HIST_DAYS - 1].actual ?? 0
  const prevActual = full[HIST_DAYS - 2].actual ?? 0
  const lastPredicted = full[full.length - 1].predicted ?? 0

  // Seeded MAPE per commodity+region
  const seedStr = `mape-${commodityId}-${regionId}`
  let seedNum = 0
  for (let i = 0; i < seedStr.length; i++) {
    seedNum = (seedNum * 31 + seedStr.charCodeAt(i)) >>> 0
  }
  const mapeRand = mulberry32(seedNum + 999)
  const mape = cfg.mapeMin + mapeRand() * (cfg.mapeMax - cfg.mapeMin)

  // Comparison: current price for all regions for same commodity
  const comparison = regions.map((r) => {
    const series = getCachedSeries(commodityId, r.id)
    return {
      region: r.name,
      price: series[HIST_DAYS - 1].actual ?? 0,
    }
  })

  return {
    summary: {
      currentPrice: lastActual,
      priceChange: lastActual - prevActual,
      predictedPrice: lastPredicted,
      mape: parseFloat(mape.toFixed(2)),
    },
    timeseries,
    comparison,
  }
}

// ---------------------------------------------------------------------------
// Public API: getHeatmapData
// ---------------------------------------------------------------------------
export function getHeatmapData(commodityId: string, range: number = 14): HeatmapResponse {
  const matrix: HeatmapRow[] = regions.map((r) => {
    const full = getCachedSeries(commodityId, r.id)
    // Last `range` historical days
    const slice = full.slice(Math.max(0, HIST_DAYS - range), HIST_DAYS)

    // Use cumulative change from the first day in the range so that
    // regional price divergence (driven by distance factor) produces a
    // rich spread of green → yellow → orange → red cells.
    const basePrice = slice[0]?.actual ?? 1
    const data: HeatmapCell[] = slice.map((point) => {
      const curr = point.actual ?? 0
      const change = basePrice !== 0 ? ((curr - basePrice) / basePrice) * 100 : 0
      return {
        date: point.date,
        price: curr,
        change: parseFloat(change.toFixed(2)),
      }
    })

    return { region: r.name, data }
  })

  // avgIncrease: mean of last-day change across all regions
  const lastDayChanges = matrix.map((row) => row.data[row.data.length - 1]?.change ?? 0)
  const avgIncrease = lastDayChanges.reduce((s, v) => s + v, 0) / lastDayChanges.length

  // alertCount: regions where cumulative change over range > 10%
  const alertCount = matrix.filter((row) => {
    if (row.data.length < 2) return false
    const first = row.data[0].price
    const last = row.data[row.data.length - 1].price
    return first > 0 && ((last - first) / first) * 100 > 10
  }).length

  // topCritical: top 5 rows by average absolute change
  const scored = matrix.map((row) => ({
    region: row.region,
    avgChange:
      row.data.reduce((s, c) => s + Math.abs(c.change), 0) / (row.data.length || 1),
  }))
  scored.sort((a, b) => b.avgChange - a.avgChange)

  const topCritical = scored.slice(0, 5).map((s) => ({
    region: s.region,
    commodity: commodityId,
    change: parseFloat(s.avgChange.toFixed(2)),
  }))

  return {
    summary: {
      totalRegions: 514,
      avgIncrease: parseFloat(avgIncrease.toFixed(2)),
      alertCount,
    },
    matrix,
    topCritical,
  }
}
