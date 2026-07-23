import generated from "./generated/regional.json"

export interface RegionalPrice {
  region: string
  price: number
  status: "CRITICAL" | "STABLE" | "SURPLUS"
}

export const regionalComparisonMaster: RegionalPrice[] = generated as RegionalPrice[]
