"use client"

import { toast } from "sonner"
import { Download } from "lucide-react"
import { commodities } from "@/data/commodities"
import { regions } from "@/data/regions"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface FilterBarProps {
  commodity: string
  region?: string
  range: number
  onCommodityChange: (value: string) => void
  onRegionChange?: (value: string) => void
  onRangeChange: (value: number) => void
  showRegion?: boolean
  showExport?: boolean
}

export function FilterBar({
  commodity,
  region,
  range,
  onCommodityChange,
  onRegionChange,
  onRangeChange,
  showRegion = true,
  showExport = false,
}: FilterBarProps) {
  const rangeOptions = [7, 14, 30]

  function handleExport() {
    toast.success("Laporan berhasil diunduh")
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Komoditas */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground whitespace-nowrap">Komoditas:</span>
        <Select
          value={commodity}
          onValueChange={(v) => { if (v !== null) onCommodityChange(v) }}
        >
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Pilih komoditas" />
          </SelectTrigger>
          <SelectContent>
            {commodities.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Wilayah */}
      {showRegion && onRegionChange && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground whitespace-nowrap">Wilayah:</span>
          <Select
            value={region}
            onValueChange={(v) => { if (v !== null && onRegionChange) onRegionChange(v) }}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Pilih wilayah" />
            </SelectTrigger>
            <SelectContent>
              {regions.map((r) => (
                <SelectItem key={r.id} value={r.id}>
                  {r.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Rentang waktu */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground whitespace-nowrap">Rentang:</span>
        <div className="flex rounded-lg overflow-hidden border border-input">
          {rangeOptions.map((days) => (
            <button
              key={days}
              onClick={() => onRangeChange(days)}
              className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                range === days
                  ? "bg-[#2563eb] text-white"
                  : "bg-white text-[#64748b] hover:bg-gray-50 border-l border-input first:border-l-0"
              }`}
            >
              {days} hari
            </button>
          ))}
        </div>
      </div>

      {/* Export button */}
      {showExport && (
        <Button
          variant="outline"
          size="default"
          onClick={handleExport}
          className="gap-1.5 ml-auto"
        >
          <Download className="size-4" />
          Export Laporan
        </Button>
      )}
    </div>
  )
}
