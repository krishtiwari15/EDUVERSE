"use client";
import { useState } from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

const CHARACTER_URL = "https://lottie.host/b99ef145-b573-4305-9164-7f0bf1997d30/IeL2KG7tpc.lottie";

const LEVELS = [
  { key: "Kid", label: "Kid", emoji: "🧒" },
  { key: "Teen", label: "Teen", emoji: "🧑‍🎓" },
  { key: "Adult", label: "Adult", emoji: "🧑" },
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
    <div className="relative min-h-screen overflow-hidden flex flex-col items-center justify-center p-6"
      style={{ background: "radial-gradient(ellipse at 70% 12%, #3B2E63 0%, #241B47 30%, #150F2E 62%, #0A0718 100%)" }}>

      <style jsx global>{`
        @keyframes lFloat { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-14px); } }
        @keyframes lGlow { 0%,100% { opacity: 0.4; transform: scale(1); } 50% { opacity: 0.7; transform: scale(1.12); } }
        @keyframes lTwinkle { 0%,100% { opacity: 0.2; } 50% { opacity: 1; } }
        @keyframes lFadeIn { 0% { opacity: 0; transform: translateY(10px); } 100% { opacity: 1; transform: translateY(0); } }
        .l-fade { animation: lFadeIn 0.4s ease-out both; }
      `}</style>

      {/* Stars */}
      {Array.from({ length: 40 }).map((_, i) => (
        <div key={i} className="absolute rounded-full bg-white" style={{
          width: i % 4 === 0 ? 3 : 2, height: i % 4 === 0 ? 3 : 2,
          top: `${(i * 23) % 100}%`, left: `${(i * 47) % 100}%`,
          animation: `lTwinkle ${2 + (i % 4)}s ease-in-out infinite`,
        }} />
      ))}

      <div className="relative z-10 flex flex-col items-center text-center w-full max-w-sm">
        <div className="relative flex items-center justify-center mb-3" style={{ width: 140, height: 140 }}>
          <div className="absolute rounded-full" style={{ width: 120, height: 120, background: "#A78BFA", filter: "blur(38px)", animation: "lGlow 3s ease-in-out infinite" }} />
          <div className="relative rounded-full flex items-center justify-center ring-4 ring-white/30 shadow-2xl" style={{ width: 112, height: 112, background: "radial-gradient(circle at 40% 35%, #ffffff66, #EDE9FE)", animation: "lFloat 4s ease-in-out infinite" }}>
            <DotLottieReact src={CHARACTER_URL} loop autoplay style={{ width: "86%", height: "86%" }} />
          </div>
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold text-white drop-shadow-lg" style={{ fontFamily: "var(--font-fredoka), sans-serif" }}>
          EduVerse
        </h1>
        <p className="text-violet-200 text-sm mt-1 mb-6">
          {mode === "signup" ? "Create your account to start exploring" : "Welcome back, explorer"}
        </p>

        <form onSubmit={submit} className="w-full flex flex-col items-center gap-3">
          {mode === "signup" && (
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="What's your name?"
              className="w-full px-6 py-3 rounded-full text-center text-base font-semibold text-violet-900 bg-white/95 outline-none shadow-xl focus:ring-4 focus:ring-violet-300/70"
              required
            />
          )}
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full px-6 py-3 rounded-full text-center text-base font-semibold text-violet-900 bg-white/95 outline-none shadow-xl focus:ring-4 focus:ring-violet-300/70"
            required
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={mode === "signup" ? "Create a password" : "Password"}
            className="w-full px-6 py-3 rounded-full text-center text-base font-semibold text-violet-900 bg-white/95 outline-none shadow-xl focus:ring-4 focus:ring-violet-300/70"
            minLength={6}
            required
          />

          {mode === "signup" && (
            <div className="l-fade mt-1 flex flex-col items-center gap-2">
              <p className="text-white/90 text-sm font-semibold" style={{ fontFamily: "var(--font-fredoka), sans-serif" }}>Who&apos;s exploring?</p>
              <div className="flex gap-2">
                {LEVELS.map((l) => (
                  <button key={l.key} type="button" onClick={() => setLevel(l.key)}
                    className={`flex flex-col items-center gap-1 px-4 py-2.5 rounded-2xl font-bold transition active:scale-95 ${level === l.key ? "bg-white text-violet-700 scale-105 shadow-lg" : "bg-white/15 text-white ring-1 ring-white/30"}`}>
                    <span className="text-xl">{l.emoji}</span>
                    <span className="text-xs">{l.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {error && <p className="l-fade text-rose-200 text-sm font-medium bg-rose-900/30 px-4 py-2 rounded-xl">{error}</p>}

          <button
            type="submit"
            disabled={busy}
            className="mt-2 w-full px-10 py-3.5 rounded-full text-lg font-bold text-violet-900 bg-gradient-to-r from-violet-200 to-indigo-200 shadow-xl active:scale-95 transition disabled:opacity-50"
          >
            {busy ? "One sec…" : mode === "signup" ? "Create account 🚀" : "Log in 🌙"}
          </button>
        </form>

        <button
          type="button"
          onClick={() => { setError(""); setMode(mode === "signup" ? "login" : "signup"); }}
          className="mt-5 text-violet-200 text-sm font-medium hover:text-white transition"
        >
          {mode === "signup" ? "Already have an account? Log in" : "New here? Create an account"}
        </button>
      </div>

      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 text-violet-300/60 text-xs">✨ where every question becomes an adventure ✨</div>
    </div>
  );
}
