"use client"

import { useEffect, useRef, useState } from "react"
import { ArrowUp, ArrowDown } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { formatRupiah } from "@/lib/format"
import type { PredictionSummary } from "@/lib/types"

interface SummaryCardsProps {
  summary: PredictionSummary | null
  loading: boolean
}

function useCountUp(target: number, duration = 800) {
  const [value, setValue] = useState(0)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    if (target === 0) {
      setValue(0)
      return
    }
    const start = performance.now()
    const from = 0

    function step(now: number) {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round(from + (target - from) * eased))
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(step)
      }
    }

    rafRef.current = requestAnimationFrame(step)
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    }
  }, [target, duration])

  return value
}

function getMapeColor(mape: number) {
  if (mape < 5) return "text-green-600"
  if (mape < 10) return "text-yellow-600"
  return "text-red-600"
}

interface CardItemProps {
  label: string
  children: React.ReactNode
}

function SummaryCard({ label, children }: CardItemProps) {
  return (
    <Card className="bg-white shadow-sm">
      <CardContent className="pt-4 pb-4">
        <p className="text-sm text-muted-foreground mb-1">{label}</p>
        {children}
      </CardContent>
    </Card>
  )
}

export function SummaryCards({ summary, loading }: SummaryCardsProps) {
  const currentPrice = useCountUp(summary?.currentPrice ?? 0)
  const predictedPrice = useCountUp(summary?.predictedPrice ?? 0)
  const priceChange = useCountUp(Math.abs(summary?.priceChange ?? 0))
  const mapeValue = useCountUp(Math.round(summary?.mape ?? 0))

  if (loading || !summary) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="bg-white shadow-sm">
            <CardContent className="pt-4 pb-4 space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-4 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const isPositiveChange = summary.priceChange >= 0

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Harga Saat Ini */}
      <SummaryCard label="Harga Saat Ini">
        <p className="text-2xl font-bold text-[#1e293b]">
          {formatRupiah(currentPrice)}
          <span className="text-sm font-normal text-muted-foreground">/kg</span>
        </p>
      </SummaryCard>

      {/* Perubahan Harga */}
      <SummaryCard label="Perubahan Harga">
        <div className="flex items-center gap-1">
          {isPositiveChange ? (
            <ArrowUp className="size-5 text-red-500 shrink-0" />
          ) : (
            <ArrowDown className="size-5 text-green-600 shrink-0" />
          )}
          <p
            className={`text-2xl font-bold ${
              isPositiveChange ? "text-red-500" : "text-green-600"
            }`}
          >
            Rp {priceChange.toLocaleString("id-ID")}
          </p>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">
          {isPositiveChange ? "Kenaikan" : "Penurunan"} harga
        </p>
      </SummaryCard>

      {/* Prediksi 14 Hari */}
      <SummaryCard label="Prediksi 14 Hari">
        <p className="text-2xl font-bold text-[#1e293b]">
          {formatRupiah(predictedPrice)}
          <span className="text-sm font-normal text-muted-foreground">/kg</span>
        </p>
      </SummaryCard>

      {/* MAPE Model */}
      <SummaryCard label="MAPE Model">
        <p className={`text-2xl font-bold ${getMapeColor(summary.mape)}`}>
          {mapeValue}%
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {summary.mape < 5
            ? "Akurasi sangat baik"
            : summary.mape < 10
            ? "Akurasi cukup baik"
            : "Akurasi rendah"}
        </p>
      </SummaryCard>
    </div>
  )
}
