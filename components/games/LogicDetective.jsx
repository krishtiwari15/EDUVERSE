"use client";
import { useEffect, useState } from "react";
import { Search, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui";
import GameShell, { GameSummary } from "./GameShell";
import { useGameSession } from "@/hooks/useGameSession";

export default function LogicDetective({ game, onBack, onAskMentor }) {
  const [phase, setPhase] = useState("setup"); // setup | loading | playing | done
  const [difficulty, setDifficulty] = useState(game.difficulty || 2);
  const [mystery, setMystery] = useState(null);
  const [culprit, setCulprit] = useState(null);
  const [clueIdx, setClueIdx] = useState(null);
  const [summary, setSummary] = useState(null);
  const { start, finish } = useGameSession("logic-detective");

  async function begin() {
    setPhase("loading");
    setCulprit(null); setClueIdx(null); setSummary(null);
    try {
      const res = await fetch("/api/games/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameId: "logic-detective", difficulty }),
      });
      const data = await res.json();
      setMystery(data.data);
      setPhase("playing");
      start();
    } catch {
      setPhase("setup");
    }
  }

  async function solve() {
    const correctCulprit = culprit === mystery.solution.culprit;
    const correctClue = clueIdx === mystery.solution.inconsistentClueIndex;
    const accuracy = (correctCulprit ? 0.5 : 0) + (correctClue ? 0.5 : 0);
    const score = Math.round(accuracy * 100) + difficulty * 5;
    const insight = correctCulprit && correctClue
      ? "Clean deduction — you connected the contradiction to the right suspect."
      : correctCulprit
      ? "You found the culprit, but the clue that proves it was a different one — worth re-reading each alibi against every clue."
      : correctClue
      ? "You spotted the inconsistency, but pinned it on the wrong suspect."
      : "Neither matched this time — try cross-checking each suspect's statement against every clue, one at a time.";
    setPhase("done");
    const result = await finish({
      difficulty, score, accuracy,
      skillConcept: "deductive reasoning",
      masteryDelta: accuracy >= 1 ? 0.08 : accuracy === 0 ? -0.05 : 0.02,
      mistake: accuracy < 1 ? "mixes up deductive reasoning under multiple clues" : null,
    });
    setSummary({ score, accuracy, insight, correctCulprit, correctClue, newAchievements: result.newAchievements });
  }

  if (phase === "setup") {
    return (
      <GameShell title="Logic Detective" onBack={onBack}>
        <div className="glass-card p-6 text-center max-w-sm mx-auto">
          <Search size={26} className="text-white/60 mx-auto mb-3" strokeWidth={1.75} />
          <p className="text-white/60 text-sm mb-4">A fresh mystery every round. Read the clues, find the contradiction, name the culprit.</p>
          <div className="grid grid-cols-4 gap-1.5 mb-5">
            {[1, 2, 3, 4].map((d) => (
              <button key={d} onClick={() => setDifficulty(d)} aria-pressed={difficulty === d} className={`focus-ring py-2 rounded-xl text-xs font-semibold transition ${difficulty === d ? "bg-white text-[var(--pill-ink)]" : "bg-white/5 text-white/70 ring-1 ring-white/15"}`}>
                {["Easy", "Medium", "Hard", "Expert"][d - 1]}
              </button>
            ))}
          </div>
          <Button variant="primary" size="lg" onClick={begin} className="w-full">Start case</Button>
        </div>
      </GameShell>
    );
  }

  if (phase === "loading") {
    return (
      <GameShell title="Logic Detective" onBack={onBack}>
        <div className="flex flex-col items-center justify-center py-16 text-white/60">
          <Loader2 size={24} className="animate-spin mb-3" />
          <p className="text-sm">Writing today&rsquo;s case…</p>
        </div>
      </GameShell>
    );
  }

  if (phase === "done" && summary) {
    return (
      <GameShell title="Logic Detective" onBack={onBack}>
        <div className="max-w-md mx-auto mb-4 glass-card p-4 text-sm text-white/70">
          <span className="font-semibold text-white">Solution: </span>{mystery.solution.culprit} — {mystery.solution.explanation}
        </div>
        <GameSummary
          title="Logic Detective" score={summary.score} accuracy={summary.accuracy} insight={summary.insight} newAchievements={summary.newAchievements}
          onPlayAgain={begin}
          onAskMentor={onAskMentor ? () => onAskMentor(`I just played Logic Detective (${summary.correctCulprit && summary.correctClue ? "solved it fully" : "missed part of it"}). Can you help me practice deductive reasoning?`) : undefined}
          onBack={onBack}
        />
      </GameShell>
    );
  }

  if (!mystery) return null;

  return (
    <GameShell title="Logic Detective" difficulty={difficulty} onBack={onBack}>
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="glass-card p-5">
          <p className="text-eyebrow mb-1.5">The case</p>
          <p className="text-white/85 text-sm leading-relaxed">{mystery.setting}</p>
        </div>

        <div className="glass-card p-5">
          <p className="text-eyebrow mb-3">Suspects — who did it?</p>
          <div className="space-y-2">
            {mystery.suspects.map((s) => (
              <button
                key={s.name}
                onClick={() => setCulprit(s.name)}
                aria-pressed={culprit === s.name}
                className={`focus-ring w-full text-left px-4 py-3 rounded-xl transition ${culprit === s.name ? "bg-white text-[var(--pill-ink)]" : "bg-white/5 text-white ring-1 ring-white/15 hover:bg-white/10"}`}
              >
                <span className="font-semibold">{s.name}</span>
                <span className={`block text-xs mt-0.5 ${culprit === s.name ? "text-[var(--pill-ink)]/70" : "text-white/60"}`}>&ldquo;{s.statement}&rdquo;</span>
              </button>
            ))}
          </div>
        </div>

        <div className="glass-card p-5">
          <p className="text-eyebrow mb-3">Clues — which one proves it?</p>
          <div className="space-y-2">
            {mystery.clues.map((c, i) => (
              <button
                key={i}
                onClick={() => setClueIdx(i)}
                aria-pressed={clueIdx === i}
                className={`focus-ring w-full text-left px-4 py-3 rounded-xl text-sm transition ${clueIdx === i ? "bg-white text-[var(--pill-ink)]" : "bg-white/5 text-white ring-1 ring-white/15 hover:bg-white/10"}`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <Button variant="primary" size="lg" onClick={solve} disabled={culprit === null || clueIdx === null} className="w-full">
          Solve the case
        </Button>
      </div>
    </GameShell>
  );
}
