"use client";
import { useState } from "react";
import { Wallet, Loader2, TrendingDown, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui";
import GameShell, { GameSummary } from "./GameShell";
import { useGameSession } from "@/hooks/useGameSession";

const ROUND_LENGTH = 4;
const START_BALANCE = 10000;
const IMPACT = { mild: -300, moderate: -1100, severe: -3200 };

export default function FinanceSimulator({ game, onBack, onAskMentor }) {
  const [phase, setPhase] = useState("setup"); // setup | loading | playing | resolved | done
  const [round, setRound] = useState(0);
  const [balance, setBalance] = useState(START_BALANCE);
  const [scenario, setScenario] = useState(null);
  const [chosen, setChosen] = useState(null);
  const [severeCount, setSevereCount] = useState(0);
  const [summary, setSummary] = useState(null);
  const { start, finish } = useGameSession("finance-simulator");

  async function loadScenario() {
    setPhase("loading");
    setChosen(null);
    try {
      const res = await fetch("/api/games/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameId: "finance-simulator", difficulty: game.difficulty || 2 }),
      });
      const data = await res.json();
      setScenario(data.data);
      setPhase("playing");
    } catch {
      setPhase("setup");
    }
  }

  function begin() {
    setRound(0); setBalance(START_BALANCE); setSevereCount(0); setSummary(null);
    start();
    loadScenario();
  }

  function choose(choice) {
    if (chosen) return;
    setChosen(choice);
    const impact = IMPACT[choice.severity] ?? IMPACT.moderate;
    setBalance((b) => Math.max(0, b + impact));
    if (choice.severity === "severe") setSevereCount((c) => c + 1);
    setPhase("resolved");
  }

  async function next() {
    const nextRound = round + 1;
    setRound(nextRound);
    if (nextRound >= ROUND_LENGTH) return finishGame();
    loadScenario();
  }

  async function finishGame() {
    setPhase("done");
    const accuracy = Math.max(0, (ROUND_LENGTH - severeCount) / ROUND_LENGTH);
    const score = Math.round(balance / 50);
    const insight = severeCount === 0
      ? "You consistently avoided the high-risk choices — that instinct is the core of financial resilience."
      : severeCount >= ROUND_LENGTH / 2
      ? "A few of those decisions carried heavy consequences — worth noticing which choices had the steepest downside before picking next time."
      : "A mixed round — some solid calls, a couple of costly ones. That's exactly the kind of practice this game is for.";
    const result = await finish({
      difficulty: game.difficulty, score, accuracy,
      skillConcept: "financial decision-making",
      masteryDelta: severeCount === 0 ? 0.07 : severeCount >= ROUND_LENGTH / 2 ? -0.04 : 0.02,
    });
    setSummary({ score, accuracy, insight, balance, newAchievements: result.newAchievements });
  }

  if (phase === "setup") {
    return (
      <GameShell title="Finance Simulator" onBack={onBack}>
        <div className="glass-card p-6 text-center max-w-sm mx-auto">
          <Wallet size={26} className="text-white/60 mx-auto mb-3" strokeWidth={1.75} />
          <p className="text-white/60 text-sm mb-2">Practice real financial decisions with {START_BALANCE.toLocaleString()} virtual credits — {ROUND_LENGTH} scenarios, no real money involved.</p>
          <p className="text-white/40 text-xs mb-5">This is a practice simulator, not personalized financial advice.</p>
          <Button variant="primary" size="lg" onClick={begin} className="w-full">Start simulation</Button>
        </div>
      </GameShell>
    );
  }

  if (phase === "loading") {
    return (
      <GameShell title="Finance Simulator" onBack={onBack}>
        <div className="flex flex-col items-center justify-center py-16 text-white/60">
          <Loader2 size={24} className="animate-spin mb-3" />
          <p className="text-sm">Preparing your next decision…</p>
        </div>
      </GameShell>
    );
  }

  if (phase === "done" && summary) {
    return (
      <GameShell title="Finance Simulator" onBack={onBack}>
        <GameSummary
          title="Finance Simulator" score={summary.score} accuracy={summary.accuracy} insight={summary.insight} newAchievements={summary.newAchievements}
          onPlayAgain={begin}
          onAskMentor={onAskMentor ? () => onAskMentor(`I just played Finance Simulator and ended with ${summary.balance.toLocaleString()} virtual credits. Can you help me understand good financial decision-making?`) : undefined}
          onBack={onBack}
        />
      </GameShell>
    );
  }

  if (!scenario) return null;

  return (
    <GameShell title="Finance Simulator" onBack={onBack} statusRight={<span className="text-xs text-white/60">Round {round + 1}/{ROUND_LENGTH} · {balance.toLocaleString()} credits</span>}>
      <div className="glass-card p-6 sm:p-8 max-w-xl mx-auto">
        <p className="text-white/85 text-sm leading-relaxed mb-5">{scenario.scenario}</p>
        <div className="grid grid-cols-1 gap-2.5">
          {scenario.choices.map((c, i) => {
            const isChosen = chosen === c;
            return (
              <button
                key={i}
                onClick={() => choose(c)}
                disabled={!!chosen}
                className={`focus-ring px-4 py-3 rounded-xl text-sm text-left transition flex items-center justify-between gap-2
                  ${isChosen ? "bg-white text-[var(--pill-ink)]" : "bg-white/5 text-white ring-1 ring-white/15 hover:bg-white/10"}`}
              >
                <span>{c.label}</span>
                {isChosen && (c.severity === "mild" ? <TrendingUp size={16} className="shrink-0" /> : <TrendingDown size={16} className="shrink-0" />)}
              </button>
            );
          })}
        </div>
        {phase === "resolved" && (
          <div className="mt-5 p-4 rounded-xl bg-white/5 ring-1 ring-white/15">
            <p className="text-white/80 text-sm leading-relaxed">{scenario.insight}</p>
            <p className="text-white/50 text-xs mt-2">{IMPACT[chosen.severity] < 0 ? `${IMPACT[chosen.severity].toLocaleString()} credits` : ""} · Balance now {balance.toLocaleString()}</p>
            <Button variant="primary" size="md" onClick={next} className="w-full mt-4">{round + 1 >= ROUND_LENGTH ? "See results" : "Next decision"}</Button>
          </div>
        )}
      </div>
    </GameShell>
  );
}
