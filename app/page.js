"use client";
import { useState, useRef, useEffect } from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import Login from "./login";
import Preferences from "./preferences";
import { mentorAvatar } from "@/lib/avatar";

const MENTORS = {
  nova: { name: "Luna", role: "Dreamer", emoji: "🌙", accent: "#A78BFA", soft: "#EDE9FE", tagline: "Let's explore the stars and discover cool things!" },
  atlas: { name: "Ellie", role: "Scientist", emoji: "🦋", accent: "#34D399", soft: "#D1FAE5", tagline: "Every question is a fun little experiment!" },
  case: { name: "Pip", role: "Stargazer", emoji: "🦉", accent: "#60A5FA", soft: "#DBEAFE", tagline: "Let's solve mysteries under the moonlight!" },
};
const LEVELS = ["Kid", "Teen", "Adult"];
const EMOJIS = ["🌙", "⭐", "🪐", "🚀", "🦉", "🦋", "🐉", "🦄"];
const COLORS = [
  { accent: "#A78BFA", soft: "#EDE9FE" },
  { accent: "#34D399", soft: "#D1FAE5" },
  { accent: "#60A5FA", soft: "#DBEAFE" },
  { accent: "#F472B6", soft: "#FCE7F3" },
  { accent: "#FBBF24", soft: "#FEF3C7" },
];
const SUBJECTS = ["General", "Math", "Science", "English", "Coding", "Languages"];
const MODES = ["Learn", "Quiz", "Homework"];
const CHARACTER_URL = "https://lottie.host/b99ef145-b573-4305-9164-7f0bf1997d30/IeL2KG7tpc.lottie";

const BADGES = [
  { need: 1, emoji: "🌟", name: "First Star" },
  { need: 5, emoji: "🚀", name: "Rising Star" },
  { need: 15, emoji: "🪐", name: "Planet Explorer" },
  { need: 30, emoji: "☄️", name: "Comet" },
  { need: 50, emoji: "🌌", name: "Galaxy Master" },
];

function GalaxyBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden -z-0">
      <div className="absolute rounded-full" style={{ top: "6%", right: "8%", width: 90, height: 90,
        background: "radial-gradient(circle at 38% 35%, #FEFCE8, #FDE68A 55%, #FBBF24 85%)",
        boxShadow: "0 0 50px 16px #FDE68A55, inset -10px -8px 0 0 #00000015", animation: "moonGlow 6s ease-in-out infinite" }} />
      {Array.from({ length: 50 }).map((_, i) => (
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
        <div key={"f" + i} className="absolute text-lg sm:text-xl" style={{ top: `${(i * 27 + 15) % 90}%`, left: `${(i * 47 + 10) % 90}%`,
          animation: `floatG ${6 + i}s ease-in-out ${i * 0.5}s infinite`, opacity: 0.6 }}>{s}</div>
      ))}
    </div>
  );
}

function MentorAvatar({ mentor, size = 56 }) {
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <img src={mentorAvatar(mentor.name)} alt={mentor.name} className="w-full h-full rounded-2xl" style={{ background: mentor.soft }} />
      <div className="absolute -bottom-1 -right-1 rounded-full flex items-center justify-center ring-2 ring-[#241B47]"
        style={{ width: size * 0.42, height: size * 0.42, fontSize: size * 0.24, background: mentor.soft }}>
        {mentor.emoji}
      </div>
    </div>
  );
}

export default function Home() {
  const [mentor, setMentor] = useState(null);
  const [authUser, setAuthUser] = useState(undefined); // undefined = checking, null = logged out
  const [building, setBuilding] = useState(false);
  const [showBadges, setShowBadges] = useState(false);
  const [room, setRoom] = useState("home");
  const [savedMentors, setSavedMentors] = useState([]);
  const [student, setStudent] = useState("");
  const [level, setLevel] = useState("Kid");
  const [subject, setSubject] = useState("General");
  const [mode, setMode] = useState("Learn");
  const [muted, setMuted] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [listening, setListening] = useState(false);
  const [confetti, setConfetti] = useState(false);
  const [stars, setStars] = useState(0);
  const [newBadge, setNewBadge] = useState(null);
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

  const lastReply = [...messages].reverse().find((m) => m.role === "assistant")?.content || "";
  const displayName = authUser?.name || student;

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (d.user) {
          setAuthUser(d.user);
          const key = String(d.user.id);
          setStudent(key);
          setLevel(d.user.level || "Kid");
          if (d.user.subjects?.length) setSubject(d.user.subjects[0]);
          loadMentors(key);
          loadStars(key);
        } else {
          setAuthUser(null);
        }
      })
      .catch(() => setAuthUser(null));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    badge: () => { tone(659, 0.15); tone(880, 0.15, "sine", 0.16, 0.12); tone(1319, 0.3, "sine", 0.16, 0.26); },
  };
  function celebrate() {
    sfx.correct();
    setConfetti(true);
    setTimeout(() => setConfetti(false), 2200);
  }

  async function loadStars(nameArg) {
    const s = (nameArg ?? student).trim();
    if (!s) return;
    try {
      const r = await fetch(`/api/progress?student=${encodeURIComponent(s)}`);
      const d = await r.json();
      setStars(d.stars || 0);
    } catch {}
  }

  async function addStar() {
    const s = student.trim();
    if (!s) { setStars((v) => v + 1); return; }
    try {
      const r = await fetch("/api/progress", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ student: s, add: 1 }) });
      const d = await r.json();
      const newTotal = d.stars || stars + 1;
      const unlocked = BADGES.find((b) => b.need === newTotal);
      setStars(newTotal);
      if (unlocked) setTimeout(() => { setNewBadge(unlocked); sfx.badge(); }, 800);
    } catch { setStars((v) => v + 1); }
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
        alert("Microphone problem: " + e.error + ". Allow the mic in your browser settings.");
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

  async function logout() {
    sfx.tap();
    try { await fetch("/api/auth/logout", { method: "POST" }); } catch {}
    setAuthUser(null);
    setMentor(null);
    setMessages([]);
    setSavedMentors([]);
    setStudent("");
    setStars(0);
  }

  function start(m) {
    sfx.tap();
    setMentor(m);
    setMessages([]);
    setRoom("home");
  }

  function enterRoom(nm) {
    sfx.tap();
    setMode(nm);
    setRoom("chat");
    setMessages([]);
    const note = nm === "Quiz" ? `Let's start a ${subject} quiz! Ask me the first question.`
      : nm === "Homework" ? `Can you help me with my homework?`
      : `Let's learn something new in ${subject}!`;
    sendText(note, []);
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

  async function sendText(raw, base) {
    const text = (raw ?? input).trim();
    if (!text || loading) return;
    const history = base ?? messages;
    const next = [...history, { role: "user", content: text }];
    setMessages(next); setInput(""); setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next, mentor, student, studentName: displayName, subject, mode, level }),
      });
      const data = await res.json();
      let reply = data.reply || "Let's try that again — say it once more?";
      const isCorrect = reply.includes("[CORRECT]");
      reply = reply.replace("[CORRECT]", "").trim();
      setMessages((m) => [...m, { role: "assistant", content: reply }]);
      sfx.reply();
      speak(reply);
      if (isCorrect) { celebrate(); addStar(); }
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
      @keyframes moonGlow { 0%,100% { box-shadow: 0 0 50px 16px #FDE68A55, inset -10px -8px 0 0 #00000015; } 50% { box-shadow: 0 0 80px 26px #FDE68A77, inset -10px -8px 0 0 #00000015; } }
      @keyframes floatG { 0%,100% { transform: translateY(0) rotate(-6deg); } 50% { transform: translateY(-20px) rotate(6deg); } }
      @keyframes popIn { 0% { opacity: 0; transform: scale(0.85) translateY(10px); } 100% { opacity: 1; transform: scale(1) translateY(0); } }
      @keyframes bounceIn { 0% { transform: scale(0.6); opacity: 0; } 60% { transform: scale(1.08); opacity: 1; } 100% { transform: scale(1); } }
      @keyframes floatCard { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
      @keyframes popperBurst { 0% { transform: translate(0,0) rotate(0deg); opacity: 1; } 70% { opacity: 1; } 100% { transform: translate(var(--dx), calc(var(--dy) + 40vh)) rotate(720deg); opacity: 0; } }
      @keyframes popperShake { 0%,100% { transform: rotate(0deg) scale(1); } 25% { transform: rotate(-15deg) scale(1.2); } 75% { transform: rotate(15deg) scale(1.2); } }
      @keyframes badgePop { 0% { transform: scale(0) rotate(-30deg); opacity: 0; } 60% { transform: scale(1.2) rotate(10deg); opacity: 1; } 100% { transform: scale(1) rotate(0deg); } }
      @keyframes ring { 0% { transform: scale(0.7); opacity: 0.7; } 100% { transform: scale(1.8); opacity: 0; } }
      @keyframes riseUp { 0% { transform: translateY(0) scale(0.6); opacity: 0; } 20% { opacity: 1; } 100% { transform: translateY(-120px) scale(1.1); opacity: 0; } }
      @keyframes bubbleIn { 0% { transform: scale(0.8) translateY(8px); opacity: 0; } 100% { transform: scale(1) translateY(0); opacity: 1; } }
      .pop-in { animation: popIn 0.35s ease-out both; }
      .bounce-in { animation: bounceIn 0.5s cubic-bezier(0.34,1.56,0.64,1) both; }
      .float-card { animation: floatCard 4s ease-in-out infinite; }
      .badge-pop { animation: badgePop 0.7s cubic-bezier(0.34,1.56,0.64,1) both; }
      .bubble-in { animation: bubbleIn 0.4s ease-out both; }
      h1, h2, .font-title { font-family: var(--font-fredoka), sans-serif; }
      .no-scrollbar::-webkit-scrollbar { display: none; }
      .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
    `}</style>
  );

  const galaxyBg = { background: "radial-gradient(ellipse at 70% 15%, #3B2E63 0%, #241B47 30%, #150F2E 60%, #0A0718 100%)" };

  const Confetti = () => confetti ? (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      <div className="absolute bottom-2 left-2 text-4xl sm:text-5xl" style={{ animation: "popperShake 0.5s ease-out" }}>🎉</div>
      <div className="absolute bottom-2 right-2 text-4xl sm:text-5xl -scale-x-100" style={{ animation: "popperShake 0.5s ease-out" }}>🎉</div>
      {Array.from({ length: 50 }).map((_, i) => {
        const bits = ["🎊", "⭐", "🌟", "✨", "💜", "💛", "🩷", "🔵"];
        const fromLeft = i % 2 === 0;
        const angle = (Math.random() * 60 + 15);
        const dist = 160 + Math.random() * 320;
        const dx = Math.sin((angle * Math.PI) / 180) * dist;
        const dy = -(Math.cos((angle * Math.PI) / 180) * dist);
        return (
          <div key={i} className="absolute text-lg sm:text-xl" style={{
            bottom: "12px", [fromLeft ? "left" : "right"]: "12px",
            "--dx": `${fromLeft ? dx : -dx}px`, "--dy": `${dy}px`,
            animation: `popperBurst ${0.9 + Math.random() * 0.6}s cubic-bezier(0.15,0.7,0.4,1) forwards`,
          }}>{bits[i % bits.length]}</div>
        );
      })}
    </div>
  ) : null;

  const BadgePopup = () => newBadge ? (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-6" onClick={() => setNewBadge(null)}>
      <div className="badge-pop bg-white/10 backdrop-blur-xl rounded-[2rem] ring-1 ring-white/30 p-8 text-center max-w-xs">
        <div className="text-7xl mb-3">{newBadge.emoji}</div>
        <div className="text-violet-200 text-sm font-bold uppercase tracking-wide">New badge unlocked!</div>
        <div className="font-title text-2xl font-bold text-white mt-1">{newBadge.name}</div>
        <button onClick={() => setNewBadge(null)} className="mt-5 px-6 py-2.5 rounded-full font-bold text-violet-900 bg-white active:scale-95 transition">Awesome! 🎉</button>
      </div>
    </div>
  ) : null;

  const StarChip = () => (
    <button onClick={() => { sfx.tap(); setShowBadges(true); }} className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/15 ring-1 ring-white/30 text-white text-sm font-bold active:scale-95 transition shrink-0">
      ⭐ {stars}
    </button>
  );

  // ---------- Auth ----------
  if (authUser === undefined) {
    return (
      <div className="relative min-h-screen flex items-center justify-center" style={galaxyBg}>
        <div className="text-4xl animate-bounce">🌙</div>
      </div>
    );
  }
  if (authUser === null) {
    return (
      <Login
        onAuth={(user) => {
          setAuthUser(user);
          const key = String(user.id);
          setStudent(key);
          setLevel(user.level || "Kid");
          loadMentors(key);
          loadStars(key);
        }}
      />
    );
  }
  if (!authUser.subjects || authUser.subjects.length === 0) {
    return (
      <Preferences
        user={authUser}
        onDone={(updatedUser) => { setAuthUser(updatedUser); setSubject(updatedUser.subjects[0]); }}
      />
    );
  }

  // ---------- Badges screen ----------
  if (showBadges) {
    const nextBadge = BADGES.find((b) => stars < b.need);
    return (
      <div className="relative min-h-screen flex items-center justify-center p-4 sm:p-6" style={galaxyBg}>
        {styleBlock}<GalaxyBackground /><Confetti />
        <div className="relative z-10 w-full max-w-md pop-in">
          <button onClick={() => { sfx.tap(); setShowBadges(false); }} className="text-white/80 hover:text-white mb-3 font-semibold">← Back</button>
          <div className="bg-white/10 backdrop-blur-xl rounded-[1.75rem] p-6 shadow-2xl ring-1 ring-white/20 text-center">
            <div className="text-5xl mb-1">⭐</div>
            <div className="font-title text-3xl font-bold text-white">{stars} Stars</div>
            <p className="text-violet-200 text-sm mt-1">
              {nextBadge ? `${nextBadge.need - stars} more to unlock ${nextBadge.name} ${nextBadge.emoji}` : "You've earned every badge! 🌌"}
            </p>
            <div className="grid grid-cols-5 gap-2 mt-6">
              {BADGES.map((b) => {
                const earned = stars >= b.need;
                return (
                  <div key={b.name} className="flex flex-col items-center">
                    <div className={`w-full aspect-square rounded-2xl flex items-center justify-center text-2xl sm:text-3xl transition ${earned ? "bg-white/20 ring-2 ring-white/50" : "bg-white/5 ring-1 ring-white/10 opacity-40 grayscale"}`}>
                      {earned ? b.emoji : "🔒"}
                    </div>
                    <div className={`text-[9px] mt-1 font-semibold leading-tight ${earned ? "text-white" : "text-white/40"}`}>{b.name}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ---------- Builder screen ----------
  if (building) {
    const c = COLORS[cColor];
    return (
      <div className="relative min-h-screen flex items-center justify-center p-4 sm:p-6" style={galaxyBg}>
        {styleBlock}<GalaxyBackground /><Confetti />
        <div className="relative z-10 w-full max-w-lg pop-in">
          <button onClick={() => { sfx.tap(); setBuilding(false); }} className="text-white/80 hover:text-white mb-3 font-semibold">← Back</button>
          <div className="bg-white/10 backdrop-blur-xl rounded-[1.75rem] p-5 sm:p-6 shadow-2xl ring-1 ring-white/20">
            <div className="flex items-center gap-3 mb-5">
              <div className="bounce-in"><MentorAvatar mentor={{ name: cName || "Your buddy", soft: c.soft, emoji: cEmoji }} size={56} /></div>
              <div>
                <div className="font-title font-bold text-white text-lg">{cName || "Your buddy"}</div>
                <div className="text-xs font-bold uppercase tracking-wide" style={{ color: c.accent }}>Custom Buddy · Oxidium Mind</div>
              </div>
            </div>
            <label className="text-sm font-bold text-white/80">Name</label>
            <input value={cName} onChange={(e) => setCName(e.target.value)} placeholder="e.g. Zappy" className="w-full mt-1 mb-4 px-4 py-3 rounded-2xl bg-white/90 outline-none text-slate-700 text-base focus:ring-4 focus:ring-violet-400/50 transition" />
            <label className="text-sm font-bold text-white/80">Pick a look</label>
            <div className="grid grid-cols-4 gap-2 mt-1 mb-4">
              {EMOJIS.map((e) => (
                <button key={e} onClick={() => { sfx.tap(); setCEmoji(e); }} className={`h-12 rounded-2xl text-2xl flex items-center justify-center transition ${cEmoji === e ? "ring-2 ring-white scale-105 bg-white/20" : "ring-1 ring-white/30"}`}>{e}</button>
              ))}
            </div>
            <label className="text-sm font-bold text-white/80">Pick a color</label>
            <div className="flex gap-2 mt-1 mb-4">
              {COLORS.map((col, i) => (
                <button key={i} onClick={() => { sfx.tap(); setCColor(i); }} className={`w-11 h-11 rounded-full transition ${cColor === i ? "ring-2 ring-offset-2 ring-offset-transparent ring-white scale-105" : ""}`} style={{ background: col.accent }} />
              ))}
            </div>
            <label className="text-sm font-bold text-white/80">Describe your buddy&apos;s personality</label>
            <textarea value={cPersona} onChange={(e) => setCPersona(e.target.value)} rows={3} placeholder="e.g. A funny robot who loves space and tells silly jokes!" className="w-full mt-1 mb-5 px-4 py-3 rounded-2xl bg-white/90 outline-none text-slate-700 text-base resize-none focus:ring-4 focus:ring-violet-400/50 transition" />
            <button onClick={createMentor} disabled={!cName.trim()} className="w-full py-3.5 rounded-2xl font-bold text-white text-base disabled:opacity-40 shadow-lg active:scale-95 transition" style={{ background: c.accent }}>Create my buddy ✨</button>
          </div>
        </div>
      </div>
    );
  }

  // ---------- Picker screen ----------
  if (!mentor) {
    return (
      <div className="relative min-h-screen flex items-center justify-center p-4 sm:p-6" style={galaxyBg}>
        {styleBlock}<GalaxyBackground /><Confetti /><BadgePopup />
        <div className="relative z-10 w-full max-w-3xl pop-in py-6">
          <div className="flex justify-between items-center mb-2">
            <button onClick={logout} className="text-violet-200/70 hover:text-white text-xs font-semibold transition">Log out</button>
            <StarChip />
          </div>
          <div className="text-center">
            <div className="text-4xl sm:text-5xl mb-2 float-card">🌙</div>
            <h1 className="text-3xl sm:text-5xl font-bold text-white drop-shadow-lg tracking-tight px-2">{displayName ? `Hi ${displayName}!` : "Pick your buddy!"}</h1>
            <p className="text-violet-200 mt-2 font-medium text-sm sm:text-base px-4">Every buddy shares one caring Oxidium Mind ✨ — pick one to begin.</p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-6 sm:mt-8">
            {Object.entries(MENTORS).map(([key, m], idx) => (
              <button key={key} onClick={() => start(m)} className="bounce-in text-left bg-white/10 backdrop-blur-xl rounded-[1.4rem] p-4 sm:p-5 shadow-xl ring-1 ring-white/20 active:scale-95 hover:ring-white/50 transition-all" style={{ animationDelay: `${idx * 0.08}s` }}>
                <div className="mb-3"><MentorAvatar mentor={m} size={56} /></div>
                <div className="font-title font-bold text-white text-base sm:text-lg">{m.name}</div>
                <div className="text-[10px] sm:text-xs font-bold uppercase tracking-wide" style={{ color: m.accent }}>{m.role}</div>
                <p className="text-xs sm:text-sm text-violet-100/80 mt-1.5 leading-snug">{m.tagline}</p>
              </button>
            ))}
            <button onClick={() => { sfx.tap(); setBuilding(true); }} className="bounce-in flex flex-col items-center justify-center bg-white/5 border-2 border-dashed border-white/40 rounded-[1.4rem] p-4 sm:p-5 active:scale-95 transition-all" style={{ animationDelay: "0.24s" }}>
              <div className="text-3xl sm:text-4xl mb-2 float-card">✨</div>
              <div className="font-title font-bold text-white text-sm sm:text-base text-center">Create your own</div>
            </button>
            {savedMentors.map((m, i) => (
              <button key={"saved" + i} onClick={() => start(m)} className="bounce-in text-left bg-white/10 backdrop-blur-xl rounded-[1.4rem] p-4 sm:p-5 shadow-xl ring-1 ring-white/20 active:scale-95 transition-all">
                <div className="mb-3"><MentorAvatar mentor={m} size={56} /></div>
                <div className="font-title font-bold text-white text-base sm:text-lg">{m.name}</div>
                <div className="text-[10px] sm:text-xs font-bold uppercase tracking-wide" style={{ color: m.accent }}>Your buddy</div>
                <p className="text-xs sm:text-sm text-violet-100/80 mt-1.5 leading-snug">{m.personality?.slice(0, 36) || "Made just for you."}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ---------- HOME BASE ----------
  if (room === "home") {
    const tiles = [
      { emoji: "📚", label: "Learn", desc: "Explore & discover", color: "#A78BFA", onClick: () => enterRoom("Learn") },
      { emoji: "✏️", label: "Quiz", desc: "Earn stars ⭐", color: "#FBBF24", onClick: () => enterRoom("Quiz") },
      { emoji: "🎒", label: "Homework", desc: "Get help", color: "#34D399", onClick: () => enterRoom("Homework") },
      { emoji: "🎨", label: "My Buddy", desc: "Switch or create", color: "#F472B6", onClick: () => { sfx.tap(); setMentor(null); } },
      { emoji: "🏅", label: "Badges", desc: `${stars} stars`, color: "#60A5FA", onClick: () => { sfx.tap(); setShowBadges(true); } },
    ];
    return (
      <div className="relative min-h-screen flex flex-col items-center justify-center p-5" style={galaxyBg}>
        {styleBlock}<GalaxyBackground /><Confetti /><BadgePopup />
        <div className="relative z-10 w-full max-w-md">
          <div className="flex items-center justify-between mb-1">
            <button onClick={() => { sfx.tap(); setMentor(null); }} className="text-white/70 hover:text-white text-xl">←</button>
            <StarChip />
          </div>
          <div className="text-center mb-6 pop-in">
            <div className="w-28 h-28 mx-auto rounded-full flex items-center justify-center shadow-2xl float-card ring-2 ring-white/30" style={{ background: mentor.soft }}>
              <DotLottieReact src={CHARACTER_URL} loop autoplay style={{ width: "82%", height: "82%" }} />
            </div>
            <h1 className="font-title text-2xl sm:text-3xl font-bold text-white mt-3">Where to, {displayName || "explorer"}?</h1>
            <p className="text-violet-200 text-sm mt-1">Tap a planet to begin ✨</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {tiles.map((t, i) => (
              <button key={t.label} onClick={t.onClick} className="bounce-in flex flex-col items-center gap-2 active:scale-90 transition" style={{ animationDelay: `${i * 0.08}s` }}>
                <div className="float-card w-24 h-24 sm:w-28 sm:h-28 rounded-full flex items-center justify-center text-4xl shadow-2xl"
                  style={{ background: `radial-gradient(circle at 38% 32%, #ffffff40, ${t.color})`, boxShadow: `0 0 28px ${t.color}88`, animationDelay: `${i * 0.3}s` }}>
                  {t.emoji}
                </div>
                <div className="font-title font-bold text-white text-sm sm:text-base">{t.label}</div>
                <div className="text-[11px] text-violet-200 -mt-1">{t.desc}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ---------- IMMERSIVE CHAT ROOM ----------
  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden" style={galaxyBg}>
      {styleBlock}<GalaxyBackground /><Confetti /><BadgePopup />
      <header className="relative z-20 flex items-center gap-2 px-3 sm:px-4 py-3">
        <button onClick={() => { sfx.tap(); stopSpeaking(); stopListening(); setRoom("home"); }} className="w-10 h-10 rounded-xl bg-white/10 ring-1 ring-white/25 flex items-center justify-center text-lg shrink-0" title="Home">🏠</button>
        <div className="flex-1 text-center">
          <div className="font-title font-bold text-white leading-tight">{mentor.name}</div>
          <div className="text-[11px] font-medium" style={{ color: mentor.accent }}>{mode} · {subject}</div>
        </div>
        <StarChip />
        <button onClick={() => { sfx.tap(); setMuted((v) => { if (!v) stopSpeaking(); return !v; }); }} className="w-10 h-10 rounded-xl ring-1 ring-white/25 bg-white/10 flex items-center justify-center text-base shrink-0">
          {muted ? "🔇" : "🔊"}
        </button>
      </header>

      <div className="relative z-10 flex flex-col items-center pt-2 pb-3">
        <div className="relative flex items-center justify-center" style={{ width: 240, height: 240 }}>
          {speaking && [0, 1, 2].map((r) => (
            <div key={r} className="absolute rounded-full" style={{ width: 180, height: 180, border: `2px solid ${mentor.accent}`, animation: `ring 1.6s ease-out ${r * 0.5}s infinite` }} />
          ))}
          <div className="absolute rounded-full" style={{ width: 190, height: 190, background: mentor.accent, filter: "blur(38px)", opacity: speaking ? 0.55 : 0.28, transition: "opacity 0.3s" }} />
          {speaking && ["⭐", "✨", "💫", "🌟"].map((s, i) => (
            <div key={i} className="absolute text-xl" style={{ left: `${20 + i * 20}%`, bottom: "30%", animation: `riseUp ${1.8 + i * 0.3}s ease-out ${i * 0.4}s infinite` }}>{s}</div>
          ))}
          <div className="relative rounded-full flex items-center justify-center shadow-2xl float-card ring-4 ring-white/30" style={{ width: 200, height: 200, background: `radial-gradient(circle at 40% 35%, #ffffff55, ${mentor.soft})` }}>
            <DotLottieReact src={CHARACTER_URL} loop autoplay speed={speaking ? 1.5 : 0.7} style={{ width: "85%", height: "85%" }} />
          </div>
        </div>
        <div className="mt-1 text-xs font-bold text-violet-200 h-4">{listening ? "🎧 listening…" : speaking ? "💬 speaking…" : ""}</div>

        {lastReply && (
          <div key={lastReply} className="bubble-in relative mt-2 mx-4 max-w-md">
            <div className="bg-white/95 text-slate-700 px-5 py-3 rounded-3xl shadow-xl text-[15px] leading-relaxed text-center">{lastReply}</div>
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white/95 rotate-45" />
          </div>
        )}
        {loading && (
          <div className="mt-3 bg-white/95 px-4 py-3 rounded-3xl flex gap-1 shadow-lg">
            {[0, 1, 2].map((d) => <span key={d} className="w-2 h-2 rounded-full animate-bounce" style={{ background: mentor.accent, animationDelay: `${d * 0.15}s` }} />)}
          </div>
        )}
      </div>

      <div className="relative z-10 flex gap-2 pt-1 px-3 overflow-x-auto no-scrollbar justify-start sm:justify-center">
        {SUBJECTS.map((s) => (
          <button key={s} onClick={() => switchContext(null, s)} className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap shrink-0 transition ${subject === s ? "bg-white text-violet-800" : "bg-white/10 text-white ring-1 ring-white/25"}`}>{s}</button>
        ))}
      </div>

      <div ref={scrollRef} className="relative z-10 flex-1 overflow-y-auto px-4 py-2 space-y-2 max-w-2xl w-full mx-auto no-scrollbar">
        {messages.filter((m) => m.role === "user").slice(-3).map((m, i) => (
          <div key={i} className="flex justify-end pop-in">
            <div className="max-w-[80%] px-4 py-2 rounded-2xl rounded-br-md text-sm bg-violet-500/90 text-white shadow">{m.content}</div>
          </div>
        ))}
      </div>

      <div className="relative z-10 px-3 sm:px-4 pb-4 pt-1 max-w-2xl w-full mx-auto">
        <div className="flex items-end gap-2 bg-white/95 rounded-3xl p-2 shadow-2xl">
          <button onClick={listening ? stopListening : startListening} className={`w-11 h-11 rounded-2xl flex items-center justify-center text-lg shrink-0 transition-all ${listening ? "bg-red-500 text-white animate-pulse scale-110" : "ring-1 ring-slate-200 text-slate-600"}`} title={listening ? "Listening… tap to stop & send" : "Tap and talk"}>🎤</button>
          <textarea value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }} rows={1} placeholder={listening ? "Listening…" : `Talk to ${mentor.name}…`} className="flex-1 resize-none outline-none bg-transparent px-2 py-2.5 text-slate-700 text-base max-h-24" />
          <button onClick={() => { sfx.tap(); send(); }} disabled={loading || !input.trim()} className="px-4 py-2.5 rounded-2xl font-bold text-white text-sm disabled:opacity-40 shadow-md active:scale-95 transition shrink-0" style={{ background: mentor.accent }}>Send</button>
        </div>
      </div>
    </div>
  );
}