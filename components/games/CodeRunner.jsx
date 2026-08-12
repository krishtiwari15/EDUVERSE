"use client";
import { useState } from "react";
import { Code2, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui";
import GameShell, { GameSummary } from "./GameShell";
import { useGameSession } from "@/hooks/useGameSession";

// A hand-authored, fact-checked JavaScript question bank — real code
// reading skill, no AI hallucination risk on something this precise.
const QUESTIONS = {
  1: [
    { type: "output", code: `let x = 5;\nx = x + 3;\nconsole.log(x);`, options: ["5", "8", "53", "undefined"], correctIndex: 1, topic: "variables" },
    { type: "output", code: `const arr = [1, 2, 3];\nconsole.log(arr.length);`, options: ["2", "3", "4", "undefined"], correctIndex: 1, topic: "arrays" },
    { type: "output", code: `console.log(typeof "hello");`, options: ["string", "text", "str", "undefined"], correctIndex: 0, topic: "types" },
    { type: "bug", code: `function greet(name) {\n  return "Hi " + nam;\n}`, options: ["Missing semicolon", "Typo: 'nam' should be 'name'", "Wrong function keyword", "Missing return"], correctIndex: 1, topic: "typos" },
    { type: "output", code: `for (let i = 0; i < 3; i++) {\n  console.log(i);\n}`, options: ["0 1 2", "1 2 3", "0 1 2 3", "3 2 1"], correctIndex: 0, topic: "loops" },
  ],
  2: [
    { type: "output", code: `const arr = [1, 2, 3].map(n => n * 2);\nconsole.log(arr);`, options: ["[1, 2, 3]", "[2, 4, 6]", "[1, 4, 9]", "6"], correctIndex: 1, topic: "array methods" },
    { type: "output", code: `console.log([1,2,3].filter(n => n % 2 === 0));`, options: ["[1, 3]", "[2]", "[1, 2, 3]", "[]"], correctIndex: 1, topic: "array methods" },
    { type: "bug", code: `function sum(a, b) {\n  if (a = b) return 0;\n  return a + b;\n}`, options: ["Should be a === b, not a = b", "Missing return", "Wrong parameter names", "No bug"], correctIndex: 0, topic: "operators" },
    { type: "output", code: `let obj = { a: 1 };\nlet copy = obj;\ncopy.a = 2;\nconsole.log(obj.a);`, options: ["1", "2", "undefined", "error"], correctIndex: 1, topic: "references" },
    { type: "output", code: `console.log("5" + 3);\nconsole.log("5" - 3);`, options: ["8 and 2", "53 and 2", "8 and 8", "53 and 53"], correctIndex: 1, topic: "type coercion" },
  ],
  3: [
    { type: "output", code: `function outer() {\n  let count = 0;\n  return function () { count++; return count; };\n}\nconst inc = outer();\ninc(); inc();\nconsole.log(inc());`, options: ["1", "2", "3", "undefined"], correctIndex: 2, topic: "closures" },
    { type: "bug", code: `async function getData() {\n  const res = fetch("/api");\n  return res.json();\n}`, options: ["Missing 'await' before fetch", "fetch doesn't exist", "async isn't needed", "No bug"], correctIndex: 0, topic: "async/await" },
    { type: "output", code: `console.log([...new Set([1, 2, 2, 3, 3, 3])]);`, options: ["[1, 2, 2, 3, 3, 3]", "[1, 2, 3]", "[3]", "Set(3)"], correctIndex: 1, topic: "data structures" },
    { type: "output", code: `const { a, ...rest } = { a: 1, b: 2, c: 3 };\nconsole.log(rest);`, options: ["{ a: 1 }", "{ b: 2, c: 3 }", "{ a: 1, b: 2, c: 3 }", "undefined"], correctIndex: 1, topic: "destructuring" },
  ],
};

function pickQuestions(tier, count = 8) {
  const pool = [...(QUESTIONS[tier] || QUESTIONS[1])];
  const out = [];
  while (out.length < count && pool.length) {
    const i = Math.floor(Math.random() * pool.length);
    out.push(pool.splice(i, 1)[0]);
  }
  // pad by repeating if the bank is smaller than `count`
  while (out.length < count) out.push(QUESTIONS[tier][out.length % QUESTIONS[tier].length]);
  return out;
}

export default function CodeRunner({ game, onBack, onAskMentor }) {
  const [phase, setPhase] = useState("setup");
  const [tier, setTier] = useState(Math.min(3, Math.max(1, Math.round((game.difficulty || 2) * 0.75))));
  const [round, setRound] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [picked, setPicked] = useState(null);
  const [correct, setCorrect] = useState(0);
  const [missedTopics, setMissedTopics] = useState([]);
  const [summary, setSummary] = useState(null);
  const { start, finish } = useGameSession("code-runner");

  function begin() {
    const qs = pickQuestions(tier);
    setQuestions(qs);
    setRound(0); setCorrect(0); setMissedTopics([]); setPicked(null); setSummary(null);
    setPhase("playing");
    start();
  }

  function answer(idx) {
    if (picked !== null) return;
    setPicked(idx);
    const q = questions[round];
    const isCorrect = idx === q.correctIndex;
    const updatedCorrect = correct + (isCorrect ? 1 : 0);
    const updatedMissed = isCorrect ? missedTopics : [...missedTopics, q.topic];
    if (isCorrect) setCorrect(updatedCorrect); else setMissedTopics(updatedMissed);
    setTimeout(() => {
      const next = round + 1;
      setRound(next);
      if (next >= questions.length) finishGame(updatedCorrect, updatedMissed);
      else setPicked(null);
    }, 700);
  }

  async function finishGame(finalCorrect, finalMissed) {
    setPhase("done");
    const accuracy = finalCorrect / questions.length;
    const score = finalCorrect * 12 + tier * 5;
    const weak = finalMissed[0];
    const insight = accuracy >= 0.9
      ? "You're reading code like an engineer — clean tracing, no shortcuts missed."
      : weak
      ? `You got ${finalCorrect}/${questions.length}. ${weak[0].toUpperCase()}${weak.slice(1)} is worth another look.`
      : `You got ${finalCorrect}/${questions.length} — solid tracing.`;
    const result = await finish({
      difficulty: tier, score, accuracy,
      skillConcept: weak || "reading code",
      masteryDelta: accuracy >= 0.8 ? 0.07 : accuracy < 0.5 ? -0.05 : 0.02,
      mistake: weak ? `mixes up ${weak}` : null,
    });
    setSummary({ score, accuracy, insight, finalCorrect, total: questions.length, newAchievements: result.newAchievements });
  }

  if (phase === "setup") {
    return (
      <GameShell title="Code Runner" onBack={onBack}>
        <div className="glass-card p-6 text-center max-w-sm mx-auto">
          <Code2 size={26} className="text-white/60 mx-auto mb-3" strokeWidth={1.75} />
          <p className="text-white/60 text-sm mb-4">Predict the output, or spot the bug — real JavaScript, real reasoning.</p>
          <div className="grid grid-cols-3 gap-2 mb-5">
            {[1, 2, 3].map((t) => (
              <button key={t} onClick={() => setTier(t)} aria-pressed={tier === t} className={`focus-ring py-2.5 rounded-xl text-sm font-semibold transition ${tier === t ? "bg-white text-[var(--pill-ink)]" : "bg-white/5 text-white/70 ring-1 ring-white/15"}`}>
                {["Beginner", "Intermediate", "Advanced"][t - 1]}
              </button>
            ))}
          </div>
          <Button variant="primary" size="lg" onClick={begin} className="w-full">Start</Button>
        </div>
      </GameShell>
    );
  }

  if (phase === "done" && summary) {
    return (
      <GameShell title="Code Runner" onBack={onBack}>
        <GameSummary
          title="Code Runner" score={summary.score} accuracy={summary.accuracy} insight={summary.insight} newAchievements={summary.newAchievements}
          onPlayAgain={begin}
          onAskMentor={onAskMentor ? () => onAskMentor(`I just played Code Runner and got ${summary.finalCorrect}/${summary.total}. Can you help me strengthen my JavaScript reading skills?`) : undefined}
          onBack={onBack}
        />
      </GameShell>
    );
  }

  const q = questions[round];
  if (!q) return null;

  return (
    <GameShell title="Code Runner" difficulty={tier} onBack={onBack} statusRight={<span className="text-xs text-white/60">{round + 1}/{questions.length} · {correct} correct</span>}>
      <div className="glass-card p-5 sm:p-6 max-w-xl mx-auto">
        <p className="text-eyebrow mb-3">{q.type === "output" ? "What does this log?" : "Find the bug"}</p>
        <pre className="bg-black/40 rounded-xl p-4 text-xs sm:text-sm text-white/90 overflow-x-auto font-mono mb-5 whitespace-pre-wrap">{q.code}</pre>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {q.options.map((opt, i) => {
            const isPicked = picked === i;
            const isCorrectOpt = picked !== null && i === q.correctIndex;
            const isWrongPick = isPicked && i !== q.correctIndex;
            return (
              <button
                key={i}
                onClick={() => answer(i)}
                disabled={picked !== null}
                className={`focus-ring px-3.5 py-2.5 rounded-xl text-sm font-mono text-left transition flex items-center gap-1.5
                  ${isCorrectOpt ? "bg-white text-[var(--pill-ink)]" : isWrongPick ? "bg-rose-500/20 text-rose-200 ring-1 ring-rose-400/40" : "bg-white/5 text-white ring-1 ring-white/15 hover:bg-white/10"}`}
              >
                {isCorrectOpt && <CheckCircle2 size={14} className="shrink-0" />}
                {isWrongPick && <XCircle size={14} className="shrink-0" />}
                <span className="truncate">{opt}</span>
              </button>
            );
          })}
        </div>
      </div>
    </GameShell>
  );
}
