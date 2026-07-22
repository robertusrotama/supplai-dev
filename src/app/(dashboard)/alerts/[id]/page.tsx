"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { 
  AlertTriangle, 
  ArrowRight, 
  ChevronLeft, 
  CloudRain, 
  TrendingUp, 
  Truck, 
  ShieldAlert, 
  Clock,
  MapPin,
  Sparkles,
  CheckCircle2,
  X,
  FileSpreadsheet,
  Send,
  Lightbulb,
  Info
} from "lucide-react";

const COMPREHENSIVE_ALERT_DB = {
  "warn-1": {
    commodity: "Bawang Merah",
    severity: "CRITICAL / PRICE SURGE",
    delta: "+12.4%",
    duration: "10 Hari Terakhir",
    region: "Jawa Tengah & DKI Jakarta",
    timestamp: "Baru saja",
    executiveSummary: "Anomali cuaca berupa curah hujan ekstrem di wilayah pesisir utara Jawa Tengah memicu gagal panen parsial sebesar 34% pada lahan produktif. Dampak ini merembet pada penurunan volume pasokan harian di Pasar Induk Kramat Jati sebesar 40 ton/hari, memicu eskalasi harga spekulatif di tingkat konsumen retail Jabodetabek.",
    triggers: [
      {
        icon: CloudRain,
        title: "Anomali Cuaca & Curah Hujan Tinggi",
        desc: "Intensitas hujan >150mm/minggu di sentra produksi Brebes menyebabkan pembusukan akar komoditas sebelum masa petik."
      },
      {
        icon: TrendingUp,
        title: "Penurunan Suplai Pasar Induk",
        desc: "Pasokan harian domestik merosot dari rata-rata 110 ton menjadi hanya 70 ton, mendistorsi kurva permintaan suplai nasional."
      },
      {
        icon: Truck,
        title: "Overhead Logistik Jalur Darat",
        desc: "Genangan banjir di jalur arteri Pantura menghambat waktu tempuh armada kargo pendingin hingga 18 jam ekstra."
      }
    ],
    impactedZones: [
      { name: "DKI Jakarta", status: "Defisit Kritis", stock: "140 ton", demand: "280 ton" },
      { name: "Jawa Barat", status: "Defisit Siaga", stock: "95 ton", demand: "130 ton" },
      { name: "Banten", status: "Defisit Waspada", stock: "45 ton", demand: "60 ton" }
    ],
    aiRecommendations: [
      "Koordinasi distribusi darurat dari Makassar dan Surabaya.",
      "Aktifkan cadangan pangan daerah segera.",
      "Buka jalur logistik alternatif non-Pantura bekerjasama dengan otoritas perhubungan."
    ]
  }
};

export default function AlertDetailPage() {
  const params = useParams();
  const router = useRouter();

  const alertId = (params?.id as string) || "warn-1";
  const alertData = COMPREHENSIVE_ALERT_DB[alertId as keyof typeof COMPREHENSIVE_ALERT_DB] || COMPREHENSIVE_ALERT_DB["warn-1"];

  // ================= STATES =================
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isExecuted, setIsExecuted] = useState(false);
  const [isWizardVisible, setIsWizardVisible] = useState(true);
  const [note, setNote] = useState("");
  const [officer, setOfficer] = useState("Tim PP0703");
  const [savedLogs, setSavedLogs] = useState<{ officer: string; text: string; time: string } | null>(null);

  const stepWizard = [
    { step: 1, title: "1. Analisis Prediktif", desc: "Proyeksi Tren Harga", path: "/dashboard?commodity=bawang-merah&trigger=alert" },
    { step: 2, title: "2. Peta Risiko Nasional", desc: "Sebaran Spasial Geografis", path: "/heatmap?commodity=bawang-merah&trigger=alert" },
    { step: 3, title: "3. Optimasi Redistribusi", desc: "Eksekusi Rute Logistik", path: "/redistribusi?commodity=bawang-merah&trigger=alert" }
  ];

  const handleSubmitAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!note.trim()) return;

    setIsExecuted(true);
    setSavedLogs({
      officer,
      text: note,
      time: "Baru saja direspon"
    });
    setIsModalOpen(false);
  };

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
                isExecuted 
                  ? "bg-emerald-600 text-white animate-bounce" 
                  : "bg-rose-500 text-white"
              }`}>
                {isExecuted ? "RESOLVED / DITANGANI" : alertData.severity}
              </span>
              <div className="flex items-center gap-1 text-xs text-slate-400 font-medium">
                <Clock className="w-3.5 h-3.5" />
                {alertData.timestamp}
              </div>
            </div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">
              Krisis Komoditas: <span className="text-[#065F46]">{alertData.commodity}</span>
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="bg-rose-50 border border-rose-100 rounded-2xl px-5 py-3 flex items-center gap-4 shrink-0 shadow-2xs">
              <div>
                <p className="text-[10px] font-bold font-mono text-slate-400 uppercase tracking-wider">Lonjakan Harga</p>
                <p className="text-2xl font-black text-rose-600 tracking-tight">{alertData.delta}</p>
              </div>
              <div className="w-px h-8 bg-rose-200" />
              <div>
                <p className="text-[10px] font-bold font-mono text-slate-400 uppercase tracking-wider">Rentang Waktu</p>
                <p className="text-sm font-extrabold text-slate-700">{alertData.duration}</p>
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
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Selesai Ditangani
                </>
              ) : (
                <>
                  <FileSpreadsheet className="w-4 h-4" />
                  Tindak Lanjuti Krisis
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ================= LOGGER DETAIL JIKA BERHASIL DIEKSEKUSI ================= */}
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
                <span>Log Intervensi Terdaftar Resmi (Sistem Berhasil Diperbarui)</span>
              </div>
              <span className="font-mono font-medium text-slate-400">{savedLogs.time}</span>
            </div>
            <div className="text-xs text-slate-600 bg-white/80 border border-emerald-100 p-3 rounded-xl leading-relaxed">
              <p className="font-bold text-slate-700 mb-0.5">Petugas: {savedLogs.officer}</p>
              <p className="font-medium">Tindakan Khusus: "{savedLogs.text}"</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================= CONTENT METRICS GRID ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COMPONENT (8 COLS) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white border border-slate-200/80 rounded-[24px] p-6 shadow-xs">
            <h3 className="text-sm font-black font-mono uppercase tracking-wider text-slate-400 mb-2.5">Nota Ringkasan Eksekutif</h3>
            <p className="text-xs text-slate-600 font-medium leading-relaxed text-justify">
              {alertData.executiveSummary}
            </p>
          </div>

          {/* ================= NEW PANEL: REKOMENDASI INTERVENSI AI ================= */}
          <div className="bg-gradient-to-br from-emerald-50/50 to-teal-50/30 border border-emerald-200 rounded-[24px] p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-emerald-100 pb-3">
              <Lightbulb className="w-5 h-5 text-emerald-600" />
              <h3 className="text-base font-bold text-slate-800">Rekomendasi Intervensi Peta Operasi SupplAi</h3>
            </div>
            <div className="space-y-2.5">
              {alertData.aiRecommendations.map((recommendation, idx) => (
                <div key={idx} className="flex items-start gap-3 bg-white border border-emerald-100/60 p-3.5 rounded-xl shadow-3xs">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <p className="text-xs text-slate-600 font-semibold leading-relaxed">
                    {recommendation}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-[24px] p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <ShieldAlert className="w-5 h-5 text-[#006c4a]" />
              <h3 className="text-base font-bold text-slate-800">Akar Masalah Kebocoran Suplai Domestik</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {alertData.triggers.map((trigger, idx) => {
                const IconComponent = trigger.icon;
                return (
                  <div key={idx} className="bg-slate-50 border border-slate-100 p-4 rounded-xl flex flex-col justify-between gap-3">
                    <div className="space-y-1.5">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#006c4a] flex items-center justify-center shrink-0">
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <h4 className="text-xs font-bold text-slate-800 leading-snug">{trigger.title}</h4>
                    </div>
                    <p className="text-[11px] text-slate-400 font-medium leading-relaxed">{trigger.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT COMPONENT (4 COLS) */}
        <div className="lg:col-span-4 bg-white border border-slate-200/80 rounded-[24px] p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <MapPin className="w-4 h-4 text-[#006c4a]" />
            <h3 className="text-base font-bold text-slate-800">Kluster Wilayah Terdampak</h3>
          </div>
          <div className="space-y-2">
            {alertData.impactedZones.map((zone, idx) => (
              <div key={idx} className="p-3 border border-slate-100 rounded-xl bg-slate-50 flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <h5 className="text-xs font-bold text-slate-800">{zone.name}</h5>
                  <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-100">{zone.status}</span>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-medium text-slate-400">Rasio Stok/Kebutuhan</p>
                  <p className="text-xs font-mono font-bold text-slate-700">{zone.stock} / <span className="text-slate-400">{zone.demand}</span></p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ================= UPDATED PANEL: NON-CTA BLUE INFO FLOW WIZARD WITH CLOSE BUTTON ================= */}
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
                <div className="p-2 bg-sky-100 rounded-xl text-sky-700">
                  <Info className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-sky-900 tracking-tight">SupplAi Mitigation Flow-Preview Pemandu</h3>
                  <p className="text-xs text-sky-700/80 font-medium mt-0.5">Referensi alur langkah analisis pemantauan krisis sistem digital.</p>
                </div>
              </div>
              
              {/* EXIT / CLOSE BUTTON */}
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

      {/* ================= MODAL INTERAKTIF: FORM ACTION TINDAK LANJUT ================= */}
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
                  <h3 className="text-sm font-black uppercase tracking-wider">Form Intervensi Krisis Suplai</h3>
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
                  <label className="text-[10px] font-bold font-mono text-slate-400 uppercase tracking-wider">Petugas Otoritas Pengendali</label>
                  <input
                    type="text"
                    value={officer}
                    onChange={(e) => setOfficer(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:border-[#006c4a] focus:bg-white transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold font-mono text-slate-400 uppercase tracking-wider">Detail Tindak Lanjut / Rencana Operasi</label>
                  <textarea
                    rows={4}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    required
                    placeholder="Contoh: Menginstruksikan pembongkaran cadangan logistik daerah surplus Blitar sebanyak 80 ton untuk segera didistribusikan via rute kargo tol Pantura..."
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
                    Simpan & Eksekusi
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