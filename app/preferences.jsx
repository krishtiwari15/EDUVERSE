"use client";
import { useState } from "react";
import { motion } from "motion/react";
import { Calculator, FlaskConical, BookOpen, Code2, Languages, Sparkles, ArrowRight, Check } from "lucide-react";
import { Button, RevealGroup, RevealItem } from "@/components/ui";

const SUBJECTS = [
  { key: "General", icon: Sparkles },
  { key: "Math", icon: Calculator },
  { key: "Science", icon: FlaskConical },
  { key: "English", icon: BookOpen },
  { key: "Coding", icon: Code2 },
  { key: "Languages", icon: Languages },
];

export default function Preferences({ user, onDone }) {
  const [picked, setPicked] = useState([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function toggle(key) {
    setPicked((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  }

  async function submit() {
    if (picked.length === 0) { setError("Pick at least one to continue."); return; }
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subjects: picked }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) { setError(data.error || "Something went wrong."); return; }
      onDone(data.user);
    } catch {
      setError("Couldn't reach the server. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden flex flex-col items-center justify-center p-6" style={{ background: "radial-gradient(ellipse at 70% 12%, var(--color-nebula-3) 0%, var(--color-nebula-2) 30%, var(--color-nebula-1) 62%, var(--color-void) 100%)" }}>
      {Array.from({ length: 30 }).map((_, i) => (
        <div key={i} className="absolute rounded-full bg-white pointer-events-none" style={{
          width: i % 4 === 0 ? 3 : 2, height: i % 4 === 0 ? 3 : 2,
          top: `${(i * 23) % 100}%`, left: `${(i * 47) % 100}%`, opacity: 0.4,
        }} />
      ))}

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }} className="relative z-10 w-full max-w-lg text-center">
        <p className="text-eyebrow text-[var(--color-aurora)] mb-3">One last thing</p>
        <h1 className="text-display text-white">
          What should <span className="font-companion">{user?.name}</span>&apos;s mentor focus on first?
        </h1>
        <p className="text-white/50 mt-3">Pick as many as you like — this just sets your starting point, you can change it anytime.</p>

        <RevealGroup className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-8" stagger={0.05}>
          {SUBJECTS.map((s) => {
            const on = picked.includes(s.key);
            return (
              <RevealItem key={s.key}>
                <button onClick={() => toggle(s.key)} aria-pressed={on}
                  className={`focus-ring relative w-full flex flex-col items-center gap-2 py-5 rounded-[var(--radius-md)] font-semibold transition-all ${on ? "bg-white text-violet-800 shadow-[0_12px_30px_-10px_rgba(255,255,255,0.4)] scale-[1.03]" : "glass-card text-white hover:bg-white/15"}`}>
                  {on && <Check size={14} className="absolute top-2.5 right-2.5" strokeWidth={3} />}
                  <s.icon size={22} strokeWidth={1.75} />
                  <span className="text-sm">{s.key}</span>
                </button>
              </RevealItem>
            );
          })}
        </RevealGroup>

        {error && <p role="alert" className="mt-5 text-rose-200 text-sm font-medium bg-rose-500/15 ring-1 ring-rose-400/30 px-4 py-2.5 rounded-xl inline-block">{error}</p>}

        <Button variant="primary" size="lg" icon={ArrowRight} iconPosition="right" onClick={submit} disabled={busy} className="w-full mt-8">
          {busy ? "Saving…" : "Enter EduVerse"}
        </Button>
      </motion.div>
    </div>
  );
}
