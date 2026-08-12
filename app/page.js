"use client";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Home as HomeIcon, ArrowLeft, LogOut, Award, Lock, Mic, MicOff, Volume2, VolumeX,
  Send, Sparkles, PencilLine, Backpack, Users, Compass, Gamepad2,
  BarChart3, Play, Brain, Settings as SettingsIcon, Star,
} from "lucide-react";
import Landing from "./landing";
import Login from "./login";
import Preferences from "./preferences";
import Companion from "./companion";
import Focus from "./focus";
import Mind from "./mind";
import SettingsScreen from "./settings";
import ParentDashboard from "./parent";
import TeacherDashboard from "./teacher";
import Games from "./games";
import { Button, Surface, Badge, ProgressBar, Section, Reveal, RevealGroup, RevealItem } from "@/components/ui";
import AIAvatar from "@/components/mentor/AIAvatar";
import BrandMark from "@/components/BrandMark";
import VoidBackdrop from "@/components/VoidBackdrop";
import QuoteRotator from "@/components/QuoteRotator";
import { useVoiceConversation } from "@/hooks/useVoiceConversation";

const MENTORS = {
  nova: { name: "Luna", role: "Dreamer", tagline: "Let's explore ideas and discover cool things, together." },
  atlas: { name: "Ellie", role: "Scientist", tagline: "Every question is a fun little experiment." },
  case: { name: "Pip", role: "Stargazer", tagline: "Let's slow down and think it through, together." },
};
const SUBJECTS = ["General", "Math", "Science", "English", "Coding", "Languages"];

const PICKER_HIGHLIGHTS = ["AI Tutor", "AI Mentor Companion", "Knowledge Games", "Obsidian Mind"];

const BADGES = [
  { need: 1, name: "First Star" },
  { need: 5, name: "Rising Star" },
  { need: 15, name: "Planet Explorer" },
  { need: 30, name: "Comet" },
  { need: 50, name: "Galaxy Master" },
];

const STARTER_PROMPTS = {
  Learn: ["Explain it simply", "Give me a real example", "Why does this matter?"],
  Quiz: ["I'm ready, ask me!", "Make it a bit harder", "Give me a hint"],
  Homework: ["Here's my problem", "I'm stuck on step one", "Check my answer"],
  Companion: ["How's it going?", "I need help getting started", "Just checking in"],
  Opportunities: ["What could I explore in this?", "What might fit my interests?", "What's a good next step?"],
};

const ROADMAP = [
  { icon: BarChart3, title: "Deep Analytics", desc: "The full story behind your learning streak." },
];

function BadgePopup({ badge, onClose }) {
  if (!badge) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-6" onClick={onClose}>
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="glass-card-elevated p-8 text-center max-w-xs" onClick={(e) => e.stopPropagation()}>
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--surface-2)] border border-[var(--border-glass-strong)] flex items-center justify-center">
          <Award size={28} className="text-[var(--ink)]" strokeWidth={1.75} />
        </div>
        <div className="text-eyebrow">New badge unlocked!</div>
        <div className="text-display text-[var(--ink)] mt-1">{badge.name}</div>
        <Button variant="primary" size="md" onClick={onClose} className="mt-5 w-full">Awesome!</Button>
      </motion.div>
    </div>
  );
}

function Toast({ message }) {
  if (!message) return null;
  return (
    <div className="fixed bottom-6 left-1/2 z-50 px-5 py-2.5 rounded-full bg-[var(--pill)] text-[var(--pill-ink)] text-sm font-semibold shadow-lg"
      style={{ animation: "toastIn 0.4s cubic-bezier(.16,1,.3,1) both" }}>
      {message}
    </div>
  );
}

function StarChip({ stars, onClick }) {
  return (
    <button onClick={onClick} aria-label={`${stars} stars earned — view progress`} className="focus-ring flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-pill)] bg-[var(--surface-2)] ring-1 ring-[var(--border-glass-strong)] text-[var(--ink)] text-sm font-bold active:scale-95 transition shrink-0">
      <Star size={13} className="fill-[var(--ink)] text-[var(--ink)]" /> {stars}
    </button>
  );
}

function IconButton({ icon: Icon, active, activeIcon: ActiveIcon, label, className = "", ...props }) {
  const Shown = active && ActiveIcon ? ActiveIcon : Icon;
  return (
    <button aria-label={label} title={label} className={`focus-ring w-11 h-11 rounded-xl ring-1 ring-[var(--border-glass-strong)] bg-[var(--surface-1)] hover:bg-[var(--surface-2)] flex items-center justify-center shrink-0 transition ${className}`} {...props}>
      <Shown size={18} strokeWidth={2} className="text-[var(--ink)]" />
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
  const [authGateMode, setAuthGateMode] = useState(null); // null = show landing; "login" | "signup" = show Login
  const [building, setBuilding] = useState(false);
  const [showBadges, setShowBadges] = useState(false);
  const [room, setRoom] = useState("home");
  const [savedMentors, setSavedMentors] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [student, setStudent] = useState("");
  const [level, setLevel] = useState("Kid");
  const [subject, setSubject] = useState("General");
  const [learnInput, setLearnInput] = useState("");
  const [mode, setMode] = useState("Learn");
  const [muted, setMuted] = useState(false);
  const [autoListenPending, setAutoListenPending] = useState(false);
  const [toast, setToast] = useState(null);
  const [stars, setStars] = useState(0);
  const [newBadge, setNewBadge] = useState(null);
  const audioCtxRef = useRef(null);
  const [cName, setCName] = useState("");
  const [cPersona, setCPersona] = useState("");
  // Debounced so the mentor-builder's live-preview avatar doesn't
  // regenerate into a completely different illustrated face on every
  // single keystroke while typing a name — it settles once typing pauses.
  const [cNameSettled, setCNameSettled] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setCNameSettled(cName), 400);
    return () => clearTimeout(t);
  }, [cName]);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

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
          if (d.user.role === "student" || !d.user.role) loadAssignments();
        } else {
          setAuthUser(null);
        }
      })
      .catch(() => setAuthUser(null));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { scrollRef.current?.scrollTo({ top: 999999, behavior: "smooth" }); }, [messages, loading]);

  const { listening, speaking, speak, stopSpeaking, startListening, stopListening, interrupt, state: convState, error: voiceError } = useVoiceConversation({
    muted,
    mentor,
    onInterim: (text) => setInput(text),
    onCommit: (text) => sendText(text),
  });

  // Landing on the chat room via the AI Mentor's "Talk to me" entry starts
  // listening immediately, instead of requiring an extra tap once you land.
  useEffect(() => {
    if (room === "chat" && autoListenPending) {
      const t = setTimeout(() => {
        setAutoListenPending(false);
        startListening(true);
      }, 0);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room, autoListenPending]);

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

  function celebrate(message = "Nice work!") {
    sfx.correct();
    setToast(message);
    setTimeout(() => setToast(null), 1800);
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

  async function loadMentors(nameArg) {
    const s = (nameArg ?? student).trim();
    if (!s) return;
    try {
      const r = await fetch(`/api/mentors?student=${encodeURIComponent(s)}`);
      const d = await r.json();
      setSavedMentors(d.mentors || []);
    } catch {}
  }

  async function loadAssignments() {
    try {
      const r = await fetch("/api/assignment");
      const d = await r.json();
      setAssignments(d.assignments || []);
    } catch {}
  }

  async function completeAssignment(id) {
    setAssignments((prev) => prev.map((a) => (a.id === id ? { ...a, completed: true } : a)));
    try { await fetch("/api/assignment/complete", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ assignmentId: id }) }); } catch {}
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

  function enterRoom(nm, subjectOverride, customNote) {
    sfx.tap();
    const activeSubject = subjectOverride || subject;
    if (subjectOverride) setSubject(subjectOverride);
    setMode(nm);
    setRoom("chat");
    setMessages([]);
    const note = customNote || (nm === "Quiz" ? `Let's start a ${activeSubject} quiz! Ask me the first question.`
      : nm === "Homework" ? `Can you help me with my homework?`
      : nm === "Companion" ? `Hey, I'm here to chat and check in.`
      : nm === "Opportunities" ? `I'd like to explore opportunities that might fit me.`
      : `I want to learn ${activeSubject}.`);
    sendText(note, []);
  }

  function enterCompanion(autoTalk) {
    enterRoom("Companion");
    if (autoTalk) setAutoListenPending(true);
  }

  async function createMentor() {
    if (!cName.trim()) return;
    const m = { name: cName.trim(), role: "Custom Buddy", personality: cPersona.trim(), tagline: "Made just for you." };
    if (student.trim()) {
      try {
        await fetch("/api/mentors", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ student: student.trim(), mentor: m }) });
        setSavedMentors((prev) => [m, ...prev]);
      } catch {}
    }
    celebrate("Buddy created!");
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
      if (isCorrect) { celebrate("Correct!"); addStar(); }
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

  const openBadges = () => { sfx.tap(); setShowBadges(true); };
  const closeBadgePopup = () => setNewBadge(null);

  // ---------- Auth ----------
  if (authUser === undefined) {
    return (
      <div className="relative min-h-app flex items-center justify-center screen-enter">
        <VoidBackdrop />
        <BrandMark className="w-6 h-9 animate-pulse" />
      </div>
    );
  }
  if (authUser === null) {
    if (!authGateMode) {
      return (
        <Landing
          onGetStarted={() => setAuthGateMode("signup")}
          onLogin={() => setAuthGateMode("login")}
        />
      );
    }
    return (
      <Login
        initialMode={authGateMode}
        onBack={() => setAuthGateMode(null)}
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
  if (authUser.role === "parent") {
    return <ParentDashboard user={authUser} onLogout={logout} />;
  }
  if (authUser.role === "teacher") {
    return <TeacherDashboard user={authUser} onLogout={logout} />;
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
      <div className="relative min-h-app flex items-center justify-center safe-pad screen-enter">
        <VoidBackdrop />
        <div className="relative z-10 w-full max-w-md">
          <button onClick={() => { sfx.tap(); setShowBadges(false); }} aria-label="Back" className="focus-ring flex items-center gap-1.5 text-white/70 hover:text-white mb-4 font-semibold text-sm">
            <ArrowLeft size={16} /> Back
          </button>
          <Surface tier={3} className="p-6 sm:p-8 text-center">
            <p className="text-eyebrow mb-1">Your Progress</p>
            <div className="text-hero text-white" style={{ fontSize: "clamp(2.5rem,8vw,3.5rem)" }}>{stars}</div>
            <p className="text-white/60 text-sm -mt-1">stars earned</p>
            {nextBadge && (
              <div className="mt-5 text-left">
                <div className="flex justify-between text-xs text-white/50 mb-1.5">
                  <span>Next: {nextBadge.name}</span>
                  <span>{nextBadge.need - stars} to go</span>
                </div>
                <ProgressBar value={pct} />
              </div>
            )}
            <RevealGroup className="grid grid-cols-5 gap-2 mt-7" stagger={0.04}>
              {BADGES.map((b) => {
                const earned = stars >= b.need;
                return (
                  <RevealItem key={b.name}>
                    <div className="flex flex-col items-center">
                      <div className={`w-full aspect-square rounded-2xl flex items-center justify-center transition ${earned ? "bg-white/15 ring-2 ring-white/50" : "bg-white/5 ring-1 ring-white/10 opacity-50"}`}>
                        {earned ? <Star size={18} className="fill-white text-white" /> : <Lock size={16} className="text-white/40" />}
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
    const previewMentor = { name: cNameSettled || "Your buddy" };
    return (
      <div className="relative min-h-app safe-pad screen-enter">
        <VoidBackdrop />
        <div className="relative z-10 max-w-4xl mx-auto py-4">
          <button onClick={() => { sfx.tap(); setBuilding(false); }} aria-label="Back" className="focus-ring flex items-center gap-1.5 text-white/70 hover:text-white mb-4 font-semibold text-sm">
            <ArrowLeft size={16} /> Back
          </button>
          <p className="text-eyebrow">Mentor Studio</p>
          <h1 className="text-display text-white mt-1 mb-6">Design your buddy</h1>

          <div className="grid md:grid-cols-2 gap-4 md:gap-6 items-start">
            {/* Config panel */}
            <Surface tier={2} className="p-5 sm:p-6 order-2 md:order-1">
              <label className="text-eyebrow">Name</label>
              <input value={cName} onChange={(e) => setCName(e.target.value)} placeholder="e.g. Zappy" className="focus-ring w-full mt-2 mb-5 px-4 py-3 rounded-xl bg-white/95 text-slate-800 text-base font-medium placeholder:text-slate-400" />

              <label className="text-eyebrow">Personality</label>
              <textarea value={cPersona} onChange={(e) => setCPersona(e.target.value)} rows={4} placeholder="e.g. A funny robot who loves space and tells silly jokes!" className="focus-ring w-full mt-2 mb-5 px-4 py-3 rounded-xl bg-white/95 text-slate-800 text-sm resize-none placeholder:text-slate-400" />

              <Button variant="primary" size="md" onClick={createMentor} disabled={!cName.trim()} className="w-full">Create my buddy</Button>
            </Surface>

            {/* Live preview panel */}
            <Surface tier={3} className="p-6 sm:p-8 order-1 md:order-2 md:sticky md:top-6">
              <p className="text-eyebrow mb-4">Live preview</p>
              <motion.div key={cNameSettled} initial={{ scale: 0.94, opacity: 0.6 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }} className="flex flex-col items-center text-center">
                <AIAvatar mentor={previewMentor} size={88} />
                <div className="text-heading text-white mt-4">{cName || "Your buddy"}</div>
                <p className="text-eyebrow mt-1">Custom Buddy · Obsidian Mind</p>
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
      <div className="relative min-h-app flex flex-col safe-pad screen-enter overflow-x-hidden">
        <VoidBackdrop />
        <div className="fixed inset-0 z-0 bg-gradient-to-r from-black/80 via-black/30 to-transparent pointer-events-none" aria-hidden="true" />
        <BadgePopup badge={newBadge} onClose={closeBadgePopup} />
        <div className="relative z-10 flex-1 flex items-center justify-center">
          <div className="w-full max-w-3xl py-4 sm:py-6">
            <div className="flex justify-between items-center mb-4">
              <button onClick={logout} className="focus-ring flex items-center gap-1.5 text-gray-500 hover:text-white text-xs font-semibold transition-colors duration-300">
                <LogOut size={13} /> Log out
              </button>
              <StarChip stars={stars} onClick={openBadges} />
            </div>
            <Reveal className="text-center">
              <p className="text-eyebrow mb-2 text-gray-300">{displayName ? `Hi ${displayName}` : "Welcome"}</p>
              <h1 className="text-hero" style={{ fontSize: "clamp(2.1rem,8vw,3.75rem)" }}>
                <span className="text-white">Pick your </span>
                <span className="text-shimmer">buddy</span>
              </h1>
              <p className="text-gray-300 mt-3 text-sm sm:text-base max-w-md mx-auto">Every buddy shares one caring Obsidian Mind — pick the one that fits your mood.</p>
            </Reveal>
            <RevealGroup className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 mt-6 sm:mt-8" stagger={0.06}>
              {Object.entries(MENTORS).map(([key, m]) => (
                <RevealItem key={key}>
                  <button onClick={() => start(m)} className="focus-ring w-full text-left rounded-xl backdrop-blur-xl bg-gradient-to-br from-orange-500/10 via-white/5 to-rose-500/5 border border-orange-200/10 hover:border-orange-200/30 hover:from-orange-500/15 hover:-translate-y-1 active:scale-95 transition-all duration-300 p-3.5 sm:p-5">
                    <div className="mb-2.5 sm:mb-3"><AIAvatar mentor={m} size={48} /></div>
                    <div className="text-heading text-white text-sm sm:text-base">{m.name}</div>
                    <div className="text-eyebrow mt-0.5 text-gray-300">{m.role}</div>
                    <p className="hidden sm:block text-xs sm:text-sm text-gray-400 mt-1.5 leading-snug">{m.tagline}</p>
                  </button>
                </RevealItem>
              ))}
              <RevealItem>
                <button onClick={() => { sfx.tap(); setBuilding(true); }} className="focus-ring w-full h-full flex flex-col items-center justify-center backdrop-blur-xl bg-gradient-to-br from-orange-500/10 via-white/5 to-rose-500/5 border-2 border-dashed border-orange-200/15 hover:border-orange-200/40 hover:from-orange-500/15 rounded-xl p-3.5 sm:p-5 active:scale-95 transition-all duration-300 min-h-[8rem] sm:min-h-[9.5rem]">
                  <Sparkles size={24} className="text-orange-200/80 mb-2" strokeWidth={1.75} />
                  <div className="text-heading text-white text-xs sm:text-sm text-center">Create your own</div>
                </button>
              </RevealItem>
              {savedMentors.map((m, i) => (
                <RevealItem key={"saved" + i}>
                  <button onClick={() => start(m)} className="focus-ring w-full text-left rounded-xl backdrop-blur-xl bg-gradient-to-br from-orange-500/10 via-white/5 to-rose-500/5 border border-orange-200/10 hover:border-orange-200/30 hover:from-orange-500/15 hover:-translate-y-1 active:scale-95 transition-all duration-300 p-3.5 sm:p-5">
                    <div className="mb-2.5 sm:mb-3"><AIAvatar mentor={m} size={48} /></div>
                    <div className="text-heading text-white text-sm sm:text-base">{m.name}</div>
                    <div className="text-eyebrow mt-0.5 text-gray-300">Your buddy</div>
                    <p className="hidden sm:block text-xs sm:text-sm text-gray-400 mt-1.5 leading-snug">{m.personality?.slice(0, 36) || "Made just for you."}</p>
                  </button>
                </RevealItem>
              ))}
            </RevealGroup>
          </div>
        </div>

        <motion.footer
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
          className="liquid-glass relative z-10 w-full max-w-3xl mx-auto rounded-3xl p-5 sm:p-6 md:p-8 text-gray-300 mt-6 md:mt-10 mb-4 md:mb-10"
        >
          <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 text-center sm:text-left">
            <div>
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <BrandMark className="w-5 h-7" />
                <span className="text-white text-lg font-medium tracking-tight">EDUVERSE</span>
              </div>
              <p className="text-sm leading-relaxed max-w-sm mt-2">
                One caring Obsidian Mind, shared across every buddy — teaching, quizzing, and remembering, built to make learning feel like discovery.
              </p>
            </div>
            <div className="flex flex-wrap justify-center sm:justify-end gap-2 sm:max-w-xs">
              {PICKER_HIGHLIGHTS.map((h) => (
                <span key={h} className="text-[11px] uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/5 ring-1 ring-white/10 text-gray-300">{h}</span>
              ))}
            </div>
          </div>
        </motion.footer>
      </div>
    );
  }

  // ---------- AI Mentor companion, focus session, Obsidian Mind, settings ----------
  if (room === "companion") {
    return (
      <div className="relative min-h-app flex items-center justify-center safe-pad screen-enter">
        <VoidBackdrop />
        <Companion
          mentor={mentor}
          displayName={displayName}
          onBack={() => { sfx.tap(); setRoom("home"); }}
          onTalk={() => { sfx.tap(); enterCompanion(true); }}
          onType={() => { sfx.tap(); enterCompanion(false); }}
          onStudy={() => { sfx.tap(); setRoom("focus"); }}
          onMind={() => { sfx.tap(); setRoom("mind"); }}
        />
      </div>
    );
  }
  if (room === "focus") {
    return (
      <div className="relative min-h-app flex items-center justify-center safe-pad screen-enter">
        <VoidBackdrop />
        <Focus mentor={mentor} muted={muted} onBack={() => { sfx.tap(); setRoom("home"); }} onComplete={() => { celebrate("Session complete!"); addStar(); }} />
      </div>
    );
  }
  if (room === "mind") {
    return (
      <div className="relative min-h-app safe-pad screen-enter">
        <VoidBackdrop />
        <Mind student={student} displayName={displayName} onBack={() => { sfx.tap(); setRoom("home"); }} />
      </div>
    );
  }
  if (room === "settings") {
    return (
      <div className="relative min-h-app safe-pad screen-enter">
        <VoidBackdrop />
        <SettingsScreen student={student} onBack={() => { sfx.tap(); setRoom("home"); }} />
      </div>
    );
  }
  if (room === "games") {
    return (
      <div className="relative min-h-app safe-pad screen-enter">
        <VoidBackdrop />
        <Games
          student={student}
          onBack={() => { sfx.tap(); setRoom("home"); }}
          onAskMentor={(message) => { sfx.tap(); enterRoom("Companion", null, message); }}
        />
      </div>
    );
  }

  // ---------- STUDENT DASHBOARD ----------
  if (room === "home") {
    const nextBadge = BADGES.find((b) => stars < b.need);
    const quickActions = [
      { icon: Brain, label: "AI Mentor", desc: "Talk & study", onClick: () => { sfx.tap(); setRoom("companion"); } },
      { icon: PencilLine, label: "Quiz", desc: "Earn stars", onClick: () => enterRoom("Quiz") },
      { icon: Backpack, label: "Homework", desc: "Get unstuck", onClick: () => enterRoom("Homework") },
      { icon: Users, label: "My Buddy", desc: "Switch or create", onClick: () => { sfx.tap(); setMentor(null); } },
      { icon: Award, label: "Progress", desc: `${stars} stars`, onClick: openBadges },
      { icon: Compass, label: "Opportunities", desc: "Explore paths", onClick: () => enterRoom("Opportunities") },
      { icon: Gamepad2, label: "Games", desc: "Play & learn", onClick: () => { sfx.tap(); setRoom("games"); } },
    ];
    return (
      <div className="relative min-h-app safe-pad screen-enter">
        <VoidBackdrop />
        <BadgePopup badge={newBadge} onClose={closeBadgePopup} />
        <Toast message={toast} />
        <div className="relative z-10 w-full max-w-3xl mx-auto py-3">
          <div className="flex items-center justify-between mb-6">
            <button onClick={() => { sfx.tap(); setMentor(null); }} aria-label="Switch buddy" className="focus-ring w-11 h-11 flex items-center justify-center text-white/70 hover:text-white rounded-xl hover:bg-white/5">
              <ArrowLeft size={18} />
            </button>
            <div className="flex items-center gap-2">
              <IconButton icon={SettingsIcon} label="Privacy & mentor settings" onClick={() => { sfx.tap(); setRoom("settings"); }} />
              <StarChip stars={stars} onClick={openBadges} />
            </div>
          </div>

          <Reveal>
            <p className="text-eyebrow mb-1.5">{greeting()}, {displayName || "explorer"}</p>
            <h1 className="text-display text-white">Your next <span className="text-shimmer">mission</span></h1>
            <QuoteRotator className="mt-3" />
          </Reveal>

          {/* Hero mission card */}
          <Reveal delay={0.08}>
            <Surface tier={3} className="mt-4 p-5 sm:p-7 flex items-center gap-5">
              <AIAvatar mentor={mentor} state="idle" size={80} />
              <div className="flex-1 min-w-0">
                <p className="text-eyebrow">{mentor.name} recommends</p>
                <h2 className="text-heading text-white mt-1">Continue {subject}</h2>
                <p className="text-white/55 text-sm mt-1 hidden sm:block">Pick up where you left off — {mentor.name} is ready when you are.</p>
              </div>
              <Button variant="primary" size="md" icon={Play} onClick={() => enterRoom("Learn")} className="shrink-0 !px-5">
                <span className="hidden sm:inline">Start</span>
              </Button>
            </Surface>
          </Reveal>

          {/* Quick actions */}
          <RevealGroup className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3 mt-4" stagger={0.05}>
            {quickActions.map((a) => (
              <RevealItem key={a.label}>
                <button onClick={a.onClick} aria-label={`${a.label} — ${a.desc}`} className="focus-ring w-full rounded-[var(--radius-lg)] backdrop-blur-xl bg-gradient-to-br from-orange-500/10 via-black/40 to-rose-500/10 border border-orange-200/10 shadow-sm p-3.5 sm:p-4 flex flex-col items-center gap-2 hover:border-orange-200/30 hover:brightness-125 hover:-translate-y-0.5 active:scale-95 transition-all text-center">
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
                      <span className="text-white/45">{nextBadge.need - stars} to {nextBadge.name}</span>
                    </div>
                    <ProgressBar value={(stars / nextBadge.need) * 100} />
                  </>
                ) : (
                  <p className="text-white/70 text-sm">You&apos;ve unlocked every badge — legendary.</p>
                )}
              </Surface>
            </Section>
          </Reveal>

          <Reveal delay={0.08}>
            <Section eyebrow="Explore" title="Subjects" className="mt-8">
              <div className="flex gap-2 flex-wrap">
                {SUBJECTS.map((s) => (
                  <button key={s} onClick={() => enterRoom("Learn", s)} className={`focus-ring px-4 py-2 rounded-[var(--radius-pill)] text-sm font-semibold transition ${subject === s ? "bg-white text-[var(--pill-ink)]" : "glass-card text-white hover:bg-white/10"}`}>
                    {s}
                  </button>
                ))}
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const topic = learnInput.trim();
                  if (!topic) return;
                  setLearnInput("");
                  enterRoom("Learn", topic);
                }}
                className="flex gap-2 mt-3"
              >
                <input
                  value={learnInput}
                  onChange={(e) => setLearnInput(e.target.value)}
                  placeholder="Or type anything — 'how money works', 'cooking', 'the universe'…"
                  aria-label="What do you want to learn?"
                  className="focus-ring flex-1 px-4 py-2.5 rounded-[var(--radius-pill)] bg-white/95 text-slate-800 text-sm placeholder:text-slate-400"
                />
                <button type="submit" disabled={!learnInput.trim()} aria-label="Start learning" className="focus-ring w-10 h-10 rounded-full flex items-center justify-center bg-white text-[var(--pill-ink)] disabled:opacity-40 shrink-0 transition active:scale-95">
                  <Send size={15} strokeWidth={2.25} />
                </button>
              </form>
            </Section>
          </Reveal>

          {assignments.length > 0 && (
            <Reveal delay={0.09}>
              <Section eyebrow="From your class" title="Assignments" className="mt-8">
                <div className="space-y-2">
                  {assignments.map((a) => (
                    <Surface key={a.id} tier={2} className={`p-4 flex items-center justify-between gap-3 ${a.completed ? "opacity-50" : ""}`}>
                      <div className="min-w-0">
                        <div className="text-white text-sm font-semibold truncate">{a.title}</div>
                        <div className="text-white/45 text-xs mt-0.5">{a.class_name}{a.due_date ? ` · due ${a.due_date}` : ""}</div>
                      </div>
                      {a.completed ? (
                        <Badge tone="neutral" className="shrink-0">Done</Badge>
                      ) : (
                        <Button variant="glass" size="sm" onClick={() => completeAssignment(a.id)} className="shrink-0">Mark done</Button>
                      )}
                    </Surface>
                  ))}
                </div>
              </Section>
            </Reveal>
          )}

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
    <div className="relative min-h-app flex flex-col overflow-hidden screen-enter">
      <VoidBackdrop />
      <BadgePopup badge={newBadge} onClose={closeBadgePopup} />
      <Toast message={toast} />
      <header className="relative z-20 flex items-center gap-2 safe-x safe-top py-3 shrink-0">
        <IconButton icon={HomeIcon} label="Go home" onClick={() => { sfx.tap(); stopSpeaking(); stopListening(); setRoom("home"); }} />
        <div className="flex-1 text-center min-w-0">
          <div className="text-heading text-white leading-tight truncate">{mentor.name}</div>
          <div className="text-[11px] font-medium text-white/50">{mode} · {subject}</div>
        </div>
        <StarChip stars={stars} onClick={openBadges} />
        <IconButton icon={Volume2} activeIcon={VolumeX} active={muted} label={muted ? "Unmute voice" : "Mute voice"} aria-pressed={muted} onClick={() => { sfx.tap(); setMuted((v) => { if (!v) stopSpeaking(); return !v; }); }} />
      </header>

      <div className="relative z-10 flex flex-col items-center pt-1 pb-2 shrink-0">
        <AIAvatar mentor={mentor} state={speaking ? "speaking" : listening ? "listening" : "idle"} size={140} />
        <div className="mt-1 h-4">
          {speaking ? (
            <button onClick={interrupt} className="focus-ring text-xs font-bold text-white/70 hover:text-white underline decoration-dotted underline-offset-2">speaking… tap to interrupt</button>
          ) : (
            <div className="text-xs font-bold text-white/60">{listening ? "listening…" : ""}</div>
          )}
        </div>
        {convState === "ERROR" && voiceError && (
          <div role="alert" className="mt-2 max-w-xs text-center text-[11px] text-white bg-white/10 ring-1 ring-white/25 px-3 py-1.5 rounded-full">{voiceError}</div>
        )}
      </div>

      <div className="relative z-10 flex gap-2 pt-1 pb-2 px-3 overflow-x-auto no-scrollbar justify-start sm:justify-center shrink-0">
        {SUBJECTS.map((s) => (
          <button key={s} onClick={() => switchContext(null, s)} aria-pressed={subject === s} className={`focus-ring px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap shrink-0 transition ${subject === s ? "bg-white text-[var(--pill-ink)]" : "bg-white/10 text-white ring-1 ring-white/20"}`}>{s}</button>
        ))}
      </div>

      <div ref={scrollRef} className="relative z-10 flex-1 min-h-0 overflow-y-auto px-4 py-2 space-y-2.5 max-w-2xl w-full mx-auto no-scrollbar">
        <AnimatePresence initial={false}>
          {messages.map((m, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[82%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${m.role === "user" ? "rounded-br-md bg-white text-[var(--pill-ink)]" : "rounded-bl-md bg-white/10 border border-white/15 text-white"}`}>
                {m.content}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white/10 border border-white/15 px-4 py-3 rounded-2xl rounded-bl-md flex gap-1">
              {[0, 1, 2].map((d) => <span key={d} className="w-2 h-2 rounded-full bg-white/70 animate-bounce" style={{ animationDelay: `${d * 0.15}s` }} />)}
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

      <div className="relative z-10 safe-x safe-bottom pt-1 max-w-2xl w-full mx-auto shrink-0">
        <div className="flex items-end gap-2 bg-white/95 rounded-3xl p-2 shadow-2xl">
          <button onClick={() => (listening ? stopListening() : startListening())} aria-label={listening ? "Stop and send" : "Talk"} aria-pressed={listening} className={`focus-ring w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 transition-all ${listening ? "bg-red-500 text-white animate-pulse scale-110" : "ring-1 ring-slate-200 text-slate-600"}`} title={listening ? "Listening… tap to stop & send" : "Tap and talk"}>
            {listening ? <MicOff size={17} /> : <Mic size={17} />}
          </button>
          <textarea value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }} rows={1} placeholder={listening ? "Listening…" : `Talk to ${mentor.name}…`} aria-label="Message" className="focus-ring flex-1 resize-none bg-transparent px-2 py-2.5 text-slate-700 text-base max-h-24" />
          <button onClick={() => { sfx.tap(); send(); }} disabled={loading || !input.trim()} aria-label="Send message" className="focus-ring w-11 h-11 rounded-2xl flex items-center justify-center text-white bg-[var(--pill-ink)] disabled:opacity-40 shadow-md active:scale-95 transition shrink-0">
            <Send size={16} strokeWidth={2.25} />
          </button>
        </div>
      </div>
    </div>
  );
}
