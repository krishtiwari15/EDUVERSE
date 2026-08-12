"use client";
import { motion } from "motion/react";

export default function ProgressBar({ value = 0, className = "" }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className={`h-2 rounded-full bg-[var(--surface-2)] overflow-hidden ${className}`} role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
      <motion.div
        className="h-full rounded-full bg-[var(--ink)]"
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      />
    </div>
  );
}
