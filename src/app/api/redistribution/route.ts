import { NextRequest, NextResponse } from "next/server"
import { getRedistributionData } from "@/data/redistribution"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const commodity = searchParams.get("commodity")

  const data = getRedistributionData(commodity || undefined)
  return NextResponse.json(data)
}
