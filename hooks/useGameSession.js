"use client";
import { useCallback, useRef } from "react";

// The one hook every Knowledge Game uses to report a finished session.
// Each game tracks its own scoring (rules differ too much to share), then
// calls finish() once with the final numbers — no shared internal state to
// go stale, no assumptions about how a given game counts "correct."
export function useGameSession(gameId) {
  const startRef = useRef(null);

  const start = useCallback(() => { startRef.current = Date.now(); }, []);

  const finish = useCallback(async ({ difficulty, score = 0, accuracy = null, skillConcept, masteryDelta, mistake } = {}) => {
    const durationSec = startRef.current ? Math.round((Date.now() - startRef.current) / 1000) : null;
    let newAchievements = [];
    try {
      const res = await fetch("/api/games/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameId, difficulty, score, accuracy, durationSec, skillConcept, masteryDelta, mistake }),
      });
      const data = await res.json();
      newAchievements = data.newAchievements || [];
    } catch {}
    return { score, accuracy, durationSec, newAchievements };
  }, [gameId]);

  return { start, finish };
}
