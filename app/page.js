"use client";
import { useState, useRef, useEffect } from "react";

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

// The animated tutor face (blinks always, mouth moves while speaking)
function TutorFace({ speaking, accent }) {
  return (
    <svg viewBox="0 0 200 200" className="w-full h-full">
      {/* shoulders / clothing (uses mentor color) */}
      <ellipse cx="100" cy="200" rx="72" ry="42" fill={accent} />
      <rect x="88" y="138" width="24" height="34" rx="11" fill="#F0C4A0" />
      {/* back hair */}
      <ellipse cx="100" cy="94" rx="72" ry="78" fill="#4A3327" />
      <path d="M32 96 Q30 150 44 182 Q52 150 54 118 Z" fill="#4A3327" />
      <path d="M168 96 Q170 150 156 182 Q148 150 146 118 Z" fill="#4A3327" />
      {/* face */}
      <ellipse cx="100" cy="100" rx="50" ry="58" fill="#F0C4A0" />
      {/* ears */}
      <ellipse cx="52" cy="104" rx="8" ry="12" fill="#F0C4A0" />
      <ellipse cx="148" cy="104" rx="8" ry="12" fill="#F0C4A0" />
      {/* front bangs */}
      <path d="M49 96 Q52 54 100 50 Q148 54 151 96 Q140 76 118 80 Q110 62 100 62 Q90 62 82 80 Q60 76 49 96 Z" fill="#4A3327" />
      {/* eyebrows */}
      <path d="M68 90 Q83 83 96 89" stroke="#3A281E" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M104 89 Q117 83 132 90" stroke="#3A281E" strokeWidth="3" fill="none" strokeLinecap="round" />
      {/* eyes (this whole group blinks) */}
      <g className="eyes">
        {/* left */}
        <ellipse cx="83" cy="104" rx="11" ry="13" fill="#fff" />
        <circle cx="83" cy="105" r="6" fill="#6E4A2C" />
        <circle cx="83" cy="105" r="3" fill="#241812" />
        <circle cx="85" cy="103" r="1.6" fill="#fff" />
        <path d="M72 98 Q83 92 94 98" stroke="#2A1E16" strokeWidth="2.2" fill="none" strokeLinecap="round" />
        <path d="M72 98 L69 95 M74 96 L72 92" stroke="#2A1E16" strokeWidth="1.6" strokeLinecap="round" />
        {/* right */}
        <ellipse cx="117" cy="104" rx="11" ry="13" fill="#fff" />
        <circle cx="117" cy="105" r="6" fill="#6E4A2C" />
        <circle cx="117" cy="105" r="3" fill="#241812" />
        <circle cx="119" cy="103" r="1.6" fill="#fff" />
        <path d="M106 98 Q117 92 128 98" stroke="#2A1E16" strokeWidth="2.2" fill="none" strokeLinecap="round" />
        <path d="M128 98 L131 95 M126 96 L128 92" stroke="#2A1E16" strokeWidth="1.6" strokeLinecap="round" />
      </g>
      {/* nose */}
      <path d="M100 108 Q104 118 97 120" stroke="#E3AE88" strokeWidth="2.4" fill="none" strokeLinecap="round" />
      {/* cheeks */}
      <ellipse cx="74" cy="120" rx="7" ry="4" fill="#F49189" opacity="0.55" />
      <ellipse cx="126" cy="120" rx="7" ry="4" fill="#F49189" opacity="0.55" />
      {/* mouth: smile when quiet, open + moving when speaking */}
      {speaking ? (
        <g className="mouth-talk">
          <ellipse cx="100" cy="132" rx="10" ry="8" fill="#B5504A" />
          <ellipse cx="100" cy="134" rx="6" ry="4" fill="#8A3B37" />
        </g>
      ) : (
        <path d="M86 130 Q100 142 114 130" stroke="#C85E58" strokeWidth="4" fill="none" strokeLinecap="round" />
      )}
    </svg>
  );
}

export default function Home() {
  const [mentor, setMentor] = useState(null);
  const [building, setBuilding] = useState(false);
  const [savedMentors, setSavedMentors] = useState([]);
  const [student, setStudent] = useState("");
  const [grade, setGrade] = useState(3);
  const [muted, setMuted] = useState(false);
  const [speaking, setSpeaking] = useState(false);
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

  async function send() {
    const text = input.trim();
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
      <style jsx>{`
        @keyframes blink {
          0%, 92%, 100% { transform: scaleY(1); }
          96% { transform: scaleY(0.08); }
        }
        @keyframes talk {
          0%, 100% { transform: scaleY(0.4); }
          50% { transform: scaleY(1); }
        }
        @keyframes sway {
          0%, 100% { transform: rotate(-1.5deg); }
          50% { transform: rotate(1.5deg); }
        }
        @keyframes glowpulse {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.12); }
        }
        :global(.eyes) { animation: blink 4.5s infinite; transform-box: fill-box; transform-origin: center; }
        :global(.mouth-talk) { animation: talk 0.24s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
        .face-wrap { animation: sway 4s ease-in-out infinite; transform-origin: center bottom; }
        .glow-ring { animation: glowpulse 1s ease-in-out infinite; }
      `}</style>

      <header className="flex items-center gap-3 px-4 py-3 bg-white/80 backdrop-blur ring-1 ring-slate-100">
        <button onClick={() => { stopSpeaking(); setMentor(null); }} className="text-slate-400 hover:text-slate-700">←</button>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ background: mentor.soft }}>{mentor.emoji}</div>
        <div className="leading-tight flex-1">
          <div className="font-bold text-slate-800">{mentor.name}</div>
          <div className="text-xs" style={{ color: mentor.accent }}>{mentor.role} · Class {grade}{student ? ` · ${student}` : ""}</div>
        </div>
        <button onClick={() => { setMuted((v) => { if (!v) stopSpeaking(); return !v; }); }} className="w-10 h-10 rounded-xl ring-1 ring-slate-200 flex items-center justify-center text-lg" title={muted ? "Turn voice on" : "Turn voice off"}>
          {muted ? "🔇" : "🔊"}
        </button>
      </header>

      {/* Animated tutor face */}
      <div className="flex flex-col items-center pt-6 pb-2">
        <div className="relative w-40 h-40">
          <div className="glow-ring absolute inset-0 rounded-full" style={{ background: mentor.accent, filter: "blur(18px)", opacity: speaking ? undefined : 0 }} />
          <div className="face-wrap relative w-40 h-40 rounded-full overflow-hidden shadow-sm ring-1 ring-black/5" style={{ background: mentor.soft }}>
            <TutorFace speaking={speaking} accent={mentor.accent} />
          </div>
        </div>
        <div className="mt-2 text-xs font-medium" style={{ color: mentor.accent }}>{speaking ? "speaking…" : "\u00A0"}</div>
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
          <textarea value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }} rows={1} placeholder={`Ask ${mentor.name} anything…`} className="flex-1 resize-none outline-none bg-transparent px-2 py-2 text-slate-700 max-h-32" />
          <button onClick={send} disabled={loading || !input.trim()} className="px-4 py-2 rounded-xl font-semibold text-white disabled:opacity-40" style={{ background: mentor.accent }}>Send</button>
        </div>
        <p className="text-center text-[11px] text-slate-400 mt-2">{mentor.name} guides you to the answer — parents & teachers are part of the team.</p>
      </div>
    </div>
  );
}