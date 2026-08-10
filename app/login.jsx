"use client";
import { useState } from "react";
import { motion } from "motion/react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { Sparkles, GraduationCap, Compass, ArrowRight, Mail, Lock, User } from "lucide-react";
import { Button, Reveal } from "@/components/ui";

const CHARACTER_URL = "https://lottie.host/b99ef145-b573-4305-9164-7f0bf1997d30/IeL2KG7tpc.lottie";

const LEVELS = [
  { key: "Kid", label: "Kid" },
  { key: "Teen", label: "Teen" },
  { key: "Adult", label: "Adult" },
];

const HIGHLIGHTS = [
  { icon: GraduationCap, text: "An AI tutor that teaches like a real person — not a search engine" },
  { icon: Compass, text: "A mentor that remembers your journey, not just your last question" },
  { icon: Sparkles, text: "One caring intelligence — the Oxidium Mind — behind every buddy" },
];

export default function Login({ onAuth }) {
  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [level, setLevel] = useState("Kid");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    if (busy) return;
    setError("");
    setBusy(true);
    try {
      const body = mode === "signup" ? { email, password, name, level } : { email, password };
      const res = await fetch(`/api/auth/${mode === "signup" ? "signup" : "login"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || "Something went wrong.");
        return;
      }
      onAuth(data.user);
    } catch {
      setError("Couldn't reach the server. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden" style={{ background: "radial-gradient(ellipse 120% 80% at 15% 0%, var(--color-nebula-3) 0%, var(--color-nebula-2) 32%, var(--color-nebula-1) 62%, var(--color-void) 100%)" }}>
      <style jsx global>{`
        @keyframes entryTwinkle { 0%,100% { opacity: 0.15; } 50% { opacity: 0.9; } }
        @keyframes entryDrift { 0%,100% { transform: translate(0,0); } 50% { transform: translate(14px,-18px); } }
      `}</style>

      {Array.from({ length: 60 }).map((_, i) => (
        <div key={i} className="absolute rounded-full bg-white pointer-events-none" style={{
          width: i % 5 === 0 ? 3 : 2, height: i % 5 === 0 ? 3 : 2,
          top: `${(i * 17) % 100}%`, left: `${(i * 53) % 100}%`,
          animation: `entryTwinkle ${2.5 + (i % 5)}s ease-in-out ${(i % 10) * 0.25}s infinite`,
        }} />
      ))}
      <div className="absolute -top-40 -right-40 w-[32rem] h-[32rem] rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(94,234,212,0.16), transparent 70%)", animation: "entryDrift 12s ease-in-out infinite" }} />
      <div className="absolute -bottom-40 -left-32 w-[28rem] h-[28rem] rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(167,139,250,0.18), transparent 70%)", animation: "entryDrift 14s ease-in-out 2s infinite" }} />

      <div className="relative z-10 min-h-screen grid lg:grid-cols-2">
        {/* Left — the pitch */}
        <div className="hidden lg:flex flex-col justify-center px-16 xl:px-20 py-16">
          <Reveal>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 ring-1 ring-white/15 text-white/70 text-xs font-semibold w-fit mb-8">
              <Sparkles size={13} className="text-[var(--color-aurora)]" />
              Your AI learning universe
            </div>
          </Reveal>
          <Reveal delay={0.08}>
            <h1 className="text-hero text-white max-w-xl">
              Learning that feels like <span className="text-[var(--color-aurora)]">discovery</span>, not homework.
            </h1>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="text-white/60 text-lg mt-6 max-w-md leading-relaxed">
              EduVerse pairs you with an AI buddy who teaches, quizzes, and remembers where you left off — built around how you actually learn.
            </p>
          </Reveal>
          <Reveal delay={0.24}>
            <div className="mt-10 space-y-4 max-w-md">
              {HIGHLIGHTS.map((h, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white/10 ring-1 ring-white/15 flex items-center justify-center shrink-0 mt-0.5">
                    <h.icon size={16} className="text-[var(--color-primary)]" strokeWidth={2} />
                  </div>
                  <p className="text-white/70 text-sm leading-relaxed pt-1.5">{h.text}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>

        {/* Right — the form */}
        <div className="flex items-center justify-center p-6 sm:p-10">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="glass-card-elevated w-full max-w-sm p-8"
          >
            <div className="flex items-center gap-3 mb-1 lg:hidden">
              <div className="relative w-11 h-11 rounded-2xl flex items-center justify-center ring-1 ring-white/25" style={{ background: "radial-gradient(circle at 40% 35%, #ffffff40, #241B47)" }}>
                <DotLottieReact src={CHARACTER_URL} loop autoplay style={{ width: "80%", height: "80%" }} />
              </div>
              <span className="text-heading text-white">EduVerse</span>
            </div>
            <h2 className="text-display text-white mt-2 lg:mt-0">{mode === "signup" ? "Create your account" : "Welcome back"}</h2>
            <p className="text-white/50 text-sm mt-1.5 mb-7">
              {mode === "signup" ? "Start your learning universe in under a minute." : "Pick up right where you left off."}
            </p>

            <form onSubmit={submit} className="flex flex-col gap-3">
              {mode === "signup" && (
                <label className="relative block">
                  <User size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" strokeWidth={2} />
                  <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="focus-ring w-full pl-11 pr-4 py-3 rounded-xl bg-white/95 text-slate-800 text-sm font-medium placeholder:text-slate-400" required />
                </label>
              )}
              <label className="relative block">
                <Mail size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" strokeWidth={2} />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="focus-ring w-full pl-11 pr-4 py-3 rounded-xl bg-white/95 text-slate-800 text-sm font-medium placeholder:text-slate-400" required />
              </label>
              <label className="relative block">
                <Lock size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" strokeWidth={2} />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={mode === "signup" ? "Create a password" : "Password"} minLength={6} className="focus-ring w-full pl-11 pr-4 py-3 rounded-xl bg-white/95 text-slate-800 text-sm font-medium placeholder:text-slate-400" required />
              </label>

              {mode === "signup" && (
                <div className="pt-1">
                  <p className="text-eyebrow text-white/40 mb-2">Who&apos;s learning</p>
                  <div className="grid grid-cols-3 gap-2">
                    {LEVELS.map((l) => (
                      <button key={l.key} type="button" onClick={() => setLevel(l.key)} aria-pressed={level === l.key}
                        className={`focus-ring py-2.5 rounded-xl text-sm font-semibold transition ${level === l.key ? "bg-white text-violet-800" : "bg-white/10 text-white/70 ring-1 ring-white/15"}`}>
                        {l.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {error && <p role="alert" className="text-rose-200 text-sm font-medium bg-rose-500/15 ring-1 ring-rose-400/30 px-4 py-2.5 rounded-xl">{error}</p>}

              <Button type="submit" variant="primary" size="md" icon={ArrowRight} iconPosition="right" disabled={busy} className="w-full mt-2">
                {busy ? "One sec…" : mode === "signup" ? "Create account" : "Log in"}
              </Button>
            </form>

            <button type="button" onClick={() => { setError(""); setMode(mode === "signup" ? "login" : "signup"); }} className="focus-ring mt-5 text-white/50 hover:text-white text-sm font-medium transition w-full text-center">
              {mode === "signup" ? "Already have an account? Log in" : "New here? Create an account"}
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
