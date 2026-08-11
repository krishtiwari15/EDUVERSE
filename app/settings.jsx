"use client";
import { useEffect, useState } from "react";
import { ArrowLeft, Camera, Mic, MessageSquare, BrainCircuit, Sparkles, BellRing, Trash2 } from "lucide-react";
import { Button, Surface, Reveal } from "@/components/ui";

function Toggle({ on, onChange, label }) {
  return (
    <button
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={() => onChange(!on)}
      className={`focus-ring relative w-11 h-6 rounded-full shrink-0 transition-colors ${on ? "bg-white" : "bg-white/15"}`}
    >
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full transition-transform ${on ? "translate-x-5 bg-[var(--pill-ink)]" : "translate-x-0 bg-white"}`} />
    </button>
  );
}

const ROWS = [
  { key: "camera", icon: Camera, label: "Camera", desc: "Used only during a focus session you start, to gently estimate presence. Never recorded or uploaded." },
  { key: "microphone", icon: Mic, label: "Microphone", desc: "Lets you talk to your mentor by voice instead of typing." },
  { key: "voiceHistory", icon: MessageSquare, label: "Voice history", desc: "Keeps a light record that you've talked by voice, to improve the experience." },
  { key: "learningMemory", icon: BrainCircuit, label: "Learning memory", desc: "Your mentor remembers concepts, mistakes, and progress across conversations (your Obsidian Mind)." },
  { key: "aiPersonalization", icon: Sparkles, label: "AI personalization", desc: "Your mentor adapts tone and pacing to how you learn." },
  { key: "proactiveMentor", icon: BellRing, label: "Proactive check-ins", desc: "Your mentor can gently check in during focus sessions if you've been away a while." },
];

export default function Settings({ student, onBack }) {
  const [settings, setSettings] = useState(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleted, setDeleted] = useState(false);

  useEffect(() => {
    if (!student) return;
    fetch(`/api/settings?student=${encodeURIComponent(student)}`).then((r) => r.json()).then((d) => setSettings(d.settings)).catch(() => setSettings({}));
  }, [student]);

  function update(key, value) {
    const next = { ...settings, [key]: value };
    setSettings(next);
    fetch("/api/settings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ student, settings: next }) }).catch(() => {});
  }

  async function deleteMemory() {
    try { await fetch(`/api/memory?student=${encodeURIComponent(student)}`, { method: "DELETE" }); } catch {}
    setDeleted(true);
    setConfirmingDelete(false);
  }

  return (
    <div className="relative z-10 w-full max-w-lg mx-auto py-6 px-1">
      <button onClick={onBack} aria-label="Back" className="focus-ring flex items-center gap-1.5 text-white/70 hover:text-white mb-5 font-semibold text-sm">
        <ArrowLeft size={16} /> Back
      </button>

      <Reveal>
        <p className="text-eyebrow mb-1.5">Privacy & Mentor</p>
        <h1 className="text-display text-white">Your controls</h1>
        <p className="text-white/55 mt-1.5">Everything here is off by default except what&apos;s needed to chat. Change your mind anytime.</p>
      </Reveal>

      {!settings ? (
        <div className="mt-8 text-white/50 text-sm">Loading…</div>
      ) : (
        <Surface tier={2} className="mt-6 divide-y divide-white/10">
          {ROWS.map((r) => (
            <div key={r.key} className="flex items-start gap-3 p-4">
              <r.icon size={18} className="text-white/60 mt-0.5 shrink-0" strokeWidth={1.75} />
              <div className="flex-1 min-w-0">
                <div className="text-white text-sm font-semibold">{r.label}</div>
                <p className="text-white/45 text-xs mt-0.5 leading-relaxed">{r.desc}</p>
              </div>
              <Toggle on={!!settings[r.key]} onChange={(v) => update(r.key, v)} label={r.label} />
            </div>
          ))}
        </Surface>
      )}

      <Surface tier={2} className="mt-4 p-4">
        <div className="flex items-start gap-3">
          <Trash2 size={18} className="text-rose-300 mt-0.5 shrink-0" strokeWidth={1.75} />
          <div className="flex-1">
            <div className="text-white text-sm font-semibold">Delete my AI memory</div>
            <p className="text-white/45 text-xs mt-0.5 leading-relaxed">Permanently erases everything your mentor remembers about you — notes, concepts, mistakes, and goals. This can&apos;t be undone.</p>
            {deleted ? (
              <p className="text-white text-xs mt-2 font-semibold">Done — your memory has been cleared.</p>
            ) : confirmingDelete ? (
              <div className="flex gap-2 mt-2.5">
                <Button variant="ghost" size="sm" onClick={() => setConfirmingDelete(false)}>Cancel</Button>
                <Button variant="glass" size="sm" onClick={deleteMemory} className="!text-rose-200">Yes, delete everything</Button>
              </div>
            ) : (
              <Button variant="ghost" size="sm" onClick={() => setConfirmingDelete(true)} className="!text-rose-300 mt-2 !px-0">Delete memory…</Button>
            )}
          </div>
        </div>
      </Surface>
    </div>
  );
}
