"use client";
import { Mic, MicOff } from "lucide-react";

const SIZES = { md: { box: "w-11 h-11", icon: 17 }, lg: { box: "w-16 h-16", icon: 24 } };

// Reusable version of the mic control used in the AI Tutor chat room —
// same look and interaction (tap to talk, tap again to stop & send).
export default function MicrophoneButton({ listening, onClick, size = "md", disabled = false, className = "" }) {
  const s = SIZES[size] || SIZES.md;
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={listening ? "Stop and send" : "Talk to your mentor"}
      aria-pressed={listening}
      title={listening ? "Listening… tap to stop & send" : "Tap and talk"}
      className={`focus-ring ${s.box} rounded-2xl flex items-center justify-center shrink-0 transition-all disabled:opacity-40 ${listening ? "bg-red-500 text-white animate-pulse scale-110" : "ring-1 ring-white/15 text-white/70 bg-white/10"} ${className}`}
    >
      {listening ? <MicOff size={s.icon} /> : <Mic size={s.icon} />}
    </button>
  );
}
