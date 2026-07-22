"use client";

import { useState, useMemo, useEffect } from "react";
import { motion } from "motion/react";
import { useApi } from "@/hooks/use-api";
import { HeatmapResponse } from "@/lib/types";
import { PriceMatrix } from "@/components/heatmap/price-matrix";
import { TopCritical } from "@/components/heatmap/top-critical";
import { CityFilterModal } from "@/components/heatmap/city-filter-modal";
import { ElasticDatePicker } from "@/components/layout/elastic-date-picker";
import { NationalHeatmap } from "@/components/heatmap/national-heatmap";
import { Button } from "@/components/ui/button";
import { MapPin, SlidersHorizontal, Info, ChevronDown } from "lucide-react";

const REGIONAL_GROUPS = {
  "Jabodetabek": ["Jakarta", "Bogor", "Depok", "Tangerang", "Bekasi"],
  "Pulau Jawa": ["Bandung", "Yogyakarta", "Semarang", "Surabaya", "Malang"],
  "Pulau Sumatera": ["Medan", "Palembang", "Padang", "Bandar Lampung"],
  "Sulawesi & Kawasan Timur": ["Manado", "Makassar", "Jayapura", "Ambon"]
};

export default function HeatmapPage() {
  const [commodity, setCommodity] = useState("beras");
  const [range, setRange] = useState(14);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  const allInitialCities = useMemo(() => Object.values(REGIONAL_GROUPS).flat(), []);
  const [appliedCities, setAppliedCities] = useState<string[]>(allInitialCities);

  // PERBAIKAN: Menambahkan type assertion eksplisit agar `refetch` dikenali oleh TypeScript
  const { data, loading, refetch } = useApi<HeatmapResponse>(
    `/api/heatmap?commodity=${commodity}&range=${range}`
  ) as { data: HeatmapResponse | null; loading: boolean; refetch: () => void };

  useEffect(() => {
    const handleGlobalRefresh = () => refetch?.();
    window.addEventListener("global-refresh", handleGlobalRefresh);
    return () => window.removeEventListener("global-refresh", handleGlobalRefresh);
  }, [refetch]);

  const filteredMatrix = useMemo(() => {
    if (!data?.matrix) return [];
    return data.matrix.filter(row => appliedCities.includes(row.region));
  }, [data, appliedCities]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 max-w-[1600px] mx-auto font-sans pb-12 text-slate-800"
    >

      {/* ================= ROW 1: CONTROLS & HEADER ================= */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-slate-200/60 pb-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#065F46] tracking-tight">Heatmap Prediksi Harga per Wilayah</h1>
          <p className="text-sm text-slate-500 font-medium mt-0.5">
            Prediksi Perubahan Harga 7 hari ke depan di Seluruh Indonesia.
          </p>
        </div>

        <div className="flex items-center gap-3 self-end lg:self-auto">
          <div className="relative group min-w-[160px]">
            <select
              value={commodity}
              onChange={(e) => setCommodity(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-[#065F46] outline-none appearance-none cursor-pointer focus:border-[#006c4a] focus:ring-2 focus:ring-emerald-50 shadow-xs h-10 transition-all pr-8"
            >
              <option value="beras">Beras (Premium)</option>
              <option value="cabai">Cabai Merah</option>
              <option value="bawang">Bawang Merah</option>
            </select>
            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-400">
              <ChevronDown className="w-3.5 h-3.5 stroke-[2.5]" />
            </div>
          </div>

          <ElasticDatePicker onRangeChange={(days) => setRange(days)} />
        </div>
      </div>

      {/* ================= ROW 2: DATA UTAMA (MATRIKS & WILAYAH KRITIS) ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">

        {/* HEATMAP PRICE MATRIX (8 COLS) */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-[24px] p-6 shadow-xs min-w-0 overflow-hidden">
          <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-4 gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-5 bg-[#006c4a] rounded-full" />
              <h3 className="text-lg font-bold text-slate-800">Matriks Perubahan Harga per Wilayah</h3>
            </div>

            <Button
              onClick={() => setIsFilterModalOpen(true)}
              variant="outline"
              className="flex items-center gap-2 font-bold border-slate-300 bg-white hover:bg-slate-50 rounded-xl shadow-xs text-xs h-9 py-0 cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
              <span>Filter Kota ({appliedCities.length})</span>
            </Button>
          </div>

          <div className="w-full overflow-x-auto">
            <PriceMatrix matrix={filteredMatrix} loading={loading} />
          </div>
        </div>

        {/* TOP 5 CRITICAL PANEL (4 COLS) */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-[24px] p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 border-b border-slate-100 pb-4 mb-4">
              <MapPin className="w-4 h-4 text-rose-600" />
              <h3 className="text-lg font-bold text-slate-800">Top 5 Wilayah Kritis</h3>
            </div>
            <TopCritical data={data?.topCritical ?? []} loading={loading} />
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-start gap-2.5 mt-4">
            <Info className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
            <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
              Penetapan status kritis mengacu pada deviasi harga &gt; 10% dari Harga Eceran Tertinggi (HET) nasional dalam kurun waktu 7 hari terakhir.
            </p>
          </div>
        </div>
      </div>

      {/* ================= ROW 3: PETA HIGH-DENSITY ================= */}
      <div className="border border-slate-200 bg-white rounded-[24px] p-2 shadow-xs">
        <NationalHeatmap />
      </div>

      {/* LAUNCH CITY FILTER MODAL */}
      <CityFilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        currentSelected={appliedCities}
        onApply={(selected) => setAppliedCities(selected)}
      />
    </motion.div>
  );
}