"use client";
import { useState, useRef, useEffect } from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

const MENTORS = {
  nova: { name: "Nova", role: "Explorer", emoji: "🚀", accent: "#F59E0B", soft: "#FEF3C7", tagline: "Let's go discover how things work." },
  atlas: { name: "Atlas", role: "Scientist", emoji: "🔬", accent: "#10B981", soft: "#D1FAE5", tagline: "Every question is an experiment." },
  case: { name: "Case", role: "Detective", emoji: "🔍", accent: "#6366F1", soft: "#E0E7FF", tagline: "Let's find the clues together." },
};
const GRADES = [1, 2, 3, 4, 5, 6, 7, 8];
const EMOJIS = ["🦉", "🤖", "🐉", "🦊", "🦄", "🐬", "🐨", "🌟"];
const COLORS = [
  { accent: "#F59E0B", soft: "#FEF3C7" },
  { accent: "#10B981", soft: "#D1FAE5" },
  { accent: "#6366F1", soft: "#E0E7FF" },
  { accent: "#EC4899", soft: "#FCE7F3" },
  { accent: "#0EA5E9", soft: "#E0F2FE" },
];

const CHARACTER_URL = "https://lottie.host/b99ef145-b573-4305-9164-7f0bf1997d30/IeL2KG7tpc.lottie";

export default function Home() {
  const [mentor, setMentor] = useState(null);
  const [building, setBuilding] = useState(false);
  const [savedMentors, setSavedMentors] = useState([]);
  const [student, setStudent] = useState("");
  const [grade, setGrade] = useState(3);
  const [muted, setMuted] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);
  const wantListeningRef = useRef(false);
  const finalTextRef = useRef("");
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

  function pickVoice() {
    const voices = window.speechSynthesis.getVoices();
    const wanted = ["Google UK English Female", "Microsoft Aria", "Microsoft Jenny", "Samantha", "Google US English", "Microsoft Zira"];
    for (const name of wanted) {
      const v = voices.find((vo) => vo.name.includes(name));
      if (v) return v;
    }
    const fem = voices.find((vo) => /female/i.test(vo.name) && /en/i.test(vo.lang));
    if (fem) return fem;
    return voices.find((vo) => /en/i.test(vo.lang)) || voices[0];
  }

  function speak(text) {
    if (muted || typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const clean = text.replace(/[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}]/gu, "");
    const u = new SpeechSynthesisUtterance(clean);
    const v = pickVoice();
    if (v) u.voice = v;
    u.rate = 0.95;
    u.pitch = 1.1;
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
    if (!SR) {
      alert("Voice input isn't supported in this browser. Please use Chrome.");
      return;
    }
    stopSpeaking();
    finalTextRef.current = "";
    wantListeningRef.current = true;

    const rec = new SR();
    rec.lang = "en-US";
    rec.interimResults = true;
    rec.continuous = true;

    rec.onstart = () => setListening(true);

    rec.onerror = (e) => {
      console.log("Mic error:", e.error);
      if (e.error === "not-allowed" || e.error === "service-not-allowed" || e.error === "audio-capture") {
        wantListeningRef.current = false;
        setListening(false);
        alert("Microphone problem: " + e.error + ".\nClick the 🎤/lock icon in Chrome's address bar and allow the microphone, and check Windows mic settings.");
      }
    };

    rec.onend = () => {
      // Chrome ends sessions on its own — restart while the user still wants to talk
      if (wantListeningRef.current) {
        try { rec.start(); } catch {}
      } else {
        setListening(false);
      }
    };

    rec.onresult = (e) => {
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) finalTextRef.current += t + " ";
        else interim += t;
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

  async function loadMentors() {
    if (!student.trim()) return;
    try {
      const r = await fetch(`/api/mentors?student=${encodeURIComponent(student.trim())}`);
      const d = await r.json();
      setSavedMentors(d.mentors || []);
    } catch {}
  }

  function start(m) {
    setMentor(m);
    const hi = student ? `Hi ${student}! I'm ${m.name}.` : `Hi! I'm ${m.name}.`;
    const greeting = `${hi} ${m.tagline || ""} What would you like to figure out today?`;
    setMessages([{ role: "assistant", content: greeting }]);
    speak(greeting);
  }

  async function createMentor() {
    if (!cName.trim()) return;
    const c = COLORS[cColor];
    const m = { name: cName.trim(), role: "Custom Mentor", emoji: cEmoji, accent: c.accent, soft: c.soft, personality: cPersona.trim(), tagline: "Made just for you." };
    if (student.trim()) {
      try {
        await fetch("/api/mentors", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ student: student.trim(), mentor: m }) });
        setSavedMentors((prev) => [m, ...prev]);
      } catch {}
    }
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
        body: JSON.stringify({ messages: next, mentor, grade, student }),
      });
      const data = await res.json();
      const reply = data.reply || "Let's try that again — say it once more?";
      setMessages((m) => [...m, { role: "assistant", content: reply }]);
      speak(reply);
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: "I lost my train of thought. Send that again?" }]);
    } finally { setLoading(false); }
  }

  function send() { sendText(); }

  // ---------- Builder screen ----------
  if (building) {
    const c = COLORS[cColor];
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-100 via-indigo-50 to-white flex items-center justify-center p-6">
        <div className="w-full max-w-lg">
          <button onClick={() => setBuilding(false)} className="text-slate-400 hover:text-slate-700 mb-4">← Back</button>
          <div className="bg-white rounded-3xl p-6 shadow-sm ring-1 ring-slate-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl" style={{ background: c.soft }}>{cEmoji}</div>
              <div>
                <div className="font-bold text-slate-800 text-lg">{cName || "Your mentor"}</div>
                <div className="text-xs font-semibold uppercase" style={{ color: c.accent }}>Custom Mentor</div>
              </div>
            </div>
            <label className="text-sm font-semibold text-slate-600">Name</label>
            <input value={cName} onChange={(e) => setCName(e.target.value)} placeholder="e.g. Zappy" className="w-full mt-1 mb-4 px-4 py-2 rounded-xl ring-1 ring-slate-200 outline-none text-slate-700" />
            <label className="text-sm font-semibold text-slate-600">Pick a look</label>
            <div className="flex gap-2 mt-1 mb-4 flex-wrap">
              {EMOJIS.map((e) => (
                <button key={e} onClick={() => setCEmoji(e)} className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center ${cEmoji === e ? "ring-2 ring-slate-800" : "ring-1 ring-slate-200"}`}>{e}</button>
              ))}
            </div>
            <label className="text-sm font-semibold text-slate-600">Pick a color</label>
            <div className="flex gap-2 mt-1 mb-4">
              {COLORS.map((col, i) => (
                <button key={i} onClick={() => setCColor(i)} className={`w-9 h-9 rounded-full ${cColor === i ? "ring-2 ring-offset-2 ring-slate-800" : ""}`} style={{ background: col.accent }} />
              ))}
            </div>
            <label className="text-sm font-semibold text-slate-600">Describe your mentor's personality</label>
            <textarea value={cPersona} onChange={(e) => setCPersona(e.target.value)} rows={3} placeholder="e.g. A funny robot who loves space, tells silly jokes, and cheers me on!" className="w-full mt-1 mb-5 px-4 py-2 rounded-xl ring-1 ring-slate-200 outline-none text-slate-700 resize-none" />
            <button onClick={createMentor} disabled={!cName.trim()} className="w-full py-3 rounded-xl font-semibold text-white disabled:opacity-40" style={{ background: c.accent }}>Create my mentor ✨</button>
          </div>
        </div>
      </div>
    );
  }

  // ---------- Picker screen ----------
  if (!mentor) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-100 via-indigo-50 to-white flex items-center justify-center p-6">
        <div className="w-full max-w-3xl">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800 text-center">Choose your mentor</h1>
          <p className="text-slate-500 mt-2 text-center">A guide who helps you figure things out yourself.</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
            {Object.entries(MENTORS).map(([key, m]) => (
              <button key={key} onClick={() => start(m)} className="text-left bg-white rounded-3xl p-5 shadow-sm ring-1 ring-slate-100 hover:shadow-lg hover:-translate-y-1 transition-all">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-4" style={{ background: m.soft }}>{m.emoji}</div>
                <div className="font-bold text-slate-800 text-lg">{m.name}</div>
                <div className="text-xs font-semibold uppercase tracking-wide" style={{ color: m.accent }}>{m.role}</div>
                <p className="text-sm text-slate-500 mt-2">{m.tagline}</p>
              </button>
            ))}
            <button onClick={() => setBuilding(true)} className="flex flex-col items-center justify-center bg-white/60 border-2 border-dashed border-slate-300 rounded-3xl p-5 hover:bg-white hover:border-slate-400 transition-all">
              <div className="text-4xl mb-2">✨</div>
              <div className="font-bold text-slate-700">Create your own</div>
              <p className="text-xs text-slate-500 mt-1 text-center">Make a mentor that's totally yours</p>
            </button>
            {savedMentors.map((m, i) => (
              <button key={"saved" + i} onClick={() => start(m)} className="text-left bg-white rounded-3xl p-5 shadow-sm ring-1 ring-slate-100 hover:shadow-lg hover:-translate-y-1 transition-all">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-4" style={{ background: m.soft }}>{m.emoji}</div>
                <div className="font-bold text-slate-800 text-lg">{m.name}</div>
                <div className="text-xs font-semibold uppercase tracking-wide" style={{ color: m.accent }}>Your mentor</div>
                <p className="text-sm text-slate-500 mt-2">{m.personality?.slice(0, 40) || "Made just for you."}</p>
              </button>
            ))}
          </div>
          <div className="mt-8 flex justify-center">
            <input value={student} onChange={(e) => setStudent(e.target.value)} onBlur={loadMentors} placeholder="What's your name?" className="px-4 py-2 rounded-full ring-1 ring-slate-200 outline-none text-slate-700 text-center" />
          </div>
          <div className="mt-4 flex items-center justify-center gap-2 flex-wrap">
            <span className="text-sm text-slate-500 mr-1">I'm in Class</span>
            {GRADES.map((g) => (
              <button key={g} onClick={() => setGrade(g)} className={`w-9 h-9 rounded-full text-sm font-semibold ${grade === g ? "bg-slate-800 text-white" : "bg-white text-slate-600 ring-1 ring-slate-200"}`}>{g}</button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ---------- Chat screen ----------
  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white flex flex-col">
      <header className="flex items-center gap-3 px-4 py-3 bg-white/80 backdrop-blur ring-1 ring-slate-100">
        <button onClick={() => { stopSpeaking(); stopListening(); setMentor(null); }} className="text-slate-400 hover:text-slate-700">←</button>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ background: mentor.soft }}>{mentor.emoji}</div>
        <div className="leading-tight flex-1">
          <div className="font-bold text-slate-800">{mentor.name}</div>
          <div className="text-xs" style={{ color: mentor.accent }}>{mentor.role} · Class {grade}{student ? ` · ${student}` : ""}</div>
        </div>
        <button onClick={() => { setMuted((v) => { if (!v) stopSpeaking(); return !v; }); }} className="w-10 h-10 rounded-xl ring-1 ring-slate-200 flex items-center justify-center text-lg" title={muted ? "Turn voice on" : "Turn voice off"}>
          {muted ? "🔇" : "🔊"}
        </button>
      </header>

      <div className="flex flex-col items-center pt-4 pb-2">
        <div className="w-44 h-44 rounded-full flex items-center justify-center" style={{ background: mentor.soft }}>
          <DotLottieReact src={CHARACTER_URL} loop autoplay speed={speaking ? 1.4 : 0.7} style={{ width: "150px", height: "150px" }} />
        </div>
        <div className="mt-1 text-xs font-medium" style={{ color: mentor.accent }}>
          {listening ? "listening…" : speaking ? "speaking…" : "\u00A0"}
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4 max-w-2xl w-full mx-auto">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-[15px] leading-relaxed ${m.role === "user" ? "bg-slate-800 text-white rounded-br-md" : "bg-white text-slate-700 ring-1 ring-slate-100 rounded-bl-md"}`}>{m.content}</div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white ring-1 ring-slate-100 px-4 py-3 rounded-2xl rounded-bl-md flex gap-1">
              {[0, 1, 2].map((d) => <span key={d} className="w-2 h-2 rounded-full animate-bounce" style={{ background: mentor.accent, animationDelay: `${d * 0.15}s` }} />)}
            </div>
          </div>
        )}
      </div>

      <div className="px-4 pb-6 pt-2 max-w-2xl w-full mx-auto">
        <div className="flex items-end gap-2 bg-white rounded-2xl ring-1 ring-slate-200 p-2 shadow-sm">
          <button
            onClick={listening ? stopListening : startListening}
            className={`w-11 h-11 rounded-xl flex items-center justify-center text-lg shrink-0 transition-all ${listening ? "bg-red-500 text-white animate-pulse" : "ring-1 ring-slate-200 text-slate-600"}`}
            title={listening ? "Listening… tap to stop & send" : "Tap and talk"}
          >
            🎤
          </button>
          <textarea value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }} rows={1} placeholder={listening ? "Listening… tap mic again when done" : `Ask ${mentor.name} anything…`} className="flex-1 resize-none outline-none bg-transparent px-2 py-2 text-slate-700 max-h-32" />
          <button onClick={send} disabled={loading || !input.trim()} className="px-4 py-2 rounded-xl font-semibold text-white disabled:opacity-40" style={{ background: mentor.accent }}>Send</button>
        </div>
        <p className="text-center text-[11px] text-slate-400 mt-2">{mentor.name} guides you to the answer — parents & teachers are part of the team.</p>
      </div>
    </div>
  );
}