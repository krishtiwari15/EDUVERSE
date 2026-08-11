"use client";
import { motion } from "motion/react";
import { HelpCircle } from "lucide-react";
import { mentorInitial } from "@/lib/avatar";

// The one mentor-avatar component used everywhere in the app — a flat
// monogram tile (no illustrated character, no per-mentor color) driven by
// a single `state` prop for idle/listening/thinking/speaking/happy/
// confused/encouraging/celebrating. Matches the v2 "Cinematic Void" system:
// hierarchy and feedback come from motion and monochrome rings, not hue.
export default function AIAvatar({ mentor, state = "idle", size = 56, className = "" }) {
  const letter = mentorInitial(mentor?.name);
  const ringInset = -Math.max(4, size * 0.07);

  return (
    <div className={`relative flex items-center justify-center shrink-0 ${className}`} style={{ width: size, height: size }}>
      {state === "speaking" && [0, 1, 2].map((r) => (
        <div key={r} className="absolute rounded-full border border-white/35" style={{ inset: ringInset, animation: `ring 1.6s ease-out ${r * 0.5}s infinite` }} />
      ))}
      {state === "listening" && (
        <div className="absolute rounded-full border border-white/45" style={{ inset: ringInset, animation: "ring 1.8s ease-out infinite" }} />
      )}
      {state === "thinking" && (
        <div className="absolute" style={{ width: size * 1.15, height: size * 1.15, animation: "orbitSpin 2.4s linear infinite" }}>
          {[0, 120, 240].map((deg) => (
            <div key={deg} className="absolute rounded-full bg-white/70" style={{
              width: 4, height: 4, top: "2%", left: "50%",
              transform: `translateX(-50%) rotate(${deg}deg)`, transformOrigin: `50% ${size * 0.55}px`,
            }} />
          ))}
        </div>
      )}

      <motion.div
        className="relative rounded-full flex items-center justify-center border border-white/15"
        style={{
          width: size, height: size, background: "rgba(255,255,255,.06)",
          animation: state === "confused" ? "tiltConfused 1.4s ease-in-out infinite" : undefined,
        }}
        animate={state === "happy" || state === "celebrating" ? { scale: [1, 1.07, 1] } : { scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <span className="font-semibold text-white select-none" style={{ fontSize: size * 0.4 }}>{letter}</span>
        {state === "confused" && (
          <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-white flex items-center justify-center">
            <HelpCircle size={11} className="text-black" strokeWidth={2.5} />
          </div>
        )}
      </motion.div>
    </div>
  );
}
