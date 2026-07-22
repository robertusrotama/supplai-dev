import { NextRequest, NextResponse } from "next/server"
import { getPriceData } from "@/data/prices"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const commodity = searchParams.get("commodity") || "beras"
  const region = searchParams.get("region") || "jakarta"
  const range = parseInt(searchParams.get("range") || "14", 10)

  const data = getPriceData(commodity, region, range)
  return NextResponse.json(data)
}
