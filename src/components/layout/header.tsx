"use client";

import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import { Search, Bell, User, LogOut, LogIn, Bot, RefreshCw, AlertTriangle, ArrowRight, ChevronLeft, ArrowUpRight, Menu } from "lucide-react";

interface HeaderProps {
    onToggleAgent: () => void;
}

const MOCK_NOTIFICATIONS = [
    {
        id: "warn-1",
        commodity: "Bawang Merah",
        title: "Naik +12% dalam 10 hari",
        severity: "critical",
        date: "Baru saja",
        reasons: ["Curah hujan tinggi di wilayah sentra Brebes", "Pasokan pasar domestik turun drastis"],
        slug: "bawang-merah"
    },
    {
        id: "warn-2",
        commodity: "Cabai Rawit",
        title: "Lonjakan Harga +24.8%",
        severity: "critical",
        date: "2 menit yang lalu",
        reasons: ["Gagal panen massal akibat hama kutu kebul", "Hambatan logistik penyeberangan antarpulau"],
        slug: "cabai-rawit"
    },
    {
        id: "warn-3",
        commodity: "Gula Pasir",
        title: "Penurunan Stok Kritis -18.2%",
        severity: "warning",
        date: "15 menit yang lalu",
        reasons: ["Keterlambatan giling pabrik tebu regional", "Kenaikan biaya kontainer kargo laut"],
        slug: "gula-pasir"
    }
];

export function Header({ onToggleAgent }: HeaderProps) {
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [showNotificationMenu, setShowNotificationMenu] = useState(false);
    const [activeView, setActiveView] = useState<"list" | "detail">("list");
    const [selectedAlert, setSelectedAlert] = useState<typeof MOCK_NOTIFICATIONS[0] | null>(null);

    const [isLoggedIn, setIsLoggedIn] = useState(true);
    const [isGlobalRefreshing, setIsGlobalRefreshing] = useState(false);

    const searchInputRef = useRef<HTMLInputElement>(null);
    const profileDropdownRef = useRef<HTMLDivElement>(null);
    const notificationDropdownRef = useRef<HTMLDivElement>(null);

    const router = useRouter();

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "/" && document.activeElement !== searchInputRef.current) {
                e.preventDefault();
                searchInputRef.current?.focus();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
                setShowProfileMenu(false);
            }
            if (notificationDropdownRef.current && !notificationDropdownRef.current.contains(event.target as Node)) {
                setShowNotificationMenu(false);
                setTimeout(() => {
                    setActiveView("list");
                    setSelectedAlert(null);
                }, 200);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const triggerGlobalRefresh = () => {
        if (isGlobalRefreshing) return;

        setIsGlobalRefreshing(true);

        // 1. Pancarkan event start agar halaman tahu harus merubah UI menjadi Skeleton
        window.dispatchEvent(new CustomEvent("global-refresh-start"));

        setTimeout(() => {
            // 2. Pancarkan event finish untuk merefresh data API asli
            window.dispatchEvent(new Event("global-refresh"));
            setIsGlobalRefreshing(false);
        }, 1200); // Durasi loading skeleton (1.2 detik)
    };

    const openAlertDetail = (alertItem: typeof MOCK_NOTIFICATIONS[0]) => {
        setSelectedAlert(alertItem);
        setActiveView("detail");
    };

    const handleGoToAlertPage = (id: string) => {
        setShowNotificationMenu(false);
        setActiveView("list");
        setSelectedAlert(null);
        router.push(`/alerts/${id}`);
    };

    // HANDLER SIGN OUT & REDIRECT KE LANDING PAGE ROUTE
    const handleAuthAction = () => {
        if (isLoggedIn) {
            setIsLoggedIn(false);
            setShowProfileMenu(false);
            router.push("/");
        } else {
            setIsLoggedIn(true);
            setShowProfileMenu(false);
        }
    };

    return (
        <header className="h-16 border-b border-slate-200 bg-white px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40 shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] gap-3">

            {/* ================= AREA KIRI: BURGER (MOBILE ONLY) & GLOBAL SEARCH ================= */}
            <div className="flex items-center gap-2 flex-1 max-w-md">
                {/* Tombol burger menu pemicu drawer khusus mobile */}
                <button
                    onClick={() => window.dispatchEvent(new Event("toggle-mobile-sidebar"))}
                    className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-xl shrink-0 cursor-pointer"
                >
                    <Menu className="w-5 h-5" />
                </button>

                <div className="relative w-full group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-[#006c4a] transition-colors" />
                    <input
                        ref={searchInputRef}
                        type="text"
                        placeholder="Cari data, wilayah..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 sm:pr-12 py-2 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-[#006c4a] focus:bg-white focus:ring-2 focus:ring-emerald-50 transition-all h-9"
                    />
                    <div className="hidden sm:block absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none bg-slate-200/70 border border-slate-300/40 text-[11px] font-mono px-1.5 py-0.5 rounded text-slate-500 shadow-sm">
                        /
                    </div>
                </div>
            </div>

            {/* ================= AREA KANAN: CONTROLS & PROFILE ================= */}
            <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">

                {/* Universal Refresh Button */}
                <button
                    onClick={triggerGlobalRefresh}
                    className="p-2 text-slate-500 hover:text-emerald-600 hover:bg-slate-100 rounded-xl transition-all cursor-pointer flex items-center justify-center"
                    title="Universal System Refresh"
                >
                    <RefreshCw className={`w-4 h-4 ${isGlobalRefreshing ? "animate-spin text-emerald-600" : ""}`} />
                </button>

                {/* Notifikasi Cepat Center */}
                <div className="relative" ref={notificationDropdownRef}>
                    <button
                        onClick={() => setShowNotificationMenu(!showNotificationMenu)}
                        className={`p-2 rounded-xl transition-all relative cursor-pointer ${showNotificationMenu ? "bg-slate-100 text-[#006c4a]" : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"}`}
                    >
                        <Bell className="w-4 h-4" />
                        <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white animate-pulse" />
                    </button>

                    <AnimatePresence>
                        {showNotificationMenu && (
                            <motion.div
                                initial={{ opacity: 0, y: 12, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 12, scale: 0.95 }}
                                transition={{ duration: 0.18, ease: "easeOut" }}
                                className="absolute right-[-60px] sm:right-0 mt-2 w-80 sm:w-88 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 overflow-hidden text-slate-800"
                            >
                                <div className="relative overflow-hidden w-full min-h-[380px]">

                                    {/* VIEW 1: LIST NOTIFIKASI */}
                                    {activeView === "list" && (
                                        <motion.div
                                            key="list-view"
                                            initial={{ x: 0, opacity: 1 }}
                                            exit={{ x: -100, opacity: 0 }}
                                            className="absolute inset-0 flex flex-col h-full"
                                        >
                                            <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                                                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Alert Center ({MOCK_NOTIFICATIONS.length})</span>
                                                <span className="text-[10px] font-mono bg-rose-100 text-rose-700 font-bold px-1.5 py-0.5 rounded-sm">Live Monitoring</span>
                                            </div>

                                            <div className="flex-1 overflow-y-auto p-2 space-y-1.5 max-h-[350px]">
                                                {MOCK_NOTIFICATIONS.map((item) => (
                                                    <div
                                                        key={item.id}
                                                        className="p-3 bg-white border border-slate-100 hover:border-slate-200/80 rounded-xl hover:shadow-xs transition-all flex flex-col justify-between gap-2"
                                                    >
                                                        <div className="flex items-start justify-between gap-4">
                                                            <div className="flex gap-2.5 items-start">
                                                                <div className={`p-1.5 rounded-lg text-white mt-0.5 shrink-0 ${item.severity === "critical" ? "bg-rose-500" : "bg-amber-500"}`}>
                                                                    <AlertTriangle className="w-3.5 h-3.5" />
                                                                </div>
                                                                <div className="space-y-0.5">
                                                                    <h5 className="text-xs font-black text-slate-800">{item.commodity}</h5>
                                                                    <p className="text-[11px] font-semibold text-slate-600 leading-snug">{item.title}</p>
                                                                </div>
                                                            </div>
                                                            <span className="text-[9px] font-medium text-slate-400 whitespace-nowrap">{item.date}</span>
                                                        </div>

                                                        <button
                                                            onClick={() => openAlertDetail(item)}
                                                            className="self-end text-[10px] font-bold text-[#006c4a] hover:text-[#005238] flex items-center gap-0.5 transition-colors cursor-pointer"
                                                        >
                                                            Lihat Selengkapnya
                                                            <ArrowUpRight className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* VIEW 2: DETAIL POPUP */}
                                    {activeView === "detail" && selectedAlert && (
                                        <motion.div
                                            key="detail-view"
                                            initial={{ x: 100, opacity: 0 }}
                                            animate={{ x: 0, opacity: 1 }}
                                            exit={{ x: 100, opacity: 0 }}
                                            className="absolute inset-0 flex flex-col h-full bg-white"
                                        >
                                            <div className="px-3 py-2.5 bg-rose-50/60 border-b border-rose-100 flex items-center gap-2 text-rose-900">
                                                <button
                                                    onClick={() => { setActiveView("list"); setSelectedAlert(null); }}
                                                    className="p-1 rounded-lg hover:bg-rose-100/50 text-rose-800 cursor-pointer transition-colors"
                                                >
                                                    <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
                                                </button>
                                                <span className="text-xs font-black uppercase tracking-wider flex items-center gap-1">
                                                    <AlertTriangle className="w-3.5 h-3.5" /> Peringatan Spesifik
                                                </span>
                                            </div>

                                            <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                                                <div className="space-y-2.5">
                                                    <div>
                                                        <span className={`inline-block text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md text-white mb-1.5 ${selectedAlert.severity === "critical" ? "bg-rose-500" : "bg-amber-500"}`}>
                                                            {selectedAlert.severity === "critical" ? "Critical Spike" : "Warning System"}
                                                        </span>
                                                        <h4 className="text-base font-black text-slate-800 leading-none">{selectedAlert.commodity}</h4>
                                                        <p className="text-xs font-mono font-bold text-rose-500 mt-1">{selectedAlert.title}</p>
                                                    </div>

                                                    <div className="text-[11px] text-slate-500 space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-100/80">
                                                        <p className="font-bold text-slate-700">Faktor Pemicu Risiko:</p>
                                                        <ul className="list-disc list-inside space-y-1 font-medium leading-relaxed">
                                                            {selectedAlert.reasons.map((reason, idx) => (
                                                                <li key={idx}>{reason}</li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={() => handleGoToAlertPage(selectedAlert.id)}
                                                    className="w-full bg-[#006c4a] hover:bg-[#005238] text-white py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer group shadow-md"
                                                >
                                                    Buka Mitigasi & Prediksi
                                                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}

                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Tombol Agent Chat */}
                <button
                    onClick={onToggleAgent}
                    className="p-2 text-slate-500 hover:text-[#006c4a] hover:bg-emerald-50 rounded-xl transition-all cursor-pointer"
                >
                    <Bot className="w-4 h-4" />
                </button>

                <div className="h-6 w-px bg-slate-200" />

                {/* User Profile Dropdown */}
                <div className="relative" ref={profileDropdownRef}>
                    <button
                        onClick={() => setShowProfileMenu(!showProfileMenu)}
                        className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition-colors text-left cursor-pointer"
                    >
                        <div className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[#006c4a] font-medium shadow-xs shrink-0">
                            <User className="w-4 h-4" />
                        </div>
                        {/* Menyembunyikan teks nama administrator di mobile agar tidak memotong layout */}
                        <div className="hidden md:flex flex-col pr-1">
                            <span className="text-slate-700 font-semibold text-xs leading-none">Tim PP0703</span>
                            <span className="text-[10px] text-slate-400 mt-0.5">Administrator</span>
                        </div>
                    </button>

                    <AnimatePresence>
                        {showProfileMenu && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                transition={{ duration: 0.12 }}
                                className="absolute right-0 mt-2 w-44 bg-white border border-slate-200 rounded-xl p-1.5 shadow-xl z-50 flex flex-col gap-0.5"
                            >
                                <button
                                    onClick={handleAuthAction}
                                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-50 text-left cursor-pointer w-full select-none"
                                >
                                    {isLoggedIn ? (
                                        <>
                                            <LogOut className="w-4 h-4 text-rose-500" />
                                            <span className="text-rose-600 font-medium">Keluar Sistem</span>
                                        </>
                                    ) : (
                                        <>
                                            <LogIn className="w-4 h-4 text-emerald-500" />
                                            <span className="text-emerald-600 font-medium">Masuk / Login</span>
                                        </>
                                    )}
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

            </div>
        </header>
    );
}

// Fallback ekspor ganda untuk kompatibilitas kompilasi Turbopack Next.js 16
export default Header;