"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { TransitionOverlay } from "@/components/ui/transition-overlay"; // Impor overlay

export default function AuthPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRedirecting, setIsRedirecting] = useState(false); // State pemicu transisi lingkaran

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      sessionStorage.setItem("userEmail", email.trim());
      localStorage.setItem("userEmail", email.trim());
    }
    if (isLogin) {
      setIsRedirecting(true); // Jika login, picu splash screen & circle reveal statis
    } else {
      // Jika mode Sign Up, sementara kita switch ke mode login dulu
      setIsLogin(true);
    }
  };

  return (
    <>
      {/* OVERLAY TRANSISE LINGKARAN MEMBESAR SAAT TOMBOL LOG IN DIKLIK */}
      <AnimatePresence mode="wait">
        {isRedirecting && (
          <TransitionOverlay
            onAnimationComplete={() => {
              router.push("/executive-summary"); // Pindah ke dashboard setelah lingkaran penuh
            }}
          />
        )}
      </AnimatePresence>

      <div className="min-h-screen w-full bg-brand-bg font-sans relative flex items-center justify-center px-6 overflow-hidden">

        {/* MESH AMBIENT BACKGROUND GLOW */}
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-brand-primary/10 blur-[120px] rounded-full pointer-events-none transform -translate-x-1/4 -translate-y-1/4" />
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-teal-500/5 blur-[100px] rounded-full pointer-events-none transform translate-x-1/4 -translate-y-1/4" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-64 bg-white pointer-events-none" style={{ clipPath: "ellipse(60% 100% at 50% 100%)" }} />

        {/* LOGO ATAS KIRI */}
        <div className="absolute top-10 left-6 md:left-12 z-20">
          <Link href="/" className="flex items-center gap-3 group">
            <img
              src="/images/logo-dashboard.png"
              alt="supplAi Logo"
              className="w-42 h-24 object-contain group-hover:scale-105 transition-transform"
            />
          </Link>
        </div>

        {/* MAIN CARD CONTAINER */}
        <div className="w-full max-w-[420px] relative z-10 pt-16 pb-8 flex flex-col items-center">

          <div className="text-center space-y-2 mb-8">
            <h2 className="text-xl font-bold text-brand-textMain tracking-tight">
              {isLogin ? "Log in to your account" : "Create your account"}
            </h2>
            <p className="text-xs text-brand-textMuted font-medium">
              {isLogin ? "Belum punya akses?" : "Sudah memiliki akun?"}{" "}
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-brand-primary font-bold hover:underline cursor-pointer"
              >
                {isLogin ? "Daftar sekarang" : "Masuk di sini"}
              </button>
            </p>
          </div>

          {/* OAUTH GOOGLE BUTTON */}
          {/* <div className="w-full space-y-3 mb-6">
            <motion.button
              type="button"
              onClick={() => setIsRedirecting(true)} // Tombol Google juga bisa masuk langsung
              whileHover={{ scale: 1.01, backgroundColor: "#f8fafc" }}
              whileTap={{ scale: 0.99 }}
              className="w-full flex items-center justify-center gap-3 bg-white border border-brand-border h-12 px-4 rounded-xl text-xs font-bold text-brand-textMain shadow-sm cursor-pointer transition-colors"
            >
              <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.866-3.577-7.866-8s3.536-8 7.866-8c2.46 0 4.105 1.025 5.047 1.926l3.227-3.227C18.29 1.414 15.56 0 12.24 0 5.58 0 0 5.37 0 12s5.58 12 12.24 12c6.96 0 11.57-4.89 11.57-11.79 0-.795-.085-1.4-.195-1.925H12.24z"/>
              </svg>
              CONTINUE WITH GOOGLE
            </motion.button>
          </div> */}

          {/* <div className="w-full flex items-center justify-between my-3">
            <div className="w-[42%] h-[1px] bg-brand-border/60" />
            <span className="text-[10px] font-mono font-bold text-brand-textMuted/40 uppercase">or</span>
            <div className="w-[42%] h-[1px] bg-brand-border/60" />
          </div> */}

          {/* INPUT FORM */}
          <form onSubmit={handleSubmit} className="w-full space-y-3.5 mt-4">

            <div className="relative w-full flex items-center">
              <Mail className="w-4 h-4 absolute left-4 text-brand-textMuted/50" />
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-12 pl-11 pr-4 bg-brand-bgSubtle/60 border border-brand-border rounded-xl text-sm font-medium text-brand-textMain placeholder-brand-textMuted/40 focus:outline-none focus:border-brand-primary/40 focus:bg-white transition-all shadow-inner"
              />
            </div>

            <div className="relative w-full flex items-center">
              <Lock className="w-4 h-4 absolute left-4 text-brand-textMuted/50" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-12 pl-11 pr-12 bg-brand-bgSubtle/60 border border-brand-border rounded-xl text-sm font-medium text-brand-textMain placeholder-brand-textMuted/40 focus:outline-none focus:border-brand-primary/40 focus:bg-white transition-all shadow-inner"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 text-brand-textMuted/40 hover:text-brand-textMain transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <AnimatePresence>
              {isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-center pt-1"
                >
                  <Link
                    href="#"
                    className="text-xs font-semibold text-brand-primary/80 hover:text-brand-primary hover:underline"
                  >
                    Forgot your password?
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>

            {/* BUTTON LOG IN / SIGN UP (STATIS TRIGGER REDIRECT) */}
            <div className="pt-3">
              <motion.button
                type="submit"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="w-full h-12 bg-brand-textMain text-white font-bold text-xs tracking-wider rounded-xl shadow-md hover:bg-black transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                {isLogin ? "LOG IN" : "SIGN UP"}
                <ArrowRight className="w-3.5 h-3.5" />
              </motion.button>
            </div>

          </form>

        </div>
      </div>
    </>
  );
}