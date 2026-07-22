"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { useApi } from "@/hooks/use-api";
import type { RedistributionResponse } from "@/lib/types";
import { IndonesiaMap } from "@/components/redistribusi/indonesia-map";
import { RouteTable } from "@/components/redistribusi/route-table";
import { SurplusPanel, MethodPanel } from "@/components/redistribusi/info-panels";
import { AnimatedNumber } from "@/components/ui/animated-number";
import { Skeleton } from "@/components/ui/skeleton";
import { formatRupiah } from "@/lib/format";
import { ChevronDown, RefreshCw, Route, Layers3, TrendingUp, MapPin, Wallet } from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.98 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 120,
      damping: 15,
    },
  },
} as const;

export default function RedistribusiPage() {
  const [commodity, setCommodity] = useState("beras");

  // PERBAIKAN 1: Menambahkan asersi tipe manual pada kembalian hook untuk memastikan Turbopack mengenali fungsi 'refetch'
  const { data, loading, refetch } = useApi<RedistributionResponse>(
    `/api/redistribution?commodity=${commodity}`
  ) as { data: RedistributionResponse | null; loading: boolean; refetch: () => void };

  const summary = data?.summary;
  const provinces = data?.provinces ?? [];
  const routes = data?.routes ?? [];
  const surplusProvinces = provinces.filter((p) => p.status === "surplus");

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6 max-w-[1600px] mx-auto font-sans pb-12 text-slate-800"
    >
      {/* ================= HEADER & CONTROLS SECTION ================= */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 border-b border-slate-200/60 pb-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#065F46] tracking-tight">Optimasi Redistribusi Pangan</h1>
          <p className="text-sm text-slate-400 font-medium mt-0.5">
            Rekomendasi pergerakan logistik domestik dari wilayah surplus menuju wilayah defisit secara efisien.
          </p>
        </div>

        <div className="flex items-center gap-3 self-end lg:self-auto lg:mt-1">
          <div className="relative group min-w-[180px]">
            <span className="absolute -top-2 left-3 bg-white px-1 text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider z-10">
              Komoditas
            </span>
            <select
              value={commodity}
              onChange={(e) => setCommodity(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-none appearance-none cursor-pointer focus:border-[#006c4a] focus:ring-2 focus:ring-emerald-50 shadow-xs h-10 transition-all pr-8"
            >
              <option value="beras">Beras (Premium)</option>
              <option value="bawang-merah">Bawang Merah</option>
              <option value="cabai-rawit">Cabai Rawit</option>
              <option value="minyak-goreng">Minyak Goreng</option>
            </select>
            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-400">
              <ChevronDown className="w-3.5 h-3.5 stroke-[2.5]" />
            </div>
          </div>

          <button
            onClick={() => refetch?.()}
            className="flex items-center justify-center border border-slate-300 rounded-xl bg-white hover:bg-slate-50 text-[#065F46] shadow-xs h-10 w-10 transition-colors cursor-pointer"
            title="Refresh alokasi data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ================= SUMMARY CARDS ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Routes */}
        <motion.div variants={itemVariants} className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-xs flex items-center justify-between">
          <div className="space-y-0.5">
            <p className="text-[11px] font-bold font-mono tracking-wider text-slate-400 uppercase">Total Rute Alokasi</p>
            {loading ? (
              <Skeleton className="h-8 w-14 mt-1" />
            ) : (
              <h4 className="text-2xl font-black text-slate-800 tracking-tight">
                {/* PERBAIKAN 2: Mengembalikan ke penulisan self-closing tag murni tanpa children */}
                <AnimatedNumber value={summary?.totalRoutes ?? 0} />
              </h4>
            )}
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-[#006c4a]">
            <Route className="w-5 h-5" />
          </div>
        </motion.div>

        {/* Total Volume */}
        <motion.div variants={itemVariants} className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-xs flex items-center justify-between">
          <div className="space-y-0.5">
            <p className="text-[11px] font-bold font-mono tracking-wider text-slate-400 uppercase">Total Volume Angkut</p>
            {loading ? (
              <Skeleton className="h-8 w-24 mt-1" />
            ) : (
              <h4 className="text-2xl font-black text-slate-800 tracking-tight flex items-baseline">
                {/* PERBAIKAN 3: Menggunakan tag tunggal aman */}
                <AnimatedNumber value={summary?.totalVolume ?? 0} />
                <span className="text-xs font-bold font-sans text-slate-400 ml-1">ton</span>
              </h4>
            )}
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-[#006c4a]">
            <TrendingUp className="w-5 h-5" />
          </div>
        </motion.div>

        {/* Prioritas Aktif */}
        <motion.div variants={itemVariants} className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-xs flex items-center justify-between">
          <div className="space-y-0.5">
            <p className="text-[11px] font-bold font-mono tracking-wider text-slate-400 uppercase">Prioritas Aktif</p>
            {loading ? (
              <Skeleton className="h-8 w-28 mt-1" />
            ) : (
              <p className="text-base font-extrabold text-slate-800 tracking-tight pt-1 leading-none">
                {summary?.activeRoutes ?? "-"}
              </p>
            )}
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
            <MapPin className="w-5 h-5" />
          </div>
        </motion.div>

        {/* Estimasi Biaya */}
        <motion.div variants={itemVariants} className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-xs flex items-center justify-between">
          <div className="space-y-0.5">
            <p className="text-[11px] font-bold font-mono tracking-wider text-slate-400 uppercase">Estimasi Biaya Kargo</p>
            {loading ? (
              <Skeleton className="h-8 w-28 mt-1" />
            ) : (
              <p className="text-lg font-black text-slate-800 tracking-tight pt-0.5">
                {formatRupiah(summary?.estimatedCost ?? 0)}
              </p>
            )}
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600">
            <Wallet className="w-5 h-5" />
          </div>
        </motion.div>
      </div>

      {/* ================= ROW 1: SPATIAL ALOCATION & METHOD ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <motion.div variants={itemVariants} className="lg:col-span-8 bg-white border border-slate-200/80 rounded-[24px] p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.02)] flex flex-col justify-between">
          <div className="border-b border-slate-100 pb-4 mb-4 flex items-center gap-2">
            <div className="w-2 h-5 bg-[#006c4a] rounded-full" />
            <h3 className="text-lg font-bold text-slate-800">Peta Aliran Distribusi Logistik</h3>
          </div>
          <div className="w-full flex-1 flex items-center justify-center">
            <IndonesiaMap 
              provinces={provinces} 
              routes={routes} 
              loading={loading} 
            />
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="lg:col-span-4 bg-white border border-slate-200/80 rounded-[24px] p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.02)]">
          <MethodPanel />
        </motion.div>
      </div>

      {/* ================= ROW 2: ROUTE TABLE & SURPLUS LIST ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <motion.div variants={itemVariants} className="lg:col-span-8 bg-white border border-slate-200/80 rounded-[24px] p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.02)] overflow-hidden min-w-0">
          <div className="border-b border-slate-100 pb-4 mb-4 flex items-center gap-2">
            <Route className="w-5 h-5 text-[#006c4a]" />
            <div className="flex flex-col">
              <h3 className="text-lg font-bold text-slate-800">Matriks Rute Distribusi Direkomendasikan</h3>
              <p className="text-[10px] font-medium text-slate-400">Biaya dihitung otomatis berdasarkan formula komparatif Rp3.000/ton/km.</p>
            </div>
          </div>
          <div className="w-full overflow-x-auto">
            <RouteTable routes={routes} loading={loading} />
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="lg:col-span-4 bg-white border border-slate-200/80 rounded-[24px] p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-4 mb-4">
            <Layers3 className="w-4 h-4 text-[#006c4a]" />
            <h3 className="text-lg font-bold text-slate-800">Wilayah Produsen (Surplus)</h3>
          </div>
          <SurplusPanel provinces={surplusProvinces} />
        </motion.div>
      </div>
    </motion.div>
  );
}