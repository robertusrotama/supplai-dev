"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { AnimatePresence, motion } from "motion/react";
import { regionalComparisonMaster } from "@/data/regional-data";
import { commodities } from "@/data/commodities";
import { Sliders, Search, AlertTriangle, Eye, MapPin, ClipboardList, X } from "lucide-react";

const CITY_COORDINATES: Record<string, { x: number; y: number }> = {
  "Medan": { x: 120, y: 140 },
  "Padang": { x: 160, y: 220 },
  "Palembang": { x: 240, y: 280 },
  "Bandung": { x: 300, y: 390 },
  "Semarang": { x: 370, y: 390 },
  "Yogyakarta": { x: 390, y: 410 },
  "Surabaya": { x: 440, y: 390 },
  "Pontianak": { x: 310, y: 210 },
  "Banjarmasin": { x: 410, y: 270 },
  "Balikpapan": { x: 440, y: 240 },
  "Makassar": { x: 530, y: 290 },
  "Palu": { x: 530, y: 210 },
  "Kupang": { x: 590, y: 430 },
  "Sorong": { x: 740, y: 190 },
  "Merauke": { x: 910, y: 380 },
};

export function NationalHeatmap() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // States Filter & Dropdown
  const [selectedCommodity, setSelectedCommodity] = useState("beras");
  const [intensity, setIntensity] = useState(71);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCommOpen, setIsCommOpen] = useState(false);
  
  // States Modal Rekomendasi & Hover Tooltip
  const [isRecoModalOpen, setIsRecoModalOpen] = useState(false);
  const [hoveredCity, setHoveredCity] = useState<any | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function clickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setIsCommOpen(false);
    }
    document.addEventListener("mousedown", clickOutside);
    return () => document.removeEventListener("mousedown", clickOutside);
  }, []);

  const filteredCommodities = useMemo(() => {
    return commodities.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [searchQuery]);

  const currentCommodityName = useMemo(() => {
    return commodities.find(c => c.id === selectedCommodity)?.name || "Beras Medium";
  }, [selectedCommodity]);

  // LOGIKA MOUSE HOVER CANVAS TOOLTIP
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const mouseY = ((e.clientY - rect.top) / rect.height) * canvas.height;

    let foundCity: any = null;

    regionalComparisonMaster.forEach((item) => {
      const coord = CITY_COORDINATES[item.region];
      if (!coord) return;

      const distance = Math.sqrt(Math.pow(mouseX - coord.x, 2) + Math.pow(mouseY - coord.y, 2));
      if (distance < 16) {
        foundCity = item;
      }
    });

    if (foundCity) {
      setHoveredCity(foundCity);
      setTooltipPos({
        x: e.clientX - rect.left + 15,
        y: e.clientY - rect.top + 15
      });
    } else {
      setHoveredCity(null);
    }
  };

  // ENGINE RENDER SEBARAN DENSITY CANVAS
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const baseMap = new Image();
    baseMap.src = "/indonesia-map.svg"; 

    baseMap.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#ffffff"; 
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.globalAlpha = 0.6; 
      ctx.drawImage(baseMap, 40, 40, 920, 420); // Skala gambar peta diperbesar agar proporsional widescreen
      ctx.globalAlpha = 1.0; 

      // Render Thermal Gradien Blur
      regionalComparisonMaster.forEach((item) => {
        const coord = CITY_COORDINATES[item.region];
        if (!coord) return;

        const radius = intensity; 
        const gradient = ctx.createRadialGradient(coord.x, coord.y, 2, coord.x, coord.y, radius);

        if (item.status === "CRITICAL") {
          gradient.addColorStop(0, "rgba(239, 68, 68, 0.85)");   
          gradient.addColorStop(0.3, "rgba(249, 115, 22, 0.55)"); 
          gradient.addColorStop(0.6, "rgba(234, 179, 8, 0.25)");  
          gradient.addColorStop(1, "rgba(59, 130, 246, 0.0)");
        } else if (item.status === "SURPLUS") {
          gradient.addColorStop(0, "rgba(16, 185, 129, 0.75)");  
          gradient.addColorStop(0.4, "rgba(52, 211, 153, 0.35)"); 
          gradient.addColorStop(1, "rgba(0, 0, 0, 0.0)");
        } else {
          gradient.addColorStop(0, "rgba(59, 130, 246, 0.55)");   
          gradient.addColorStop(0.5, "rgba(147, 197, 253, 0.25)"); 
          gradient.addColorStop(1, "rgba(0, 0, 0, 0.0)");
        }

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(coord.x, coord.y, radius, 0, Math.PI * 2);
        ctx.fill();
      });

      // Render Titik Anchor Kota & Teks Label
      regionalComparisonMaster.forEach((item) => {
        const coord = CITY_COORDINATES[item.region];
        if (!coord) return;

        ctx.fillStyle = item.status === "CRITICAL" ? "#ef4444" : "#1e293b";
        ctx.beginPath();
        ctx.arc(coord.x, coord.y, 4.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.font = "bold 11px sans-serif";
        ctx.fillStyle = "#0f172a";
        ctx.shadowColor = "#ffffff";
        ctx.shadowBlur = 4;
        ctx.fillText(item.region, coord.x + 8, coord.y + 2);

        ctx.font = "9px monospace";
        ctx.fillStyle = "#64748b";
        ctx.fillText(`Rp${item.price.toLocaleString()}`, coord.x + 8, coord.y + 12);
        
        ctx.shadowBlur = 0; 
      });
    };
  }, [selectedCommodity, intensity]);

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto font-sans pb-4 p-2 text-slate-800">
      
      {/* ================= BAR CONTROLLER ATAS & TOMBOL MODAL ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/50 pb-4">
        <div>
          <h1 className="text-3xl font-black text-[#006c4a] tracking-tight">National Supply Density Heatmap</h1>
          <p className="text-sm text-slate-500 font-medium mt-0.5">
            Realtime thermal density projection mapping logistics deficits and surplus matrices.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Legend Indikator Status */}
          <div className="hidden md:flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-500 shadow-3xs h-10">
            <span>Surplus</span>
            <div className="w-20 h-2 bg-gradient-to-r from-emerald-500 via-yellow-400 to-rose-500 rounded-md" />
            <span>Defisit</span>
          </div>

          {/* NEW ACTION BUTTON: Pemicu Pop-Up Rekomendasi Wilayah */}
          <button
            onClick={() => setIsRecoModalOpen(true)}
            className="flex items-center gap-2 bg-[#006c4a] hover:bg-[#005238] text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-xs transition-all active:scale-97 cursor-pointer h-10 shrink-0"
          >
            <ClipboardList className="w-4 h-4" />
            <span>Lihat Rekomendasi Wilayah</span>
          </button>
        </div>
      </div>

      {/* ================= MAIN INTERFACE (FULL WIDESCREEN VIEW) ================= */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch w-full">
        
        {/* PANEL FILTER PARAMETER (KIRI - 3 COLS) */}
        <div className="xl:col-span-3 bg-white border border-slate-200 rounded-[24px] p-5 space-y-5 shadow-xs flex flex-col justify-start">
          <div className="flex items-center gap-2 text-[10px] font-bold tracking-wider text-slate-400 font-mono uppercase">
            <Sliders className="w-3.5 h-3.5 text-[#006c4a]" />
            HEATMAP FILTERS
          </div>

          <div className="space-y-1.5 relative" ref={dropdownRef}>
            <label className="text-[10px] font-bold tracking-wider text-slate-400 font-mono uppercase block">
              TARGET MATRIC COMMODITY
            </label>
            <div 
              onClick={() => setIsCommOpen(!isCommOpen)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 flex items-center justify-between text-sm font-bold text-slate-700 cursor-pointer transition-all hover:border-slate-300"
            >
              <span>{currentCommodityName}</span>
              <svg className="w-3.5 h-3.5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m6 9 6 6 6-6"/></svg>
            </div>
            <AnimatePresence>
              {isCommOpen && (
                <div className="absolute left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-2 space-y-2">
                  <div className="relative flex items-center">
                    <Search className="absolute left-2.5 w-3.5 h-3.5 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="Cari komoditas..." 
                      value={searchQuery} 
                      onChange={(e) => setSearchQuery(e.target.value)} 
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs outline-none focus:border-[#006c4a] font-bold"
                    />
                  </div>
                  <div className="max-h-40 overflow-y-auto space-y-0.5">
                    {filteredCommodities.map(c => (
                      <div 
                        key={c.id} 
                        onClick={() => { setSelectedCommodity(c.id); setIsCommOpen(false); setSearchQuery(""); }} 
                        className={`px-3 py-2 text-xs font-bold rounded-lg cursor-pointer ${c.id === selectedCommodity ? "bg-emerald-50 text-[#006c4a]" : "text-slate-600 hover:bg-slate-50"}`}
                      >
                        {c.name}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </AnimatePresence>
          </div>

          <div className="space-y-2 pt-2">
            <div className="flex justify-between items-center text-[10px] font-bold tracking-wider text-slate-400 font-mono uppercase">
              <span>BLUR RADIAL INTENSITY</span>
              <span className="text-emerald-700 font-bold">{intensity}PX</span>
            </div>
            <input 
              type="range" 
              min="40" 
              max="110" 
              value={intensity} 
              onChange={(e) => setIntensity(Number(e.target.value))}
              className="w-full accent-[#006c4a] bg-slate-100 rounded-lg h-1.5 appearance-none cursor-pointer"
            />
          </div>
        </div>

        {/* WORKSPACE PETA INDONESIA BESAR MAKSIMAL (KANAN - 9 COLS) */}
        <div className="xl:col-span-9 bg-white border border-slate-200 rounded-[24px] p-5 shadow-xs flex flex-col relative w-full overflow-hidden">
          <div className="w-full flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <span className="text-[11px] font-bold tracking-wider text-slate-400 font-mono uppercase flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-[#006c4a]" />
              LIVE HIGH-DENSITY SMOOTH WIDESCREEN MAP LAYER ENGINE
            </span>
            <div className="flex items-center gap-2 text-[10px] font-bold font-mono text-slate-500">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
              Brebes Cluster Critical Peak
            </div>
          </div>
          
          <div className="w-full relative bg-slate-50 rounded-2xl border border-slate-200/40 p-2 flex justify-center items-center overflow-hidden">
            <canvas 
              ref={canvasRef} 
              width={1000} 
              height={500} 
              onMouseMove={handleMouseMove}
              onMouseLeave={() => setHoveredCity(null)}
              className="rounded-xl shadow-2xs w-full h-auto cursor-crosshair"
            />

            {/* FLOATING DETAILED HOVER WIDGET */}
            <AnimatePresence>
              {hoveredCity && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.1 }}
                  style={{ left: tooltipPos.x, top: tooltipPos.y }}
                  className="absolute pointer-events-none bg-slate-900/95 backdrop-blur-xs text-white px-4 py-3 rounded-xl shadow-xl border border-slate-800 space-y-1.5 z-50 w-52"
                >
                  <div className="flex justify-between items-center border-b border-slate-700/60 pb-1.5">
                    <span className="font-bold text-xs flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                      {hoveredCity.region}
                    </span>
                    <span className={`text-[9px] font-mono font-black px-1.5 py-0.5 rounded ${
                      hoveredCity.status === 'CRITICAL' ? 'bg-rose-600' : 'bg-emerald-600'
                    }`}>
                      {hoveredCity.status}
                    </span>
                  </div>
                  <div className="space-y-0.5 font-mono text-[10px]">
                    <div className="flex justify-between"><span className="text-slate-400">Harga Retail:</span><span className="font-bold text-emerald-300">Rp{hoveredCity.price.toLocaleString()}</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">Volume Stok:</span><span className="font-bold text-slate-100">140 Ton</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">Rasio Pangan:</span><span className="font-bold text-amber-300">88.4%</span></div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

      </div>

      {/* ================= MODAL INTERAKTIF POP-UP REKOMENDASI PER WILAYAH ================= */}
      <AnimatePresence>
        {isRecoModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsRecoModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs"
            />
            
            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="bg-white border border-slate-200 w-full max-w-2xl rounded-[24px] shadow-2xl relative z-10 overflow-hidden text-slate-800"
            >
              {/* Modal Header */}
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2 text-[#006c4a]">
                  <ClipboardList className="w-5 h-5 text-[#006c4a]" />
                  <h3 className="text-sm font-black uppercase tracking-wider font-mono">Matriks Rekomendasi SupplAi per Wilayah</h3>
                </div>
                <button 
                  onClick={() => setIsRecoModalOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4 stroke-[2.5]" />
                </button>
              </div>

              {/* Modal Grid Content List */}
              <div className="p-6 space-y-3.5 max-h-[70vh] overflow-y-auto">
                <div className="p-4 border border-slate-100 rounded-xl bg-slate-50/80 space-y-1">
                  <h5 className="text-xs font-black text-[#006c4a]">Kawasan Jabodetabek</h5>
                  <p className="text-xs text-slate-600 font-medium leading-relaxed">Stabilisasi stok via Pasar Induk Cipinang dan Kramat Jati perlu ditingkatkan segera. Hambatan variansi harga eceran terpantau menipis.</p>
                </div>
                <div className="p-4 border border-slate-100 rounded-xl bg-slate-50/80 space-y-1">
                  <h5 className="text-xs font-black text-[#006c4a]">Kawasan Pulau Jawa</h5>
                  <p className="text-xs text-slate-600 font-medium leading-relaxed">Pasokan cabai dan bawang menuju Jabodetabek terpantau aman, namun awasi volatilitas krisis penawaran di sentra tani Brebes.</p>
                </div>
                <div className="p-4 border border-slate-100 rounded-xl bg-slate-50/80 space-y-1">
                  <h5 className="text-xs font-black text-[#006c4a]">Kawasan Pulau Sumatera</h5>
                  <p className="text-xs text-slate-600 font-medium leading-relaxed">Distribusikan tambahan logistik jalur darat lintas Trans-Sumatera guna menekan potensi defisit pasokan musiman akibat cuaca buruk.</p>
                </div>
                <div className="p-4 border border-slate-100 rounded-xl bg-slate-50/80 space-y-1">
                  <h5 className="text-xs font-black text-[#006c4a]">Sulawesi & Kawasan Timur</h5>
                  <p className="text-xs text-slate-600 font-medium leading-relaxed">Rekomendasi taktis substitusi moda armada logistik laut terpadu untuk menekan disparitas lonjakan harga tinggi antar pulau.</p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}