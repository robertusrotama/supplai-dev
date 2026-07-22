"use client";

import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";

export interface AlertData {
  id: string | number;
  severity: "CRITICAL" | "WARNING" | "INFO";
  type: string;
  title: string;
  location: string;
  delta: string;
  updated: string;
}

interface AlertCardProps {
  alert: AlertData;
  onDismiss?: (id: string | number) => void;
}

export function AlertCard({ alert, onDismiss }: AlertCardProps) {
  const router = useRouter();
  const isCritical = alert.severity === "CRITICAL";
  const isWarning = alert.severity === "WARNING";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.2 }}
      className={`border rounded-[24px] p-5 flex flex-col justify-between min-h-[220px] relative transition-all bg-white shadow-3xs hover:border-slate-300 ${isCritical ? "border-rose-200" : isWarning ? "border-amber-200" : "border-slate-200"
        }`}
    >
      <div>
        {/* Status Label Line Row */}
        <span className={`text-[9px] font-black tracking-wider uppercase font-mono px-2 py-0.5 rounded-md ${isCritical ? "bg-rose-50 text-rose-600" : isWarning ? "bg-amber-50 text-amber-600" : "bg-slate-100 text-slate-500"
          }`}>
          {alert.severity} • {alert.type}
        </span>

        {/* Title & Wilayah Kluster Realtime */}
        <h4 className="text-xl font-black tracking-tight text-slate-800 mt-2.5">
          {alert.title}
        </h4>
        <p className="text-xs text-slate-400 font-bold mt-0.5">
          {alert.location}
        </p>
      </div>

      {/* Metrik Delta Informasi */}
      <div className="flex justify-between items-end mt-4 pt-4 border-t border-slate-100">
        <div>
          <span className="text-[10px] text-slate-400 font-bold font-mono block uppercase">Price Delta</span>
          <span className={`text-2xl font-black font-mono tracking-tight ${isCritical ? "text-rose-600" : isWarning ? "text-amber-600" : "text-emerald-600"
            }`}>
            {alert.delta}
          </span>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-slate-400 font-bold font-mono block uppercase">Last Updated</span>
          <span className="text-xs font-extrabold text-slate-700">{alert.updated}</span>
        </div>
      </div>

      {/* Action Buttons: Mengaktifkan rute parameter navigasi dinamis */}
      <div className="flex items-center gap-2 mt-4 w-full">
        <Button
          onClick={() => router.push(`/alerts/${alert.id}`)} // PERBAIKAN: Mengubah /alert/ menjadi /alerts/
          className="flex-1 text-[11px] font-black bg-[#006c4a] hover:bg-[#005237] text-white rounded-xl h-10 shadow-3xs cursor-pointer active:scale-97 transition-all"
        >
          INVESTIGATE
        </Button>
        <Button
          variant="outline"
          onClick={(e) => {
            e.stopPropagation();
            onDismiss?.(alert.id);
          }}
          className="text-[11px] font-bold border-slate-200 text-slate-500 hover:bg-slate-50 rounded-xl h-10 cursor-pointer"
        >
          DISMISS
        </Button>
      </div>
    </motion.div>
  );
}