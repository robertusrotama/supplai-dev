import { NextResponse } from "next/server"
import { commodities } from "@/data/commodities"

export async function GET() {
  return NextResponse.json(commodities)
}
