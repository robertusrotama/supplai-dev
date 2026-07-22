import { NextRequest, NextResponse } from "next/server"
import { getHeatmapData } from "@/data/prices"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const commodity = searchParams.get("commodity") || "beras"
  const range = parseInt(searchParams.get("range") || "14", 10)

  const data = getHeatmapData(commodity, range)
  return NextResponse.json(data)
}
