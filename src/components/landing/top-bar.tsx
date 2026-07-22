"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation"; // 1. Tambah useRouter untuk navigasi manual
import { motion, AnimatePresence } from "motion/react";
import { Globe, LayoutDashboard, Menu, X } from "lucide-react";
import { TransitionOverlay } from "@/components/ui/transition-overlay"; // 2. Impor overlay transisi baru Anda

export function TopBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [lang, setLang] = useState("ID");
  const [isScrolled, setIsScrolled] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false); // 3. State pengontrol splash screen
  
  const pathname = usePathname();
  const router = useRouter(); // 4. Inisialisasi router internal Next.js
  
  const toggleLanguage = () => {
    setLang((prev) => (prev === "ID" ? "EN" : "ID"));
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = (e: React.MouseEvent) => {
    if (pathname === "/") {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // 5. Fungsi Interseptor sebelum pindah ke Dashboard
  const handleDashboardAccess = () => {
    setIsOpen(false); // Tutup menu mobile jika sedang terbuka
    setIsRedirecting(true); // Picu splash screen loading muncul
    router.push("/login"); // Langsung arahkan ke halaman login
  };

  return (
    <>
      {/* 6. WADAH RENDER SCREEN OVERLAY APABILA TOMBOL DI-KLIK */}
      <AnimatePresence mode="wait">
        {isRedirecting && (
          <TransitionOverlay 
            onAnimationComplete={() => {
              // Pindah rute ke halaman dashboard secara instan saat lingkaran putih memenuhi layar penuh
              router.push("/dashboard"); 
            }} 
          />
        )}
      </AnimatePresence>

      <nav
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 border-b ${
          isScrolled
            ? "bg-brand-card/95 backdrop-blur-md border-brand-border shadow-sm py-3"
            : "bg-transparent border-transparent py-5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 transition-all duration-300">

            {/* ================= LOGO BRAND ================= */}
            <Link href="/" onClick={scrollToTop} className="flex items-center gap-3 flex-shrink-0 group cursor-pointer">
              <img 
                src="/images/logo.png" 
                alt="supplAi Logo" 
                className="w-20 h-20 object-contain group-hover:scale-105 transition-transform" 
              />
            </Link>

            {/* ================= MENU NAVIGASI ================= */}
            <div className="hidden md:flex items-center gap-8">
              {[
                { name: "Our Goals", href: "#our-goals" },
                { name: "Features", href: "#features" },
                { name: "FAQ", href: "#faq" },      
                { name: "Contact Us", href: "#contact-us" }
              ].map((menu) => (
                <a
                  key={menu.name}
                  href={menu.href}
                  className={`text-sm font-semibold transition-colors duration-300 cursor-pointer ${
                    isScrolled
                      ? "text-brand-textMuted hover:text-[#10B981]"
                      : "text-brand-textMuted hover:text-brand-textMain"
                  }`}
                >
                  {menu.name}
                </a>
              ))}
            </div>

            {/* ================= SEBELAH KANAN (TOMBOL DESKTOP) ================= */}
            <div className="hidden md:flex items-center gap-4">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={toggleLanguage}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold cursor-pointer transition-all duration-300 ${
                  isScrolled
                    ? "border-brand-border text-brand-textMuted hover:bg-brand-bgSubtle"
                    : "border-white/10 text-slate-300 hover:text-white hover:bg-white/10"
                }`}
              >
                <Globe className="w-3.5 h-3.5 text-[#10B981]" />
                <span>{lang}</span>
              </motion.button>

              {/* 7. UBAH DENGAN MENGHAPUS <Link> DAN MENGGUNAKAN onClick={handleDashboardAccess} */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleDashboardAccess}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold cursor-pointer shadow-sm transition-all duration-300 ${
                  isScrolled
                    ? "bg-[#10B981] text-white hover:bg-[#0e9f6e]"
                    : "bg-brand-card text-brand-textMain hover:bg-brand-bgSubtle border border-brand-border"
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                Access to Dashboard
              </motion.button>
            </div>
            
            {/* Hamburger Menu Mobile */}
            <div className="flex md:hidden">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className={`transition-colors duration-300 ${isScrolled ? "text-slate-800" : "text-slate-400"}`}
              >
                {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

          </div>
        </div>

        {/* Menu Mobile Panel */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className={`md:hidden overflow-hidden border-t mt-2 ${isScrolled ? "bg-white border-slate-200" : "bg-[#0f172a] border-slate-800"}`}
            >
              <div className="px-4 pt-2 pb-6 space-y-3 flex flex-col">
                {["Our Goals", "Features", "FAQ", "Contact Us"].map((item) => (
                  <a
                    key={item}
                    href={`#${item.toLowerCase().replace(" ", "-")}`}
                    onClick={() => setIsOpen(false)}
                    className={`text-sm py-2 font-medium cursor-pointer transition-colors ${
                      isScrolled ? "text-slate-700 hover:text-[#10B981]" : "text-slate-300 hover:text-white"
                    }`}
                  >
                    {item}
                  </a>
                ))}
                
                {/* Tombol Akses di Mobile juga diberikan fungsi splash screen */}
                <button
                  onClick={handleDashboardAccess}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-[#10B981] text-white cursor-pointer shadow-sm w-full mt-2"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  Access to Dashboard
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  );
}