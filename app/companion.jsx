"use client";
import { motion } from "motion/react";
import { ArrowLeft, Mic, Keyboard, BookOpen, Sparkles } from "lucide-react";
import { Button, Reveal, RevealGroup, RevealItem } from "@/components/ui";
import AIAvatar from "@/components/mentor/AIAvatar";

// The AI Mentor's hero screen (spec section 20): a calm, special first
// moment rather than another chat window — the entry point into talking,
// typing, studying together, or exploring the student's Obsidian Mind.
export default function Companion({ mentor, displayName, onBack, onTalk, onType, onStudy, onMind }) {
  const actions = [
    { icon: Keyboard, label: "Type instead", desc: "Chat by typing", onClick: onType },
    { icon: BookOpen, label: "Study with me", desc: "Start a focus session", onClick: onStudy },
    { icon: Sparkles, label: "Explore my mind", desc: "Your learning universe", onClick: onMind },
  ];

  return (
    <div className="relative z-10 w-full max-w-xl mx-auto py-6 px-1">
      <button onClick={onBack} aria-label="Back" className="focus-ring flex items-center gap-1.5 text-white/70 hover:text-white mb-6 font-semibold text-sm">
        <ArrowLeft size={16} /> Back
      </button>

      <Reveal className="flex flex-col items-center text-center">
        <AIAvatar mentor={mentor} state="encouraging" size={148} />
        <p className="text-eyebrow mt-5">Your AI Mentor</p>
        <h1 className="text-display text-white mt-1">
          Hey{displayName ? `, ${displayName}` : ""}! I&apos;m {mentor.name}.
        </h1>
        <p className="text-white/60 mt-2 max-w-sm">
          I&apos;m here whenever you&apos;re ready — to talk something through, study together, or just check in.
        </p>
      </Reveal>

      <Reveal delay={0.1} className="mt-7">
        <motion.button
          onClick={onTalk}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.98 }}
          className="focus-ring w-full glass-card-elevated p-5 flex items-center gap-4 text-left"
        >
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 bg-white/10 border border-white/15">
            <Mic size={22} className="text-white" strokeWidth={2} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-heading text-white text-base">Talk to me</div>
            <div className="text-white/55 text-sm mt-0.5">Tap and start speaking — I&apos;m listening.</div>
          </div>
        </motion.button>
      </Reveal>

      <RevealGroup className="grid grid-cols-3 gap-2.5 mt-3" stagger={0.06}>
        {actions.map((a) => (
          <RevealItem key={a.label}>
            <button onClick={a.onClick} className="focus-ring w-full h-full glass-card p-3.5 flex flex-col items-center gap-1.5 text-center hover:bg-white/15 hover:-translate-y-0.5 active:scale-95 transition-all">
              <a.icon size={18} className="text-white/80" strokeWidth={1.75} />
              <div className="text-white text-xs font-semibold leading-tight">{a.label}</div>
              <div className="text-white/40 text-[10px] leading-tight">{a.desc}</div>
            </button>
          </RevealItem>
        ))}
      </RevealGroup>

      <Reveal delay={0.15}>
        <div className="mt-6 text-center">
          <Button variant="ghost" size="sm" onClick={onTalk}>Not sure what to say? Just tap Talk — I&apos;ll take it from there.</Button>
        </div>
      </Reveal>
    </div>
  );
}
