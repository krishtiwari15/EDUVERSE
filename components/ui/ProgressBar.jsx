"use client";
import { motion } from "motion/react";

const TONES = {
  primary: "from-violet-400 to-violet-300",
  aurora: "from-teal-300 to-cyan-200",
  gold: "from-amber-300 to-yellow-200",
};

export default function ProgressBar({ value = 0, tone = "aurora", className = "" }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className={`h-2 rounded-full bg-white/10 overflow-hidden ${className}`} role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
      <motion.div
        className={`h-full rounded-full bg-gradient-to-r ${TONES[tone]}`}
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      />
    </div>
  );
}
