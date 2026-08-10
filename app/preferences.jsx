"use client";
import { useState } from "react";

const SUBJECTS = [
  { key: "General", emoji: "🌟" },
  { key: "Math", emoji: "🔢" },
  { key: "Science", emoji: "🧪" },
  { key: "English", emoji: "📖" },
  { key: "Coding", emoji: "💻" },
  { key: "Languages", emoji: "🗣️" },
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
    <div className="relative min-h-screen overflow-hidden flex flex-col items-center justify-center p-6"
      style={{ background: "radial-gradient(ellipse at 70% 12%, #3B2E63 0%, #241B47 30%, #150F2E 62%, #0A0718 100%)" }}>

      <style jsx global>{`
        @keyframes pTwinkle { 0%,100% { opacity: 0.2; } 50% { opacity: 1; } }
        @keyframes pPop { 0% { opacity: 0; transform: scale(0.85) translateY(10px); } 100% { opacity: 1; transform: scale(1) translateY(0); } }
      `}</style>

      {Array.from({ length: 30 }).map((_, i) => (
        <div key={i} className="absolute rounded-full bg-white" style={{
          width: i % 4 === 0 ? 3 : 2, height: i % 4 === 0 ? 3 : 2,
          top: `${(i * 23) % 100}%`, left: `${(i * 47) % 100}%`,
          animation: `pTwinkle ${2 + (i % 4)}s ease-in-out infinite`,
        }} />
      ))}

      <div className="relative z-10 w-full max-w-md text-center" style={{ animation: "pPop 0.4s ease-out both" }}>
        <div className="text-4xl mb-2">🌌</div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white drop-shadow-lg" style={{ fontFamily: "var(--font-fredoka), sans-serif" }}>
          Hi {user?.name}! What do you want to study?
        </h1>
        <p className="text-violet-200 text-sm mt-2">Pick as many as you like — you can change this anytime.</p>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-6">
          {SUBJECTS.map((s) => {
            const on = picked.includes(s.key);
            return (
              <button key={s.key} onClick={() => toggle(s.key)}
                className={`flex flex-col items-center gap-1 py-4 rounded-2xl font-bold transition active:scale-95 ${on ? "bg-white text-violet-700 scale-105 shadow-xl" : "bg-white/10 text-white ring-1 ring-white/25"}`}>
                <span className="text-2xl">{s.emoji}</span>
                <span className="text-sm">{s.key}</span>
              </button>
            );
          })}
        </div>

        {error && <p className="mt-4 text-rose-200 text-sm font-medium bg-rose-900/30 px-4 py-2 rounded-xl inline-block">{error}</p>}

        <button
          onClick={submit}
          disabled={busy}
          className="mt-6 w-full px-10 py-3.5 rounded-full text-lg font-bold text-violet-900 bg-gradient-to-r from-violet-200 to-indigo-200 shadow-xl active:scale-95 transition disabled:opacity-50"
        >
          {busy ? "Saving…" : "Let's go 🚀"}
        </button>
      </div>
    </div>
  );
}
