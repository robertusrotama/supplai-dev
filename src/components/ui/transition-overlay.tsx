"use client";

import { motion } from "motion/react";

interface TransitionOverlayProps {
  onAnimationComplete?: () => void;
}

export function TransitionOverlay({ onAnimationComplete }: TransitionOverlayProps) {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-brand-bg font-sans overflow-hidden">
      
      {/* 1. KONTEN LOADING (MUNCUL LALU HILANG) */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="flex flex-col items-center space-y-4 relative z-10 text-center"
      >
        {/* Logo SuplAI dengan Animasi Pulse Halus */}
        <motion.img
          src="/images/logo-dashboard.png"
          alt="SuplAi Logo"
          className="w-24 h-24 object-contain"
          animate={{ scale: [1, 1.04, 1] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
        />
        <div className="space-y-1">
          <p className="text-brand-textMuted text-xs font-mono font-bold tracking-widest uppercase">
            You will be redirected to SupplAi Dashboard...
          </p>
        </div>
      </motion.div>

      {/* 2. TRANSISE CIRCLE REVEAL (LINGKARAN MEMBESAR DI AKHIR) */}
      <motion.div
        className="absolute inset-0 bg-brand-card pointer-events-none"
        initial={{ clipPath: "circle(0% at 50% 50%)" }}
        animate={{ clipPath: "circle(150% at 50% 50%)" }}
        transition={{
          duration: 0.8,
          delay: 2.2, // Splash screen & teks muncul dulu selama ~2 detik
          ease: [0.76, 0, 0.24, 1] // Karakteristik cubic-bezier transisi iOS/SaaS
        }}
        onAnimationComplete={onAnimationComplete}
      />
      
    </div>
  );
}