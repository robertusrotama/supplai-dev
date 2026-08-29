"use client"

import { useState, useCallback } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { formatRupiah, formatPercent, formatShortDate } from "@/lib/format"
import type { HeatmapRow } from "@/lib/types"
import { MapPin } from "lucide-react"

interface PriceMatrixProps {
  matrix: HeatmapRow[]
  loading: boolean
}

interface TooltipState {
  visible: boolean
  x: number
  y: number
  region: string
  date: string
  price: number
  change: number
}

// ─── Color helpers ───────────────────────────────────────────────────────────

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace("#", "")
  const r = parseInt(clean.slice(0, 2), 16)
  const g = parseInt(clean.slice(2, 4), 16)
  const b = parseInt(clean.slice(4, 6), 16)
  return [r, g, b]
}

function rgbToHex(r: number, g: number, b: number): string {
  return (
    "#" +
    [r, g, b]
      .map((v) => Math.round(v).toString(16).padStart(2, "0"))
      .join("")
  )
}

function interpolateColor(c1: string, c2: string, t: number): string {
  const [r1, g1, b1] = hexToRgb(c1)
  const [r2, g2, b2] = hexToRgb(c2)
  return rgbToHex(r1 + (r2 - r1) * t, g1 + (g2 - g1) * t, b1 + (b2 - b1) * t)
}

function getHeatColor(change: number): string {
  if (change <= 0) return "#22c55e"
  if (change <= 5) {
    const t = change / 5
    return interpolateColor("#22c55e", "#eab308", t)
  }
  if (change <= 10) {
    const t = (change - 5) / 5
    return interpolateColor("#eab308", "#f97316", t)
  }
  if (change <= 15) {
    const t = (change - 10) / 5
    return interpolateColor("#f97316", "#ef4444", t)
  }
  return "#ef4444"
}

function getTextColor(bgHex: string): string {
  const [r, g, b] = hexToRgb(bgHex)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.55 ? "#1e293b" : "#ffffff"
}

function formatAbbrev(price: number): string {
  if (price >= 1_000_000) return `${(price / 1_000_000).toFixed(1)}jt`
  if (price >= 1_000) return `${(price / 1_000).toFixed(1)}rb`
  return `${price}`
}

// ─── Skeleton ────────────────────────────────────────────────────────────────

function MatrixSkeleton() {
  return (
    <div className="overflow-x-auto">
      <table className="border-collapse text-xs w-full">
        <thead>
          <tr>
            <th className="sticky left-0 z-20 bg-gray-50 px-3 py-2 min-w-[140px]">
              <Skeleton className="h-4 w-20" />
            </th>
            {Array.from({ length: 7 }).map((_, i) => (
              <th key={i} className="px-2 py-2 min-w-[70px]">
                <Skeleton className="h-4 w-10 mx-auto" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 8 }).map((_, row) => (
            <tr key={row}>
              <td className="sticky left-0 z-10 bg-white px-3 py-2 min-w-[140px]">
                <Skeleton className="h-4 w-28" />
              </td>
              {Array.from({ length: 7 }).map((_, col) => (
                <td key={col} className="min-w-[70px] py-2 px-1">
                  <Skeleton className="h-7 w-full rounded" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function PriceMatrix({ matrix, loading }: PriceMatrixProps) {
  const [sortAsc, setSortAsc] = useState(true)
  const [tooltip, setTooltip] = useState<TooltipState>({
    visible: false,
    x: 0,
    y: 0,
    region: "",
    date: "",
    price: 0,
    change: 0,
  })

  const handleMouseEnter = useCallback(
    (
      e: React.MouseEvent<HTMLTableCellElement>,
      region: string,
      date: string,
      price: number,
      change: number
    ) => {
      const rect = e.currentTarget.getBoundingClientRect()
      setTooltip({
        visible: true,
        x: rect.left + rect.width / 2,
        y: rect.top - 8,
        region,
        date,
        price,
        change,
      })
    },
    []
  )

  const handleMouseLeave = useCallback(() => {
    setTooltip((t) => ({ ...t, visible: false }))
  }, [])

  if (loading || matrix.length === 0) {
    return <MatrixSkeleton />
  }

  const dates = matrix[0]?.data.map((d) => d.date) ?? []
  // Kolom proyeksi ditandai dari data, bukan ditebak dari posisi — kalau suatu
  // wilayah kekurangan bulan historis, batasnya tetap jatuh di tempat benar.
  const future = matrix[0]?.data.map((d) => d.isFuture === true) ?? []
  const firstFuture = future.indexOf(true)

  const sorted = [...matrix].sort((a, b) => {
    if (sortAsc) return a.region.localeCompare(b.region, "id")
    const maxA = Math.max(...a.data.map((d) => d.change))
    const maxB = Math.max(...b.data.map((d) => d.change))
    return maxB - maxA
  })

  return (
    <div className="relative">
      {/* Sort controls */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs text-muted-foreground">Urutkan:</span>
        <button
          onClick={() => setSortAsc(true)}
          className={`text-xs px-2 py-1 rounded border transition-colors cursor-pointer ${
            sortAsc
              ? "bg-[#006c4a] text-white border-[#006c4a]"
              : "bg-white text-[#64748b] border-gray-200 hover:bg-gray-50"
          }`}
        >
          A–Z Wilayah
        </button>
        <button
          onClick={() => setSortAsc(false)}
          className={`text-xs px-2 py-1 rounded border transition-colors cursor-pointer ${
            !sortAsc
              ? "bg-[#006c4a] text-white border-[#006c4a]"
              : "bg-white text-[#64748b] border-gray-200 hover:bg-gray-50"
          }`}
        >
          Kenaikan Tertinggi
        </button>
      </div>

      {/* Color legend */}
      <div className="flex items-center gap-3 mb-3 text-xs text-muted-foreground">
        <span>Legenda:</span>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: "#22c55e" }} />
          <span>Turun / Stabil</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: "#eab308" }} />
          <span>+5%</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: "#f97316" }} />
          <span>+10%</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: "#ef4444" }} />
          <span>+15%+</span>
        </div>
        <div className="flex items-center gap-1 pl-3 ml-1 border-l-2 border-dashed border-[#006c4a]">
          <div
            className="w-4 h-4 rounded border border-gray-300"
            style={{ backgroundImage: "repeating-linear-gradient(45deg, #cbd5e1 0 3px, #f1f5f9 3px 7px)" }}
          />
          <span>Kolom berarsir = <b className="text-[#006c4a]">prediksi</b>, bukan harga teramati</span>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table
          className="text-xs w-full"
          style={{ borderCollapse: "collapse" }}
        >
          <thead>
            <tr className="bg-gray-50">
              <th
                className="sticky left-0 z-20 bg-gray-50 text-left font-semibold text-[#1e293b] px-3 py-2.5 min-w-[160px] border-b border-r border-gray-200 cursor-pointer select-none whitespace-nowrap"
                onClick={() => setSortAsc((v) => !v)}
              >
                Wilayah
                <span className="ml-1 text-[#006c4a]">{sortAsc ? "↑" : "↓"}</span>
              </th>
              {dates.map((date, i) => (
                <th
                  key={date}
                  className={`min-w-[70px] text-center font-semibold py-2.5 px-1 border-b border-gray-200 whitespace-nowrap ${
                    future[i]
                      ? "text-[#006c4a] bg-emerald-50/70 italic"
                      : "text-[#1e293b]"
                  } ${i === firstFuture ? "border-l-2 border-l-dashed border-l-[#006c4a]" : ""}`}
                >
                  {formatShortDate(date)}
                  {future[i] && (
                    <span className="block text-[9px] font-bold not-italic tracking-wide opacity-70">
                      PREDIKSI
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((row, rowIdx) => (
              <tr
                key={row.region}
                className={rowIdx % 2 === 0 ? "bg-white" : "bg-gray-50/40"}
              >
                {/* Nama wilayah. Dulu menaut ke /heatmap/<wilayah>, rute yang
                    belum ada — setiap baris memicu 404 saat di-prefetch, dan
                    mengeklik nama provinsi membawa pengguna ke halaman kosong.
                    Tautkan kembali begitu halaman detail wilayah tersedia. */}
                <td
                  // Latar wajib pekat. Sebelumnya "bg-gray-50/40" — 40% tembus
                  // pandang — sehingga sel yang tergulir di baliknya menembus
                  // di belakang nama wilayah saat tabel digeser mendatar.
                  className={`sticky left-0 z-10 px-3 py-1.5 min-w-[160px] font-medium border-r border-gray-200 whitespace-nowrap ${
                    rowIdx % 2 === 0 ? "bg-white" : "bg-[#f8fafc]"
                  }`}
                >
                  <span className="flex items-center gap-1.5 text-slate-700">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {row.region}
                  </span>
                </td>
                {row.data.map((cell, i) => {
                  const bg = getHeatColor(cell.change)
                  const fg = getTextColor(bg)
                  return (
                    <td
                      key={cell.date}
                      className={`min-w-[70px] text-center py-2 px-1 cursor-default transition-opacity hover:opacity-80 ${
                        cell.isFuture ? "italic" : ""
                      } ${i === firstFuture ? "border-l-2 border-l-dashed border-l-[#006c4a]" : ""}`}
                      style={{
                        backgroundColor: bg,
                        color: fg,
                        // Sel proyeksi sengaja diberi arsir samar supaya tidak
                        // terbaca setara dengan harga yang benar-benar teramati.
                        ...(cell.isFuture
                          ? { backgroundImage: "repeating-linear-gradient(45deg, rgba(255,255,255,.32) 0 3px, transparent 3px 7px)" }
                          : {}),
                      }}
                      onMouseEnter={(e) =>
                        handleMouseEnter(e, row.region, cell.date, cell.price, cell.change)
                      }
                      onMouseLeave={handleMouseLeave}
                    >
                      <span className="font-medium">{formatAbbrev(cell.price)}</span>
                      <br />
                      <span className="opacity-80">
                        {cell.change >= 0 ? "+" : ""}
                        {cell.change.toFixed(1)}%
                      </span>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Tooltip */}
      {tooltip.visible && (
        <div
          className="pointer-events-none fixed z-50 rounded-lg bg-[#1e293b] text-white text-xs shadow-xl px-3 py-2 -translate-x-1/2 -translate-y-full"
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          <p className="font-semibold mb-0.5">{tooltip.region}</p>
          <p className="text-gray-300">{formatShortDate(tooltip.date)}</p>
          <p className="mt-1">
            Harga:{" "}
            <span className="font-medium text-white">{formatRupiah(tooltip.price)}</span>
          </p>
          <p>
            Perubahan:{" "}
            <span
              className={`font-medium ${
                tooltip.change > 10
                  ? "text-red-400"
                  : tooltip.change > 5
                  ? "text-orange-400"
                  : tooltip.change > 0
                  ? "text-yellow-400"
                  : "text-green-400"
              }`}
            >
              {formatPercent(tooltip.change)}
            </span>
          </p>
          <div className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-[#1e293b]" />
        </div>
      )}
    </div>
  )
}