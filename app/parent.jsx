"use client";
import { useEffect, useState } from "react";
import { LogOut, Star, Users, ArrowRight } from "lucide-react";
import { Button, Surface, Reveal, RevealGroup, RevealItem } from "@/components/ui";
import BrandMark from "@/components/BrandMark";
import VoidBackdrop from "@/components/VoidBackdrop";

export default function ParentDashboard({ user, onLogout }) {
  const [children, setChildren] = useState(null); // null = loading
  const [code, setCode] = useState("");
  const [linkError, setLinkError] = useState("");
  const [linking, setLinking] = useState(false);

  function loadChildren() {
    fetch("/api/parent/children").then((r) => r.json()).then((d) => setChildren(d.children || [])).catch(() => setChildren([]));
  }

  useEffect(() => { loadChildren(); }, []);

  async function submitCode(e) {
    e.preventDefault();
    if (!code.trim() || linking) return;
    setLinking(true);
    setLinkError("");
    try {
      const res = await fetch("/api/parent/link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim() }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) { setLinkError(data.error || "Something went wrong."); return; }
      setCode("");
      loadChildren();
    } catch {
      setLinkError("Couldn't reach the server. Try again.");
    } finally {
      setLinking(false);
    }
  }

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

        <Reveal>
          <p className="text-eyebrow mb-1.5">Parent Copilot</p>
          <h1 className="text-display text-white">Hi {user?.name}</h1>
          <p className="text-white/55 mt-1.5 max-w-lg">Plain-language updates on your child&apos;s progress — built from what they&apos;ve actually learned with their mentor, nothing fabricated.</p>
        </Reveal>

        <Reveal delay={0.06}>
          <Surface tier={2} className="mt-6 p-5">
            <p className="text-eyebrow mb-3">Link a child</p>
            <form onSubmit={submitCode} className="flex gap-2">
              <input
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="Enter the code they gave you"
                maxLength={6}
                className="focus-ring flex-1 px-4 py-2.5 rounded-xl bg-white/90 text-slate-800 text-sm tracking-widest font-semibold placeholder:font-normal placeholder:tracking-normal placeholder:text-slate-400"
              />
              <Button type="submit" variant="primary" size="sm" icon={ArrowRight} iconPosition="right" disabled={linking || !code.trim()}>
                {linking ? "Linking…" : "Link"}
              </Button>
            </form>
            {linkError && <p role="alert" className="mt-2.5 text-white text-xs font-medium bg-white/10 ring-1 ring-white/25 px-3 py-2 rounded-lg">{linkError}</p>}
            <p className="text-white/40 text-xs mt-2.5">Your child can find their code under Settings → Invite a parent.</p>
          </Surface>
        </Reveal>

        <div className="mt-8">
          {children === null ? (
            <p className="text-white/50 text-sm">Loading…</p>
          ) : children.length === 0 ? (
            <Surface tier={2} className="p-8 text-center">
              <Users size={26} className="text-white/40 mx-auto mb-3" strokeWidth={1.5} />
              <p className="text-white/70 font-semibold">No children linked yet</p>
              <p className="text-white/45 text-sm mt-1 max-w-xs mx-auto">Enter the code your child shares from their Settings to see their progress here.</p>
            </Surface>
          ) : (
            <RevealGroup className="space-y-4" stagger={0.06}>
              {children.map((c) => (
                <RevealItem key={c.id}>
                  <Surface tier={3} className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-heading text-white">{c.name}</h3>
                        <p className="text-white/45 text-xs mt-0.5">{c.level}{c.subjects?.length ? ` · ${c.subjects.join(", ")}` : ""}</p>
                      </div>
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 ring-1 ring-white/20 text-white text-sm font-bold shrink-0">
                        <Star size={13} className="fill-white text-white" /> {c.stars}
                      </div>
                    </div>
                    <p className="text-white/75 text-sm mt-3 leading-relaxed">{c.summary}</p>
                    {c.knowledge?.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {c.knowledge.map((k) => (
                          <span key={k.subject} className="px-2.5 py-1 rounded-full bg-white/5 ring-1 ring-white/15 text-white/60 text-xs">
                            {k.subject} · {k.level}
                          </span>
                        ))}
                      </div>
                    )}
                  </Surface>
                </RevealItem>
              ))}
            </RevealGroup>
          )}
        </div>
      </div>
    </div>
  );
}
