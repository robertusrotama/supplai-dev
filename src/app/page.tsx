"use client";

import { motion } from "motion/react";
import { TopBar } from "@/components/landing/top-bar";
import { HeroSection } from "@/components/landing/hero-section";
import { OurGoalsSection } from "@/components/landing/our-goals";
import { ModulesSection } from "@/components/landing/modules"; // Import Tab Arsitektur Otomatis
import { FeaturesSection } from "@/components/landing/features"; // Import 4 Kotak Fitur
import { FaqSection } from "@/components/landing/faq";
import { ContactUsSection } from "@/components/landing/contact-us";
import { FooterSection } from "@/components/landing/footer";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-brand-bg text-brand-textMain overflow-x-hidden relative scroll-smooth">
      
      {/* 1. FIXED TOP BAR */}
      <TopBar />

      {/* 2. HERO SECTION */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }}>
        <HeroSection />
      </motion.div>

      {/* 3. SECTION: OUR GOALS (ID: #our-goals) */}
      <OurGoalsSection />  {/* Visi Strategis & Target Metrik */}
      <ModulesSection />   {/* Tiga Modul Utama + Arsitektur Operasional (Autoplay) */}
      <FeaturesSection />  {/* 4 Kotak Fitur Unggulan */}
      <FaqSection />

      {/* 6. SECTION: CONTACT US (ID: #contact-us) */}
      <ContactUsSection />

      {/* 7. FOOTER STANDARD PEKAT */}
      <FooterSection />

    </div>
  );
}