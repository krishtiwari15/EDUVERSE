"use client";
import { motion } from "motion/react";
import { useState } from "react";
import { Calculator, FlaskConical, BookOpen, Code2, Languages, Sparkles, ArrowRight, Check } from "lucide-react";
import { Button, RevealGroup, RevealItem } from "@/components/ui";
import AuthPlate from "@/components/AuthPlate";

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
    <div className="relative min-h-app overflow-hidden flex flex-col items-center justify-center safe-pad">
      <AuthPlate />

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }} className="relative z-10 w-full max-w-lg text-center">
        <p className="text-eyebrow mb-3">One last thing</p>
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
                  className={`focus-ring relative w-full flex flex-col items-center gap-2 py-5 rounded-[var(--radius-md)] font-semibold transition-all ${on ? "bg-white text-[var(--pill-ink)] scale-[1.03]" : "glass-card text-white hover:bg-white/10"}`}>
                  {on && <Check size={14} className="absolute top-2.5 right-2.5" strokeWidth={3} />}
                  <s.icon size={22} strokeWidth={1.75} />
                  <span className="text-sm">{s.key}</span>
                </button>
              </RevealItem>
            );
          })}
        </RevealGroup>

        {error && <p role="alert" className="mt-5 text-white text-sm font-medium bg-white/10 ring-1 ring-white/25 px-4 py-2.5 rounded-xl inline-block">{error}</p>}

        <Button variant="primary" size="lg" icon={ArrowRight} iconPosition="right" onClick={submit} disabled={busy} className="w-full mt-8">
          {busy ? "Saving…" : "Enter EduVerse"}
        </Button>
      </motion.div>
    </div>
  );
}
