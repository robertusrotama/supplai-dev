import type { RedistributionResponse } from "@/lib/types"
import generated from "./generated/redistribution.json"

const data = generated as Record<string, RedistributionResponse>

export function getRedistributionData(commodity?: string): RedistributionResponse {
  return data[commodity ?? "all"] ?? data["all"]
}
