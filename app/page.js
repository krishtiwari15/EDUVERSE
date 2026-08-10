"use client";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import {
  Home as HomeIcon, ArrowLeft, LogOut, Award, Lock, Mic, MicOff, Volume2, VolumeX,
  Send, Sparkles, PencilLine, Backpack, Users, GraduationCap, Compass,
  BarChart3, Play, Palette,
} from "lucide-react";
import Login from "./login";
import Preferences from "./preferences";
import { mentorAvatar } from "@/lib/avatar";
import { Button, Surface, Badge, ProgressBar, Section, Reveal, RevealGroup, RevealItem } from "@/components/ui";

const MENTORS = {
  nova: { name: "Luna", role: "Dreamer", emoji: "🌙", accent: "#A78BFA", soft: "#EDE9FE", tagline: "Let's explore the stars and discover cool things!" },
  atlas: { name: "Ellie", role: "Scientist", emoji: "🦋", accent: "#34D399", soft: "#D1FAE5", tagline: "Every question is a fun little experiment!" },
  case: { name: "Pip", role: "Stargazer", emoji: "🦉", accent: "#60A5FA", soft: "#DBEAFE", tagline: "Let's solve mysteries under the moonlight!" },
};
const EMOJIS = ["🌙", "⭐", "🪐", "🚀", "🦉", "🦋", "🐉", "🦄"];
const COLORS = [
  { accent: "#A78BFA", soft: "#EDE9FE" },
  { accent: "#34D399", soft: "#D1FAE5" },
  { accent: "#60A5FA", soft: "#DBEAFE" },
  { accent: "#F472B6", soft: "#FCE7F3" },
  { accent: "#FBBF24", soft: "#FEF3C7" },
];
const SUBJECTS = ["General", "Math", "Science", "English", "Coding", "Languages"];
const CHARACTER_URL = "https://lottie.host/b99ef145-b573-4305-9164-7f0bf1997d30/IeL2KG7tpc.lottie";

const BADGES = [
  { need: 1, emoji: "🌟", name: "First Star" },
  { need: 5, emoji: "🚀", name: "Rising Star" },
  { need: 15, emoji: "🪐", name: "Planet Explorer" },
  { need: 30, emoji: "☄️", name: "Comet" },
  { need: 50, emoji: "🌌", name: "Galaxy Master" },
];

const STARTER_PROMPTS = {
  Learn: ["Explain it simply", "Give me a real example", "Why does this matter?"],
  Quiz: ["I'm ready, ask me!", "Make it a bit harder", "Give me a hint"],
  Homework: ["Here's my problem", "I'm stuck on step one", "Check my answer"],
};

const ROADMAP = [
  { icon: Users, title: "Parent Copilot", desc: "Plain-language updates on your child's progress." },
  { icon: GraduationCap, title: "Teacher Copilot", desc: "AI-assisted lesson & assignment creation." },
  { icon: Compass, title: "Opportunities", desc: "Scholarships, competitions & programs, matched to you." },
  { icon: BarChart3, title: "Deep Analytics", desc: "The full story behind your learning streak." },
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
      <img src={mentorAvatar(mentor.name)} alt="" className="w-full h-full rounded-2xl" style={{ background: mentor.soft }} />
      <div className="absolute -bottom-1 -right-1 rounded-full flex items-center justify-center ring-2 ring-[#241B47]"
        style={{ width: size * 0.42, height: size * 0.42, fontSize: size * 0.24, background: mentor.soft }}>
        {mentor.emoji}
      </div>
    </div>
  );
}

const CONFETTI_BITS = ["🎊", "⭐", "🌟", "✨", "💜", "💛", "🩷", "🔵"];

function Confetti({ particles }) {
  if (!particles) return null;
  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      <div className="absolute bottom-2 left-2 text-4xl sm:text-5xl" style={{ animation: "popperShake 0.5s ease-out" }}>🎉</div>
      <div className="absolute bottom-2 right-2 text-4xl sm:text-5xl -scale-x-100" style={{ animation: "popperShake 0.5s ease-out" }}>🎉</div>
      {particles.map((p, i) => (
        <div key={i} className="absolute text-lg sm:text-xl" style={{
          bottom: "12px", [p.fromLeft ? "left" : "right"]: "12px",
          "--dx": `${p.dx}px`, "--dy": `${p.dy}px`,
          animation: `popperBurst ${p.duration}s cubic-bezier(0.15,0.7,0.4,1) forwards`,
        }}>{CONFETTI_BITS[i % CONFETTI_BITS.length]}</div>
      ))}
    </div>
  );
}

function BadgePopup({ badge, onClose }) {
  if (!badge) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-6" onClick={onClose}>
      <motion.div initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", damping: 16, stiffness: 220 }}
        className="glass-card-elevated p-8 text-center max-w-xs" onClick={(e) => e.stopPropagation()}>
        <div className="text-7xl mb-3">{badge.emoji}</div>
        <div className="text-eyebrow text-[var(--color-gold)]">New badge unlocked!</div>
        <div className="text-display text-white mt-1">{badge.name}</div>
        <Button variant="primary" size="md" onClick={onClose} className="mt-5 w-full">Awesome!</Button>
      </motion.div>
    </div>
  );
}

function StarChip({ stars, onClick }) {
  return (
    <button onClick={onClick} aria-label={`${stars} stars earned — view progress`} className="focus-ring flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-pill)] bg-white/15 ring-1 ring-white/30 text-white text-sm font-bold active:scale-95 transition shrink-0">
      <span className="text-[var(--color-gold)]">★</span> {stars}
    </button>
  );
}

function IconButton({ icon: Icon, active, activeIcon: ActiveIcon, label, className = "", ...props }) {
  const Shown = active && ActiveIcon ? ActiveIcon : Icon;
  return (
    <button aria-label={label} title={label} className={`focus-ring w-11 h-11 rounded-xl ring-1 ring-white/25 bg-white/10 hover:bg-white/15 flex items-center justify-center shrink-0 transition ${className}`} {...props}>
      <Shown size={18} strokeWidth={2} className="text-white" />
    </button>
  );
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
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
  const [confettiBurst, setConfettiBurst] = useState(null);
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
  function makeConfettiBurst() {
    // Randomness belongs here, in an event handler — not in any render
    // path — so the rendered particles are a pure function of props.
    return Array.from({ length: 50 }).map((_, i) => {
      const fromLeft = i % 2 === 0;
      const angle = Math.random() * 60 + 15;
      const dist = 160 + Math.random() * 320;
      const dx = Math.sin((angle * Math.PI) / 180) * dist;
      const dy = -(Math.cos((angle * Math.PI) / 180) * dist);
      return { fromLeft, dx: fromLeft ? dx : -dx, dy, duration: 0.9 + Math.random() * 0.6 };
    });
  }

  function celebrate() {
    sfx.correct();
    setConfettiBurst(makeConfettiBurst());
    setTimeout(() => setConfettiBurst(null), 2200);
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
      @keyframes floatCard { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
      @keyframes popperBurst { 0% { transform: translate(0,0) rotate(0deg); opacity: 1; } 70% { opacity: 1; } 100% { transform: translate(var(--dx), calc(var(--dy) + 40vh)) rotate(720deg); opacity: 0; } }
      @keyframes popperShake { 0%,100% { transform: rotate(0deg) scale(1); } 25% { transform: rotate(-15deg) scale(1.2); } 75% { transform: rotate(15deg) scale(1.2); } }
      @keyframes ring { 0% { transform: scale(0.7); opacity: 0.7; } 100% { transform: scale(1.8); opacity: 0; } }
      @keyframes riseUp { 0% { transform: translateY(0) scale(0.6); opacity: 0; } 20% { opacity: 1; } 100% { transform: translateY(-120px) scale(1.1); opacity: 0; } }
      .float-card { animation: floatCard 4s ease-in-out infinite; }
      h1, h2, .font-title { font-family: var(--font-display), sans-serif; }
      .no-scrollbar::-webkit-scrollbar { display: none; }
      .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
    `}</style>
  );

  const galaxyBg = { background: "radial-gradient(ellipse at 70% 15%, var(--color-nebula-3) 0%, var(--color-nebula-2) 30%, var(--color-nebula-1) 60%, var(--color-void) 100%)" };
  const openBadges = () => { sfx.tap(); setShowBadges(true); };
  const closeBadgePopup = () => setNewBadge(null);

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

  // ---------- Progress screen ----------
  if (showBadges) {
    const nextBadge = BADGES.find((b) => stars < b.need);
    const prevNeed = [0, ...BADGES.map((b) => b.need)][BADGES.findIndex((b) => b === nextBadge)] || 0;
    const pct = nextBadge ? Math.round(((stars - prevNeed) / (nextBadge.need - prevNeed)) * 100) : 100;
    return (
      <div className="relative min-h-screen flex items-center justify-center p-4 sm:p-6" style={galaxyBg}>
        {styleBlock}<GalaxyBackground /><Confetti particles={confettiBurst} />
        <div className="relative z-10 w-full max-w-md">
          <button onClick={() => { sfx.tap(); setShowBadges(false); }} aria-label="Back" className="focus-ring flex items-center gap-1.5 text-white/70 hover:text-white mb-4 font-semibold text-sm">
            <ArrowLeft size={16} /> Back
          </button>
          <Surface tier={3} className="p-6 sm:p-8 text-center">
            <p className="text-eyebrow text-[var(--color-gold)] mb-1">Your Progress</p>
            <div className="text-hero text-white" style={{ fontSize: "clamp(2.5rem,8vw,3.5rem)" }}>{stars}</div>
            <p className="text-white/60 text-sm -mt-1">stars earned</p>
            {nextBadge && (
              <div className="mt-5 text-left">
                <div className="flex justify-between text-xs text-white/50 mb-1.5">
                  <span>Next: {nextBadge.name} {nextBadge.emoji}</span>
                  <span>{nextBadge.need - stars} to go</span>
                </div>
                <ProgressBar value={pct} tone="gold" />
              </div>
            )}
            <RevealGroup className="grid grid-cols-5 gap-2 mt-7" stagger={0.04}>
              {BADGES.map((b) => {
                const earned = stars >= b.need;
                return (
                  <RevealItem key={b.name}>
                    <div className="flex flex-col items-center">
                      <div className={`w-full aspect-square rounded-2xl flex items-center justify-center text-2xl sm:text-3xl transition ${earned ? "bg-white/20 ring-2 ring-[var(--color-gold)]/60" : "bg-white/5 ring-1 ring-white/10 opacity-50"}`}>
                        {earned ? b.emoji : <Lock size={16} className="text-white/40" />}
                      </div>
                      <div className={`text-[9px] mt-1 font-semibold leading-tight ${earned ? "text-white" : "text-white/40"}`}>{b.name}</div>
                    </div>
                  </RevealItem>
                );
              })}
            </RevealGroup>
          </Surface>
        </div>
      </div>
    );
  }

  // ---------- Mentor Studio (builder) ----------
  if (building) {
    const c = COLORS[cColor];
    const previewMentor = { name: cName || "Your buddy", soft: c.soft, emoji: cEmoji, accent: c.accent };
    return (
      <div className="relative min-h-screen p-4 sm:p-6" style={galaxyBg}>
        {styleBlock}<GalaxyBackground /><Confetti particles={confettiBurst} />
        <div className="relative z-10 max-w-4xl mx-auto py-4">
          <button onClick={() => { sfx.tap(); setBuilding(false); }} aria-label="Back" className="focus-ring flex items-center gap-1.5 text-white/70 hover:text-white mb-4 font-semibold text-sm">
            <ArrowLeft size={16} /> Back
          </button>
          <p className="text-eyebrow text-[var(--color-aurora)]">Mentor Studio</p>
          <h1 className="text-display text-white mt-1 mb-6">Design your buddy</h1>

          <div className="grid md:grid-cols-2 gap-4 md:gap-6 items-start">
            {/* Config panel */}
            <Surface tier={2} className="p-5 sm:p-6 order-2 md:order-1">
              <label className="text-eyebrow text-white/50">Name</label>
              <input value={cName} onChange={(e) => setCName(e.target.value)} placeholder="e.g. Zappy" className="focus-ring w-full mt-2 mb-5 px-4 py-3 rounded-xl bg-white/90 text-slate-800 text-base font-medium placeholder:text-slate-400" />

              <label className="text-eyebrow text-white/50 flex items-center gap-1.5"><Palette size={12} /> Look</label>
              <div className="grid grid-cols-4 gap-2 mt-2 mb-5">
                {EMOJIS.map((e) => (
                  <button key={e} onClick={() => { sfx.tap(); setCEmoji(e); }} aria-label={`Use ${e} icon`} aria-pressed={cEmoji === e} className={`focus-ring h-12 rounded-xl text-2xl flex items-center justify-center transition ${cEmoji === e ? "ring-2 ring-white scale-105 bg-white/20" : "ring-1 ring-white/20 hover:bg-white/10"}`}>{e}</button>
                ))}
              </div>

              <label className="text-eyebrow text-white/50">Color</label>
              <div className="flex gap-2 mt-2 mb-5">
                {COLORS.map((col, i) => (
                  <button key={i} onClick={() => { sfx.tap(); setCColor(i); }} aria-label={`Use color ${i + 1}`} aria-pressed={cColor === i} className={`focus-ring w-10 h-10 rounded-full transition ${cColor === i ? "ring-2 ring-offset-2 ring-offset-[#1a1330] ring-white scale-105" : ""}`} style={{ background: col.accent }} />
                ))}
              </div>

              <label className="text-eyebrow text-white/50">Personality</label>
              <textarea value={cPersona} onChange={(e) => setCPersona(e.target.value)} rows={3} placeholder="e.g. A funny robot who loves space and tells silly jokes!" className="focus-ring w-full mt-2 mb-5 px-4 py-3 rounded-xl bg-white/90 text-slate-800 text-sm resize-none placeholder:text-slate-400" />

              <Button variant="primary" size="md" onClick={createMentor} disabled={!cName.trim()} className="w-full">Create my buddy</Button>
            </Surface>

            {/* Live preview panel */}
            <Surface tier={3} className="p-6 sm:p-8 order-1 md:order-2 md:sticky md:top-6">
              <p className="text-eyebrow text-white/40 mb-4">Live preview</p>
              <motion.div key={cName + cEmoji + cColor} initial={{ scale: 0.94, opacity: 0.6 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }} className="flex flex-col items-center text-center">
                <MentorAvatar mentor={previewMentor} size={88} />
                <div className="text-heading text-white mt-4">{cName || "Your buddy"}</div>
                <p className="text-eyebrow mt-1" style={{ color: c.accent }}>Custom Buddy · Oxidium Mind</p>
                <div className="glass-card p-4 mt-5 text-left w-full">
                  <p className="text-white/50 text-xs mb-1.5">How they&apos;ll greet you</p>
                  <p className="text-white/90 text-sm leading-relaxed">
                    {cPersona.trim()
                      ? `"Hey! I'm ${cName || "your buddy"} — ${cPersona.trim().charAt(0).toLowerCase() + cPersona.trim().slice(1)}. Ready to learn something together?"`
                      : `"Hey! I'm ${cName || "your buddy"}. What are we learning today?"`}
                  </p>
                </div>
              </motion.div>
            </Surface>
          </div>
        </div>
      </div>
    );
  }

  // ---------- Picker screen ----------
  if (!mentor) {
    return (
      <div className="relative min-h-screen flex items-center justify-center p-4 sm:p-6" style={galaxyBg}>
        {styleBlock}<GalaxyBackground /><Confetti particles={confettiBurst} /><BadgePopup badge={newBadge} onClose={closeBadgePopup} />
        <div className="relative z-10 w-full max-w-3xl py-6">
          <div className="flex justify-between items-center mb-4">
            <button onClick={logout} className="focus-ring flex items-center gap-1.5 text-violet-200/70 hover:text-white text-xs font-semibold transition">
              <LogOut size={13} /> Log out
            </button>
            <StarChip stars={stars} onClick={openBadges} />
          </div>
          <Reveal className="text-center">
            <p className="text-eyebrow text-[var(--color-aurora)] mb-2">{displayName ? `Hi ${displayName}` : "Welcome"}</p>
            <h1 className="text-hero text-white" style={{ fontSize: "clamp(2rem,5vw,3.25rem)" }}>Pick your buddy</h1>
            <p className="text-white/50 mt-3">Every buddy shares one caring Oxidium Mind — pick the one that fits your mood.</p>
          </Reveal>
          <RevealGroup className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-8" stagger={0.06}>
            {Object.entries(MENTORS).map(([key, m]) => (
              <RevealItem key={key}>
                <button onClick={() => start(m)} className="focus-ring w-full text-left glass-card p-4 sm:p-5 hover:bg-white/15 hover:-translate-y-1 active:scale-95 transition-all duration-200">
                  <div className="mb-3"><MentorAvatar mentor={m} size={56} /></div>
                  <div className="text-heading text-white text-base">{m.name}</div>
                  <div className="text-eyebrow mt-0.5" style={{ color: m.accent }}>{m.role}</div>
                  <p className="text-xs sm:text-sm text-white/60 mt-1.5 leading-snug">{m.tagline}</p>
                </button>
              </RevealItem>
            ))}
            <RevealItem>
              <button onClick={() => { sfx.tap(); setBuilding(true); }} className="focus-ring w-full h-full flex flex-col items-center justify-center bg-white/5 border-2 border-dashed border-white/25 hover:border-white/40 rounded-[var(--radius-lg)] p-4 sm:p-5 active:scale-95 transition-all min-h-[9.5rem]">
                <Sparkles size={26} className="text-white/70 mb-2" strokeWidth={1.75} />
                <div className="text-heading text-white text-sm text-center">Create your own</div>
              </button>
            </RevealItem>
            {savedMentors.map((m, i) => (
              <RevealItem key={"saved" + i}>
                <button onClick={() => start(m)} className="focus-ring w-full text-left glass-card p-4 sm:p-5 hover:bg-white/15 hover:-translate-y-1 active:scale-95 transition-all duration-200">
                  <div className="mb-3"><MentorAvatar mentor={m} size={56} /></div>
                  <div className="text-heading text-white text-base">{m.name}</div>
                  <div className="text-eyebrow mt-0.5" style={{ color: m.accent }}>Your buddy</div>
                  <p className="text-xs sm:text-sm text-white/60 mt-1.5 leading-snug">{m.personality?.slice(0, 36) || "Made just for you."}</p>
                </button>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </div>
    );
  }

  // ---------- STUDENT DASHBOARD ----------
  if (room === "home") {
    const nextBadge = BADGES.find((b) => stars < b.need);
    const quickActions = [
      { icon: PencilLine, label: "Quiz", desc: "Earn stars", onClick: () => enterRoom("Quiz") },
      { icon: Backpack, label: "Homework", desc: "Get unstuck", onClick: () => enterRoom("Homework") },
      { icon: Users, label: "My Buddy", desc: "Switch or create", onClick: () => { sfx.tap(); setMentor(null); } },
      { icon: Award, label: "Progress", desc: `${stars} stars`, onClick: openBadges },
    ];
    return (
      <div className="relative min-h-screen p-4 sm:p-6" style={galaxyBg}>
        {styleBlock}<GalaxyBackground /><Confetti particles={confettiBurst} /><BadgePopup badge={newBadge} onClose={closeBadgePopup} />
        <div className="relative z-10 w-full max-w-3xl mx-auto py-3">
          <div className="flex items-center justify-between mb-6">
            <button onClick={() => { sfx.tap(); setMentor(null); }} aria-label="Switch buddy" className="focus-ring w-11 h-11 flex items-center justify-center text-white/70 hover:text-white rounded-xl hover:bg-white/10">
              <ArrowLeft size={18} />
            </button>
            <StarChip stars={stars} onClick={openBadges} />
          </div>

          <Reveal>
            <p className="text-eyebrow text-[var(--color-aurora)] mb-1.5">{greeting()}, {displayName || "explorer"}</p>
            <h1 className="text-display text-white">Your next mission</h1>
          </Reveal>

          {/* Hero mission card */}
          <Reveal delay={0.08}>
            <Surface tier={3} className="mt-4 p-5 sm:p-7 flex items-center gap-5">
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center shrink-0 float-card ring-2 ring-white/25" style={{ background: mentor.soft }}>
                <DotLottieReact src={CHARACTER_URL} loop autoplay style={{ width: "80%", height: "80%" }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-eyebrow" style={{ color: mentor.accent }}>{mentor.name} recommends</p>
                <h2 className="text-heading text-white mt-1">Continue {subject}</h2>
                <p className="text-white/55 text-sm mt-1 hidden sm:block">Pick up where you left off — {mentor.name} is ready when you are.</p>
              </div>
              <Button variant="primary" size="md" icon={Play} onClick={() => enterRoom("Learn")} className="shrink-0 !px-5">
                <span className="hidden sm:inline">Start</span>
              </Button>
            </Surface>
          </Reveal>

          {/* Quick actions */}
          <RevealGroup className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4" stagger={0.05}>
            {quickActions.map((a) => (
              <RevealItem key={a.label}>
                <button onClick={a.onClick} aria-label={`${a.label} — ${a.desc}`} className="focus-ring w-full glass-card p-4 flex flex-col items-center gap-2 hover:bg-white/15 hover:-translate-y-0.5 active:scale-95 transition-all text-center">
                  <a.icon size={20} className="text-white/80" strokeWidth={1.75} />
                  <div>
                    <div className="text-white text-sm font-semibold">{a.label}</div>
                    <div className="text-white/45 text-[11px]">{a.desc}</div>
                  </div>
                </button>
              </RevealItem>
            ))}
          </RevealGroup>

          {/* Progress + subjects */}
          <Reveal delay={0.05}>
            <Section eyebrow="Progress" title="Your learning streak" className="mt-8">
              <Surface tier={2} className="p-5">
                {nextBadge ? (
                  <>
                    <div className="flex justify-between text-sm text-white/70 mb-2">
                      <span>{stars} stars</span>
                      <span className="text-white/45">{nextBadge.need - stars} to {nextBadge.name} {nextBadge.emoji}</span>
                    </div>
                    <ProgressBar value={(stars / nextBadge.need) * 100} tone="gold" />
                  </>
                ) : (
                  <p className="text-white/70 text-sm">🌌 You&apos;ve unlocked every badge — legendary.</p>
                )}
              </Surface>
            </Section>
          </Reveal>

          <Reveal delay={0.08}>
            <Section eyebrow="Explore" title="Subjects" className="mt-8">
              <div className="flex gap-2 flex-wrap">
                {SUBJECTS.map((s) => (
                  <button key={s} onClick={() => { setSubject(s); enterRoom("Learn"); }} className={`focus-ring px-4 py-2 rounded-[var(--radius-pill)] text-sm font-semibold transition ${subject === s ? "bg-white text-violet-800" : "glass-card text-white hover:bg-white/15"}`}>
                    {s}
                  </button>
                ))}
              </div>
            </Section>
          </Reveal>

          {/* Roadmap teasers */}
          <Reveal delay={0.1}>
            <Section eyebrow="Coming to EduVerse" title="The full learning universe" className="mt-8 mb-4">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {ROADMAP.map((r) => (
                  <div key={r.title} className="rounded-[var(--radius-md)] border border-dashed border-white/15 p-4 opacity-70">
                    <r.icon size={18} className="text-white/50 mb-2" strokeWidth={1.75} />
                    <div className="text-white/80 text-sm font-semibold">{r.title}</div>
                    <p className="text-white/40 text-[11px] mt-1 leading-snug">{r.desc}</p>
                    <Badge tone="neutral" className="mt-2 !text-[10px]">Coming soon</Badge>
                  </div>
                ))}
              </div>
            </Section>
          </Reveal>
        </div>
      </div>
    );
  }

  // ---------- IMMERSIVE CHAT ROOM ----------
  const showStarters = messages.length <= 1 && !loading;
  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden" style={galaxyBg}>
      {styleBlock}<GalaxyBackground /><Confetti particles={confettiBurst} /><BadgePopup badge={newBadge} onClose={closeBadgePopup} />
      <header className="relative z-20 flex items-center gap-2 px-3 sm:px-4 py-3">
        <IconButton icon={HomeIcon} label="Go home" onClick={() => { sfx.tap(); stopSpeaking(); stopListening(); setRoom("home"); }} />
        <div className="flex-1 text-center min-w-0">
          <div className="text-heading text-white leading-tight truncate">{mentor.name}</div>
          <div className="text-[11px] font-medium" style={{ color: mentor.accent }}>{mode} · {subject}</div>
        </div>
        <StarChip stars={stars} onClick={openBadges} />
        <IconButton icon={Volume2} activeIcon={VolumeX} active={muted} label={muted ? "Unmute voice" : "Mute voice"} aria-pressed={muted} onClick={() => { sfx.tap(); setMuted((v) => { if (!v) stopSpeaking(); return !v; }); }} />
      </header>

      <div className="relative z-10 flex flex-col items-center pt-1 pb-2">
        <div className="relative flex items-center justify-center" style={{ width: 140, height: 140 }}>
          {speaking && [0, 1, 2].map((r) => (
            <div key={r} className="absolute rounded-full" style={{ width: 110, height: 110, border: `2px solid ${mentor.accent}`, animation: `ring 1.6s ease-out ${r * 0.5}s infinite` }} />
          ))}
          <div className="absolute rounded-full" style={{ width: 116, height: 116, background: mentor.accent, filter: "blur(30px)", opacity: speaking ? 0.55 : 0.28, transition: "opacity 0.3s" }} />
          {speaking && ["⭐", "✨", "💫", "🌟"].map((s, i) => (
            <div key={i} className="absolute text-lg" style={{ left: `${20 + i * 20}%`, bottom: "30%", animation: `riseUp ${1.8 + i * 0.3}s ease-out ${i * 0.4}s infinite` }}>{s}</div>
          ))}
          <div className="relative rounded-full flex items-center justify-center shadow-2xl float-card ring-4 ring-white/25" style={{ width: 124, height: 124, background: `radial-gradient(circle at 40% 35%, #ffffff55, ${mentor.soft})` }}>
            <DotLottieReact src={CHARACTER_URL} loop autoplay speed={speaking ? 1.5 : 0.7} style={{ width: "85%", height: "85%" }} />
          </div>
        </div>
        <div className="mt-1 text-xs font-bold text-violet-200 h-4">{listening ? "🎧 listening…" : speaking ? "💬 speaking…" : ""}</div>
      </div>

      <div className="relative z-10 flex gap-2 pt-1 pb-2 px-3 overflow-x-auto no-scrollbar justify-start sm:justify-center">
        {SUBJECTS.map((s) => (
          <button key={s} onClick={() => switchContext(null, s)} aria-pressed={subject === s} className={`focus-ring px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap shrink-0 transition ${subject === s ? "bg-white text-violet-800" : "bg-white/10 text-white ring-1 ring-white/25"}`}>{s}</button>
        ))}
      </div>

      <div ref={scrollRef} className="relative z-10 flex-1 overflow-y-auto px-4 py-2 space-y-2.5 max-w-2xl w-full mx-auto no-scrollbar">
        <AnimatePresence initial={false}>
          {messages.map((m, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[82%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow ${m.role === "user" ? "rounded-br-md bg-violet-500/90 text-white" : "rounded-bl-md bg-white/95 text-slate-700"}`}>
                {m.content}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white/95 px-4 py-3 rounded-2xl rounded-bl-md flex gap-1 shadow">
              {[0, 1, 2].map((d) => <span key={d} className="w-2 h-2 rounded-full animate-bounce" style={{ background: mentor.accent, animationDelay: `${d * 0.15}s` }} />)}
            </div>
          </div>
        )}
        {showStarters && (
          <div className="flex flex-wrap gap-2 pt-1">
            {(STARTER_PROMPTS[mode] || STARTER_PROMPTS.Learn).map((p) => (
              <button key={p} onClick={() => sendText(p)} className="focus-ring px-3 py-1.5 rounded-full text-xs font-medium bg-white/10 text-white/80 ring-1 ring-white/20 hover:bg-white/15 transition">
                {p}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="relative z-10 px-3 sm:px-4 pb-4 pt-1 max-w-2xl w-full mx-auto">
        <div className="flex items-end gap-2 bg-white/95 rounded-3xl p-2 shadow-2xl">
          <button onClick={listening ? stopListening : startListening} aria-label={listening ? "Stop and send" : "Talk"} aria-pressed={listening} className={`focus-ring w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 transition-all ${listening ? "bg-red-500 text-white animate-pulse scale-110" : "ring-1 ring-slate-200 text-slate-600"}`} title={listening ? "Listening… tap to stop & send" : "Tap and talk"}>
            {listening ? <MicOff size={17} /> : <Mic size={17} />}
          </button>
          <textarea value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }} rows={1} placeholder={listening ? "Listening…" : `Talk to ${mentor.name}…`} aria-label="Message" className="focus-ring flex-1 resize-none bg-transparent px-2 py-2.5 text-slate-700 text-base max-h-24" />
          <button onClick={() => { sfx.tap(); send(); }} disabled={loading || !input.trim()} aria-label="Send message" className="focus-ring w-11 h-11 rounded-2xl flex items-center justify-center text-white disabled:opacity-40 shadow-md active:scale-95 transition shrink-0" style={{ background: mentor.accent }}>
            <Send size={16} strokeWidth={2.25} />
          </button>
        </div>
      </div>
    </div>
  );
}
