"use client";
import { useEffect, useState } from "react";
import { LogOut, ArrowLeft, ArrowRight, Plus, Star, Users, Copy, Check } from "lucide-react";
import { Button, Surface, Reveal, RevealGroup, RevealItem } from "@/components/ui";
import BrandMark from "@/components/BrandMark";
import VoidBackdrop from "@/components/VoidBackdrop";

function CreateClassForm({ onCreated }) {
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [busy, setBusy] = useState(false);
  const [newCode, setNewCode] = useState(null);
  const [copied, setCopied] = useState(false);

  async function submit(e) {
    e.preventDefault();
    if (!name.trim() || busy) return;
    setBusy(true);
    try {
      const res = await fetch("/api/class", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), subject: subject.trim() || null }),
      });
      const data = await res.json();
      if (data.ok) {
        setNewCode(data.class.join_code);
        setName(""); setSubject("");
        onCreated(data.class);
      }
    } catch {} finally { setBusy(false); }
  }

  function copyCode() {
    navigator.clipboard?.writeText(newCode).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500); });
  }

  return (
    <Surface tier={2} className="p-5">
      <p className="text-eyebrow mb-3">Create a class</p>
      <form onSubmit={submit} className="flex flex-col sm:flex-row gap-2">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Class name, e.g. Period 3 Algebra" className="focus-ring flex-1 px-4 py-2.5 rounded-xl bg-white/95 text-slate-800 text-sm placeholder:text-slate-400" />
        <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject (optional)" className="focus-ring sm:w-48 px-4 py-2.5 rounded-xl bg-white/95 text-slate-800 text-sm placeholder:text-slate-400" />
        <Button type="submit" variant="primary" size="sm" icon={Plus} disabled={busy || !name.trim()}>{busy ? "Creating…" : "Create"}</Button>
      </form>
      {newCode && (
        <div className="mt-3 flex items-center gap-2 text-sm">
          <span className="text-white/60">Join code:</span>
          <span className="font-mono font-bold text-white tracking-widest">{newCode}</span>
          <button onClick={copyCode} className="focus-ring text-white/50 hover:text-white transition" aria-label="Copy join code">
            {copied ? <Check size={14} /> : <Copy size={14} />}
          </button>
        </div>
      )}
    </Surface>
  );
}

function ClassDetail({ classId, onBack }) {
  const [data, setData] = useState(null);
  const [title, setTitle] = useState("");
  const [topic, setTopic] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [creating, setCreating] = useState(false);

  function load() {
    fetch(`/api/class/${classId}`).then((r) => r.json()).then((d) => setData(d)).catch(() => setData({ ok: false }));
  }
  useEffect(() => { load(); }, [classId]); // eslint-disable-line react-hooks/exhaustive-deps

  async function createAssignment(e) {
    e.preventDefault();
    if (!title.trim() || !topic.trim() || creating) return;
    setCreating(true);
    try {
      const res = await fetch("/api/assignment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ classId, title: title.trim(), topic: topic.trim(), dueDate: dueDate || null }),
      });
      const d = await res.json();
      if (d.ok) { setTitle(""); setTopic(""); setDueDate(""); load(); }
    } catch {} finally { setCreating(false); }
  }

  if (!data) return <p className="text-white/50 text-sm mt-6">Loading…</p>;
  if (!data.ok && data.error) return <p className="text-white/50 text-sm mt-6">{data.error}</p>;

  const { class: cls, roster = [], assignments = [] } = data;

  return (
    <div className="mt-6">
      <button onClick={onBack} aria-label="Back to classes" className="focus-ring flex items-center gap-1.5 text-white/70 hover:text-white font-semibold text-sm mb-5">
        <ArrowLeft size={16} /> Back to classes
      </button>

      <Reveal>
        <h2 className="text-display text-white">{cls.name}</h2>
        <p className="text-white/50 text-sm mt-1">{cls.subject ? `${cls.subject} · ` : ""}Join code: <span className="font-mono font-bold text-white/80 tracking-widest">{cls.join_code}</span></p>
      </Reveal>

      <Reveal delay={0.05}>
        <Surface tier={2} className="mt-5 p-5">
          <p className="text-eyebrow mb-3">Create an assignment</p>
          <form onSubmit={createAssignment} className="flex flex-col gap-2.5">
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title, e.g. Fractions practice" className="focus-ring px-4 py-2.5 rounded-xl bg-white/95 text-slate-800 text-sm placeholder:text-slate-400" />
            <textarea value={topic} onChange={(e) => setTopic(e.target.value)} rows={3} placeholder="Describe the topic and goal — the mentor will write the actual assignment for you." className="focus-ring px-4 py-2.5 rounded-xl bg-white/95 text-slate-800 text-sm resize-none placeholder:text-slate-400" />
            <div className="flex items-center gap-2">
              <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="focus-ring px-4 py-2.5 rounded-xl bg-white/95 text-slate-800 text-sm" />
              <Button type="submit" variant="primary" size="sm" icon={ArrowRight} iconPosition="right" disabled={creating || !title.trim() || !topic.trim()} className="ml-auto">
                {creating ? "Generating…" : "Generate & post"}
              </Button>
            </div>
          </form>
        </Surface>
      </Reveal>

      <Reveal delay={0.08}>
        <Surface tier={2} className="mt-5 p-5">
          <p className="text-eyebrow mb-3">Roster · {roster.length}</p>
          {roster.length === 0 ? (
            <p className="text-white/40 text-sm">No students have joined yet — share the join code above.</p>
          ) : (
            <div className="space-y-1.5">
              {roster.map((s) => (
                <div key={s.id} className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/5 text-sm">
                  <span className="text-white/85">{s.name}</span>
                  <span className="flex items-center gap-1 text-white/50 text-xs"><Star size={11} className="fill-white/50" /> {s.stars}</span>
                </div>
              ))}
            </div>
          )}
        </Surface>
      </Reveal>

      <Reveal delay={0.1}>
        <Surface tier={2} className="mt-5 p-5">
          <p className="text-eyebrow mb-3">Assignments</p>
          {assignments.length === 0 ? (
            <p className="text-white/40 text-sm">Nothing posted yet.</p>
          ) : (
            <div className="space-y-2">
              {assignments.map((a) => (
                <div key={a.id} className="px-3 py-2.5 rounded-lg bg-white/5 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-white font-semibold">{a.title}</span>
                    <span className="text-white/40 text-xs">{a.completed_count}/{roster.length} done</span>
                  </div>
                  {a.due_date && <p className="text-white/40 text-xs mt-0.5">Due {a.due_date}</p>}
                </div>
              ))}
            </div>
          )}
        </Surface>
      </Reveal>
    </div>
  );
}

export default function TeacherDashboard({ user, onLogout }) {
  const [classes, setClasses] = useState(null);
  const [selectedId, setSelectedId] = useState(null);

  function loadClasses() {
    fetch("/api/class").then((r) => r.json()).then((d) => setClasses(d.classes || [])).catch(() => setClasses([]));
  }
  useEffect(() => { loadClasses(); }, []);

  return (
    <div className="relative min-h-app safe-pad screen-enter">
      <VoidBackdrop />
      <div className="relative z-10 w-full max-w-3xl mx-auto py-4">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2.5">
            <BrandMark className="w-5 h-8" />
            <span className="text-heading text-white">EduVerse</span>
          </div>
          <button onClick={onLogout} className="focus-ring flex items-center gap-1.5 text-white/50 hover:text-white text-xs font-semibold transition">
            <LogOut size={13} /> Log out
          </button>
        </div>

        {selectedId ? (
          <ClassDetail classId={selectedId} onBack={() => { setSelectedId(null); loadClasses(); }} />
        ) : (
          <>
            <Reveal>
              <p className="text-eyebrow mb-1.5">Teacher Copilot</p>
              <h1 className="text-display text-white">Hi {user?.name}</h1>
              <p className="text-white/55 mt-1.5 max-w-lg">Create classes, generate real assignments with your mentor, and see who&apos;s completed them.</p>
            </Reveal>

            <Reveal delay={0.05}><div className="mt-6"><CreateClassForm onCreated={loadClasses} /></div></Reveal>

            <div className="mt-6">
              {classes === null ? (
                <p className="text-white/50 text-sm">Loading…</p>
              ) : classes.length === 0 ? (
                <Surface tier={2} className="p-8 text-center">
                  <Users size={26} className="text-white/40 mx-auto mb-3" strokeWidth={1.5} />
                  <p className="text-white/70 font-semibold">No classes yet</p>
                  <p className="text-white/45 text-sm mt-1 max-w-xs mx-auto">Create one above to get a join code you can share with students.</p>
                </Surface>
              ) : (
                <RevealGroup className="grid sm:grid-cols-2 gap-3" stagger={0.06}>
                  {classes.map((c) => (
                    <RevealItem key={c.id}>
                      <button onClick={() => setSelectedId(c.id)} className="focus-ring w-full text-left glass-card p-4 hover:bg-white/10 hover:-translate-y-0.5 active:scale-95 transition-all">
                        <div className="text-heading text-white text-base">{c.name}</div>
                        <div className="text-white/45 text-xs mt-1">{c.subject ? `${c.subject} · ` : ""}{c.student_count} student{c.student_count === 1 ? "" : "s"}</div>
                        <div className="text-white/40 text-xs mt-2 font-mono tracking-widest">{c.join_code}</div>
                      </button>
                    </RevealItem>
                  ))}
                </RevealGroup>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
