"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { TopCards } from "@/components/executive-summary/top-cards";
import { ShortcutCards } from "@/components/executive-summary/shortcut-cards";
import { Button } from "@/components/ui/button";
import { motion } from "motion/react";
import { 
  Download, 
  Calendar, 
  AlertTriangle, 
  TrendingUp, 
  MapPin, 
  ArrowRight,
  Database,
  ShieldAlert,
  CheckCircle2, 
  Truck
} from "lucide-react";

// IMPOR MASTER DATA OPERASIONAL REALISTIS ANDA
import { commodities } from "@/data/commodities";
import { regionalComparisonMaster } from "@/data/regional-data";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend
} from "recharts";

const transitionSmooth = { type: "spring", stiffness: 100, damping: 15 } as const;

export default function ExecutiveSummaryPage() {
  const router = useRouter();
  
  // Simulasi pembacaan ringkasan status realtime dari Alert Database aktif
  const activeAlertsCount = 3; 

  // Mengolah data batang agregat lintas komoditas berdasarkan data nasional ril
  const komoditasOverviewData = useMemo(() => {
    return [
      { name: "Beras Medium", price: 14350, status: "SURPLUS", fill: "#006c4a" },
      { name: "Cabai Rawit", price: 49200, status: "CRITICAL", fill: "#e11d48" },
      { name: "Bawang Merah", price: 38400, status: "CRITICAL", fill: "#e11d48" },
      { name: "Bawang Putih", price: 32100, status: "STABLE", fill: "#d97706" },
      { name: "Gula Pasir", price: 17500, status: "STABLE", fill: "#d97706" },
    ];
  }, []);

  // Handler cetak dokumen ringkasan dashboard terintegrasi
  const handlePrintSummary = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto font-sans text-slate-800 printable-summary">
      
      {/* STYLE CETAK NATIVE PADA HALAMAN RINGKASAN */}
      <style jsx global>{`
        @media print {
          body * { visibility: hidden; }
          .printable-summary, .printable-summary * { visibility: visible; }
          .printable-summary { position: absolute; left: 0; top: 0; width: 100%; }
          .no-print-btn { display: none !important; }
        }
      `}</style>

      {/* ================= HEADER SECTION ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/60 pb-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Executive Summary</h1>
          <p className="text-sm text-slate-500 font-medium mt-0.5">
            National Food Security Intelligence Control Center
          </p>
        </div>
        
        <div className="flex items-center gap-3 no-print-btn">
          <Button 
            onClick={handlePrintSummary}
            variant="outline" 
            size="default" 
            className="flex items-center gap-2 font-bold border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-all shadow-3xs cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Export Summary
          </Button>
          
          <Button 
            variant="default" 
            size="default" 
            className="flex items-center gap-2 font-bold bg-[#006c4a] hover:bg-[#005238] text-white rounded-xl shadow-sm transition-all cursor-default"
          >
            <Calendar className="w-4 h-4" />
            Juli 2026
          </Button>
        </div>
      </div>

      {/* ================= CRITICAL SYSTEM ALERT ANCHOR BANNER ================= */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={transitionSmooth}
        onClick={() => router.push("/alerts")}
        className="bg-rose-50 border border-rose-200 rounded-[20px] p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-3xs cursor-pointer hover:bg-rose-100/60 transition-colors group"
      >
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 bg-rose-600 text-white rounded-xl shrink-0 animate-pulse">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-black text-rose-900 tracking-tight flex items-center gap-2">
              Anomali Pasokan Skala Nasional Terdeteksi
              <span className="bg-rose-600 text-white text-[9px] font-mono font-black px-1.5 py-0.5 rounded-full uppercase">
                {activeAlertsCount} Peringatan Aktif
              </span>
            </h4>
            <p className="text-xs font-semibold text-rose-700/90 mt-0.5 leading-relaxed">
              Krisis harga komoditas <span className="underline font-bold">Bawang Merah (+12.4%)</span> akibat cuaca ekstrem Jawa Tengah memerlukan intervensi pasar segera. Klik untuk membuka Alert Center.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 text-xs font-bold text-rose-700 group-hover:translate-x-1 transition-transform shrink-0">
          Tindak Lanjuti Krisis
          <ArrowRight className="w-4 h-4" />
        </div>
      </motion.div>

      {/* ================= TOP METRICS CARDS INTEGRATION ================= */}
      <TopCards />

      {/* ================= CENTER MONITORING GRID ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* PANEL A: MACRO COMMODITY TRACKER MAP REPLACE */}
        <div className="lg:col-span-2 border border-slate-200 bg-white rounded-[24px] p-6 flex flex-col justify-between shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4 mb-3">
            <div className="space-y-0.5">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#006c4a]" />
                Peta Indeks Harga Baseline Strategis
              </h3>
              <p className="text-[11px] font-medium text-slate-400">Rangkuman harga pasar komoditas utama nasional semester ini.</p>
            </div>
            <div className="flex gap-1.5 text-[10px] font-mono font-bold shrink-0">
              <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-600 border border-rose-100">Kritis</span>
              <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-600 border border-amber-100">Waspada</span>
              <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-600 border border-emerald-100">Aman</span>
            </div>
          </div>
          
          {/* Visualisasi Grafik Komparasi Komoditas Nyata */}
          <div className="flex-1 w-full h-[300px] pt-3">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={komoditasOverviewData} margin={{ top: 10, right: 5, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" tickLine={false} axisLine={false} stroke="#94a3b8" style={{ fontSize: "11px", fontWeight: "600" }} />
                <YAxis tickLine={false} axisLine={false} stroke="#94a3b8" tickFormatter={(v) => `Rp ${v.toLocaleString()}`} style={{ fontSize: "10px", fontFamily: "monospace" }} />
                <RechartsTooltip formatter={(v: any) => [`Rp ${v.toLocaleString()}/kg`, "Harga Agregat"]} contentStyle={{ borderRadius: "12px" }} />
                <Bar dataKey="price" fill="#006c4a" radius={[6, 6, 0, 0]} maxBarSize={38}>
                  {komoditasOverviewData.map((entry, index) => (
                    <circle key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* PANEL B: INTEGRATED REALTIME INCIDENT LOGS */}
        <div className="border border-slate-200 bg-white rounded-[24px] p-6 flex flex-col shadow-xs">
          <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-4">
            <div className="space-y-0.5">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-1.5">
                <Database className="w-4 h-4 text-[#006c4a]" />
                Log Aktivitas Rantai Suplai
              </h3>
              <p className="text-[11px] font-medium text-slate-400">Sinkronisasi anomali logistik & warkat pasar.</p>
            </div>
            <span 
              onClick={() => router.push("/alerts")}
              className="text-xs font-bold text-[#006c4a] hover:text-[#005238] cursor-pointer transition-colors shrink-0"
            >
              Lihat Semua
            </span>
          </div>
          
          {/* Rentetan Log Operasional Nyata terintegrasi dengan Alert Center */}
          <div className="flex-1 space-y-3 overflow-y-auto pr-1">
            {[
              { time: "Baru saja", type: "CRITICAL", msg: "Lonjakan Harga Bawang Merah +12.4% Jabodetabek", icon: ShieldAlert, bg: "bg-rose-50 text-rose-600 border-rose-100" },
              { time: "2 jam lalu", type: "ANOMALI", msg: "Volume pasokan Kramat Jati merosot 40 ton/hari", icon: AlertTriangle, bg: "bg-amber-50 text-amber-600 border-amber-100" },
              { time: "1 hari lalu", type: "LOGISTIK", msg: "Kargo armada logistik tertahan 18 jam di Pantura", icon: Truck, bg: "bg-sky-50 text-sky-600 border-sky-100" },
              { time: "2 hari lalu", type: "STABLE", msg: "Stok Beras Medium wilayah Surabaya terkonfirmasi aman", icon: CheckCircle2, bg: "bg-emerald-50 text-emerald-600 border-emerald-100" },
            ].map((log, idx) => {
              const LogIcon = log.icon;
              return (
                <div key={idx} className="p-3 border border-slate-100 rounded-xl bg-slate-50 flex items-start gap-3 hover:bg-slate-100/50 transition-colors">
                  <div className={`p-2 rounded-lg border shrink-0 ${log.bg}`}>
                    <LogIcon className="w-3.5 h-3.5" />
                  </div>
                  <div className="space-y-0.5 min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-mono font-black uppercase tracking-wider text-slate-400">{log.type}</span>
                      <span className="text-[9px] font-mono text-slate-400">{log.time}</span>
                    </div>
                    <p className="text-xs font-semibold text-slate-600 leading-tight truncate">{log.msg}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ================= BOTTOM SECTION: SMART NAVIGATION LINKS ================= */}
      <ShortcutCards />

    </div>
  );
}