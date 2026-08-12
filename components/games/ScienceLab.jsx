"use client";
import { useState } from "react";
import { FlaskConical, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui";
import GameShell, { GameSummary } from "./GameShell";
import { useGameSession } from "@/hooks/useGameSession";

export default function ScienceLab({ game, onBack, onAskMentor }) {
  const [phase, setPhase] = useState("setup"); // setup | loading | predicting | revealed | done
  const [difficulty, setDifficulty] = useState(game.difficulty || 2);
  const [scenario, setScenario] = useState(null);
  const [picked, setPicked] = useState(null);
  const [summary, setSummary] = useState(null);
  const { start, finish } = useGameSession("science-lab");

  async function begin() {
    setPhase("loading");
    setPicked(null); setSummary(null);
    try {
      const res = await fetch("/api/games/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameId: "science-lab", difficulty }),
      });
      const data = await res.json();
      setScenario(data.data);
      setPhase("predicting");
      start();
    } catch {
      setPhase("setup");
    }
  }

  function predict(idx) {
    if (picked !== null) return;
    setPicked(idx);
    setPhase("revealed");
  }

  async function finishRound() {
    const correct = picked === scenario.correctIndex;
    const accuracy = correct ? 1 : 0;
    const score = correct ? 60 + difficulty * 10 : 15;
    const insight = correct
      ? `Correct prediction — ${scenario.topic} clicked for you.`
      : `Not quite this time, but you now know why: it comes down to ${scenario.variable}.`;
    setPhase("done");
    const result = await finish({
      difficulty, score, accuracy,
      skillConcept: scenario.topic || "science reasoning",
      masteryDelta: correct ? 0.07 : -0.04,
      mistake: correct ? null : `misjudges ${scenario.topic}`,
    });
    setSummary({ score, accuracy, insight, correct, newAchievements: result.newAchievements });
  }

  if (phase === "setup") {
    return (
      <GameShell title="Science Lab" onBack={onBack}>
        <div className="glass-card p-6 text-center max-w-sm mx-auto">
          <FlaskConical size={26} className="text-white/60 mx-auto mb-3" strokeWidth={1.75} />
          <p className="text-white/60 text-sm mb-4">Predict what happens, then discover the real reason. Physics, chemistry, biology, astronomy — a fresh scenario every round.</p>
          <div className="grid grid-cols-4 gap-1.5 mb-5">
            {[1, 2, 3, 4].map((d) => (
              <button key={d} onClick={() => setDifficulty(d)} aria-pressed={difficulty === d} className={`focus-ring py-2 rounded-xl text-xs font-semibold transition ${difficulty === d ? "bg-white text-[var(--pill-ink)]" : "bg-white/5 text-white/70 ring-1 ring-white/15"}`}>
                {["Easy", "Medium", "Hard", "Expert"][d - 1]}
              </button>
            ))}
          </div>
          <Button variant="primary" size="lg" onClick={begin} className="w-full">Start experiment</Button>
        </div>
      </GameShell>
    );
  }

  if (phase === "loading") {
    return (
      <GameShell title="Science Lab" onBack={onBack}>
        <div className="flex flex-col items-center justify-center py-16 text-white/60">
          <Loader2 size={24} className="animate-spin mb-3" />
          <p className="text-sm">Setting up the experiment…</p>
        </div>
      </GameShell>
    );
  }

  if (phase === "done" && summary) {
    return (
      <GameShell title="Science Lab" onBack={onBack}>
        <GameSummary
          title="Science Lab" score={summary.score} accuracy={summary.accuracy} insight={summary.insight} newAchievements={summary.newAchievements}
          onPlayAgain={begin}
          onAskMentor={onAskMentor ? () => onAskMentor(`I just played Science Lab on the topic of ${scenario.topic}. ${summary.correct ? "I got it right, but" : "I got it wrong —"} can you help me understand it better?`) : undefined}
          onBack={onBack}
        />
      </GameShell>
    );
  }

  if (!scenario) return null;

  return (
    <GameShell title="Science Lab" difficulty={difficulty} onBack={onBack} statusRight={<span className="text-xs text-white/60">{scenario.topic}</span>}>
      <div className="glass-card p-6 sm:p-8 max-w-xl mx-auto">
        <p className="text-white/85 text-sm leading-relaxed mb-4">{scenario.setup}</p>
        <h2 className="text-heading text-white mb-5">{scenario.question}</h2>
        <div className="grid grid-cols-1 gap-2.5">
          {scenario.options.map((opt, i) => {
            const isPicked = picked === i;
            const isCorrectOpt = picked !== null && i === scenario.correctIndex;
            const isWrongPick = isPicked && i !== scenario.correctIndex;
            return (
              <button
                key={i}
                onClick={() => predict(i)}
                disabled={picked !== null}
                className={`focus-ring px-4 py-3 rounded-xl text-sm text-left transition flex items-center gap-1.5
                  ${isCorrectOpt ? "bg-white text-[var(--pill-ink)]" : isWrongPick ? "bg-rose-500/20 text-rose-200 ring-1 ring-rose-400/40" : "bg-white/5 text-white ring-1 ring-white/15 hover:bg-white/10"}`}
              >
                {isCorrectOpt && <CheckCircle2 size={14} className="shrink-0" />}
                {isWrongPick && <XCircle size={14} className="shrink-0" />}
                {opt}
              </button>
            );
          })}
        </div>
        {phase === "revealed" && (
          <div className="mt-5 p-4 rounded-xl bg-white/5 ring-1 ring-white/15">
            <p className="text-white/80 text-sm leading-relaxed">{scenario.explanation}</p>
            <Button variant="primary" size="md" onClick={finishRound} className="w-full mt-4">Continue</Button>
          </div>
        )}
      </div>
    </GameShell>
  );
}
