"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { AgentPanel } from "@/components/agent/agent-panel";
import { AnimatePresence, motion } from "motion/react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isAgentOpen, setIsAgentOpen] = useState(false);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 font-sans">
      {/* Sidebar Kiri */}
      <Sidebar />

      {/* Konten Utama */}
      <div className="flex flex-col flex-1 h-full overflow-hidden">
        <Header onToggleAgent={() => setIsAgentOpen(!isAgentOpen)} />

        <main className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
          {children}
        </main>
      </div>

      {/* Panel Kanan (Chat Agent) dengan Animasi Masuk/Keluar */}
      <AnimatePresence>
        {isAgentOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 400, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="border-l border-slate-200 bg-white h-full shadow-2xl overflow-hidden flex-shrink-0"
          >
            <div className="w-[400px] h-full">
              <AgentPanel onClose={() => setIsAgentOpen(false)} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}