"use client";
import { useState, useEffect } from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

const CHARACTER_URL = "https://lottie.host/b99ef145-b573-4305-9164-7f0bf1997d30/IeL2KG7tpc.lottie";

const QUOTES = [
  "Every star was once a question ✨",
  "Curiosity is your superpower 🚀",
  "Little steps reach the moon 🌙",
  "Mistakes are just clues in disguise 🔍",
  "The sky is not the limit — it's the beginning 🌌",
];

export default function Welcome({ onStart }) {
  const [quote, setQuote] = useState(0);
  const [name, setName] = useState("");
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const q = setInterval(() => setQuote((v) => (v + 1) % QUOTES.length), 3000);
    return () => clearInterval(q);
  }, []);

  // Play exit animation, then enter the app
  function go() {
    if (!name.trim() || leaving) return;
    setLeaving(true);
    setTimeout(() => onStart(name.trim()), 900); // matches exit duration
  }

  return (
    <div className="relative min-h-screen overflow-hidden flex flex-col items-center justify-center p-6"
      style={{ background: "radial-gradient(ellipse at 70% 12%, #3B2E63 0%, #241B47 30%, #150F2E 62%, #0A0718 100%)" }}>

      <style jsx global>{`
        @keyframes dropIn { 0% { opacity: 0; transform: translateY(-140px); } 70% { opacity: 1; transform: translateY(12px); } 100% { opacity: 1; transform: translateY(0); } }
        @keyframes dropBig { 0% { opacity: 0; transform: translateY(-260px) scale(0.6); } 65% { transform: translateY(14px) scale(1.06); } 100% { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes moonDrop { 0% { opacity: 0; transform: translate(-40px, -260px); } 100% { opacity: 1; transform: translate(-40px, -40px); } }
        @keyframes wFloat { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-14px); } }
        @keyframes wGlow { 0%,100% { opacity: 0.4; transform: scale(1); } 50% { opacity: 0.7; transform: scale(1.12); } }
        @keyframes wTwinkle { 0%,100% { opacity: 0.2; } 50% { opacity: 1; } }
        @keyframes starFall { 0% { opacity: 0; transform: translateY(-100px); } 40% { opacity: 1; } 100% { opacity: 0.7; transform: translateY(0); } }
        @keyframes wQuote { 0% { opacity: 0; transform: translateY(8px); } 15% { opacity: 1; transform: translateY(0); } 85% { opacity: 1; } 100% { opacity: 0; transform: translateY(-8px); } }
        @keyframes wMoonGlow { 0%,100% { box-shadow: 0 0 70px 24px #C4B5FD44; } 50% { box-shadow: 0 0 110px 36px #C4B5FD66; } }
        @keyframes wBtnPulse { 0%,100% { box-shadow: 0 0 0 0 #ffffff55; } 50% { box-shadow: 0 0 0 12px #ffffff00; } }

        /* EXIT: everything lifts up and fades */
        @keyframes flyUp { 0% { opacity: 1; transform: translateY(0) scale(1); } 100% { opacity: 0; transform: translateY(-160px) scale(0.85); } }
        @keyframes buddyLaunch { 0% { opacity: 1; transform: translateY(0) scale(1) rotate(0deg); } 30% { transform: translateY(20px) scale(0.95); } 100% { opacity: 0; transform: translateY(-120vh) scale(0.5) rotate(-12deg); } }
        @keyframes moonExit { 0% { opacity: 1; transform: translate(-40px, -40px); } 100% { opacity: 0; transform: translate(-40px, -260px); } }
        @keyframes fadeOut { to { opacity: 0; } }

        .drop-1 { animation: dropIn 0.9s cubic-bezier(0.34,1.4,0.64,1) 0.2s both; }
        .drop-2 { animation: dropBig 1.1s cubic-bezier(0.34,1.5,0.64,1) 0.6s both; }
        .drop-3 { animation: dropIn 0.8s cubic-bezier(0.34,1.4,0.64,1) 1.2s both; }
        .drop-4 { animation: dropIn 0.8s cubic-bezier(0.34,1.4,0.64,1) 1.6s both; }
        .drop-5 { animation: dropIn 0.8s cubic-bezier(0.34,1.4,0.64,1) 2.0s both; }
        .drop-6 { animation: dropIn 0.8s cubic-bezier(0.34,1.4,0.64,1) 2.5s both; }

        /* when leaving, override with exit anims (staggered bottom-to-top) */
        .leaving .exit-a { animation: flyUp 0.7s ease-in 0s both; }
        .leaving .exit-b { animation: flyUp 0.7s ease-in 0.08s both; }
        .leaving .exit-c { animation: flyUp 0.7s ease-in 0.16s both; }
        .leaving .exit-d { animation: flyUp 0.7s ease-in 0.24s both; }
        .leaving .exit-buddy { animation: buddyLaunch 0.9s cubic-bezier(0.5,0,0.75,0) 0.15s both; }
        .leaving .exit-moon { animation: moonExit 0.7s ease-in both; }
        .leaving .exit-stars { animation: fadeOut 0.5s ease-in both; }
      `}</style>

      <div className={leaving ? "leaving contents" : "contents"}>
        {/* Moon */}
        <div className="exit-moon absolute rounded-full" style={{
          top: 0, left: 0, width: 180, height: 180,
          background: "radial-gradient(circle at 40% 38%, #F5F3FF, #DDD6FE 50%, #A78BFA 88%)",
          animation: "moonDrop 1.2s cubic-bezier(0.34,1.3,0.64,1) 0.1s both, wMoonGlow 6s ease-in-out 1.4s infinite",
        }}>
          <div className="absolute rounded-full bg-violet-300/40" style={{ top: "58px", left: "100px", width: 20, height: 20 }} />
          <div className="absolute rounded-full bg-violet-300/30" style={{ top: "108px", left: "62px", width: 14, height: 14 }} />
        </div>

        {/* Stars */}
        <div className="exit-stars">
          {Array.from({ length: 45 }).map((_, i) => (
            <div key={i} className="absolute rounded-full bg-white" style={{
              width: i % 4 === 0 ? 3 : 2, height: i % 4 === 0 ? 3 : 2,
              top: `${(i * 23) % 100}%`, left: `${(i * 47) % 100}%`,
              animation: `starFall 0.9s ease-out ${(i % 10) * 0.12}s both, wTwinkle ${2 + (i % 4)}s ease-in-out 1.2s infinite`,
            }} />
          ))}
        </div>

        {/* Center content */}
        <div className="relative z-10 flex flex-col items-center text-center min-h-screen justify-center">
          <div className="drop-2 exit-buddy relative flex items-center justify-center" style={{ width: 260, height: 260 }}>
            <div className="absolute rounded-full" style={{ width: 210, height: 210, background: "#A78BFA", filter: "blur(45px)", animation: "wGlow 3s ease-in-out 1.6s infinite" }} />
            <div className="relative rounded-full flex items-center justify-center ring-4 ring-white/30 shadow-2xl" style={{ width: 200, height: 200, background: "radial-gradient(circle at 40% 35%, #ffffff66, #EDE9FE)", animation: "wFloat 4s ease-in-out 1.6s infinite" }}>
              <DotLottieReact src={CHARACTER_URL} loop autoplay style={{ width: "86%", height: "86%" }} />
            </div>
          </div>

          <h1 className="drop-3 exit-d mt-4 text-4xl sm:text-6xl font-bold text-white drop-shadow-lg" style={{ fontFamily: "var(--font-fredoka), sans-serif" }}>
            EduVerse
          </h1>

          <div className="drop-4 exit-c h-8 mt-2 flex items-center">
            <p key={quote} className="text-violet-200 text-base sm:text-lg font-medium" style={{ animation: "wQuote 3s ease-in-out infinite" }}>
              {QUOTES[quote]}
            </p>
          </div>

          <p className="drop-5 exit-b mt-3 text-white/90 text-lg sm:text-xl font-semibold px-4" style={{ fontFamily: "var(--font-fredoka), sans-serif" }}>
            Hi there, little explorer! 👋<br />I'm your learning buddy.
          </p>

          <div className="drop-6 exit-a mt-6 flex flex-col items-center gap-4 w-full">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") go(); }}
              placeholder="What's your name?"
              className="w-64 px-6 py-3.5 rounded-full text-center text-lg font-semibold text-violet-900 bg-white/95 outline-none shadow-xl focus:ring-4 focus:ring-violet-300/70"
            />
            <button
              onClick={go}
              disabled={!name.trim()}
              className="px-10 py-3.5 rounded-full text-lg font-bold text-violet-900 bg-gradient-to-r from-violet-200 to-indigo-200 shadow-xl active:scale-95 transition disabled:opacity-40"
              style={{ animation: name.trim() && !leaving ? "wBtnPulse 1.8s ease-in-out infinite" : "none" }}
            >
              Let's explore! 🚀
            </button>
          </div>
        </div>

        <div className="drop-1 exit-a absolute bottom-5 left-1/2 -translate-x-1/2 text-violet-300/60 text-xs">✨ where every question becomes an adventure ✨</div>
      </div>
    </div>
  );
}