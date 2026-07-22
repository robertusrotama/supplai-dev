import { NextResponse } from "next/server"
import { regions } from "@/data/regions"

export async function GET() {
  return NextResponse.json(regions)
}
