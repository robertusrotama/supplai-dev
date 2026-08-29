import type { PredictionResponse, HeatmapResponse, HeatmapCell, HeatmapRow, PricePoint } from "@/lib/types"
import { regions } from "./regions"
import heatmapGenerated from "./generated/heatmap.json"
import { generatedTimeSeriesMaster } from "./prediction-chart"
import commodityMape from "./generated/commodity_mape.json"

// Both accessors below read the model's exported artifacts. `getPriceData` used
// to synthesise its series from a seeded random walk instead — it reported beras
// at Rp32.549 where the model says Rp15.350, and a MAPE drawn at random — and it
// threw for any commodity missing from its hard-coded config table, which was
// half of them. Nothing in the UI called it; only /api/predictions did.

const MAPE: Record<string, number> = commodityMape

/** Resolve a region id ("aceh"), a province name ("Aceh"), or nothing, to a province name. */
function provinceName(regionId: string | undefined, available: string[]): string | undefined {
  if (!available.length) return undefined
  if (regionId) {
    const hit = regions.find((r) => r.id === regionId || r.name === regionId)
    const name = hit?.name ?? regionId
    if (available.includes(name)) return name
  }
  return available[0]
}

// ---------------------------------------------------------------------------
// Public API: getPriceData
// ---------------------------------------------------------------------------
export function getPriceData(
  commodityId: string,
  regionId: string,
  range: number = 12
): PredictionResponse {
  const byProvince = generatedTimeSeriesMaster[commodityId] ?? {}
  const provinces = Object.keys(byProvince)
  const prov = provinceName(regionId, provinces)
  const series = prov ? byProvince[prov] ?? [] : []

  const history = series.filter((p) => !p.isFuture)
  const future = series.filter((p) => p.isFuture)

  // Monthly data, so `range` counts months of history, not days.
  const shown = range > 0 ? history.slice(-range) : history

  const timeseries: PricePoint[] = [
    ...shown.map((p) => ({
      date: p.date,
      actual: p.price,
      // The last observed month also carries `predicted` so the forecast line
      // joins the actual line instead of starting in mid-air.
      predicted: p.isToday ? p.price : null,
      upper: null,
      lower: null,
    })),
    ...future.map((p) => ({
      date: p.date,
      actual: null,
      predicted: p.price,
      upper: null,
      lower: null,
    })),
  ]

  const currentPrice = history.length ? history[history.length - 1].price : 0
  const prevPrice = history.length > 1 ? history[history.length - 2].price : currentPrice
  const predictedPrice = future.length ? future[future.length - 1].price : currentPrice

  const comparison = provinces.map((name) => {
    const s = byProvince[name].filter((p) => !p.isFuture)
    return { region: name, price: s.length ? s[s.length - 1].price : 0 }
  })

  return {
    summary: {
      currentPrice,
      priceChange: currentPrice - prevPrice,
      predictedPrice,
      // Backtested horizon-1 MAPE for this commodity, not an estimate.
      mape: MAPE[commodityId] ?? 0,
    },
    timeseries,
    comparison,
  }
}

export function getHeatmapData(commodityId: string, range: number = 12): HeatmapResponse {
  const all = heatmapGenerated as Record<string, HeatmapResponse>
  const src = all[commodityId] ?? all["beras"]

  // `range` memilih berapa bulan RIWAYAT yang ditampilkan. Bulan proyeksi selalu
  // ikut disertakan di ujung kanan — kalau ikut dipotong bersama riwayat, jendela
  // 12 bulan akan termakan 3 bulan prediksi dan riwayatnya tinggal 9.
  const matrix: HeatmapRow[] = src.matrix.map((row) => {
    const hist = row.data.filter((c) => !c.isFuture).slice(-range)
    const future = row.data.filter((c) => c.isFuture)
    const base = hist[0]?.price ?? 1
    const rebase = (c: HeatmapCell): HeatmapCell => ({
      date: c.date,
      price: c.price,
      change: base ? parseFloat((((c.price - base) / base) * 100).toFixed(2)) : 0,
      isFuture: c.isFuture === true,
    })
    return { region: row.region, data: [...hist, ...future].map(rebase) }
  })

  // Ringkasan menggambarkan apa yang sudah terjadi, jadi sel proyeksi diabaikan.
  const histOf = (r: HeatmapRow) => r.data.filter((c) => !c.isFuture)
  const lastChanges = matrix.map((r) => {
    const h = histOf(r)
    return h[h.length - 1]?.change ?? 0
  })
  const avgIncrease = lastChanges.length
    ? parseFloat((lastChanges.reduce((s, v) => s + v, 0) / lastChanges.length).toFixed(2))
    : 0
  const alertCount = matrix.filter((r) => {
    const h = histOf(r)
    if (h.length < 2) return false
    const first = h[0].price
    const last = h[h.length - 1].price
    return first > 0 && ((last - first) / first) * 100 > 10
  }).length

  return {
    summary: { totalRegions: src.summary.totalRegions, avgIncrease, alertCount },
    matrix,
    topCritical: src.topCritical,
  }
}
