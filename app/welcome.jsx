"use client";
import { useState, useEffect } from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

const CHARACTER_URL = "https://lottie.host/b99ef145-b573-4305-9164-7f0bf1997d30/IeL2KG7tpc.lottie";

export default function Welcome({ onStart }) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");

  const lines = [
    "Hi there! 🌟 I'm your learning buddy.",
    "Together we'll explore, play, and discover amazing things!",
    "What's your name, explorer?",
  ];

  useEffect(() => {
    if (step < 2) {
      const t = setTimeout(() => setStep((s) => s + 1), 2200);
      return () => clearTimeout(t);
    }
  }, [step]);

  return (
    <div className="relative min-h-screen overflow-hidden flex items-center justify-center p-6"
      style={{ background: "radial-gradient(circle at 30% 20%, #FBBF24 0%, #F59E0B 22%, #B45309 48%, #4C1D1D 78%, #1A0E1F 100%)" }}>

      <style jsx global>{`
        @keyframes swirl { 0% { transform: rotate(0deg) scale(1); } 100% { transform: rotate(360deg) scale(1); } }
        @keyframes floatUp { 0% { opacity: 0; transform: translateY(40px) scale(0.9); } 100% { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes twinkle2 { 0%,100% { opacity: 0.2; } 50% { opacity: 1; } }
        @keyframes driftClouds { 0% { transform: translateX(-20px); } 50% { transform: translateX(20px); } 100% { transform: translateX(-20px); } }
        @keyframes charIn { 0% { opacity: 0; transform: translateY(-60px) scale(0.5); } 60% { transform: translateY(10px) scale(1.05); } 100% { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes glowPulse { 0%,100% { opacity: 0.4; transform: scale(1); } 50% { opacity: 0.75; transform: scale(1.15); } }
        .swirl-slow { animation: swirl 60s linear infinite; }
        .float-up { animation: floatUp 0.7s ease-out both; }
        .char-in { animation: charIn 1s cubic-bezier(0.34,1.56,0.64,1) both; }
        .glow-pulse { animation: glowPulse 3s ease-in-out infinite; }
      `}</style>

      {/* Swirling golden Venus clouds */}
      <div className="pointer-events-none absolute inset-0 opacity-40 swirl-slow"
        style={{ background: "conic-gradient(from 0deg, transparent, #FDE68A55, transparent, #FCD34D55, transparent, #F59E0B55, transparent)" }} />
      <div className="pointer-events-none absolute -inset-40 opacity-20" style={{ animation: "driftClouds 14s ease-in-out infinite",
        background: "radial-gradient(ellipse at 60% 40%, #FEF3C7aa, transparent 55%), radial-gradient(ellipse at 30% 70%, #FBBF24aa, transparent 50%)" }} />

      {/* Twinkling stars */}
      {Array.from({ length: 30 }).map((_, i) => (
        <div key={i} className="absolute rounded-full bg-white"
          style={{ width: i % 3 === 0 ? 3 : 2, height: i % 3 === 0 ? 3 : 2, top: `${(i * 29) % 100}%`, left: `${(i * 53) % 100}%`,
            animation: `twinkle2 ${2 + (i % 4)}s ease-in-out ${i * 0.2}s infinite` }} />
      ))}

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-md">
        {/* Character with glow */}
        <div className="relative char-in">
          <div className="glow-pulse absolute inset-0 rounded-full" style={{ background: "#FDE68A", filter: "blur(40px)" }} />
          <div className="relative w-48 h-48 rounded-full flex items-center justify-center"
            style={{ background: "radial-gradient(circle at 40% 35%, #FEF3C7, #F59E0B)" }}>
            <DotLottieReact src={CHARACTER_URL} loop autoplay style={{ width: "160px", height: "160px" }} />
          </div>
        </div>

        {/* Speech */}
        <div key={step} className="float-up mt-8 min-h-[80px]">
          <p className="text-2xl sm:text-3xl font-extrabold text-white drop-shadow-lg leading-snug">
            {lines[step]}
          </p>
        </div>

        {/* Name input appears at last step */}
        {step >= 2 && (
          <div className="float-up mt-6 flex flex-col items-center gap-4 w-full">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && name.trim()) onStart(name.trim()); }}
              placeholder="Type your name…"
              className="w-64 px-6 py-3 rounded-full text-center text-lg font-semibold text-amber-900 bg-white/95 outline-none shadow-xl focus:ring-4 focus:ring-amber-300/60"
            />
            <button
              onClick={() => name.trim() && onStart(name.trim())}
              disabled={!name.trim()}
              className="px-10 py-3.5 rounded-full text-lg font-extrabold text-amber-900 bg-gradient-to-r from-yellow-200 to-amber-300 shadow-xl hover:scale-105 active:scale-95 transition disabled:opacity-40"
            >
              Let's go! 🚀
            </button>
          </div>
        )}

        {/* Skip hint */}
        {step < 2 && (
          <button onClick={() => setStep(2)} className="mt-8 text-white/60 text-sm hover:text-white transition">
            skip →
          </button>
        )}
      </div>
    </div>
  );
}