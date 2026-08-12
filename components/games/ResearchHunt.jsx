"use client";
import { useState } from "react";
import { SearchCheck, ShieldCheck, ShieldAlert, Loader2 } from "lucide-react";
import { Button } from "@/components/ui";
import GameShell, { GameSummary } from "./GameShell";
import { useGameSession } from "@/hooks/useGameSession";

export default function ResearchHunt({ game, onBack, onAskMentor }) {
  const [phase, setPhase] = useState("setup"); // setup | loading | playing | done
  const [difficulty, setDifficulty] = useState(game.difficulty || 2);
  const [round, setRound] = useState(null);
  const [trusted, setTrusted] = useState(null);
  const [weak, setWeak] = useState(null);
  const [summary, setSummary] = useState(null);
  const { start, finish } = useGameSession("research-hunt");

  async function begin() {
    setPhase("loading");
    setTrusted(null); setWeak(null); setSummary(null);
    try {
      const res = await fetch("/api/games/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameId: "research-hunt", difficulty }),
      });
      const data = await res.json();
      setRound(data.data);
      setPhase("playing");
      start();
    } catch {
      setPhase("setup");
    }
  }

  async function submit() {
    const correctTrust = trusted === round.correctIndex;
    const correctWeak = weak === round.weakIndex;
    const accuracy = (correctTrust ? 0.5 : 0) + (correctWeak ? 0.5 : 0);
    const score = Math.round(accuracy * 100) + difficulty * 5;
    const insight = correctTrust && correctWeak
      ? "Sharp evaluation — you separated evidence from assertion correctly on both counts."
      : "Reliable sources usually cite methodology or broad consensus; weak ones lean on authority, urgency, or 'everyone knows' language. Worth rereading the reasons given for each source.";
    setPhase("done");
    const result = await finish({
      difficulty, score, accuracy,
      skillConcept: "source evaluation",
      masteryDelta: accuracy >= 1 ? 0.08 : accuracy === 0 ? -0.05 : 0.02,
      mistake: accuracy < 1 ? "struggles distinguishing reliable from weak sources" : null,
    });
    setSummary({ score, accuracy, insight, correctTrust, correctWeak, newAchievements: result.newAchievements });
  }

  if (phase === "setup") {
    return (
      <GameShell title="Research Hunt" onBack={onBack}>
        <div className="glass-card p-6 text-center max-w-sm mx-auto">
          <SearchCheck size={26} className="text-white/60 mx-auto mb-3" strokeWidth={1.75} />
          <p className="text-white/60 text-sm mb-4">Given a question and three sources, find the one you can trust — and the one you can&rsquo;t.</p>
          <div className="grid grid-cols-4 gap-1.5 mb-5">
            {[1, 2, 3, 4].map((d) => (
              <button key={d} onClick={() => setDifficulty(d)} aria-pressed={difficulty === d} className={`focus-ring py-2 rounded-xl text-xs font-semibold transition ${difficulty === d ? "bg-white text-[var(--pill-ink)]" : "bg-white/5 text-white/70 ring-1 ring-white/15"}`}>
                {["Easy", "Medium", "Hard", "Expert"][d - 1]}
              </button>
            ))}
          </div>
          <Button variant="primary" size="lg" onClick={begin} className="w-full">Start hunt</Button>
        </div>
      </GameShell>
    );
  }

  if (phase === "loading") {
    return (
      <GameShell title="Research Hunt" onBack={onBack}>
        <div className="flex flex-col items-center justify-center py-16 text-white/60">
          <Loader2 size={24} className="animate-spin mb-3" />
          <p className="text-sm">Gathering sources…</p>
        </div>
      </GameShell>
    );
  }

  if (phase === "done" && summary) {
    return (
      <GameShell title="Research Hunt" onBack={onBack}>
        <div className="max-w-md mx-auto mb-4 glass-card p-4 text-sm text-white/70 leading-relaxed">
          <span className="font-semibold text-white">Most trustworthy: </span>{round.sources[round.correctIndex].label} — {round.sources[round.correctIndex].reason}
          <br /><span className="font-semibold text-white">Weakest: </span>{round.sources[round.weakIndex].label} — {round.sources[round.weakIndex].reason}
        </div>
        <GameSummary
          title="Research Hunt" score={summary.score} accuracy={summary.accuracy} insight={summary.insight} newAchievements={summary.newAchievements}
          onPlayAgain={begin}
          onAskMentor={onAskMentor ? () => onAskMentor(`I just played Research Hunt. Can you help me get better at evaluating whether a source is trustworthy?`) : undefined}
          onBack={onBack}
        />
      </GameShell>
    );
  }

  if (!round) return null;

  return (
    <GameShell title="Research Hunt" difficulty={difficulty} onBack={onBack}>
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="glass-card p-5">
          <p className="text-eyebrow mb-1.5">The question</p>
          <p className="text-white/85 text-sm leading-relaxed">{round.question}</p>
        </div>

        <div className="glass-card p-5">
          <p className="text-eyebrow mb-3">Sources — mark the most trustworthy and the weakest</p>
          <div className="space-y-3">
            {round.sources.map((s, i) => (
              <div key={i} className="p-3.5 rounded-xl bg-white/5 ring-1 ring-white/10">
                <p className="text-white text-sm font-semibold">{s.label}</p>
                <p className="text-white/60 text-xs mt-1 leading-relaxed">&ldquo;{s.excerpt}&rdquo;</p>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => setTrusted(i)}
                    aria-pressed={trusted === i}
                    className={`focus-ring flex-1 px-3 py-2 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1.5 ${trusted === i ? "bg-white text-[var(--pill-ink)]" : "bg-white/5 text-white/70 ring-1 ring-white/15 hover:bg-white/10"}`}
                  >
                    <ShieldCheck size={13} /> Trust this
                  </button>
                  <button
                    onClick={() => setWeak(i)}
                    aria-pressed={weak === i}
                    className={`focus-ring flex-1 px-3 py-2 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1.5 ${weak === i ? "bg-rose-500/25 text-rose-200 ring-1 ring-rose-400/40" : "bg-white/5 text-white/70 ring-1 ring-white/15 hover:bg-white/10"}`}
                  >
                    <ShieldAlert size={13} /> Flag as weak
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Button variant="primary" size="lg" onClick={submit} disabled={trusted === null || weak === null || trusted === weak} className="w-full">
          Submit evaluation
        </Button>
      </div>
    </GameShell>
  );
}
