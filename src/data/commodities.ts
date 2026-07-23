import type { Commodity } from "@/lib/types"
import generated from "./generated/commodities.json"

export const commodities: Commodity[] = generated as Commodity[]

export function getCommodityById(id: string): Commodity | undefined {
  return commodities.find((c) => c.id === id)
}
