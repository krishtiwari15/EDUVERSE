"use client";
import { useState } from "react";
import { Globe2, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui";
import GameShell, { GameSummary } from "./GameShell";
import { useGameSession } from "@/hooks/useGameSession";

// A small, hand-verified dataset — deliberately not AI-generated, to avoid
// any risk of outdated or incorrect geopolitical facts.
const COUNTRIES = [
  { name: "France", capital: "Paris", continent: "Europe", flag: "🇫🇷" },
  { name: "Germany", capital: "Berlin", continent: "Europe", flag: "🇩🇪" },
  { name: "Spain", capital: "Madrid", continent: "Europe", flag: "🇪🇸" },
  { name: "Italy", capital: "Rome", continent: "Europe", flag: "🇮🇹" },
  { name: "Portugal", capital: "Lisbon", continent: "Europe", flag: "🇵🇹" },
  { name: "Norway", capital: "Oslo", continent: "Europe", flag: "🇳🇴" },
  { name: "Sweden", capital: "Stockholm", continent: "Europe", flag: "🇸🇪" },
  { name: "Poland", capital: "Warsaw", continent: "Europe", flag: "🇵🇱" },
  { name: "Greece", capital: "Athens", continent: "Europe", flag: "🇬🇷" },
  { name: "Netherlands", capital: "Amsterdam", continent: "Europe", flag: "🇳🇱" },
  { name: "Switzerland", capital: "Bern", continent: "Europe", flag: "🇨🇭" },
  { name: "Ireland", capital: "Dublin", continent: "Europe", flag: "🇮🇪" },
  { name: "India", capital: "New Delhi", continent: "Asia", flag: "🇮🇳" },
  { name: "China", capital: "Beijing", continent: "Asia", flag: "🇨🇳" },
  { name: "Japan", capital: "Tokyo", continent: "Asia", flag: "🇯🇵" },
  { name: "South Korea", capital: "Seoul", continent: "Asia", flag: "🇰🇷" },
  { name: "Thailand", capital: "Bangkok", continent: "Asia", flag: "🇹🇭" },
  { name: "Vietnam", capital: "Hanoi", continent: "Asia", flag: "🇻🇳" },
  { name: "Indonesia", capital: "Jakarta", continent: "Asia", flag: "🇮🇩" },
  { name: "Turkey", capital: "Ankara", continent: "Asia", flag: "🇹🇷" },
  { name: "Saudi Arabia", capital: "Riyadh", continent: "Asia", flag: "🇸🇦" },
  { name: "Israel", capital: "Jerusalem", continent: "Asia", flag: "🇮🇱" },
  { name: "Bangladesh", capital: "Dhaka", continent: "Asia", flag: "🇧🇩" },
  { name: "Pakistan", capital: "Islamabad", continent: "Asia", flag: "🇵🇰" },
  { name: "Egypt", capital: "Cairo", continent: "Africa", flag: "🇪🇬" },
  { name: "Nigeria", capital: "Abuja", continent: "Africa", flag: "🇳🇬" },
  { name: "Kenya", capital: "Nairobi", continent: "Africa", flag: "🇰🇪" },
  { name: "South Africa", capital: "Pretoria", continent: "Africa", flag: "🇿🇦" },
  { name: "Morocco", capital: "Rabat", continent: "Africa", flag: "🇲🇦" },
  { name: "Ethiopia", capital: "Addis Ababa", continent: "Africa", flag: "🇪🇹" },
  { name: "Ghana", capital: "Accra", continent: "Africa", flag: "🇬🇭" },
  { name: "United States", capital: "Washington, D.C.", continent: "North America", flag: "🇺🇸" },
  { name: "Canada", capital: "Ottawa", continent: "North America", flag: "🇨🇦" },
  { name: "Mexico", capital: "Mexico City", continent: "North America", flag: "🇲🇽" },
  { name: "Brazil", capital: "Brasília", continent: "South America", flag: "🇧🇷" },
  { name: "Argentina", capital: "Buenos Aires", continent: "South America", flag: "🇦🇷" },
  { name: "Chile", capital: "Santiago", continent: "South America", flag: "🇨🇱" },
  { name: "Peru", capital: "Lima", continent: "South America", flag: "🇵🇪" },
  { name: "Colombia", capital: "Bogotá", continent: "South America", flag: "🇨🇴" },
  { name: "Australia", capital: "Canberra", continent: "Oceania", flag: "🇦🇺" },
  { name: "New Zealand", capital: "Wellington", continent: "Oceania", flag: "🇳🇿" },
];

const ROUND_LENGTH = 10;

function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

function genQuestion() {
  const mode = ["capital", "country", "flag"][randInt(0, 2)];
  const country = COUNTRIES[randInt(0, COUNTRIES.length - 1)];
  const distractors = shuffle(COUNTRIES.filter((c) => c.name !== country.name)).slice(0, 3);
  if (mode === "capital") {
    const options = shuffle([country.capital, ...distractors.map((d) => d.capital)]);
    return { mode, prompt: `What's the capital of ${country.name}?`, options, correctIndex: options.indexOf(country.capital), country: country.name };
  }
  if (mode === "flag") {
    const options = shuffle([country.name, ...distractors.map((d) => d.name)]);
    return { mode, prompt: `${country.flag}  Which country's flag is this?`, options, correctIndex: options.indexOf(country.name), country: country.name };
  }
  const options = shuffle([country.name, ...distractors.map((d) => d.name)]);
  return { mode, prompt: `${country.capital} is the capital of which country?`, options, correctIndex: options.indexOf(country.name), country: country.name };
}

export default function GeographyExplorer({ game, onBack, onAskMentor }) {
  const [phase, setPhase] = useState("setup");
  const [round, setRound] = useState(0);
  const [question, setQuestion] = useState(null);
  const [picked, setPicked] = useState(null);
  const [correct, setCorrect] = useState(0);
  const [missed, setMissed] = useState([]);
  const [summary, setSummary] = useState(null);
  const { start, finish } = useGameSession("geography-explorer");

  function begin() {
    setRound(0); setCorrect(0); setMissed([]); setSummary(null); setPicked(null);
    setQuestion(genQuestion());
    setPhase("playing");
    start();
  }

  function answer(idx) {
    if (picked !== null) return;
    setPicked(idx);
    const isCorrect = idx === question.correctIndex;
    const updatedCorrect = correct + (isCorrect ? 1 : 0);
    const updatedMissed = isCorrect ? missed : [...missed, question.country];
    if (isCorrect) setCorrect(updatedCorrect); else setMissed(updatedMissed);
    setTimeout(() => {
      const next = round + 1;
      setRound(next);
      if (next >= ROUND_LENGTH) finishGame(updatedCorrect, updatedMissed);
      else { setQuestion(genQuestion()); setPicked(null); }
    }, 600);
  }

  async function finishGame(finalCorrect, finalMissed) {
    setPhase("done");
    const accuracy = finalCorrect / ROUND_LENGTH;
    const score = finalCorrect * 10;
    const insight = accuracy >= 0.9
      ? "You know your world map well — genuinely strong recall."
      : finalMissed.length
      ? `You got ${finalCorrect}/${ROUND_LENGTH}. A few countries to revisit: ${[...new Set(finalMissed)].slice(0, 3).join(", ")}.`
      : `You got ${finalCorrect}/${ROUND_LENGTH} — nice round.`;
    const result = await finish({
      difficulty: game.difficulty, score, accuracy,
      skillConcept: finalMissed[0] ? `geography — ${finalMissed[0]}` : "world geography",
      masteryDelta: accuracy >= 0.8 ? 0.06 : accuracy < 0.5 ? -0.05 : 0.02,
    });
    setSummary({ score, accuracy, insight, finalCorrect, newAchievements: result.newAchievements });
  }

  if (phase === "setup") {
    return (
      <GameShell title="Geography Explorer" onBack={onBack}>
        <div className="glass-card p-6 text-center max-w-sm mx-auto">
          <Globe2 size={26} className="text-white/60 mx-auto mb-3" strokeWidth={1.75} />
          <p className="text-white/60 text-sm mb-5">Capitals, countries, and flags from around the world — {ROUND_LENGTH} questions.</p>
          <Button variant="primary" size="lg" onClick={begin} className="w-full">Start exploring</Button>
        </div>
      </GameShell>
    );
  }

  if (phase === "done" && summary) {
    return (
      <GameShell title="Geography Explorer" onBack={onBack}>
        <GameSummary
          title="Geography Explorer" score={summary.score} accuracy={summary.accuracy} insight={summary.insight} newAchievements={summary.newAchievements}
          onPlayAgain={begin}
          onAskMentor={onAskMentor ? () => onAskMentor(`I just played Geography Explorer and got ${summary.finalCorrect}/${ROUND_LENGTH}. Can we explore some world geography together?`) : undefined}
          onBack={onBack}
        />
      </GameShell>
    );
  }

  if (!question) return null;

  return (
    <GameShell title="Geography Explorer" onBack={onBack} statusRight={<span className="text-xs text-white/60">{round + 1}/{ROUND_LENGTH} · {correct} correct</span>}>
      <div className="glass-card p-6 sm:p-8 max-w-lg mx-auto text-center">
        <h2 className="text-heading text-white mb-6">{question.prompt}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {question.options.map((opt, i) => {
            const isPicked = picked === i;
            const isCorrectOpt = picked !== null && i === question.correctIndex;
            const isWrongPick = isPicked && i !== question.correctIndex;
            return (
              <button
                key={i}
                onClick={() => answer(i)}
                disabled={picked !== null}
                className={`focus-ring px-4 py-3 rounded-xl text-sm font-semibold transition flex items-center justify-center gap-1.5
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
