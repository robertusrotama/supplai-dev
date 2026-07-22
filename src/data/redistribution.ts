import type {
  RedistributionResponse,
  RedistributionProvince,
  RedistributionRoute,
} from "@/lib/types"

// ---------------------------------------------------------------------------
// Provinces
// ---------------------------------------------------------------------------
const provinces: RedistributionProvince[] = [
  // Surplus
  { id: "jawa-timur", name: "Jawa Timur", status: "surplus", stock: 2500 },
  { id: "jawa-barat", name: "Jawa Barat", status: "surplus", stock: 1800 },
  { id: "jawa-tengah", name: "Jawa Tengah", status: "surplus", stock: 1500 },
  { id: "sulawesi-selatan", name: "Sulawesi Selatan", status: "surplus", stock: 900 },
  { id: "sumatera-selatan", name: "Sumatera Selatan", status: "surplus", stock: 700 },
  { id: "lampung", name: "Lampung", status: "surplus", stock: 600 },
  { id: "kalimantan-selatan", name: "Kalimantan Selatan", status: "surplus", stock: 400 },
  { id: "bali", name: "Bali", status: "surplus", stock: 300 },
  // Deficit
  { id: "papua", name: "Papua", status: "deficit", stock: 120 },
  { id: "papua-barat", name: "Papua Barat", status: "deficit", stock: 80 },
  { id: "maluku", name: "Maluku", status: "deficit", stock: 150 },
  { id: "ntt", name: "NTT", status: "deficit", stock: 200 },
  { id: "sulawesi-tengah", name: "Sulawesi Tengah", status: "deficit", stock: 180 },
  { id: "kalimantan-barat", name: "Kalimantan Barat", status: "deficit", stock: 250 },
  { id: "papua-selatan", name: "Papua Selatan", status: "deficit", stock: 90 },
  { id: "maluku-utara", name: "Maluku Utara", status: "deficit", stock: 100 },
  { id: "ntb", name: "NTB", status: "deficit", stock: 220 },
  { id: "sulawesi-utara", name: "Sulawesi Utara", status: "deficit", stock: 160 },
]

// Cost estimate: Rp1.500/ton/km (realistic inter-island bulk freight)
function calcCost(volume: number, distance: number): number {
  return volume * distance * 1500
}

// ---------------------------------------------------------------------------
// Routes (~15 realistic routes)
// ---------------------------------------------------------------------------
const allRoutes: RedistributionRoute[] = [
  {
    from: "Jawa Timur",
    to: "Papua",
    commodity: "beras",
    volume: 500,
    distance: 3800,
    cost: calcCost(500, 3800),
    priority: "high",
  },
  {
    from: "Jawa Timur",
    to: "Papua Selatan",
    commodity: "beras",
    volume: 200,
    distance: 4100,
    cost: calcCost(200, 4100),
    priority: "high",
  },
  {
    from: "Jawa Timur",
    to: "Papua Barat",
    commodity: "gula-pasir",
    volume: 150,
    distance: 3600,
    cost: calcCost(150, 3600),
    priority: "high",
  },
  {
    from: "Sulawesi Selatan",
    to: "Maluku",
    commodity: "beras",
    volume: 300,
    distance: 1200,
    cost: calcCost(300, 1200),
    priority: "medium",
  },
  {
    from: "Sulawesi Selatan",
    to: "Maluku Utara",
    commodity: "bawang-merah",
    volume: 180,
    distance: 1400,
    cost: calcCost(180, 1400),
    priority: "medium",
  },
  {
    from: "Sulawesi Selatan",
    to: "Sulawesi Tengah",
    commodity: "beras",
    volume: 250,
    distance: 700,
    cost: calcCost(250, 700),
    priority: "medium",
  },
  {
    from: "Jawa Timur",
    to: "NTT",
    commodity: "beras",
    volume: 400,
    distance: 1800,
    cost: calcCost(400, 1800),
    priority: "medium",
  },
  {
    from: "Jawa Barat",
    to: "NTB",
    commodity: "gula-pasir",
    volume: 300,
    distance: 1200,
    cost: calcCost(300, 1200),
    priority: "medium",
  },
  {
    from: "Jawa Barat",
    to: "NTT",
    commodity: "cabai-rawit",
    volume: 80,
    distance: 1850,
    cost: calcCost(80, 1850),
    priority: "medium",
  },
  {
    from: "Kalimantan Selatan",
    to: "Kalimantan Barat",
    commodity: "beras",
    volume: 280,
    distance: 900,
    cost: calcCost(280, 900),
    priority: "low",
  },
  {
    from: "Jawa Tengah",
    to: "NTB",
    commodity: "bawang-merah",
    volume: 200,
    distance: 1100,
    cost: calcCost(200, 1100),
    priority: "low",
  },
  {
    from: "Jawa Timur",
    to: "Sulawesi Utara",
    commodity: "beras",
    volume: 220,
    distance: 2200,
    cost: calcCost(220, 2200),
    priority: "medium",
  },
  {
    from: "Lampung",
    to: "NTT",
    commodity: "bawang-putih",
    volume: 120,
    distance: 2000,
    cost: calcCost(120, 2000),
    priority: "low",
  },
  {
    from: "Bali",
    to: "NTB",
    commodity: "cabai-rawit",
    volume: 60,
    distance: 400,
    cost: calcCost(60, 400),
    priority: "low",
  },
  {
    from: "Sulawesi Selatan",
    to: "Papua Barat",
    commodity: "gula-pasir",
    volume: 130,
    distance: 2100,
    cost: calcCost(130, 2100),
    priority: "high",
  },
]

// ---------------------------------------------------------------------------
// Public API: getRedistributionData
// ---------------------------------------------------------------------------
export function getRedistributionData(commodityId?: string): RedistributionResponse {
  const routes =
    commodityId && commodityId !== "all"
      ? allRoutes.filter((r) => r.commodity === commodityId)
      : allRoutes

  const totalVolume = routes.reduce((s, r) => s + r.volume, 0)
  const estimatedCost = routes.reduce((s, r) => s + r.cost, 0)
  const highRoutes = routes.filter((r) => r.priority === "high").length

  return {
    summary: {
      totalRoutes: routes.length,
      totalVolume,
      activeRoutes: `${highRoutes} jalur prioritas tinggi`,
      estimatedCost,
    },
    provinces,
    routes,
  }
}
