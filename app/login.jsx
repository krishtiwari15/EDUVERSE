"use client";
import { useState } from "react";
import { motion } from "motion/react";
import { GraduationCap, Compass, Sparkles, ArrowRight, ArrowLeft, Mail, Lock, User, KeyRound } from "lucide-react";
import { Button, Reveal } from "@/components/ui";
import AuthPlate from "@/components/AuthPlate";
import BrandMark from "@/components/BrandMark";

const LEVELS = [
  { key: "Kid", label: "Kid" },
  { key: "Teen", label: "Teen" },
  { key: "Adult", label: "Adult" },
];

const ROLES = [
  { key: "student", label: "Student" },
  { key: "parent", label: "Parent" },
  { key: "teacher", label: "Teacher" },
];

const HIGHLIGHTS = [
  { icon: GraduationCap, text: "An AI tutor that teaches like a real person — not a search engine" },
  { icon: Compass, text: "A mentor that remembers your journey, not just your last question" },
  { icon: Sparkles, text: "One caring intelligence — the Obsidian Mind — behind every buddy" },
];

export default function Login({ onAuth, initialMode, onBack }) {
  const [mode, setMode] = useState(initialMode === "signup" ? "signup" : "login"); // "login" | "signup" | "recover"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [level, setLevel] = useState("Kid");
  const [role, setRole] = useState("student");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  // Recovery is its own two-step flow: email a one-time code, then enter
  // it along with a new password. Works for any account, unlike a
  // security question, which only helps if one was ever set up.
  const [recoverStep, setRecoverStep] = useState(1);
  const [otpCode, setOtpCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  async function submit(e) {
    e.preventDefault();
    if (busy) return;
    setError("");
    setBusy(true);
    try {
      const body = mode === "signup" ? { email, password, name, level, role } : { email, password };
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

  async function sendRecoverCode(e) {
    e.preventDefault();
    if (busy || resendCooldown > 0) return;
    setError("");
    setBusy(true);
    try {
      const res = await fetch("/api/auth/forgot/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || "Something went wrong.");
        return;
      }
      setRecoverStep(2);
      setResendCooldown(60);
      const t = setInterval(() => setResendCooldown((s) => {
        if (s <= 1) { clearInterval(t); return 0; }
        return s - 1;
      }), 1000);
    } catch {
      setError("Couldn't reach the server. Try again.");
    } finally {
      setBusy(false);
    }
  }

  async function submitRecoverReset(e) {
    e.preventDefault();
    if (busy) return;
    setError("");
    setBusy(true);
    try {
      const res = await fetch("/api/auth/forgot/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: otpCode, newPassword }),
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

  function backToLogin() {
    setError(""); setMode("login"); setRecoverStep(1); setOtpCode(""); setNewPassword("");
  }

  return (
    <div className="relative min-h-app overflow-hidden">
      <AuthPlate />

      {onBack && (
        <button onClick={onBack} aria-label="Back" className="focus-ring absolute z-20 flex items-center gap-1.5 text-white/60 hover:text-white text-sm font-semibold transition" style={{ top: "max(1.25rem, env(safe-area-inset-top))", left: "max(1.25rem, env(safe-area-inset-left))" }}>
          <ArrowLeft size={16} /> Back
        </button>
      )}

      <div className="relative z-10 min-h-app grid lg:grid-cols-2">
        {/* Left — the pitch */}
        <div className="hidden lg:flex flex-col justify-center px-16 xl:px-20 py-16">
          <Reveal>
            <BrandMark className="w-6 h-9 mb-8" />
          </Reveal>
          <Reveal delay={0.08}>
            <h1 className="text-hero text-white max-w-xl">
              Learning that feels like discovery, not homework.
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
                  <div className="w-9 h-9 rounded-xl bg-white/5 ring-1 ring-white/15 flex items-center justify-center shrink-0 mt-0.5">
                    <h.icon size={16} className="text-white/80" strokeWidth={2} />
                  </div>
                  <p className="text-white/70 text-sm leading-relaxed pt-1.5">{h.text}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>

        {/* Right — the form */}
        <div className="flex items-center justify-center safe-pad sm:p-10">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="glass-card-elevated w-full max-w-sm p-8"
          >
            <div className="flex items-center gap-3 mb-5 lg:hidden">
              <BrandMark className="w-5 h-8" />
              <span className="text-heading text-white">EduVerse</span>
            </div>
            <div className="lg:hidden mb-6">
              <h1 className="text-display text-white leading-tight">
                Learning that feels like discovery, not homework.
              </h1>
              <p className="text-white/55 text-sm mt-2 leading-relaxed">
                An AI buddy that teaches, quizzes, and remembers where you left off.
              </p>
            </div>
            <h2 className="text-display text-white">
              {mode === "signup" ? "Create your account" : mode === "recover" ? "Recover your account" : "Welcome back"}
            </h2>
            <p className="text-white/50 text-sm mt-1.5 mb-7">
              {mode === "signup"
                ? "Start your learning universe in under a minute."
                : mode === "recover"
                ? recoverStep === 1 ? "Enter your email and we'll send you a one-time code." : "Enter the code we emailed you, plus a new password."
                : "Pick up right where you left off."}
            </p>

            {mode === "recover" ? (
              recoverStep === 1 ? (
                <form onSubmit={sendRecoverCode} className="flex flex-col gap-3">
                  <label className="relative block">
                    <Mail size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" strokeWidth={2} />
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="focus-ring w-full pl-11 pr-4 py-3 rounded-xl bg-white/95 text-slate-800 text-sm font-medium placeholder:text-slate-400" required />
                  </label>
                  {error && <p role="alert" className="text-white text-sm font-medium bg-white/10 ring-1 ring-white/25 px-4 py-2.5 rounded-xl">{error}</p>}
                  <Button type="submit" variant="primary" size="md" icon={ArrowRight} iconPosition="right" disabled={busy} className="w-full mt-2">
                    {busy ? "Sending…" : "Send me a code"}
                  </Button>
                </form>
              ) : (
                <form onSubmit={submitRecoverReset} className="flex flex-col gap-3">
                  <div className="flex items-start gap-2.5 bg-white/5 ring-1 ring-white/15 rounded-xl px-4 py-3">
                    <Mail size={17} className="text-white/60 shrink-0 mt-0.5" strokeWidth={2} />
                    <p className="text-white/85 text-sm leading-snug">We sent a 6-digit code to <span className="font-semibold">{email}</span>. It expires in 10 minutes.</p>
                  </div>
                  <label className="relative block">
                    <KeyRound size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" strokeWidth={2} />
                    <input value={otpCode} onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))} inputMode="numeric" placeholder="6-digit code" className="focus-ring w-full pl-11 pr-4 py-3 rounded-xl bg-white/95 text-slate-800 text-sm font-medium tracking-[0.3em] placeholder:tracking-normal placeholder:text-slate-400" required />
                  </label>
                  <label className="relative block">
                    <Lock size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" strokeWidth={2} />
                    <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="New password" minLength={6} className="focus-ring w-full pl-11 pr-4 py-3 rounded-xl bg-white/95 text-slate-800 text-sm font-medium placeholder:text-slate-400" required />
                  </label>
                  {error && <p role="alert" className="text-white text-sm font-medium bg-white/10 ring-1 ring-white/25 px-4 py-2.5 rounded-xl">{error}</p>}
                  <Button type="submit" variant="primary" size="md" icon={ArrowRight} iconPosition="right" disabled={busy} className="w-full mt-2">
                    {busy ? "One sec…" : "Set new password & log in"}
                  </Button>
                  <button type="button" onClick={sendRecoverCode} disabled={resendCooldown > 0 || busy} className="focus-ring text-white/50 hover:text-white text-xs font-medium transition disabled:opacity-40 disabled:hover:text-white/50">
                    {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : "Didn't get it? Resend code"}
                  </button>
                </form>
              )
            ) : (
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

              {mode === "login" && (
                <button type="button" onClick={() => { setError(""); setMode("recover"); setRecoverStep(1); }} className="focus-ring self-end text-white/50 hover:text-white text-xs font-medium transition -mt-1">
                  Forgot password?
                </button>
              )}

              {mode === "signup" && (
                <div className="pt-1">
                  <p className="text-eyebrow mb-2">I am a</p>
                  <div className="grid grid-cols-3 gap-2">
                    {ROLES.map((r) => (
                      <button key={r.key} type="button" onClick={() => setRole(r.key)} aria-pressed={role === r.key}
                        className={`focus-ring py-2.5 rounded-xl text-sm font-semibold transition ${role === r.key ? "bg-white text-[var(--pill-ink)]" : "bg-white/5 text-white/70 ring-1 ring-white/15"}`}>
                        {r.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {mode === "signup" && role === "student" && (
                <div className="pt-1">
                  <p className="text-eyebrow mb-2">Who&apos;s learning</p>
                  <div className="grid grid-cols-3 gap-2">
                    {LEVELS.map((l) => (
                      <button key={l.key} type="button" onClick={() => setLevel(l.key)} aria-pressed={level === l.key}
                        className={`focus-ring py-2.5 rounded-xl text-sm font-semibold transition ${level === l.key ? "bg-white text-[var(--pill-ink)]" : "bg-white/5 text-white/70 ring-1 ring-white/15"}`}>
                        {l.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {error && <p role="alert" className="text-white text-sm font-medium bg-white/10 ring-1 ring-white/25 px-4 py-2.5 rounded-xl">{error}</p>}

              <Button type="submit" variant="primary" size="md" icon={ArrowRight} iconPosition="right" disabled={busy} className="w-full mt-2">
                {busy ? "One sec…" : mode === "signup" ? "Create account" : "Log in"}
              </Button>
            </form>
            )}

            <button
              type="button"
              onClick={() => {
                if (mode === "recover") { backToLogin(); return; }
                setError("");
                setMode(mode === "signup" ? "login" : "signup");
              }}
              className="focus-ring mt-5 text-white/50 hover:text-white text-sm font-medium transition w-full text-center"
            >
              {mode === "recover" ? "Back to log in" : mode === "signup" ? "Already have an account? Log in" : "New here? Create an account"}
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
