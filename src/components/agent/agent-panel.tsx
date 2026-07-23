"use client";

import { useState, useRef, useEffect } from "react";
import { X, Send, Bot, User } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Message {
    id: string;
    role: "agent" | "user";
    content: string;
}

export function AgentPanel({ onClose }: { onClose: () => void }) {
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "init",
            role: "agent",
            content: "Halo! Saya **Suplai Agent**. Ada yang bisa saya bantu terkait analisis komoditas pangan atau prediksi harga hari ini?\n\nCoba tanyakan seperti:\n* *Tampilkan ringkasan alert hari ini.*\n* *Kenapa harga daging sapi di DKI Jakarta diproyeksikan naik?*"
        }
    ]);

    const chatEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll ke pesan paling baru
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMessageId = `user-${Date.now()}`;
        const newMessages: Message[] = [
            ...messages,
            { id: userMessageId, role: "user", content: input }
        ];

        setMessages(newMessages);
        setInput("");

        // Simulasi jawaban Agent (Nanti bisa ditembak ke API LLM Anda)
        setTimeout(() => {
            setMessages([
                ...newMessages,
                {
                    id: `agent-${Date.now()}`,
                    role: "agent",
                    content: `Berikut adalah analisis data untuk **Daging Sapi**:\n\n| Wilayah | Harga Saat Ini | Proyeksi 3 Bulan | Status |\n| :--- | :--- | :--- | :--- |\n| DKI Jakarta | Rp 135.200 | Rp 138.500 | Kenaikan |\n| Jawa Barat | Rp 130.500 | Rp 134.100 | Kenaikan |\n\nTerjadi tren kenaikan rata-rata sebesar **4.2%** yang dipicu oleh minimnya curah hujan di daerah sentra produksi Jawa Barat.`
                }
            ]);
        }, 1000);
    };

    return (
        <div className="h-full flex flex-col bg-white">
            {/* ================= HEADER PANEL ================= */}
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-white z-10">
                <div className="flex items-center gap-2 font-bold text-slate-800">
                    <Bot className="w-5 h-5 text-[#006c4a]" />
                    Suplai Agent
                </div>
                <button onClick={onClose} className="hover:bg-slate-100 p-1.5 rounded-full transition-colors cursor-pointer">
                    <X className="w-5 h-5 text-slate-500" />
                </button>
            </div>

            {/* ================= AREA CHAT (DENGAN LAYOUT ANIMATION) ================= */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/60">
                <motion.div layout className="flex flex-col gap-4">
                    <AnimatePresence initial={false}>
                        {messages.map((m) => {
                            const isAgent = m.role === "agent";
                            return (
                                <motion.div
                                    key={m.id}
                                    layout // Membuat bubble chat di atasnya bergeser naik dengan smooth
                                    initial={{ opacity: 0, y: 15, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                    className={`flex gap-3 ${!isAgent ? "flex-row-reverse" : ""}`}
                                >
                                    {/* Avatar */}
                                    <div className={`p-2 h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${isAgent ? "bg-emerald-50 text-[#006c4a]" : "bg-[#006c4a] text-white"
                                        }`}>
                                        {isAgent ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                                    </div>

                                    {/* Bubble Chat + Markdown Renderer */}
                                    <div className={`p-3.5 rounded-2xl text-sm shadow-xs max-w-[85%] border leading-relaxed ${isAgent
                                            ? "bg-white text-slate-800 border-slate-200/80"
                                            : "bg-[#006c4a] text-white border-[#006c4a]"
                                        }`}>
                                        {/* Pindahkan className prose ke div pembungkus ini */}
                                        <div className={`prose prose-sm max-w-none ${isAgent
                                                ? "prose-slate prose-headings:text-slate-900 prose-strong:text-slate-900 prose-table:border prose-th:bg-slate-50 prose-th:p-2 prose-td:p-2"
                                                : "prose-invert prose-strong:text-white"
                                            }`}>
                                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                {m.content}
                                            </ReactMarkdown>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </motion.div>

                {/* Anchor for Auto-scroll */}
                <div ref={chatEndRef} />
            </div>

            {/* ================= INPUT FORM ================= */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-200 bg-white">
                <div className="relative flex items-center">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-4 pr-12 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-[#006c4a] focus:bg-white focus:ring-2 focus:ring-emerald-50 transition-all"
                        placeholder="Tanyakan analisis komoditas..."
                    />
                    <button
                        type="submit"
                        disabled={!input.trim()}
                        className="absolute right-2 p-2 bg-[#006c4a] hover:bg-[#005237] disabled:opacity-40 disabled:hover:bg-[#006c4a] text-white rounded-lg transition-colors cursor-pointer"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </div>
            </form>
        </div>
    );
}