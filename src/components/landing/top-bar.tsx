"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { Globe, LayoutDashboard, Menu, X } from "lucide-react";
import { TransitionOverlay } from "@/components/ui/transition-overlay";

export function TopBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [lang, setLang] = useState("ID");
  const [isScrolled, setIsScrolled] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const pathname = usePathname();
  const router = useRouter();

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

  const handleDashboardAccess = () => {
    setIsOpen(false);
    setIsRedirecting(true);
    router.push("/login");
  };

  return (
    <>
      <AnimatePresence mode="wait">
        {isRedirecting && (
          <TransitionOverlay
            onAnimationComplete={() => {
              router.push("/dashboard");
            }}
          />
        )}
      </AnimatePresence>

      <nav
        /* PERBAIKAN: Menghapus garis border-b saat isScrolled === false */
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${isScrolled
            ? "bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm py-3"
            : "bg-gradient-to-b from-slate-950/70 via-slate-900/30 to-transparent border-none py-5"
          }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 transition-all duration-300">

            {/* LOGO BRAND */}
            <Link href="/" onClick={scrollToTop} className="flex items-center gap-3 flex-shrink-0 group cursor-pointer">
              <img
                src="/images/logo.png"
                alt="supplAi Logo"
                className="w-20 h-20 object-contain group-hover:scale-105 transition-transform"
              />
            </Link>

            {/* MENU NAVIGASI */}
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
                  className={`text-sm font-bold transition-all duration-300 cursor-pointer ${isScrolled
                      ? "text-slate-700 hover:text-[#10B981]"
                      : "text-white hover:text-[#10B981] drop-shadow-sm"
                    }`}
                >
                  {menu.name}
                </a>
              ))}
            </div>

            {/* SEBELAH KANAN */}
            <div className="hidden md:flex items-center gap-4">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={toggleLanguage}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold cursor-pointer transition-all duration-300 ${isScrolled
                    ? "border-slate-200 text-slate-700 hover:bg-slate-50"
                    : "border-white/30 text-white hover:bg-white/10 backdrop-blur-xs"
                  }`}
              >
                <Globe className="w-3.5 h-3.5 text-[#10B981]" />
                <span>{lang}</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleDashboardAccess}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold cursor-pointer shadow-md bg-[#10B981] text-white hover:bg-[#0e9f6e] transition-all duration-300"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                Access to Dashboard
              </motion.button>
            </div>

            {/* Hamburger Menu Mobile */}
            <div className="flex md:hidden">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className={`transition-colors duration-300 ${isScrolled ? "text-slate-800" : "text-white"}`}
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
              className={`md:hidden overflow-hidden border-t mt-2 ${isScrolled ? "bg-white border-slate-200" : "bg-slate-900/95 backdrop-blur-md border-slate-800"
                }`}
            >
              <div className="px-4 pt-2 pb-6 space-y-3 flex flex-col">
                {["Our Goals", "Features", "FAQ", "Contact Us"].map((item) => (
                  <a
                    key={item}
                    href={`#${item.toLowerCase().replace(" ", "-")}`}
                    onClick={() => setIsOpen(false)}
                    className={`text-sm py-2 font-bold cursor-pointer transition-colors ${isScrolled ? "text-slate-700 hover:text-[#10B981]" : "text-white hover:text-[#10B981]"
                      }`}
                  >
                    {item}
                  </a>
                ))}

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