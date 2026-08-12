import { sql as authSql, getSessionUser } from "@/lib/auth";
import { GAMES } from "@/lib/games";

// The hub's data source: the static registry merged with this student's
// real progress (continue-playing, per-game difficulty, best score).
export async function GET() {
  const db = authSql();
  const user = await getSessionUser(db);
  if (!user) return Response.json({ games: GAMES.map((g) => ({ ...g, difficulty: 2, sessionsPlayed: 0, bestScore: 0, lastPlayedAt: null })) });

  const rows = await db`SELECT game_id, difficulty, sessions_played, best_score, last_played_at FROM game_progress WHERE student = ${String(user.id)}`;
  const byId = Object.fromEntries(rows.map((r) => [r.game_id, r]));

  const games = GAMES.map((g) => {
    const p = byId[g.id];
    return {
      ...g,
      difficulty: p?.difficulty ?? 2,
      sessionsPlayed: p?.sessions_played ?? 0,
      bestScore: p?.best_score ?? 0,
      lastPlayedAt: p?.last_played_at ?? null,
    };
  });

  const achievementRows = await db`SELECT key, earned_at FROM game_achievements WHERE student = ${String(user.id)} ORDER BY earned_at DESC`;

  return Response.json({ games, achievements: achievementRows });
}
