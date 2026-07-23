import type { Region } from "@/lib/types"
import generated from "./generated/regions.json"

export const regions: Region[] = generated as Region[]

export function getRegionById(id: string): Region | undefined {
  return regions.find((r) => r.id === id)
}
