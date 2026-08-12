"use client";
import { useMemo } from "react";
import { motion } from "motion/react";
import { HelpCircle } from "lucide-react";
import { mentorAvatarUri } from "@/lib/avatar";

// Deterministic warm hue per mentor name — keeps every avatar in the same
// amber/orange/rose family as the ambient video backdrop instead of
// clashing cool tones, while still giving each mentor a distinct identity.
function warmHue(name) {
  const str = name || "?";
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) % 1000;
  return 5 + (h % 50); // 5–55: red through amber/gold
}

// The one mentor-avatar component used everywhere in the app — a real,
// locally-generated illustrated face (DiceBear "adventurer", seeded on the
// mentor's name so it's stable across sessions) inside a warm glowing
// ring, driven by a single `state` prop for idle/listening/thinking/
// speaking/happy/confused/encouraging/celebrating.
export default function AIAvatar({ mentor, state = "idle", size = 56, className = "" }) {
  const ringInset = -Math.max(4, size * 0.07);
  const hue = warmHue(mentor?.name);
  const avatarUri = useMemo(() => mentorAvatarUri(mentor?.name), [mentor?.name]);

  return (
    <div className={`relative flex items-center justify-center shrink-0 ${className}`} style={{ width: size, height: size }}>
      {state === "speaking" && [0, 1, 2].map((r) => (
        <div key={r} className="absolute rounded-full border border-[var(--border-glass-strong)]" style={{ inset: ringInset, animation: `ring 1.6s ease-out ${r * 0.5}s infinite` }} />
      ))}
      {state === "listening" && (
        <div className="absolute rounded-full border border-[var(--border-glass-strong)]" style={{ inset: ringInset, animation: "ring 1.8s ease-out infinite" }} />
      )}
      {state === "thinking" && (
        <div className="absolute" style={{ width: size * 1.15, height: size * 1.15, animation: "orbitSpin 2.4s linear infinite" }}>
          {[0, 120, 240].map((deg) => (
            <div key={deg} className="absolute rounded-full bg-[var(--muted)]" style={{
              width: 4, height: 4, top: "2%", left: "50%",
              transform: `translateX(-50%) rotate(${deg}deg)`, transformOrigin: `50% ${size * 0.55}px`,
            }} />
          ))}
        </div>
      )}

      <motion.div
        className="relative rounded-full flex items-center justify-center overflow-hidden"
        style={{
          width: size, height: size,
          background: `radial-gradient(circle at 32% 28%, hsla(${hue},85%,62%,0.55), hsla(${hue},75%,42%,0.25) 70%)`,
          border: `1.5px solid hsla(${hue},80%,70%,0.55)`,
          boxShadow: `0 0 ${size * 0.35}px hsla(${hue},85%,55%,0.35)`,
          animation: state === "confused" ? "tiltConfused 1.4s ease-in-out infinite" : undefined,
        }}
        animate={state === "happy" || state === "celebrating" ? { scale: [1, 1.07, 1] } : { scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={avatarUri} alt="" className="w-full h-full select-none pointer-events-none" draggable={false} />
        {state === "confused" && (
          <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[var(--pill)] flex items-center justify-center">
            <HelpCircle size={11} className="text-[var(--pill-ink)]" strokeWidth={2.5} />
          </div>
        )}
      </motion.div>
    </div>
  );
}
