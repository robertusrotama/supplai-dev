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
