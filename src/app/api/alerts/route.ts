import { NextRequest, NextResponse } from "next/server"
import { getAlerts } from "@/data/alerts"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const severity = searchParams.get("severity")
  const status = searchParams.get("status")
  const commodity = searchParams.get("commodity")
  const region = searchParams.get("region")

  const filters: Record<string, string> = {}
  if (severity) filters.severity = severity
  if (status) filters.status = status
  if (commodity) filters.commodity = commodity
  if (region) filters.region = region

  const data = getAlerts(filters)
  return NextResponse.json(data)
}
