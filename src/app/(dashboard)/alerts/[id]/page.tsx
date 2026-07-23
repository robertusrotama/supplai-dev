"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { getAlertById, getAlerts } from "@/data/alerts";
import { getRedistributionData } from "@/data/redistribution";
import { commodities } from "@/data/commodities";
import {
  AlertTriangle,
  ArrowRight,
  ChevronLeft,
  TrendingUp,
  TrendingDown,
  Truck,
  ShieldAlert,
  Clock,
  MapPin,
  CheckCircle2,
  X,
  FileSpreadsheet,
  Send,
  Lightbulb,
  Info,
  Gauge,
  BarChart3,
  Target,
} from "lucide-react";

const SEVERITY = {
  kritis: { label: "KRITIS", badge: "bg-rose-500 text-white", chip: "bg-rose-50 text-rose-600 border-rose-100" },
  tinggi: { label: "WARNING", badge: "bg-amber-500 text-white", chip: "bg-amber-50 text-amber-600 border-amber-100" },
  sedang: { label: "INFO", badge: "bg-sky-500 text-white", chip: "bg-sky-50 text-sky-600 border-sky-100" },
  rendah: { label: "INFO", badge: "bg-sky-500 text-white", chip: "bg-sky-50 text-sky-600 border-sky-100" },
} as const;

const rupiah = (n: number) => `Rp${n.toLocaleString("id-ID")}`;
const titleCase = (id: string) =>
  id.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

export default function AlertDetailPage() {
  const params = useParams();
  const router = useRouter();
  const alertId = (params?.id as string) || "";
  const alert = getAlertById(alertId);

  // ================= STATES =================
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isExecuted, setIsExecuted] = useState(false);
  const [isWizardVisible, setIsWizardVisible] = useState(true);
  const [note, setNote] = useState("");
  const [officer, setOfficer] = useState("Tim TPID");
  const [savedLogs, setSavedLogs] = useState<{ officer: string; text: string; time: string } | null>(null);

  const handleSubmitAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!note.trim()) return;
    setIsExecuted(true);
    setSavedLogs({ officer, text: note, time: "Baru saja direspon" });
    setIsModalOpen(false);
  };

  // ================= NOT FOUND =================
  if (!alert) {
    return (
      <div className="max-w-[1600px] mx-auto font-sans py-16 text-center space-y-4">
        <p className="text-sm font-bold text-slate-500">
          Peringatan <span className="font-mono">{alertId}</span> tidak ditemukan.
        </p>
        <button
          onClick={() => router.push("/alerts")}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#006c4a] hover:text-[#005238] cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          Kembali ke Alert Center
        </button>
      </div>
    );
  }

  // ================= DERIVED (REAL) =================
  const sev = SEVERITY[alert.severity];
  const commodity = commodities.find((c) => c.id === alert.commodity);
  const commodityName = commodity?.name ?? titleCase(alert.commodity);
  const unit = commodity?.unit ?? "kg";
  const d = alert.detail;
  const up = alert.change >= 0;
  const accuracy = (100 - d.mapeKomoditas).toFixed(1);
  const snapshotDate = new Date(alert.timestamp).toLocaleDateString("id-ID", {
    day: "2-digit", month: "short", year: "numeric",
  });

  // Real logistics: redistribution routes the LP proposes for this commodity.
  const routes = getRedistributionData(alert.commodity).routes.slice(0, 4);
  // Other real alerts for the same commodity.
  const relatedAlerts = getAlerts({ commodity: alert.commodity }).alerts
    .filter((a) => a.id !== alert.id)
    .slice(0, 5);

  const stepWizard = [
    { title: "1. Analisis Prediktif", desc: "Proyeksi Tren Harga", path: `/dashboard?commodity=${alert.commodity}&trigger=alert` },
    { title: "2. Peta Risiko Nasional", desc: "Sebaran Spasial Geografis", path: `/heatmap?commodity=${alert.commodity}&trigger=alert` },
    { title: "3. Optimasi Redistribusi", desc: "Eksekusi Rute Logistik", path: `/redistribusi?commodity=${alert.commodity}&trigger=alert` },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="space-y-6 max-w-[1600px] mx-auto font-sans pb-16 text-slate-800 relative"
    >
      {/* ================= HEADER & BREADCRUMB ================= */}
      <div className="flex flex-col gap-2 border-b border-slate-200/60 pb-4">
        <button
          onClick={() => router.push("/alerts")}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#006c4a] transition-colors w-fit group cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
          Kembali ke Alert Center
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-2">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className={`font-mono font-black text-[10px] uppercase px-2 py-0.5 rounded-md tracking-wider transition-all duration-300 ${
                isExecuted ? "bg-emerald-600 text-white" : sev.badge
              }`}>
                {isExecuted ? "DITANGANI" : sev.label}
              </span>
              <span className="font-mono text-[10px] text-slate-400">{alert.id}</span>
              <div className="flex items-center gap-1 text-xs text-slate-400 font-medium">
                <Clock className="w-3.5 h-3.5" />
                Snapshot • {snapshotDate}
              </div>
            </div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">
              {commodityName} — <span className="text-[#065F46]">{alert.region}</span>
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className={`border rounded-2xl px-5 py-3 flex items-center gap-4 shrink-0 shadow-2xs ${up ? "bg-rose-50 border-rose-100" : "bg-emerald-50 border-emerald-100"}`}>
              <div>
                <p className="text-[10px] font-bold font-mono text-slate-400 uppercase tracking-wider">Proyeksi 3 Bulan</p>
                <p className={`text-2xl font-black tracking-tight ${up ? "text-rose-600" : "text-emerald-600"}`}>
                  {up ? "+" : ""}{alert.change.toFixed(1)}%
                </p>
              </div>
              <div className={`w-px h-8 ${up ? "bg-rose-200" : "bg-emerald-200"}`} />
              <div>
                <p className="text-[10px] font-bold font-mono text-slate-400 uppercase tracking-wider">Keyakinan Model</p>
                <p className="text-sm font-extrabold text-slate-700">{alert.confidence}%</p>
              </div>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              disabled={isExecuted}
              className={`px-5 py-4 rounded-2xl text-xs font-black shadow-md transition-all duration-200 flex items-center gap-2 cursor-pointer ${
                isExecuted
                  ? "bg-emerald-50 border border-emerald-200 text-emerald-700 cursor-not-allowed"
                  : "bg-[#006c4a] hover:bg-[#005238] text-white active:scale-95"
              }`}
            >
              {isExecuted ? (
                <><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Selesai Ditangani</>
              ) : (
                <><FileSpreadsheet className="w-4 h-4" /> Tindak Lanjuti</>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ================= INTERVENTION LOG ================= */}
      <AnimatePresence>
        {isExecuted && savedLogs && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-5 space-y-2 overflow-hidden shadow-2xs"
          >
            <div className="flex items-center justify-between text-xs text-emerald-800 font-bold">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Log Intervensi Tercatat (lokal, sesi ini)</span>
              </div>
              <span className="font-mono font-medium text-slate-400">{savedLogs.time}</span>
            </div>
            <div className="text-xs text-slate-600 bg-white/80 border border-emerald-100 p-3 rounded-xl leading-relaxed">
              <p className="font-bold text-slate-700 mb-0.5">Petugas: {savedLogs.officer}</p>
              <p className="font-medium">Tindakan: &quot;{savedLogs.text}&quot;</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================= CONTENT GRID ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT (8 COLS) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Executive summary — the model's real reasoning */}
          <div className="bg-white border border-slate-200/80 rounded-[24px] p-6 shadow-xs">
            <h3 className="text-sm font-black font-mono uppercase tracking-wider text-slate-400 mb-2.5">Ringkasan Model</h3>
            <p className="text-xs text-slate-600 font-medium leading-relaxed text-justify">
              {d.recommendation}
            </p>
          </div>

          {/* Model signal — real metrics (replaces the fabricated "root cause") */}
          <div className="bg-white border border-slate-200/80 rounded-[24px] p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <ShieldAlert className="w-5 h-5 text-[#006c4a]" />
              <h3 className="text-base font-bold text-slate-800">Sinyal Model</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl space-y-1">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#006c4a] flex items-center justify-center"><BarChart3 className="w-4 h-4" /></div>
                <p className="text-[10px] font-bold font-mono text-slate-400 uppercase mt-1">Harga Kini</p>
                <p className="text-sm font-black text-slate-800">{rupiah(d.hargaKini)}<span className="text-[10px] font-normal text-slate-400">/{unit}</span></p>
              </div>
              <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl space-y-1">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${up ? "bg-rose-50 text-rose-600" : "bg-emerald-50 text-emerald-600"}`}>
                  {up ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                </div>
                <p className="text-[10px] font-bold font-mono text-slate-400 uppercase mt-1">Prediksi 3 Bln</p>
                <p className="text-sm font-black text-slate-800">{rupiah(d.hargaPrediksi)}<span className="text-[10px] font-normal text-slate-400">/{unit}</span></p>
              </div>
              <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl space-y-1">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center"><Target className="w-4 h-4" /></div>
                <p className="text-[10px] font-bold font-mono text-slate-400 uppercase mt-1">Persentil Historis</p>
                <p className="text-sm font-black text-slate-800">{d.persentilHistoris.toFixed(0)}%</p>
              </div>
              <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl space-y-1">
                <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center"><Gauge className="w-4 h-4" /></div>
                <p className="text-[10px] font-bold font-mono text-slate-400 uppercase mt-1">Akurasi Model</p>
                <p className="text-sm font-black text-slate-800">{accuracy}%<span className="text-[10px] font-normal text-slate-400"> · MAPE {d.mapeKomoditas}%</span></p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${d.diAtasHet ? "bg-rose-50 text-rose-600 border-rose-100" : "bg-emerald-50 text-emerald-600 border-emerald-100"}`}>
                {d.diAtasHet ? "Prediksi di atas HAP/HET" : "Prediksi di bawah HAP/HET"}
              </span>
              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${d.anomaliTerkonfirmasi ? "bg-amber-50 text-amber-600 border-amber-100" : "bg-slate-50 text-slate-500 border-slate-100"}`}>
                {d.anomaliTerkonfirmasi ? "Anomali terkonfirmasi" : "Tanpa anomali historis"}
              </span>
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full border bg-slate-50 text-slate-500 border-slate-100">
                Model: horizon 3 bulan
              </span>
            </div>
          </div>

          {/* Real logistics recommendations from the redistribution LP */}
          <div className="bg-gradient-to-br from-emerald-50/50 to-teal-50/30 border border-emerald-200 rounded-[24px] p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-emerald-100 pb-3">
              <Lightbulb className="w-5 h-5 text-emerald-600" />
              <h3 className="text-base font-bold text-slate-800">Rekomendasi Redistribusi — {commodityName}</h3>
            </div>
            {routes.length > 0 ? (
              <div className="space-y-2.5">
                {routes.map((r, idx) => (
                  <div key={idx} className="flex items-center gap-3 bg-white border border-emerald-100/60 p-3.5 rounded-xl shadow-3xs">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0"><Truck className="w-4 h-4" /></div>
                    <p className="text-xs text-slate-600 font-semibold leading-relaxed flex-1">
                      Kirim <span className="font-black text-slate-800">{r.volume.toLocaleString("id-ID")} ton</span> dari{" "}
                      <span className="font-bold">{r.from}</span> <ArrowRight className="inline w-3 h-3" /> <span className="font-bold">{r.to}</span>
                      <span className="text-slate-400"> · {r.distance.toLocaleString("id-ID")} km · {rupiah(r.cost)}</span>
                    </p>
                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border shrink-0 ${
                      r.priority === "high" ? "bg-rose-50 text-rose-600 border-rose-100" :
                      r.priority === "medium" ? "bg-amber-50 text-amber-600 border-amber-100" :
                      "bg-slate-50 text-slate-500 border-slate-100"
                    }`}>{r.priority}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 font-medium">Tidak ada rute redistribusi yang diusulkan untuk komoditas ini.</p>
            )}
          </div>
        </div>

        {/* RIGHT (4 COLS) — other real alerts, same commodity */}
        <div className="lg:col-span-4 bg-white border border-slate-200/80 rounded-[24px] p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <MapPin className="w-4 h-4 text-[#006c4a]" />
            <h3 className="text-base font-bold text-slate-800">Wilayah Lain — {commodityName}</h3>
          </div>
          {relatedAlerts.length > 0 ? (
            <div className="space-y-2">
              {relatedAlerts.map((a) => {
                const s = SEVERITY[a.severity];
                const rUp = a.change >= 0;
                return (
                  <button
                    key={a.id}
                    onClick={() => router.push(`/alerts/${a.id}`)}
                    className="w-full text-left p-3 border border-slate-100 rounded-xl bg-slate-50 flex items-center justify-between gap-4 hover:bg-slate-100/60 transition-colors cursor-pointer"
                  >
                    <div className="space-y-0.5 min-w-0">
                      <h5 className="text-xs font-bold text-slate-800 truncate">{a.region}</h5>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${s.chip}`}>{s.label}</span>
                    </div>
                    <p className={`text-xs font-mono font-black shrink-0 ${rUp ? "text-rose-600" : "text-emerald-600"}`}>
                      {rUp ? "+" : ""}{a.change.toFixed(1)}%
                    </p>
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-slate-500 font-medium">Tidak ada peringatan lain untuk komoditas ini.</p>
          )}
        </div>
      </div>

      {/* ================= FLOW WIZARD ================= */}
      <AnimatePresence>
        {isWizardVisible && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0, y: 15 }}
            className="bg-sky-50/70 border border-sky-200 text-slate-700 rounded-[24px] p-6 shadow-sm space-y-5 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-sky-200/20 rounded-full blur-3xl pointer-events-none" />
            <div className="flex items-center justify-between gap-4 border-b border-sky-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-sky-100 rounded-xl text-sky-700"><Info className="w-5 h-5" /></div>
                <div>
                  <h3 className="text-base font-bold text-sky-900 tracking-tight">Alur Mitigasi SupplAi</h3>
                  <p className="text-xs text-sky-700/80 font-medium mt-0.5">Lanjutkan analisis {commodityName} lintas modul.</p>
                </div>
              </div>
              <button
                onClick={() => setIsWizardVisible(false)}
                className="p-1.5 bg-white border border-sky-200 hover:bg-sky-100/50 rounded-xl text-sky-800 transition-colors cursor-pointer relative z-20"
                title="Sembunyikan panduan"
              >
                <X className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
              {stepWizard.map((step, idx) => (
                <div
                  key={idx}
                  onClick={() => router.push(step.path)}
                  className="bg-white/80 border border-sky-200/60 p-4 rounded-xl flex items-start gap-3 hover:border-sky-400 hover:bg-white cursor-pointer transition-all duration-200 group text-left w-full outline-none shadow-3xs"
                >
                  <div className="w-7 h-7 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center text-xs font-mono font-black shrink-0 border border-sky-200 transition-colors group-hover:bg-sky-600 group-hover:text-white group-hover:border-transparent">
                    {idx + 1}
                  </div>
                  <div className="flex-1 space-y-0.5 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-xs font-bold text-sky-900 truncate group-hover:text-sky-700 transition-colors">{step.title}</h4>
                      <ArrowRight className="w-3.5 h-3.5 text-sky-500 group-hover:translate-x-1 transition-transform shrink-0" />
                    </div>
                    <p className="text-[11px] font-medium text-slate-500 leading-tight">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================= ACTION MODAL (local intervention log) ================= */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="bg-white border border-slate-200 w-full max-w-lg rounded-[24px] shadow-2xl relative z-10 overflow-hidden text-slate-800"
            >
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2 text-[#006c4a]">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <h3 className="text-sm font-black uppercase tracking-wider">Catat Tindak Lanjut</h3>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 rounded-lg hover:bg-slate-200/60 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <form onSubmit={handleSubmitAction} className="p-6 space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold font-mono text-slate-400 uppercase tracking-wider">Petugas / Unit</label>
                  <input
                    type="text"
                    value={officer}
                    onChange={(e) => setOfficer(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:border-[#006c4a] focus:bg-white transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold font-mono text-slate-400 uppercase tracking-wider">Rencana Tindak Lanjut</label>
                  <textarea
                    rows={4}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    required
                    placeholder={`Contoh: tinjau rute redistribusi ${commodityName} dan koordinasikan dengan TPID ${alert.region}.`}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 placeholder-slate-400 outline-none focus:border-[#006c4a] focus:bg-white transition-all resize-none leading-relaxed"
                  />
                </div>
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-500 transition-colors cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="bg-[#006c4a] hover:bg-[#005238] text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-97 transition-all cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Simpan
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
