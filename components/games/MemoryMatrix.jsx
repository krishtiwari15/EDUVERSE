"use client";
import { useState } from "react";
import { Grid2x2 } from "lucide-react";
import { Button } from "@/components/ui";
import GameShell, { GameSummary } from "./GameShell";
import { useGameSession } from "@/hooks/useGameSession";

function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

function makePattern(size, count) {
  const total = size * size;
  const cells = new Set();
  while (cells.size < count) cells.add(randInt(0, total - 1));
  return cells;
}

function levelConfig(lv) {
  const sz = Math.min(3 + Math.floor((lv - 1) / 2), 7);
  const count = Math.min(3 + lv, sz * sz - 2);
  const showMs = Math.max(1100, 2600 - lv * 120);
  return { sz, count, showMs };
}

export default function MemoryMatrix({ game, onBack, onAskMentor }) {
  const [phase, setPhase] = useState("setup"); // setup | showing | recall | done
  const [level, setLevel] = useState(1);
  const [size, setSize] = useState(3);
  const [pattern, setPattern] = useState(new Set());
  const [picked, setPicked] = useState(new Set());
  const [summary, setSummary] = useState(null);
  const { start, finish } = useGameSession("memory-matrix");

  function startLevel(lv) {
    const { sz, count, showMs } = levelConfig(lv);
    setSize(sz);
    setPattern(makePattern(sz, count));
    setPicked(new Set());
    setPhase("showing");
    setTimeout(() => setPhase("recall"), showMs);
  }

  function beginGame() {
    setLevel(1);
    setSummary(null);
    start();
    startLevel(1);
  }

  async function endGame(levelsCleared, mistakesCount) {
    setPhase("done");
    const accuracy = levelsCleared + mistakesCount > 0 ? Math.max(0.1, levelsCleared / (levelsCleared + mistakesCount)) : 0;
    const score = levelsCleared * 25;
    const insight = levelsCleared >= 6
      ? "Your working memory is genuinely strong — you held complex patterns with real accuracy."
      : levelsCleared >= 3
      ? "Solid working memory — patterns got away from you as the grid grew, which is completely normal."
      : "Memory games get easier fast with practice — try chunking the pattern into small groups instead of memorizing every cell one by one.";
    const result = await finish({
      difficulty: Math.min(4, Math.max(1, Math.ceil(levelsCleared / 2))), score, accuracy,
      skillConcept: "visual working memory",
      masteryDelta: levelsCleared >= 5 ? 0.08 : levelsCleared <= 1 ? -0.04 : 0.02,
    });
    setSummary({ score, accuracy, insight, levelsCleared, newAchievements: result.newAchievements });
  }

  function clickCell(i) {
    if (phase !== "recall" || picked.has(i)) return;
    const nextPicked = new Set(picked);
    nextPicked.add(i);
    setPicked(nextPicked);
    if (!pattern.has(i)) {
      endGame(level - 1, 1);
      return;
    }
    if ([...pattern].every((c) => nextPicked.has(c))) {
      const nextLevel = level + 1;
      setLevel(nextLevel);
      setTimeout(() => startLevel(nextLevel), 500);
    }
  }

  if (phase === "setup") {
    return (
      <GameShell title="Memory Matrix" onBack={onBack}>
        <div className="glass-card p-6 text-center max-w-sm mx-auto">
          <Grid2x2 size={26} className="text-white/60 mx-auto mb-3" strokeWidth={1.75} />
          <p className="text-white/60 text-sm mb-5">Watch the pattern, then reproduce it from memory. The grid grows every level — play until you slip.</p>
          <Button variant="primary" size="lg" onClick={beginGame} className="w-full">Start</Button>
        </div>
      </GameShell>
    );
  }

  if (phase === "done" && summary) {
    return (
      <GameShell title="Memory Matrix" onBack={onBack}>
        <GameSummary
          title="Memory Matrix" score={summary.score} accuracy={summary.accuracy} insight={summary.insight} newAchievements={summary.newAchievements}
          onPlayAgain={beginGame}
          onAskMentor={onAskMentor ? () => onAskMentor(`I just played Memory Matrix and cleared ${summary.levelsCleared} level${summary.levelsCleared === 1 ? "" : "s"}. Any tips for improving working memory?`) : undefined}
          onBack={onBack}
        />
      </GameShell>
    );
  }

  return (
    <GameShell title="Memory Matrix" difficulty={Math.min(4, Math.max(1, Math.ceil(level / 2)))} onBack={onBack} statusRight={<span className="text-xs text-white/60">Level {level}</span>}>
      <div className="flex flex-col items-center">
        <p className="text-white/60 text-sm mb-4 h-5">{phase === "showing" ? "Memorize the pattern…" : "Now click the cells you saw."}</p>
        <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${size}, minmax(0,1fr))`, width: "min(92vw, 380px)" }}>
          {Array.from({ length: size * size }, (_, i) => {
            const isLit = phase === "showing" && pattern.has(i);
            const isPicked = picked.has(i);
            const isRight = phase === "recall" && isPicked && pattern.has(i);
            return (
              <button
                key={i}
                onClick={() => clickCell(i)}
                aria-label={`Cell ${i + 1}`}
                disabled={phase !== "recall"}
                className={`focus-ring aspect-square rounded-lg transition-colors ${isLit ? "bg-white" : isRight ? "bg-white/60" : "bg-white/10 hover:bg-white/15"}`}
              />
            );
          })}
        </div>
        {phase === "recall" && (
          <Button variant="ghost" size="sm" onClick={() => endGame(level - 1, 0)} className="mt-5">End session</Button>
        )}
      </div>
    </GameShell>
  );
}
