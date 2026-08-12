"use client";
import { ArrowLeft, Trophy, Award } from "lucide-react";
import { Button, Surface } from "@/components/ui";
import { DIFFICULTY_LABELS } from "@/lib/games";

// Shared chrome every game plugs into: back button, title, difficulty
// badge, and a slot for game-specific status (timer, score, lives...).
export default function GameShell({ title, difficulty, statusRight, onBack, children }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <button onClick={onBack} aria-label="Back to games" className="focus-ring flex items-center gap-1.5 text-white/70 hover:text-white font-semibold text-sm">
          <ArrowLeft size={16} /> Games
        </button>
        <div className="flex items-center gap-2">
          {difficulty && (
            <span className="text-xs text-white/50 px-2.5 py-1 rounded-full bg-white/5 ring-1 ring-white/15">{DIFFICULTY_LABELS[difficulty] || difficulty}</span>
          )}
          {statusRight}
        </div>
      </div>
      <h1 className="text-display text-white mb-4">{title}</h1>
      {children}
    </div>
  );
}

// The post-session card every game ends on — score, an honest one-line
// skill insight (never a wall of analytics), and the three exits the brief
// specifies: keep playing, ask the mentor about it, or head back.
export function GameSummary({ title, score, accuracy, insight, onAskMentor, onPlayAgain, onBack, newAchievements = [] }) {
  return (
    <Surface tier={3} className="p-6 sm:p-8 text-center max-w-md mx-auto">
      <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
        <Trophy size={26} className="text-white" strokeWidth={1.75} />
      </div>
      <h2 className="text-heading text-white">Nice work!</h2>
      <p className="text-white/60 text-sm mt-1">
        {title} · Score {score}{accuracy != null ? ` · ${Math.round(accuracy * 100)}% accuracy` : ""}
      </p>
      {insight && <p className="text-white/75 text-sm mt-4 leading-relaxed">{insight}</p>}
      {newAchievements.length > 0 && (
        <div className="flex flex-wrap justify-center gap-2 mt-4">
          {newAchievements.map((a) => (
            <span key={a.key} className="px-3 py-1.5 rounded-full bg-white/10 ring-1 ring-white/20 text-white text-xs font-semibold flex items-center gap-1.5">
              <Award size={12} /> {a.label}
            </span>
          ))}
        </div>
      )}
      <div className="flex flex-col sm:flex-row gap-2 mt-6">
        <Button variant="primary" size="md" onClick={onPlayAgain} className="flex-1">Play Again</Button>
        {onAskMentor && <Button variant="glass" size="md" onClick={onAskMentor} className="flex-1">Ask Mentor</Button>}
        <Button variant="ghost" size="md" onClick={onBack} className="flex-1">Back to Games</Button>
      </div>
    </Surface>
  );
}
