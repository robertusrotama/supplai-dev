import type { Commodity } from "@/lib/types"

export const commodities: Commodity[] = [
  { id: "beras", name: "Beras Medium", unit: "kg" },
  { id: "cabai-rawit", name: "Cabai Rawit Merah", unit: "kg" },
  { id: "bawang-merah", name: "Bawang Merah", unit: "kg" },
  { id: "bawang-putih", name: "Bawang Putih Impor", unit: "kg" },
  { id: "gula-pasir", name: "Gula Pasir Lokal", unit: "kg" },
  { id: "daging-sapi", name: "Daging Sapi Murni", unit: "kg" },
  { id: "daging-ayam", name: "Daging Ayam Ras", unit: "kg" },
  { id: "telur-ayam", name: "Telur Ayam Ras", unit: "kg" },
  { id: "tomat", name: "Tomat Segar", unit: "kg" },
  { id: "wortel", name: "Wortel Lokal", unit: "kg" },
  { id: "kentang", name: "Kentang Dieng", unit: "kg" },
]

export function getCommodityById(id: string): Commodity | undefined {
  return commodities.find((c) => c.id === id)
}