"use client";
import { useEffect, useState } from "react";
import { Lightbulb, RotateCcw, Pause, Play } from "lucide-react";
import { Button } from "@/components/ui";
import GameShell, { GameSummary } from "./GameShell";
import { useGameSession } from "@/hooks/useGameSession";
import { DIFFICULTY_LABELS } from "@/lib/games";

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function isValid(grid, row, col, num) {
  for (let i = 0; i < 9; i++) {
    if (grid[row][i] === num || grid[i][col] === num) return false;
  }
  const br = row - (row % 3), bc = col - (col % 3);
  for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) {
    if (grid[br + r][bc + c] === num) return false;
  }
  return true;
}

function fillRandom(grid) {
  for (let idx = 0; idx < 81; idx++) {
    const r = Math.floor(idx / 9), c = idx % 9;
    if (grid[r][c] !== 0) continue;
    for (const n of shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9])) {
      if (isValid(grid, r, c, n)) {
        grid[r][c] = n;
        if (fillRandom(grid)) return true;
        grid[r][c] = 0;
      }
    }
    return false;
  }
  return true;
}

function countSolutions(grid, limit = 2) {
  let count = 0;
  const g = grid.map((row) => [...row]);
  function helper() {
    if (count >= limit) return;
    for (let idx = 0; idx < 81; idx++) {
      const r = Math.floor(idx / 9), c = idx % 9;
      if (g[r][c] === 0) {
        for (let n = 1; n <= 9; n++) {
          if (isValid(g, r, c, n)) {
            g[r][c] = n;
            helper();
            g[r][c] = 0;
            if (count >= limit) return;
          }
        }
        return;
      }
    }
    count++;
  }
  helper();
  return count;
}

const CLUES_BY_DIFFICULTY = { 1: 40, 2: 34, 3: 28, 4: 24 };

function generatePuzzle(difficulty) {
  const solved = Array.from({ length: 9 }, () => Array(9).fill(0));
  fillRandom(solved);
  const puzzle = solved.map((row) => [...row]);
  const cellsToRemove = 81 - (CLUES_BY_DIFFICULTY[difficulty] || 34);
  const positions = shuffle(Array.from({ length: 81 }, (_, i) => i));
  let removed = 0;
  for (const pos of positions) {
    if (removed >= cellsToRemove) break;
    const r = Math.floor(pos / 9), c = pos % 9;
    const backup = puzzle[r][c];
    puzzle[r][c] = 0;
    if (countSolutions(puzzle, 2) !== 1) puzzle[r][c] = backup;
    else removed++;
  }
  return { puzzle, solution: solved };
}

export default function Sudoku({ game, onBack, onAskMentor }) {
  const [difficulty, setDifficulty] = useState(game.difficulty || 2);
  const [phase, setPhase] = useState("setup"); // setup | playing | paused | done
  const [solution, setSolution] = useState(null);
  const [grid, setGrid] = useState(null);
  const [given, setGiven] = useState(null);
  const [selected, setSelected] = useState(null);
  const [mistakes, setMistakes] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [summary, setSummary] = useState(null);
  const [generating, setGenerating] = useState(false);
  const { start, finish } = useGameSession("sudoku");

  useEffect(() => {
    if (phase !== "playing") return;
    const t = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(t);
  }, [phase]);

  function newGame() {
    setGenerating(true);
    setTimeout(() => {
      const { puzzle: p, solution: s } = generatePuzzle(difficulty);
      setSolution(s);
      setGrid(p.map((row) => [...row]));
      setGiven(p.map((row) => row.map((v) => v !== 0)));
      setSelected(null);
      setMistakes(0);
      setHintsUsed(0);
      setElapsed(0);
      setSummary(null);
      setGenerating(false);
      setPhase("playing");
      start();
    }, 10);
  }

  async function completeGame(finalGrid, mistakesCount, hintsCount) {
    setPhase("done");
    const accuracy = Math.max(0, 1 - mistakesCount / 30);
    const score = Math.max(0, Math.round(500 - elapsed - mistakesCount * 15 - hintsCount * 10));
    const insight = mistakesCount === 0
      ? "Clean solve — your elimination logic held up the whole way through."
      : mistakesCount <= 3
      ? "Solid solve. A couple of slips, but you recovered well — that's real logical reasoning at work."
      : "You got there. Next time, try scanning each row, column, and 3×3 box before placing a number rather than guessing.";
    const result = await finish({
      difficulty, score, accuracy,
      skillConcept: "sudoku logic",
      masteryDelta: mistakesCount === 0 ? 0.1 : mistakesCount > 6 ? -0.05 : 0.03,
    });
    setSummary({ score, accuracy, insight, newAchievements: result.newAchievements });
  }

  function placeNumber(n) {
    if (!selected || phase !== "playing" || !grid) return;
    const { r, c } = selected;
    if (given[r][c]) return;
    const next = grid.map((row) => [...row]);
    next[r][c] = n;
    setGrid(next);
    const newMistakes = n !== 0 && n !== solution[r][c] ? mistakes + 1 : mistakes;
    if (newMistakes !== mistakes) setMistakes(newMistakes);
    if (next.every((row, ri) => row.every((v, ci) => v === solution[ri][ci]))) {
      completeGame(next, newMistakes, hintsUsed);
    }
  }

  function useHint() {
    if (!selected || phase !== "playing" || !grid) return;
    const { r, c } = selected;
    if (given[r][c]) return;
    const next = grid.map((row) => [...row]);
    next[r][c] = solution[r][c];
    setGrid(next);
    const newHints = hintsUsed + 1;
    setHintsUsed(newHints);
    if (next.every((row, ri) => row.every((v, ci) => v === solution[ri][ci]))) {
      completeGame(next, mistakes, newHints);
    }
  }

  useEffect(() => {
    if (phase !== "playing") return;
    function onKey(e) {
      if (e.key >= "1" && e.key <= "9") placeNumber(Number(e.key));
      else if (e.key === "Backspace" || e.key === "Delete") placeNumber(0);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, selected, grid, mistakes, hintsUsed]);

  const mm = String(Math.floor(elapsed / 60)).padStart(2, "0");
  const ss = String(elapsed % 60).padStart(2, "0");

  if (phase === "setup") {
    return (
      <GameShell title="Sudoku" onBack={onBack}>
        <div className="glass-card p-6 text-center max-w-sm mx-auto">
          <p className="text-white/60 text-sm mb-4">Classic number logic. Pick a difficulty to begin.</p>
          <div className="grid grid-cols-4 gap-2 mb-5">
            {[1, 2, 3, 4].map((d) => (
              <button key={d} onClick={() => setDifficulty(d)} aria-pressed={difficulty === d} className={`focus-ring py-2.5 rounded-xl text-sm font-semibold transition ${difficulty === d ? "bg-white text-[var(--pill-ink)]" : "bg-white/5 text-white/70 ring-1 ring-white/15"}`}>
                {DIFFICULTY_LABELS[d]}
              </button>
            ))}
          </div>
          <Button variant="primary" size="lg" onClick={newGame} disabled={generating} className="w-full">{generating ? "Preparing…" : "Start"}</Button>
        </div>
      </GameShell>
    );
  }

  if (phase === "done" && summary) {
    return (
      <GameShell title="Sudoku" onBack={onBack}>
        <GameSummary
          title="Sudoku" score={summary.score} accuracy={summary.accuracy} insight={summary.insight} newAchievements={summary.newAchievements}
          onPlayAgain={() => setPhase("setup")}
          onAskMentor={onAskMentor ? () => onAskMentor(`I just finished a Sudoku puzzle — ${mistakes === 0 ? "solved it clean, no mistakes!" : `made ${mistakes} mistakes along the way`}. Any tips to get sharper at logic puzzles?`) : undefined}
          onBack={onBack}
        />
      </GameShell>
    );
  }

  if (!grid) return null;

  return (
    <GameShell
      title="Sudoku" difficulty={difficulty} onBack={onBack}
      statusRight={<div className="flex items-center gap-2 text-xs text-white/60"><span>{mm}:{ss}</span><span>· {mistakes} mistakes</span></div>}
    >
      <div className="flex flex-col items-center">
        <div className="grid grid-cols-9 w-full max-w-[min(92vw,420px)] aspect-square border border-white/25 rounded-lg overflow-hidden" role="grid" aria-label="Sudoku board">
          {grid.map((row, r) => row.map((v, c) => {
            const isGiven = given[r][c];
            const isSelected = selected && selected.r === r && selected.c === c;
            const isWrong = v !== 0 && !isGiven && v !== solution[r][c];
            return (
              <button
                key={`${r}-${c}`}
                onClick={() => setSelected({ r, c })}
                disabled={isGiven || phase === "paused"}
                aria-label={`Row ${r + 1} column ${c + 1}${v ? `, ${v}` : ", empty"}`}
                className={`focus-ring flex items-center justify-center text-sm sm:text-base font-semibold border border-white/10 transition
                  ${isGiven ? "bg-white/10 text-white" : "bg-white/[0.03] text-white"}
                  ${isSelected ? "ring-2 ring-inset ring-white bg-white/20" : ""}
                  ${isWrong ? "text-rose-300" : ""}
                  ${(c === 2 || c === 5) ? "border-r-2 border-r-white/40" : ""}
                  ${(r === 2 || r === 5) ? "border-b-2 border-b-white/40" : ""}`}
              >
                {v !== 0 ? v : ""}
              </button>
            );
          }))}
        </div>

        <div className="grid grid-cols-9 gap-1.5 max-w-[min(92vw,420px)] w-full mt-4">
          {Array.from({ length: 9 }, (_, i) => i + 1).map((n) => (
            <button key={n} onClick={() => placeNumber(n)} disabled={phase === "paused"} className="focus-ring aspect-square rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold text-sm transition">{n}</button>
          ))}
        </div>

        <div className="flex gap-2 mt-4">
          <Button variant="glass" size="sm" icon={Lightbulb} onClick={useHint} disabled={phase === "paused"}>Hint</Button>
          <Button variant="ghost" size="sm" icon={RotateCcw} onClick={() => placeNumber(0)} disabled={phase === "paused"}>Clear cell</Button>
          <Button variant="ghost" size="sm" icon={phase === "paused" ? Play : Pause} onClick={() => setPhase(phase === "paused" ? "playing" : "paused")}>{phase === "paused" ? "Resume" : "Pause"}</Button>
        </div>
        {phase === "paused" && <p className="text-white/50 text-sm mt-3">Paused</p>}
      </div>
    </GameShell>
  );
}
