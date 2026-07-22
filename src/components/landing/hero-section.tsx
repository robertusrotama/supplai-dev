"use client";

import Link from "next/link";
import { motion } from "motion/react";

export function HeroSection() {
  return (
    // Mengubah items-end menjadi items-center agar seluruh blok teks berada pas di tengah vertikal hero
    <section className="relative w-full h-[95vh] flex items-center justify-start overflow-hidden">
      
      {/* BACKGROUND IMAGE DENGAN EFEK PARALLAX */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat bg-fixed"
        style={{ 
          backgroundImage: "url('/images/hero-plantation.jpg')" 
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-white/10 via-transparent to-white/5" />
      </div>

      {/* KONTAINER TEKS UTAMA (SEKARANG DI TENGAH) */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 w-full relative z-10 flex flex-col items-start gap-6">
        
        <div className="max-w-3xl space-y-4">
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-[#1ea7d5] tracking-tight leading-tight"
          >
            Digitalisasi Ketahanan Pangan
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
            className="text-[#5D5D5D] text-base md:text-xl font-medium leading-relaxed max-w-2xl"
          >
            Sistem Peringatan Dini Inflasi Pangan Berbasis AI. Memangkas waktu respons 
            TPID menjadi 2–3 hari guna memutus disparitas ekstrem melalui manajemen 
            distribusi cerdas.
          </motion.p>
        </div>

        {/* TOMBOL CTA UTAMA - ROUNDED-XL */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
        >
          <Link href="/login">
            <motion.button
              whileHover={{ scale: 1.03, backgroundColor: "#0fa574" }}
              whileTap={{ scale: 0.98 }}
              // Menggunakan bg-[#10b981] dan rounded-xl agar sama persis dengan top bar
              className="inline-flex items-center gap-2 bg-[#10b981] text-white font-bold px-6 py-3.5 rounded-xl text-base shadow-lg cursor-pointer transition-all"
            >
              <span>Go to Dashboard</span>
              <span className="font-bold text-lg">→</span>
            </motion.button>
          </Link>
        </motion.div>

      </div>
    </section>
  );
}