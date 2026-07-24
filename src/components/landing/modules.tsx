"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Database, Zap, Rocket, CheckCircle2 } from "lucide-react";

const modulesData = [
  {
    id: "predict",
    step: "INPUT",
    stepLabel: "Integrasi Data Multi-Sektoral",
    title: "SupplAi Predict",
    description: "Mengintegrasikan data PIHPS BI, Panel Bapanas, cuaca BMKG, dan data produksi Kementan untuk memproyeksikan pergerakan harga pokok 1–3 bulan ke depan.",
    icon: Database,
    imageBg: "from-brand-primary/10 to-emerald-500/5",
    labels: ["PIHPS", "Bapanas", "BMKG", "Kementan"],
    mockupContent: (
      <div className="w-full h-full flex flex-col justify-between p-6 text-brand-textMuted font-mono text-xs bg-brand-card">
        <div className="flex items-center justify-between border-b border-brand-border pb-2">
          <span className="font-semibold text-brand-textMain">Prophet + LSTM Engine</span>
          <span className="text-brand-primary font-bold">● Active</span>
        </div>
        <div className="space-y-2 my-auto">
          <p className="text-brand-textMuted/50">// Menghitung tren 1–3 bulan ke depan</p>
          <p className="text-cyan-700 font-semibold">Executing: model.predict(target_date)</p>
          <div className="h-16 w-full bg-brand-bgSubtle rounded border border-brand-border p-2 flex items-end gap-1">
            <div className="w-full bg-brand-primary/30 h-1/3 rounded-t"></div>
            <div className="w-full bg-brand-primary/50 h-1/2 rounded-t"></div>
            <div className="w-full bg-brand-primary/70 h-3/4 rounded-t"></div>
            <div className="w-full bg-brand-primary h-full rounded-t animate-pulse"></div>
          </div>
        </div>
        <div className="text-right text-brand-primary font-bold">Akurasi: 94.8%</div>
      </div>
    )
  },
  {
    id: "match",
    step: "PROSES",
    stepLabel: "AI & Matchmaking Engine",
    title: "SupplAi Match",
    description: "Algoritma optimasi matematis menganalisis fluktuasi harga secara real-time dan otomatis memetakan titik pasokan surplus untuk dialirkan ke wilayah defisit.",
    icon: Zap,
    imageBg: "from-teal-500/10 to-brand-primary/5",
    labels: ["Machine Learning", "Linear Programming", "Redistribution Route"],
    mockupContent: (
      <div className="w-full h-full flex flex-col justify-between p-6 text-brand-textMuted font-mono text-xs bg-brand-card">
        <div className="flex items-center justify-between border-b border-brand-border pb-2">
          <span className="font-semibold text-brand-textMain">Optimasi Jalur Distribusi</span>
        </div>
        <div className="space-y-3 my-auto">
          <div className="flex items-center justify-between bg-brand-primary/10 border border-brand-primary/20 p-2 rounded-xl">
            <span className="text-brand-accentDark font-bold">Wilayah Surplus</span>
            <span className="font-bold text-brand-textMain">Kediri (+12T)</span>
          </div>
          <div className="flex justify-center text-brand-textMuted/40 text-[10px]">↓↓ Proses Alokasi Jalur ↓↓</div>
          <div className="flex items-center justify-between bg-rose-500/10 border border-rose-500/20 p-2 rounded-xl">
            <span className="text-rose-600 font-bold">Wilayah Defisit</span>
            <span className="font-bold text-brand-textMain">Surabaya (-8T)</span>
          </div>
        </div>
        <div className="text-center text-brand-accentDark font-bold">Biaya Logistik minimum didapatkan</div>
      </div>
    )
  },
  {
    id: "agent",
    step: "OUTPUT",
    stepLabel: "Aksi Cepat & Peringatan",
    title: "SupplAi Agent",
    description: "Sistem otomatisasi yang menyajikan peta disparitas spasial nasional serta mengirimkan alarm Push-Alert darurat langsung ke 500 instansi TPID daerah.",
    icon: Rocket,
    imageBg: "from-emerald-500/10 to-cyan-500/5",
    labels: ["Early Warning System", "Peta Disparitas Real-time"],
    mockupContent: (
      <div className="w-full h-full flex flex-col justify-between p-6 text-brand-textMuted font-mono text-xs bg-brand-card">
        <div className="flex items-center justify-between border-b border-brand-border pb-2">
          <span className="font-semibold text-brand-textMain">TPID AI Agent Report</span>
          <span className="bg-brand-primary text-[10px] px-1.5 py-0.5 rounded-md text-white font-sans font-bold">Autonomous</span>
        </div>
        <div className="space-y-2 my-auto text-left w-full">
          <div className="p-2 bg-brand-bgSubtle rounded-xl border border-brand-border flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-brand-primary flex-shrink-0" />
            <span>Early Warning System Aktif</span>
          </div>
          <div className="p-2 bg-brand-bgSubtle rounded-xl border border-brand-border flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-brand-primary flex-shrink-0" />
            <span>Peta Disparitas Terdistribusi</span>
          </div>
        </div>
        <div className="text-xs text-brand-textMuted/60 italic text-left">Notification broadcast completed successfully.</div>
      </div>
    )
  }
];

export function ModulesSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [progress, setProgress] = useState(0); // State untuk persentase visual timer (0 - 100)
  const activeTab = modulesData[activeIndex];
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const DURATION = 5000; // Total durasi 5 detik per modul
  const INTERVAL = 100; // Update setiap 100 milidetik

  useEffect(() => {
    // Mulai siklus penghitungan progress bar
    timerRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          // Ketika mencapai batas maksimal, geser index modul dan reset ke 0
          setActiveIndex((prevIndex) => (prevIndex + 1) % modulesData.length);
          return 0;
        }
        return prev + (INTERVAL / DURATION) * 100;
      });
    }, INTERVAL);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activeIndex]);

  const handleTabClick = (index: number) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setProgress(0); // Reset visual progress bar ke ujung atas
    setActiveIndex(index); // Pindah modul secara manual
  };

  return (
    <section id="modules" className="w-full bg-brand-bg font-sans py-24 px-6 md:px-12">
      <div className="max-w-7xl mx-auto space-y-16">

        {/* Header Bersama */}
        <div className="text-center space-y-3">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-brand-textMain">
            How we Works?
          </h2>
          <p className="text-brand-textMuted text-base md:text-lg max-w-2xl mx-auto">
            Integrasi sistematis alur end-to-end dari input hulu hingga aksi hilir secara prediktif.
          </p>
        </div>

        {/* Grid Utama */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

          {/* KIRI: Wadah Visual/Mockup Dinamis */}
          <div className="lg:col-span-6 w-full aspect-[4/3] bg-brand-bgSubtle rounded-3xl border border-brand-border p-5 flex flex-col relative overflow-hidden shadow-sm">
            <div className={`absolute inset-0 bg-gradient-to-br ${activeTab.imageBg} blur-[60px] opacity-100 transition-all duration-700`} />

            <div className="relative z-20 flex gap-1.5 pb-3">
              <div className="w-3 h-3 rounded-full bg-rose-400/40" />
              <div className="w-3 h-3 rounded-full bg-amber-400/40" />
              <div className="w-3 h-3 rounded-full bg-emerald-400/40" />
            </div>

            <div className="relative z-10 w-full h-full bg-brand-card rounded-2xl border border-brand-border shadow-md overflow-hidden flex-1">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab.id}
                  initial={{ opacity: 0, scale: 0.98, y: 8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98, y: -8 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  className="w-full h-full"
                >
                  {activeTab.mockupContent}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* KANAN: Menu Alur Langkah Input -> Proses -> Output */}
          <div className="lg:col-span-6 space-y-4 relative border-l border-brand-border/60 pl-6 ml-2 lg:ml-0">
            {modulesData.map((item, index) => {
              const IconComponent = item.icon;
              const isActive = activeIndex === index;

              return (
                <div
                  key={item.id}
                  className="relative cursor-pointer group py-4 transition-all duration-300 select-none"
                  onClick={() => handleTabClick(index)}
                >
                  {/* CONTAINER UTAMA TRACK LINER ABU-ABU DI LOKASI GARIS AKTIF */}
                  {isActive && (
                    <div className="absolute left-[-26px] top-0 bottom-0 w-[3px] bg-brand-border rounded-full overflow-hidden">
                      {/* ANIMASI PROGRESS BAR HIJAU DARI ATAS KE BAWAH */}
                      <motion.div
                        className="w-full bg-brand-primary origin-top rounded-full"
                        style={{ height: `${progress}%` }}
                        transition={{ ease: "linear" }}
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    {/* Tahapan Label Arsitektur (JetBrains Mono) */}
                    <span className={`font-mono text-xs font-bold tracking-widest uppercase block ${isActive ? "text-brand-primary" : "text-brand-textMuted/40 group-hover:text-brand-textMuted/70"
                      }`}>
                      {item.step} : {item.stepLabel}
                    </span>

                    <div className="flex items-center gap-3 mt-1">
                      <div className={`p-2 rounded-xl border transition-all duration-300 ${isActive
                        ? "bg-brand-primary/10 border-brand-primary/30 text-brand-primary shadow-sm"
                        : "bg-brand-card border-brand-border text-brand-textMuted group-hover:text-brand-textMain"
                        }`}>
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <h3 className={`text-xl font-bold tracking-tight transition-colors duration-300 ${isActive ? "text-brand-textMain" : "text-brand-textMuted/50 group-hover:text-brand-textMain"
                        }`}>
                        {item.title}
                      </h3>
                    </div>

                    <p className={`text-sm leading-relaxed transition-colors duration-300 max-w-xl ${isActive ? "text-brand-textMuted" : "text-brand-textMuted/30 group-hover:text-brand-textMuted/60"
                      }`}>
                      {item.description}
                    </p>

                    {/* Badge Sub-Info Mini */}
                    {isActive && (
                      <motion.div
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-wrap gap-1.5 pt-2 font-mono text-[10px] font-bold text-brand-textMuted"
                      >
                        {item.labels.map((lbl) => (
                          <span key={lbl} className="px-2 py-0.5 bg-brand-bgSubtle border border-brand-border rounded-md">
                            {lbl}
                          </span>
                        ))}
                      </motion.div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

        </div>
        {/* ================================================================= */}
        {/* MUTED LOGO CLOUD INTERGRASI LEMBAGA MITRA (PAS DI BAWAH FLOW)     */}
        {/* ================================================================= */}
        <div className="pt-20 mt-8 border-t border-brand-border/60 text-center space-y-6">
          <p className="text-brand-textMuted/60 font-medium text-xs tracking-wider uppercase font-mono">
            In Partnership with:
          </p>

          {/* Grid Logo Otomatis Muted, Grayscale, dan Efek Transparan Cerdas */}
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-8 max-w-5xl mx-auto px-4">
            {[
              { name: "Bank Indonesia", src: "/images/logos/bi.png" },
              { name: "Bapanas", src: "/images/logos/bapanas.png" },
              { name: "BMKG", src: "/images/logos/bmkg.png" },
              { name: "Kementerian Pertanian", src: "/images/logos/kementan.png" },
            ].map((logo) => (
              <img
                key={logo.name}
                src={logo.src}
                alt={`Logo Resmi ${logo.name}`}
                title={logo.name}
                // Efek filter grayscale pekat, opacity tipis, dan transisi hover cerah saat disentuh
                className="h-9 md:h-11 object-contain grayscale opacity-45 contrast-75 brightness-95 hover:opacity-90 hover:grayscale-0 transition-all duration-300 select-none cursor-help"
              />
            ))}
          </div>
          <div
            title="Tim Pengendalian Inflasi Daerah"
            className="font-mono text-xs md:text-sm font-black tracking-tight text-brand-textMuted/45 hover:text-brand-primary border border-dashed border-brand-border/80 hover:border-brand-primary/40 px-3 py-2 rounded-xl transition-all duration-300 cursor-help select-none bg-brand-card/30"
          >
            +500 TPID yang tersebar di seluruh daerah Indonesia
          </div>
        </div>

      </div>
    </section>
  );
}