"use client";
import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, Zap } from "lucide-react";
import { Button } from "@/components/ui";
import GameShell, { GameSummary } from "./GameShell";
import { useGameSession } from "@/hooks/useGameSession";

const ROUND_LENGTH = 10;
const TOPICS = ["arithmetic", "fractions", "percentages", "algebra", "geometry", "probability"];

function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
function withOptions(correctValue, distractors, formatter = String) {
  const values = shuffle([correctValue, ...distractors]);
  return { options: values.map(formatter), correctIndex: values.indexOf(correctValue) };
}
function numericDistractors(answer, count = 3, spread = 5) {
  const set = new Set();
  let guard = 0;
  while (set.size < count && guard < 50) {
    guard++;
    const d = answer + randInt(-spread, spread) * randInt(1, 2) || answer + 1;
    if (d !== answer) set.add(d);
  }
  return [...set];
}

function genArithmetic(tier) {
  const range = [15, 60, 300, 999][tier - 1] || 60;
  const ops = tier <= 1 ? ["+", "-"] : tier === 2 ? ["+", "-", "×"] : ["+", "-", "×", "÷"];
  const op = ops[randInt(0, ops.length - 1)];
  let prompt, answer;
  if (op === "+") { const a = randInt(1, range), b = randInt(1, range); answer = a + b; prompt = `${a} + ${b}`; }
  else if (op === "-") { const a = randInt(1, range), b = randInt(1, range); const hi = Math.max(a, b), lo = Math.min(a, b); answer = hi - lo; prompt = `${hi} - ${lo}`; }
  else if (op === "×") { const a = randInt(2, tier >= 3 ? 15 : 12), b = randInt(2, tier >= 3 ? 15 : 12); answer = a * b; prompt = `${a} × ${b}`; }
  else { const b = randInt(2, 12), ans = randInt(2, 12); const a = b * ans; answer = ans; prompt = `${a} ÷ ${b}`; }
  const { options, correctIndex } = withOptions(answer, numericDistractors(answer));
  return { topic: "arithmetic", prompt: `${prompt} = ?`, options, correctIndex };
}

function genFractions(tier) {
  const denoms = tier <= 1 ? [2, 3, 4] : tier === 2 ? [3, 4, 5, 6] : [4, 5, 6, 7, 8];
  const d1 = denoms[randInt(0, denoms.length - 1)], d2 = denoms[randInt(0, denoms.length - 1)];
  const n1 = randInt(1, d1 - 1), n2 = randInt(1, d2 - 1);
  const v1 = n1 / d1, v2 = n2 / d2;
  const bigger = v1 > v2 ? `${n1}/${d1}` : `${n2}/${d2}`;
  const options = shuffle([`${n1}/${d1}`, `${n2}/${d2}`]);
  return { topic: "fractions", prompt: `Which is larger — ${n1}/${d1} or ${n2}/${d2}?`, options, correctIndex: options.indexOf(bigger) };
}

function genPercentages(tier) {
  const bases = tier <= 1 ? [10, 20, 50, 100] : tier === 2 ? [20, 40, 60, 80] : [30, 45, 70, 90, 120];
  const percents = tier <= 2 ? [10, 25, 50, 20] : [15, 35, 60, 75, 12];
  const base = bases[randInt(0, bases.length - 1)];
  const pct = percents[randInt(0, percents.length - 1)];
  const answer = Math.round((pct / 100) * base);
  const { options, correctIndex } = withOptions(answer, numericDistractors(answer, 3, Math.max(3, Math.round(answer * 0.2))));
  return { topic: "percentages", prompt: `What is ${pct}% of ${base}?`, options, correctIndex };
}

function genAlgebra(tier) {
  const x = randInt(1, tier >= 3 ? 15 : 10);
  const a = randInt(2, tier >= 3 ? 9 : 5);
  const b = randInt(1, tier >= 3 ? 30 : 15);
  const result = a * x + b;
  const { options, correctIndex } = withOptions(x, numericDistractors(x, 3, 3));
  return { topic: "algebra", prompt: `Solve for x: ${a}x + ${b} = ${result}`, options, correctIndex };
}

function genGeometry(tier) {
  const isArea = Math.random() < 0.5;
  if (isArea) {
    const w = randInt(2, tier >= 3 ? 20 : 12), h = randInt(2, tier >= 3 ? 20 : 12);
    const answer = w * h;
    const { options, correctIndex } = withOptions(answer, numericDistractors(answer, 3, Math.max(4, Math.round(answer * 0.15))));
    return { topic: "geometry", prompt: `A rectangle is ${w} × ${h}. What's its area?`, options, correctIndex };
  }
  const s = randInt(2, tier >= 3 ? 20 : 12);
  const answer = s * 4;
  const { options, correctIndex } = withOptions(answer, numericDistractors(answer, 3, 4));
  return { topic: "geometry", prompt: `A square has sides of length ${s}. What's its perimeter?`, options, correctIndex };
}

function genProbability(tier) {
  const red = randInt(1, tier >= 3 ? 9 : 5);
  const blue = randInt(1, tier >= 3 ? 9 : 5);
  const total = red + blue;
  const answer = `${red}/${total}`;
  const distractors = new Set();
  while (distractors.size < 3) {
    const n = randInt(1, total - 1);
    const v = `${n}/${total}`;
    if (v !== answer) distractors.add(v);
  }
  const options = shuffle([answer, ...distractors]);
  return { topic: "probability", prompt: `A bag has ${red} red and ${blue} blue marbles. What's the probability of drawing red?`, options, correctIndex: options.indexOf(answer) };
}

const GENERATORS = { arithmetic: genArithmetic, fractions: genFractions, percentages: genPercentages, algebra: genAlgebra, geometry: genGeometry, probability: genProbability };

function genQuestion(tier) {
  const topic = TOPICS[randInt(0, TOPICS.length - 1)];
  return GENERATORS[topic](tier);
}

export default function MathDuel({ game, onBack, onAskMentor }) {
  const [phase, setPhase] = useState("setup");
  const [tier, setTier] = useState(game.difficulty || 2);
  const [round, setRound] = useState(0);
  const [question, setQuestion] = useState(null);
  const [picked, setPicked] = useState(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [mistakesByTopic, setMistakesByTopic] = useState({});
  const [seenByTopic, setSeenByTopic] = useState({});
  const [summary, setSummary] = useState(null);
  const { start, finish } = useGameSession("math-duel");

  function newRound(nextTier) {
    setQuestion(genQuestion(nextTier ?? tier));
    setPicked(null);
  }

  function beginGame() {
    setRound(0); setCorrectCount(0); setStreak(0); setMistakesByTopic({}); setSeenByTopic({}); setSummary(null);
    setPhase("playing");
    start();
    newRound(tier);
  }

  function answer(idx) {
    if (picked !== null) return;
    setPicked(idx);
    const isCorrect = idx === question.correctIndex;
    setSeenByTopic((m) => ({ ...m, [question.topic]: (m[question.topic] || 0) + 1 }));
    let nextTier = tier;
    let updatedCorrect = correctCount;
    let updatedMistakes = mistakesByTopic;
    if (isCorrect) {
      updatedCorrect = correctCount + 1;
      setCorrectCount(updatedCorrect);
      const newStreak = streak + 1;
      setStreak(newStreak);
      if (newStreak >= 2) { nextTier = Math.min(4, tier + 1); setTier(nextTier); setStreak(0); }
    } else {
      setStreak(0);
      nextTier = Math.max(1, tier - 1);
      setTier(nextTier);
      updatedMistakes = { ...mistakesByTopic, [question.topic]: (mistakesByTopic[question.topic] || 0) + 1 };
      setMistakesByTopic(updatedMistakes);
    }
    setTimeout(() => {
      const nextRound = round + 1;
      setRound(nextRound);
      if (nextRound >= ROUND_LENGTH) finishGame(nextTier, updatedCorrect, updatedMistakes);
      else newRound(nextTier);
    }, 650);
  }

  async function finishGame(finalTier, finalCorrect, finalMistakes) {
    setPhase("done");
    const accuracy = finalCorrect / ROUND_LENGTH;
    const score = finalCorrect * 10 + finalTier * 5;
    const topicEntries = Object.entries(finalMistakes).sort((a, b) => b[1] - a[1]);
    const weakest = topicEntries[0]?.[0];
    const insight = accuracy >= 0.9
      ? "Excellent — you're moving fast and staying accurate. Ready for a harder tier."
      : weakest
      ? `You solved ${finalCorrect}/${ROUND_LENGTH}. ${weakest[0].toUpperCase()}${weakest.slice(1)} tripped you up most — a few focused minutes there would help a lot.`
      : `You solved ${finalCorrect}/${ROUND_LENGTH} — solid round.`;
    const result = await finish({
      difficulty: finalTier, score, accuracy,
      skillConcept: weakest || (accuracy >= 0.8 ? "mental math" : null),
      masteryDelta: weakest ? -0.08 : accuracy >= 0.8 ? 0.08 : 0.02,
      mistake: weakest ? `struggles with ${weakest}` : null,
    });
    setSummary({ score, accuracy, insight, weakest, finalCorrect, newAchievements: result.newAchievements });
  }

  if (phase === "setup") {
    return (
      <GameShell title="Math Duel" onBack={onBack}>
        <div className="glass-card p-6 text-center max-w-sm mx-auto">
          <Zap size={26} className="text-white/60 mx-auto mb-3" strokeWidth={1.75} />
          <p className="text-white/60 text-sm mb-5">10 fast questions across arithmetic, fractions, percentages, algebra, geometry, and probability. Difficulty adapts as you play.</p>
          <Button variant="primary" size="lg" onClick={beginGame} className="w-full">Start duel</Button>
        </div>
      </GameShell>
    );
  }

  if (phase === "done" && summary) {
    return (
      <GameShell title="Math Duel" onBack={onBack}>
        <GameSummary
          title="Math Duel" score={summary.score} accuracy={summary.accuracy} insight={summary.insight} newAchievements={summary.newAchievements}
          onPlayAgain={beginGame}
          onAskMentor={onAskMentor ? () => onAskMentor(`I just played Math Duel and got ${summary.finalCorrect}/${ROUND_LENGTH}.${summary.weakest ? ` I think I'm struggling with ${summary.weakest}.` : ""} Can you help me get better?`) : undefined}
          onBack={onBack}
        />
      </GameShell>
    );
  }

  if (!question) return null;

  return (
    <GameShell
      title="Math Duel" difficulty={tier} onBack={onBack}
      statusRight={<span className="text-xs text-white/60">Question {round + 1}/{ROUND_LENGTH} · {correctCount} correct</span>}
    >
      <div className="glass-card p-6 sm:p-8 max-w-lg mx-auto text-center">
        <p className="text-eyebrow mb-2">{question.topic}</p>
        <h2 className="text-heading text-white mb-6">{question.prompt}</h2>
        <div className="grid grid-cols-2 gap-2.5">
          {question.options.map((opt, i) => {
            const isPicked = picked === i;
            const isCorrectOpt = picked !== null && i === question.correctIndex;
            const isWrongPick = isPicked && i !== question.correctIndex;
            return (
              <button
                key={i}
                onClick={() => answer(i)}
                disabled={picked !== null}
                className={`focus-ring px-4 py-3.5 rounded-xl text-sm font-semibold transition flex items-center justify-center gap-1.5
                  ${isCorrectOpt ? "bg-white text-[var(--pill-ink)]" : isWrongPick ? "bg-rose-500/20 text-rose-200 ring-1 ring-rose-400/40" : "bg-white/5 text-white ring-1 ring-white/15 hover:bg-white/10"}`}
              >
                {isCorrectOpt && <CheckCircle2 size={14} />}
                {isWrongPick && <XCircle size={14} />}
                {opt}
              </button>
            );
          })}
        </div>
      </div>
    </GameShell>
  );
}
