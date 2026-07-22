import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // 1. Centralized Font Family
      fontFamily: {
        sans: ["var(--font-hanken)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      // 2. Centralized Design System Colors
      colors: {
        brand: {
          bg: "#F9F9F7",        // Latar belakang utama cerah murni (Main Content)
          bgSubtle: "#F3F3F0",  // Latar sekunder/subtle komponen
          card: "#FFFFFF",      // Putih murni untuk background card
          primary: "#10B981",   // Hijau emerald untuk aksen & CTA button
          accentDark: "#065F46",// Hijau tua pekat untuk card tengah & penekanan teks
          textMain: "#0F172A",  // Slate pekat untuk judul utama
          textMuted: "#5D5D5D", // Abu-abu seimbang untuk deskripsi paragraf
          border: "#E2E8F0",    // Garis pembatas tipis umum
        },
        // Warna tambahan khusus untuk layout Sidebar yang baru
        sidebar: {
          bg: "#F6F6F3",        // Background khusus sidebar
          border: "#D8D8D6",    // Stroke / garis pembatas khusus sidebar
        }
      },
    },
  },
  plugins: [],
};
export default config;