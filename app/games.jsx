"use client";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft, Flame, Grid3x3, Calculator, Search, Grid2x2, BookOpen,
  Globe2, FlaskConical, Code2, Wallet, SearchCheck, Sparkles,
} from "lucide-react";
import { Surface, Reveal, RevealGroup, RevealItem, Badge } from "@/components/ui";
import { GAMES, CATEGORIES, findGame, ACHIEVEMENTS } from "@/lib/games";

import Sudoku from "@/components/games/Sudoku";
import MathDuel from "@/components/games/MathDuel";
import LogicDetective from "@/components/games/LogicDetective";
import MemoryMatrix from "@/components/games/MemoryMatrix";
import WordQuest from "@/components/games/WordQuest";
import GeographyExplorer from "@/components/games/GeographyExplorer";
import ScienceLab from "@/components/games/ScienceLab";
import CodeRunner from "@/components/games/CodeRunner";
import FinanceSimulator from "@/components/games/FinanceSimulator";
import ResearchHunt from "@/components/games/ResearchHunt";

const ICONS = { Grid3x3, Calculator, Search, Grid2x2, BookOpen, Globe2, FlaskConical, Code2, Wallet, SearchCheck };

const GAME_COMPONENTS = {
  sudoku: Sudoku,
  "math-duel": MathDuel,
  "logic-detective": LogicDetective,
  "memory-matrix": MemoryMatrix,
  "word-quest": WordQuest,
  "geography-explorer": GeographyExplorer,
  "science-lab": ScienceLab,
  "code-runner": CodeRunner,
  "finance-simulator": FinanceSimulator,
  "research-hunt": ResearchHunt,
};

function dailyChallengeGame() {
  const day = Math.floor(Date.now() / 86400000);
  return GAMES[day % GAMES.length];
}

function recommendGame(profile, subjectKnowledge) {
  const goal = (profile?.primary_goal || "").toLowerCase();
  const rules = [
    [/python|program|code|software|develop/, "code-runner"],
    [/math|algebra|calculus|number/, "math-duel"],
    [/english|language|vocab|word/, "word-quest"],
    [/science|physics|chemistry|biology/, "science-lab"],
    [/geograph|world|countr/, "geography-explorer"],
    [/finance|money|budget|invest/, "finance-simulator"],
    [/research|source|evidence/, "research-hunt"],
    [/logic|critical|reason|puzzle/, "logic-detective"],
  ];
  for (const [re, id] of rules) if (re.test(goal)) return findGame(id);
  if (subjectKnowledge?.length) {
    const weakest = [...subjectKnowledge].sort((a, b) => (a.difficulty ?? 2) - (b.difficulty ?? 2))[0];
    const bySubject = GAMES.find((g) => g.subject.toLowerCase() === (weakest.subject || "").toLowerCase());
    if (bySubject) return bySubject;
  }
  return null;
}

function GameTile({ game, onClick }) {
  const Icon = ICONS[game.icon] || Sparkles;
  return (
    <button onClick={onClick} className="focus-ring w-full text-left glass-card p-4 hover:bg-white/10 hover:-translate-y-0.5 active:scale-95 transition-all">
      <div className="w-10 h-10 rounded-xl bg-white/5 ring-1 ring-white/15 flex items-center justify-center mb-3">
        <Icon size={18} className="text-white/80" strokeWidth={1.75} />
      </div>
      <div className="text-heading text-white text-base">{game.title}</div>
      <p className="text-white/50 text-xs mt-1 leading-snug">{game.tagline}</p>
      {game.sessionsPlayed > 0 && (
        <p className="text-white/35 text-[11px] mt-2">Best score {game.bestScore} · {game.sessionsPlayed} play{game.sessionsPlayed === 1 ? "" : "s"}</p>
      )}
    </button>
  );
}

export default function Games({ student, onBack, onAskMentor }) {
  const [games, setGames] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [profile, setProfile] = useState(null);
  const [subjectKnowledge, setSubjectKnowledge] = useState([]);
  const [category, setCategory] = useState("All");
  const [activeGameId, setActiveGameId] = useState(null);

  function load() {
    fetch("/api/games").then((r) => r.json()).then((d) => { setGames(d.games || []); setAchievements(d.achievements || []); }).catch(() => setGames([]));
  }
  useEffect(() => { load(); }, []);
  useEffect(() => {
    if (!student) return;
    fetch(`/api/mind?student=${encodeURIComponent(student)}`)
      .then((r) => r.json())
      .then((d) => { setProfile(d.profile || null); setSubjectKnowledge(d.subjectKnowledge || []); })
      .catch(() => {});
  }, [student]);

  const continuePlaying = useMemo(
    () => (games || []).filter((g) => g.sessionsPlayed > 0).sort((a, b) => new Date(b.lastPlayedAt) - new Date(a.lastPlayedAt)).slice(0, 3),
    [games]
  );
  const daily = dailyChallengeGame();
  const recommended = useMemo(() => recommendGame(profile, subjectKnowledge), [profile, subjectKnowledge]);
  const featured = games?.find((g) => g.id === "logic-detective") || games?.[0];

  const filtered = useMemo(() => {
    if (!games) return [];
    return category === "All" ? games : games.filter((g) => g.category === category);
  }, [games, category]);

  if (activeGameId) {
    const game = findGame(activeGameId);
    const GameComponent = GAME_COMPONENTS[activeGameId];
    const progress = games?.find((g) => g.id === activeGameId);
    return (
      <div className="relative z-10 w-full max-w-3xl mx-auto py-4">
        <GameComponent
          game={{ ...game, difficulty: progress?.difficulty || 2 }}
          onBack={() => { setActiveGameId(null); load(); }}
          onAskMentor={onAskMentor}
        />
      </div>
    );
  }

  return (
    <div className="relative z-10 w-full max-w-5xl mx-auto py-4">
      <button onClick={onBack} aria-label="Back" className="focus-ring flex items-center gap-1.5 text-white/70 hover:text-white font-semibold text-sm mb-5">
        <ArrowLeft size={16} /> Back
      </button>

      <Reveal>
        <p className="text-eyebrow mb-1.5">Knowledge Games</p>
        <h1 className="text-display text-white">Play. Think. <span className="text-shimmer">Master.</span></h1>
        <p className="text-white/55 mt-1.5 max-w-lg">Challenge your mind while building real skills — every game feeds straight back into your Obsidian Mind.</p>
      </Reveal>

      {featured && (
        <Reveal delay={0.05}>
          <button onClick={() => setActiveGameId(featured.id)} className="focus-ring w-full text-left glass-card-elevated p-5 sm:p-6 mt-6 flex items-center gap-4 hover:bg-white/5 transition-colors">
            <div className="w-14 h-14 rounded-2xl bg-white/10 ring-1 ring-white/20 flex items-center justify-center shrink-0">
              {(() => { const Icon = ICONS[featured.icon] || Sparkles; return <Icon size={24} className="text-white" strokeWidth={1.75} />; })()}
            </div>
            <div className="flex-1 min-w-0">
              <Badge tone="solid" className="mb-1.5 !text-[10px]">Featured</Badge>
              <div className="text-heading text-white">{featured.title}</div>
              <p className="text-white/55 text-sm mt-0.5">{featured.tagline}</p>
            </div>
          </button>
        </Reveal>
      )}

      {continuePlaying.length > 0 && (
        <Reveal delay={0.07}>
          <div className="mt-8">
            <p className="text-eyebrow mb-3">Continue playing</p>
            <div className="grid sm:grid-cols-3 gap-3">
              {continuePlaying.map((g) => <GameTile key={g.id} game={g} onClick={() => setActiveGameId(g.id)} />)}
            </div>
          </div>
        </Reveal>
      )}

      <Reveal delay={0.09}>
        <div className="grid sm:grid-cols-2 gap-3 mt-8">
          <button onClick={() => setActiveGameId(daily.id)} className="focus-ring text-left glass-card p-4 flex items-center gap-3 hover:bg-white/10 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-white/10 ring-1 ring-white/20 flex items-center justify-center shrink-0">
              <Flame size={18} className="text-white" strokeWidth={1.75} />
            </div>
            <div className="min-w-0">
              <p className="text-eyebrow">Daily challenge</p>
              <p className="text-white text-sm font-semibold truncate">{daily.title}</p>
            </div>
          </button>
          {recommended && (
            <button onClick={() => setActiveGameId(recommended.id)} className="focus-ring text-left glass-card p-4 flex items-center gap-3 hover:bg-white/10 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-white/10 ring-1 ring-white/20 flex items-center justify-center shrink-0">
                <Sparkles size={18} className="text-white" strokeWidth={1.75} />
              </div>
              <div className="min-w-0">
                <p className="text-eyebrow">Recommended for you</p>
                <p className="text-white text-sm font-semibold truncate">{recommended.title}</p>
              </div>
            </button>
          )}
        </div>
      </Reveal>

      {achievements.length > 0 && (
        <Reveal delay={0.1}>
          <div className="mt-8">
            <p className="text-eyebrow mb-3">Achievements</p>
            <div className="flex flex-wrap gap-2">
              {achievements.map((a) => (
                <span key={a.key} className="px-3 py-1.5 rounded-full bg-white/10 ring-1 ring-white/20 text-white text-xs font-semibold flex items-center gap-1.5">
                  {ACHIEVEMENTS[a.key] ? `${ACHIEVEMENTS[a.key].emoji} ${ACHIEVEMENTS[a.key].label}` : a.key.replace(/_/g, " ")}
                </span>
              ))}
            </div>
          </div>
        </Reveal>
      )}

      <div className="mt-8">
        <p className="text-eyebrow mb-3">All games</p>
        <div className="flex gap-2 flex-wrap mb-4">
          {["All", ...CATEGORIES].map((c) => (
            <button key={c} onClick={() => setCategory(c)} className={`focus-ring px-3.5 py-1.5 rounded-full text-xs font-semibold transition ${category === c ? "bg-white text-[var(--pill-ink)]" : "bg-white/5 text-white/60 ring-1 ring-white/15 hover:bg-white/10"}`}>
              {c}
            </button>
          ))}
        </div>
        {games === null ? (
          <p className="text-white/50 text-sm">Loading…</p>
        ) : (
          <RevealGroup className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3" stagger={0.04}>
            {filtered.map((g) => (
              <RevealItem key={g.id}>
                <GameTile game={g} onClick={() => setActiveGameId(g.id)} />
              </RevealItem>
            ))}
          </RevealGroup>
        )}
      </div>
    </div>
  );
}
