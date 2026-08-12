"use client";
import { useState } from "react";
import { BookOpen, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui";
import GameShell, { GameSummary } from "./GameShell";
import { useGameSession } from "@/hooks/useGameSession";

// A curated, fact-checked vocabulary bank — real definitions/synonyms/
// antonyms, no AI generation risk for something this precision-sensitive.
const WORDS = [
  { word: "Meticulous", tier: 1, definition: "Showing great attention to detail", synonym: "Precise", antonym: "Careless", misspellings: ["Meticulus", "Metticulous", "Meticulous "] },
  { word: "Resilient", tier: 1, definition: "Able to recover quickly from difficulty", synonym: "Tough", antonym: "Fragile", misspellings: ["Resiliant", "Resillient", "Resileint"] },
  { word: "Candid", tier: 1, definition: "Truthful and straightforward", synonym: "Honest", antonym: "Deceptive", misspellings: ["Candied", "Kandid", "Candidd"] },
  { word: "Ambiguous", tier: 2, definition: "Open to more than one interpretation", synonym: "Unclear", antonym: "Explicit", misspellings: ["Ambigous", "Amiguous", "Ambigious"] },
  { word: "Pragmatic", tier: 2, definition: "Dealing with things sensibly and realistically", synonym: "Practical", antonym: "Idealistic", misspellings: ["Pragmattic", "Pragmatik", "Pragmetic"] },
  { word: "Ephemeral", tier: 2, definition: "Lasting for a very short time", synonym: "Fleeting", antonym: "Permanent", misspellings: ["Emphemeral", "Ephemerel", "Efemeral"] },
  { word: "Tenacious", tier: 2, definition: "Holding firmly to a course of action", synonym: "Persistent", antonym: "Yielding", misspellings: ["Tenatious", "Tennacious", "Tenacius"] },
  { word: "Ubiquitous", tier: 3, definition: "Present, appearing, or found everywhere", synonym: "Omnipresent", antonym: "Rare", misspellings: ["Ubiquitious", "Ubiqutous", "Ubiquotous"] },
  { word: "Cogent", tier: 3, definition: "Clear, logical, and convincing", synonym: "Compelling", antonym: "Weak", misspellings: ["Cogeant", "Cogent ", "Cogient"] },
  { word: "Austere", tier: 3, definition: "Severe or strict in manner or appearance", synonym: "Stark", antonym: "Luxurious", misspellings: ["Austeer", "Austerre", "Austier"] },
  { word: "Curious", tier: 1, definition: "Eager to know or learn something", synonym: "Inquisitive", antonym: "Indifferent", misspellings: ["Curius", "Curiuos", "Curioius"] },
  { word: "Generous", tier: 1, definition: "Willing to give more than is necessary", synonym: "Giving", antonym: "Stingy", misspellings: ["Generuos", "Genereous", "Generose"] },
  { word: "Diligent", tier: 1, definition: "Having care in one's work or duties", synonym: "Hardworking", antonym: "Lazy", misspellings: ["Dilligent", "Diligeant", "Dilignet"] },
  { word: "Skeptical", tier: 2, definition: "Not easily convinced; doubting", synonym: "Doubtful", antonym: "Trusting", misspellings: ["Skepptical", "Sceptikal", "Skeptial"] },
  { word: "Eloquent", tier: 2, definition: "Fluent and persuasive in speaking", synonym: "Articulate", antonym: "Inarticulate", misspellings: ["Elequent", "Eloqent", "Ellouqent"] },
  { word: "Prudent", tier: 2, definition: "Acting with care and thought for the future", synonym: "Cautious", antonym: "Reckless", misspellings: ["Prudant", "Proodent", "Prudint"] },
];

const MODES = ["definition", "synonym", "antonym", "spelling"];
const ROUND_LENGTH = 10;

function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

function genQuestion(tier) {
  const pool = WORDS.filter((w) => w.tier <= tier);
  const entry = pool[randInt(0, pool.length - 1)];
  const others = shuffle(WORDS.filter((w) => w.word !== entry.word)).slice(0, 3);
  const mode = MODES[randInt(0, MODES.length - 1)];

  if (mode === "definition") {
    const options = shuffle([entry.definition, ...others.map((o) => o.definition)]);
    return { mode, prompt: `What does "${entry.word}" mean?`, options, correctIndex: options.indexOf(entry.definition), word: entry.word };
  }
  if (mode === "synonym") {
    const options = shuffle([entry.synonym, ...others.map((o) => o.synonym)]);
    return { mode, prompt: `Which word is closest in meaning to "${entry.word}"?`, options, correctIndex: options.indexOf(entry.synonym), word: entry.word };
  }
  if (mode === "antonym") {
    const options = shuffle([entry.antonym, ...others.map((o) => o.antonym)]);
    return { mode, prompt: `Which word means the OPPOSITE of "${entry.word}"?`, options, correctIndex: options.indexOf(entry.antonym), word: entry.word };
  }
  const options = shuffle([entry.word, ...entry.misspellings]);
  return { mode, prompt: `Which is the correct spelling for: "${entry.definition}"?`, options, correctIndex: options.indexOf(entry.word), word: entry.word };
}

export default function WordQuest({ game, onBack, onAskMentor }) {
  const [phase, setPhase] = useState("setup");
  const [tier] = useState(Math.min(3, Math.max(1, Math.round((game.difficulty || 2) * 0.75))));
  const [round, setRound] = useState(0);
  const [question, setQuestion] = useState(null);
  const [picked, setPicked] = useState(null);
  const [correct, setCorrect] = useState(0);
  const [missedWords, setMissedWords] = useState([]);
  const [summary, setSummary] = useState(null);
  const { start, finish } = useGameSession("word-quest");

  function begin() {
    setRound(0); setCorrect(0); setMissedWords([]); setPicked(null); setSummary(null);
    setQuestion(genQuestion(tier));
    setPhase("playing");
    start();
  }

  function answer(idx) {
    if (picked !== null) return;
    setPicked(idx);
    const isCorrect = idx === question.correctIndex;
    const updatedCorrect = correct + (isCorrect ? 1 : 0);
    const updatedMissed = isCorrect ? missedWords : [...missedWords, question.word];
    if (isCorrect) setCorrect(updatedCorrect); else setMissedWords(updatedMissed);
    setTimeout(() => {
      const next = round + 1;
      setRound(next);
      if (next >= ROUND_LENGTH) finishGame(updatedCorrect, updatedMissed);
      else { setQuestion(genQuestion(tier)); setPicked(null); }
    }, 600);
  }

  async function finishGame(finalCorrect, finalMissed) {
    setPhase("done");
    const accuracy = finalCorrect / ROUND_LENGTH;
    const score = finalCorrect * 10;
    const insight = accuracy >= 0.9
      ? "Your vocabulary is genuinely strong — you're reading precision, not just guessing."
      : finalMissed.length
      ? `You got ${finalCorrect}/${ROUND_LENGTH}. Worth reviewing: ${[...new Set(finalMissed)].slice(0, 3).join(", ")}.`
      : `You got ${finalCorrect}/${ROUND_LENGTH} — nice round.`;
    const result = await finish({
      difficulty: tier, score, accuracy,
      skillConcept: finalMissed[0] ? `vocabulary — ${finalMissed[0]}` : "vocabulary",
      masteryDelta: accuracy >= 0.8 ? 0.06 : accuracy < 0.5 ? -0.05 : 0.02,
    });
    setSummary({ score, accuracy, insight, finalCorrect, newAchievements: result.newAchievements });
  }

  if (phase === "setup") {
    return (
      <GameShell title="Word Quest" onBack={onBack}>
        <div className="glass-card p-6 text-center max-w-sm mx-auto">
          <BookOpen size={26} className="text-white/60 mx-auto mb-3" strokeWidth={1.75} />
          <p className="text-white/60 text-sm mb-5">Definitions, synonyms, antonyms, and spelling — {ROUND_LENGTH} words to test yourself on.</p>
          <Button variant="primary" size="lg" onClick={begin} className="w-full">Start</Button>
        </div>
      </GameShell>
    );
  }

  if (phase === "done" && summary) {
    return (
      <GameShell title="Word Quest" onBack={onBack}>
        <GameSummary
          title="Word Quest" score={summary.score} accuracy={summary.accuracy} insight={summary.insight} newAchievements={summary.newAchievements}
          onPlayAgain={begin}
          onAskMentor={onAskMentor ? () => onAskMentor(`I just played Word Quest and got ${summary.finalCorrect}/${ROUND_LENGTH}. Can you help me build my vocabulary?`) : undefined}
          onBack={onBack}
        />
      </GameShell>
    );
  }

  if (!question) return null;

  return (
    <GameShell title="Word Quest" onBack={onBack} statusRight={<span className="text-xs text-white/60">{round + 1}/{ROUND_LENGTH} · {correct} correct</span>}>
      <div className="glass-card p-6 sm:p-8 max-w-lg mx-auto text-center">
        <p className="text-eyebrow mb-2">{question.mode}</p>
        <h2 className="text-heading text-white mb-6">{question.prompt}</h2>
        <div className="grid grid-cols-1 gap-2.5">
          {question.options.map((opt, i) => {
            const isPicked = picked === i;
            const isCorrectOpt = picked !== null && i === question.correctIndex;
            const isWrongPick = isPicked && i !== question.correctIndex;
            return (
              <button
                key={i}
                onClick={() => answer(i)}
                disabled={picked !== null}
                className={`focus-ring px-4 py-2.5 rounded-xl text-sm font-semibold transition flex items-center justify-center gap-1.5
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
