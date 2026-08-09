"use client";
import { useState, useRef, useEffect } from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import Welcome from "./welcome";

const MENTORS = {
  nova: { name: "Luna", role: "Dreamer", emoji: "🌙", accent: "#A78BFA", soft: "#EDE9FE", tagline: "Let's explore the stars and discover cool things!" },
  atlas: { name: "Ellie", role: "Scientist", emoji: "🦋", accent: "#34D399", soft: "#D1FAE5", tagline: "Every question is a fun little experiment!" },
  case: { name: "Pip", role: "Stargazer", emoji: "🦉", accent: "#60A5FA", soft: "#DBEAFE", tagline: "Let's solve mysteries under the moonlight!" },
};
const GRADES = [1, 2, 3, 4, 5, 6, 7, 8];
const EMOJIS = ["🌙", "⭐", "🪐", "🚀", "🦉", "🦋", "🐉", "🦄"];
const COLORS = [
  { accent: "#A78BFA", soft: "#EDE9FE" },
  { accent: "#34D399", soft: "#D1FAE5" },
  { accent: "#60A5FA", soft: "#DBEAFE" },
  { accent: "#F472B6", soft: "#FCE7F3" },
  { accent: "#FBBF24", soft: "#FEF3C7" },
];
const SUBJECTS = ["General", "Math", "Science", "English", "Social Studies", "GK"];
const MODES = ["Learn", "Quiz", "Homework"];
const CHARACTER_URL = "https://lottie.host/b99ef145-b573-4305-9164-7f0bf1997d30/IeL2KG7tpc.lottie";

function GalaxyBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden -z-0">
      <div className="absolute rounded-full" style={{ top: "8%", right: "10%", width: 120, height: 120,
        background: "radial-gradient(circle at 38% 35%, #FEFCE8, #FDE68A 55%, #FBBF24 85%)",
        boxShadow: "0 0 60px 20px #FDE68A55, inset -12px -10px 0 0 #00000015", animation: "moonGlow 6s ease-in-out infinite" }} />
      {Array.from({ length: 60 }).map((_, i) => (
        <div key={i} className="absolute rounded-full bg-white"
          style={{ width: i % 4 === 0 ? 3 : 2, height: i % 4 === 0 ? 3 : 2, top: `${(i * 17) % 100}%`, left: `${(i * 41) % 100}%`,
            animation: `twinkle3 ${2 + (i % 5)}s ease-in-out ${(i % 10) * 0.3}s infinite` }} />
      ))}
      {[0, 1, 2].map((n) => (
        <div key={"sh" + n} className="absolute" style={{ top: `${10 + n * 22}%`, left: "-10%",
          animation: `shoot ${5 + n}s linear ${n * 3}s infinite` }}>
          <div style={{ width: 90, height: 2, background: "linear-gradient(90deg, transparent, #fff)", borderRadius: 2, boxShadow: "0 0 8px #fff" }} />
        </div>
      ))}
      {["✨", "💫", "⭐", "🌟"].map((s, i) => (
        <div key={"f" + i} className="absolute text-xl" style={{ top: `${(i * 27 + 15) % 90}%`, left: `${(i * 47 + 10) % 90}%`,
          animation: `floatG ${6 + i}s ease-in-out ${i * 0.5}s infinite`, opacity: 0.7 }}>{s}</div>
      ))}
    </div>
  );
}

export default function Home() {
  const [mentor, setMentor] = useState(null);
  const [welcomed, setWelcomed] = useState(false);
  const [building, setBuilding] = useState(false);
  const [savedMentors, setSavedMentors] = useState([]);
  const [student, setStudent] = useState("");
  const [grade, setGrade] = useState(3);
  const [subject, setSubject] = useState("General");
  const [mode, setMode] = useState("Learn");
  const [muted, setMuted] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [listening, setListening] = useState(false);
  const [confetti, setConfetti] = useState(false);
  const recognitionRef = useRef(null);
  const wantListeningRef = useRef(false);
  const finalTextRef = useRef("");
  const audioCtxRef = useRef(null);
  const [cName, setCName] = useState("");
  const [cEmoji, setCEmoji] = useState(EMOJIS[0]);
  const [cColor, setCColor] = useState(0);
  const [cPersona, setCPersona] = useState("");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => { scrollRef.current?.scrollTo({ top: 999999, behavior: "smooth" }); }, [messages, loading]);

  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
    }
  }, []);

  function tone(freq, dur = 0.12, type = "sine", vol = 0.15, delay = 0) {
    try {
      if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      const ctx = audioCtxRef.current;
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = type; o.frequency.value = freq;
      o.connect(g); g.connect(ctx.destination);
      const t = ctx.currentTime + delay;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(vol, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.start(t); o.stop(t + dur);
    } catch {}
  }
  const sfx = {
    tap: () => tone(660, 0.09, "triangle", 0.12),
    reply: () => { tone(523, 0.12, "sine", 0.14); tone(784, 0.14, "sine", 0.12, 0.08); },
    correct: () => { tone(523, 0.12); tone(659, 0.12, "sine", 0.15, 0.1); tone(988, 0.2, "sine", 0.15, 0.2); },
  };
  function celebrate() {
    sfx.correct();
    setConfetti(true);
    setTimeout(() => setConfetti(false), 2200);
  }

  function pickVoice() {
    const voices = window.speechSynthesis.getVoices();
    const wanted = ["Google UK English Female", "Microsoft Aria", "Microsoft Jenny", "Samantha", "Google US English", "Microsoft Zira"];
    for (const name of wanted) { const v = voices.find((vo) => vo.name.includes(name)); if (v) return v; }
    const fem = voices.find((vo) => /female/i.test(vo.name) && /en/i.test(vo.lang));
    if (fem) return fem;
    return voices.find((vo) => /en/i.test(vo.lang)) || voices[0];
  }

  function speak(text) {
    if (muted || typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const clean = text.replace(/[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}]/gu, "");
    const u = new SpeechSynthesisUtterance(clean);
    const v = pickVoice(); if (v) u.voice = v;
    u.rate = 0.95; u.pitch = 1.1;
    u.onstart = () => setSpeaking(true);
    u.onend = () => setSpeaking(false);
    u.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(u);
  }

  function stopSpeaking() {
    if (typeof window !== "undefined" && window.speechSynthesis) window.speechSynthesis.cancel();
    setSpeaking(false);
  }

  function startListening() {
    if (typeof window === "undefined") return;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { alert("Voice input isn't supported in this browser. Please use Chrome."); return; }
    stopSpeaking();
    finalTextRef.current = "";
    wantListeningRef.current = true;
    const rec = new SR();
    rec.lang = "en-US"; rec.interimResults = true; rec.continuous = true;
    rec.onstart = () => setListening(true);
    rec.onerror = (e) => {
      console.log("Mic error:", e.error);
      if (["not-allowed", "service-not-allowed", "audio-capture"].includes(e.error)) {
        wantListeningRef.current = false; setListening(false);
        alert("Microphone problem: " + e.error + ". Allow the mic in Chrome's address-bar icon and check Windows mic settings.");
      }
    };
    rec.onend = () => { if (wantListeningRef.current) { try { rec.start(); } catch {} } else setListening(false); };
    rec.onresult = (e) => {
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) finalTextRef.current += t + " "; else interim += t;
      }
      setInput((finalTextRef.current + interim).trim());
    };
    recognitionRef.current = rec;
    try { rec.start(); } catch {}
  }

  function stopListening() {
    wantListeningRef.current = false;
    recognitionRef.current?.stop();
    setListening(false);
    setTimeout(() => sendText(), 300);
  }

  async function loadMentors(nameArg) {
    const s = (nameArg ?? student).trim();
    if (!s) return;
    try {
      const r = await fetch(`/api/mentors?student=${encodeURIComponent(s)}`);
      const d = await r.json();
      setSavedMentors(d.mentors || []);
    } catch {}
  }

  function start(m) {
    sfx.tap();
    setMentor(m);
    const hi = student ? `Hi ${student}! I'm ${m.name}.` : `Hi! I'm ${m.name}.`;
    const greeting = `${hi} ${m.tagline || ""} What would you like to figure out today?`;
    setMessages([{ role: "assistant", content: greeting }]);
    sfx.reply();
    speak(greeting);
  }

  async function createMentor() {
    if (!cName.trim()) return;
    const c = COLORS[cColor];
    const m = { name: cName.trim(), role: "Custom Buddy", emoji: cEmoji, accent: c.accent, soft: c.soft, personality: cPersona.trim(), tagline: "Made just for you." };
    if (student.trim()) {
      try {
        await fetch("/api/mentors", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ student: student.trim(), mentor: m }) });
        setSavedMentors((prev) => [m, ...prev]);
      } catch {}
    }
    celebrate();
    start(m);
    setBuilding(false);
  }

  async function sendText(raw) {
    const text = (raw ?? input).trim();
    if (!text || loading) return;
    const next = [...messages, { role: "user", content: text }];
    setMessages(next); setInput(""); setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next, mentor, grade, student, subject, mode }),
      });
      const data = await res.json();
      let reply = data.reply || "Let's try that again — say it once more?";
      const isCorrect = reply.includes("[CORRECT]");
      reply = reply.replace("[CORRECT]", "").trim();
      setMessages((m) => [...m, { role: "assistant", content: reply }]);
      sfx.reply();
      speak(reply);
      if (isCorrect) celebrate();
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: "I lost my train of thought. Send that again?" }]);
    } finally { setLoading(false); }
  }

  function send() { sendText(); }

  function switchContext(newMode, newSubject) {
    sfx.tap();
    const nm = newMode ?? mode;
    const ns = newSubject ?? subject;
    setMode(nm); setSubject(ns);
    const note = nm === "Quiz" ? `Let's do a ${ns} quiz! Ask me your first question.` : nm === "Homework" ? `I need homework help with ${ns}.` : `Let's learn some ${ns}.`;
    sendText(note);
  }

  const styleBlock = (
    <style jsx global>{`
      @keyframes twinkle3 { 0%,100% { opacity: 0.2; } 50% { opacity: 1; } }
      @keyframes shoot { 0% { transform: translate(0,0) rotate(18deg); opacity: 0; } 8% { opacity: 1; } 22% { opacity: 1; } 40%,100% { transform: translate(130vw, 40vh) rotate(18deg); opacity: 0; } }
      @keyframes moonGlow { 0%,100% { box-shadow: 0 0 60px 20px #FDE68A55, inset -12px -10px 0 0 #00000015; } 50% { box-shadow: 0 0 90px 30px #FDE68A77, inset -12px -10px 0 0 #00000015; } }
      @keyframes floatG { 0%,100% { transform: translateY(0) rotate(-6deg); } 50% { transform: translateY(-20px) rotate(6deg); } }
      @keyframes popIn { 0% { opacity: 0; transform: scale(0.85) translateY(10px); } 100% { opacity: 1; transform: scale(1) translateY(0); } }
      @keyframes wiggle { 0%,100% { transform: rotate(-2deg); } 50% { transform: rotate(2deg); } }
      @keyframes bounceIn { 0% { transform: scale(0.6); opacity: 0; } 60% { transform: scale(1.08); opacity: 1; } 100% { transform: scale(1); } }
      @keyframes floatCard { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
      @keyframes popperBurst { 0% { transform: translate(0,0) rotate(0deg); opacity: 1; } 70% { opacity: 1; } 100% { transform: translate(var(--dx), calc(var(--dy) + 40vh)) rotate(720deg); opacity: 0; } }
      @keyframes popperShake { 0%,100% { transform: rotate(0deg) scale(1); } 25% { transform: rotate(-15deg) scale(1.2); } 75% { transform: rotate(15deg) scale(1.2); } }
      .pop-in { animation: popIn 0.35s ease-out both; }
      .wiggle-hover:hover { animation: wiggle 0.4s ease-in-out; }
      .bounce-in { animation: bounceIn 0.5s cubic-bezier(0.34,1.56,0.64,1) both; }
      .float-card { animation: floatCard 4s ease-in-out infinite; }
      h1, h2, .font-title { font-family: var(--font-fredoka), sans-serif; }
    `}</style>
  );

  const galaxyBg = { background: "radial-gradient(ellipse at 70% 15%, #3B2E63 0%, #241B47 30%, #150F2E 60%, #0A0718 100%)" };

  const Confetti = () => confetti ? (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      <div className="absolute bottom-2 left-2 text-5xl" style={{ animation: "popperShake 0.5s ease-out" }}>🎉</div>
      <div className="absolute bottom-2 right-2 text-5xl -scale-x-100" style={{ animation: "popperShake 0.5s ease-out" }}>🎉</div>
      {Array.from({ length: 60 }).map((_, i) => {
        const bits = ["🎊", "⭐", "🌟", "✨", "💜", "💛", "🩷", "🔵"];
        const fromLeft = i % 2 === 0;
        const angle = (Math.random() * 60 + 15);
        const dist = 200 + Math.random() * 400;
        const dx = Math.sin((angle * Math.PI) / 180) * dist;
        const dy = -(Math.cos((angle * Math.PI) / 180) * dist);
        return (
          <div key={i} className="absolute text-xl" style={{
            bottom: "12px", [fromLeft ? "left" : "right"]: "12px",
            "--dx": `${fromLeft ? dx : -dx}px`, "--dy": `${dy}px`,
            animation: `popperBurst ${0.9 + Math.random() * 0.6}s cubic-bezier(0.15,0.7,0.4,1) forwards`,
          }}>{bits[i % bits.length]}</div>
        );
      })}
    </div>
  ) : null;

  // ---------- Welcome ----------
  if (!welcomed) {
    return <Welcome onStart={(nm) => { setStudent(nm); loadMentors(nm); setWelcomed(true); }} />;
  }

  // ---------- Builder screen ----------
  if (building) {
    const c = COLORS[cColor];
    return (
      <div className="relative min-h-screen flex items-center justify-center p-6" style={galaxyBg}>
        {styleBlock}<GalaxyBackground /><Confetti />
        <div className="relative z-10 w-full max-w-lg pop-in">
          <button onClick={() => { sfx.tap(); setBuilding(false); }} className="text-white/80 hover:text-white mb-4 font-semibold">← Back</button>
          <div className="bg-white/10 backdrop-blur-xl rounded-[2rem] p-6 shadow-2xl ring-1 ring-white/20">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl bounce-in" style={{ background: c.soft }}>{cEmoji}</div>
              <div>
                <div className="font-title font-bold text-white text-lg">{cName || "Your buddy"}</div>
                <div className="text-xs font-bold uppercase tracking-wide" style={{ color: c.accent }}>Custom Buddy</div>
              </div>
            </div>
            <label className="text-sm font-bold text-white/80">Name</label>
            <input value={cName} onChange={(e) => setCName(e.target.value)} placeholder="e.g. Zappy" className="w-full mt-1 mb-4 px-4 py-2.5 rounded-2xl bg-white/90 outline-none text-slate-700 focus:ring-4 focus:ring-violet-400/50 transition" />
            <label className="text-sm font-bold text-white/80">Pick a look</label>
            <div className="flex gap-2 mt-1 mb-4 flex-wrap">
              {EMOJIS.map((e) => (
                <button key={e} onClick={() => { sfx.tap(); setCEmoji(e); }} className={`w-11 h-11 rounded-2xl text-xl flex items-center justify-center transition wiggle-hover ${cEmoji === e ? "ring-2 ring-white scale-110 bg-white/20" : "ring-1 ring-white/30"}`}>{e}</button>
              ))}
            </div>
            <label className="text-sm font-bold text-white/80">Pick a color</label>
            <div className="flex gap-2 mt-1 mb-4">
              {COLORS.map((col, i) => (
                <button key={i} onClick={() => { sfx.tap(); setCColor(i); }} className={`w-10 h-10 rounded-full transition wiggle-hover ${cColor === i ? "ring-2 ring-offset-2 ring-offset-transparent ring-white scale-110" : ""}`} style={{ background: col.accent }} />
              ))}
            </div>
            <label className="text-sm font-bold text-white/80">Describe your buddy's personality</label>
            <textarea value={cPersona} onChange={(e) => setCPersona(e.target.value)} rows={3} placeholder="e.g. A funny robot who loves space, tells silly jokes, and cheers me on!" className="w-full mt-1 mb-5 px-4 py-2.5 rounded-2xl bg-white/90 outline-none text-slate-700 resize-none focus:ring-4 focus:ring-violet-400/50 transition" />
            <button onClick={createMentor} disabled={!cName.trim()} className="w-full py-3.5 rounded-2xl font-bold text-white disabled:opacity-40 shadow-lg hover:scale-[1.02] active:scale-95 transition" style={{ background: c.accent }}>Create my buddy ✨</button>
          </div>
        </div>
      </div>
    );
  }

  // ---------- Picker screen ----------
  if (!mentor) {
    return (
      <div className="relative min-h-screen flex items-center justify-center p-6" style={galaxyBg}>
        {styleBlock}<GalaxyBackground /><Confetti />
        <div className="relative z-10 w-full max-w-3xl pop-in">
          <div className="text-center">
            <div className="text-5xl mb-2 float-card">🌙</div>
            <h1 className="text-4xl sm:text-5xl font-bold text-white drop-shadow-lg tracking-tight">{student ? `Hi ${student}! Pick your buddy` : "Pick your buddy!"}</h1>
            <p className="text-violet-200 mt-2 font-medium">A friend who helps you explore and learn under the stars.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
            {Object.entries(MENTORS).map(([key, m], idx) => (
              <button key={key} onClick={() => start(m)} className="bounce-in float-card text-left bg-white/10 backdrop-blur-xl rounded-[1.6rem] p-5 shadow-xl ring-1 ring-white/20 hover:ring-white/50 hover:-translate-y-2 transition-all" style={{ animationDelay: `${idx * 0.08}s` }}>
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-4 wiggle-hover" style={{ background: m.soft }}>{m.emoji}</div>
                <div className="font-title font-bold text-white text-lg">{m.name}</div>
                <div className="text-xs font-bold uppercase tracking-wide" style={{ color: m.accent }}>{m.role}</div>
                <p className="text-sm text-violet-100/80 mt-2">{m.tagline}</p>
              </button>
            ))}
            <button onClick={() => { sfx.tap(); setBuilding(true); }} className="bounce-in flex flex-col items-center justify-center bg-white/5 border-2 border-dashed border-white/40 rounded-[1.6rem] p-5 hover:bg-white/15 hover:-translate-y-2 transition-all" style={{ animationDelay: "0.24s" }}>
              <div className="text-4xl mb-2 float-card">✨</div>
              <div className="font-title font-bold text-white">Create your own</div>
              <p className="text-xs text-violet-200 mt-1 text-center">Make a buddy that's totally yours</p>
            </button>
            {savedMentors.map((m, i) => (
              <button key={"saved" + i} onClick={() => start(m)} className="bounce-in float-card text-left bg-white/10 backdrop-blur-xl rounded-[1.6rem] p-5 shadow-xl ring-1 ring-white/20 hover:ring-white/50 hover:-translate-y-2 transition-all">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-4 wiggle-hover" style={{ background: m.soft }}>{m.emoji}</div>
                <div className="font-title font-bold text-white text-lg">{m.name}</div>
                <div className="text-xs font-bold uppercase tracking-wide" style={{ color: m.accent }}>Your buddy</div>
                <p className="text-sm text-violet-100/80 mt-2">{m.personality?.slice(0, 40) || "Made just for you."}</p>
              </button>
            ))}
          </div>
          <div className="mt-6 flex items-center justify-center gap-2 flex-wrap">
            <span className="text-sm text-violet-200 mr-1 font-medium">I'm in Class</span>
            {GRADES.map((g) => (
              <button key={g} onClick={() => { sfx.tap(); setGrade(g); }} className={`w-9 h-9 rounded-full text-sm font-bold transition wiggle-hover ${grade === g ? "bg-white text-violet-700 scale-110" : "bg-white/15 text-white ring-1 ring-white/30"}`}>{g}</button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ---------- Chat screen ----------
  return (
    <div className="relative min-h-screen flex flex-col" style={galaxyBg}>
      {styleBlock}<GalaxyBackground /><Confetti />
      <header className="relative z-10 flex items-center gap-3 px-4 py-3 bg-white/10 backdrop-blur-xl ring-1 ring-white/20">
        <button onClick={() => { sfx.tap(); stopSpeaking(); stopListening(); setMentor(null); }} className="text-white/70 hover:text-white text-lg">←</button>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ background: mentor.soft }}>{mentor.emoji}</div>
        <div className="leading-tight flex-1">
          <div className="font-title font-bold text-white">{mentor.name}</div>
          <div className="text-xs font-medium" style={{ color: mentor.accent }}>{mentor.role} · Class {grade}{student ? ` · ${student}` : ""}</div>
        </div>
        <button onClick={() => { sfx.tap(); setMuted((v) => { if (!v) stopSpeaking(); return !v; }); }} className="w-10 h-10 rounded-xl ring-1 ring-white/30 bg-white/10 flex items-center justify-center text-lg wiggle-hover" title={muted ? "Turn voice on" : "Turn voice off"}>
          {muted ? "🔇" : "🔊"}
        </button>
      </header>

      <div className="relative z-10 flex justify-center gap-2 pt-3">
        {MODES.map((md) => (
          <button key={md} onClick={() => switchContext(md, null)} className={`px-4 py-1.5 rounded-full text-sm font-bold transition wiggle-hover ${mode === md ? "text-violet-900 bg-white scale-105 shadow-md" : "bg-white/15 text-white ring-1 ring-white/30"}`}>{md}</button>
        ))}
      </div>

      <div className="relative z-10 flex justify-center gap-2 pt-2 flex-wrap px-4">
        {SUBJECTS.map((s) => (
          <button key={s} onClick={() => switchContext(null, s)} className={`px-3 py-1 rounded-full text-xs font-semibold transition ${subject === s ? "bg-white text-violet-800" : "bg-white/10 text-white ring-1 ring-white/25"}`}>{s}</button>
        ))}
      </div>

      <div className="relative z-10 flex flex-col items-center pt-2 pb-1">
        <div className={`w-32 h-32 rounded-full flex items-center justify-center shadow-2xl float-card ${speaking ? "ring-4 ring-white/70" : "ring-2 ring-white/30"}`} style={{ background: mentor.soft }}>
          <DotLottieReact src={CHARACTER_URL} loop autoplay speed={speaking ? 1.4 : 0.7} style={{ width: "110px", height: "110px" }} />
        </div>
        <div className="mt-1 text-xs font-bold text-violet-200">{listening ? "listening…" : speaking ? "speaking…" : "\u00A0"}</div>
      </div>

      <div ref={scrollRef} className="relative z-10 flex-1 overflow-y-auto px-4 py-2 space-y-4 max-w-2xl w-full mx-auto">
        {messages.map((m, i) => (
          <div key={i} className={`flex pop-in ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] px-4 py-3 rounded-3xl text-[15px] leading-relaxed shadow-lg ${m.role === "user" ? "bg-violet-500 text-white rounded-br-lg" : "bg-white/95 text-slate-700 rounded-bl-lg"}`}>{m.content}</div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white/95 px-4 py-3 rounded-3xl rounded-bl-lg flex gap-1 shadow-lg">
              {[0, 1, 2].map((d) => <span key={d} className="w-2 h-2 rounded-full animate-bounce" style={{ background: mentor.accent, animationDelay: `${d * 0.15}s` }} />)}
            </div>
          </div>
        )}
      </div>

      <div className="relative z-10 px-4 pb-6 pt-2 max-w-2xl w-full mx-auto">
        <div className="flex items-end gap-2 bg-white/95 rounded-3xl p-2 shadow-2xl">
          <button onClick={listening ? stopListening : startListening} className={`w-11 h-11 rounded-2xl flex items-center justify-center text-lg shrink-0 transition-all ${listening ? "bg-red-500 text-white animate-pulse scale-110" : "ring-1 ring-slate-200 text-slate-600 wiggle-hover"}`} title={listening ? "Listening… tap to stop & send" : "Tap and talk"}>🎤</button>
          <textarea value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }} rows={1} placeholder={listening ? "Listening… tap mic again when done" : `Ask ${mentor.name} anything…`} className="flex-1 resize-none outline-none bg-transparent px-2 py-2 text-slate-700 max-h-32" />
          <button onClick={() => { sfx.tap(); send(); }} disabled={loading || !input.trim()} className="px-5 py-2.5 rounded-2xl font-bold text-white disabled:opacity-40 shadow-md hover:scale-105 active:scale-95 transition" style={{ background: mentor.accent }}>Send</button>
        </div>
        <p className="text-center text-[11px] text-violet-200 mt-2 font-medium">{mentor.name} helps you learn — parents & teachers are part of the team 💜</p>
      </div>
    </div>
  );
}