import { sql as authSql, getSessionUser } from "@/lib/auth";
import { GAMES, findGame, ACHIEVEMENTS } from "@/lib/games";

const FIRST_PLAY_KEY = {
  "math-duel": "math_explorer",
  "geography-explorer": "world_explorer",
  "code-runner": "code_thinker",
  "science-lab": "science_explorer",
  "word-quest": "word_builder",
  "research-hunt": "researcher",
  "logic-detective": "problem_solver",
};

async function checkAchievements(db, student) {
  const earnedRows = await db`SELECT key FROM game_achievements WHERE student = ${student}`;
  const earned = new Set(earnedRows.map((r) => r.key));
  const toAward = [];

  const totals = await db`SELECT game_id, COUNT(*)::int AS n FROM game_sessions WHERE student = ${student} GROUP BY game_id`;
  const totalSessions = totals.reduce((sum, t) => sum + t.n, 0);
  if (!earned.has("first_challenge") && totalSessions >= 1) toAward.push("first_challenge");

  for (const t of totals) {
    const key = FIRST_PLAY_KEY[t.game_id];
    if (key && !earned.has(key) && t.n >= 1) toAward.push(key);
  }

  const gamesPlayed = new Set(totals.map((t) => t.game_id));
  if (!earned.has("knowledge_master") && GAMES.every((g) => gamesPlayed.has(g.id))) toAward.push("knowledge_master");

  if (!earned.has("streak_7day")) {
    const dayRows = await db`SELECT DISTINCT created_at::date AS d FROM game_sessions WHERE student = ${student} ORDER BY d DESC LIMIT 14`;
    const days = dayRows.map((r) => new Date(r.d).getTime());
    let streak = 1;
    for (let i = 0; i < days.length - 1; i++) {
      if (days[i] - days[i + 1] === 86400000) streak++; else break;
    }
    if (streak >= 7) toAward.push("streak_7day");
  }

  for (const key of toAward) {
    await db`INSERT INTO game_achievements (student, key) VALUES (${student}, ${key}) ON CONFLICT DO NOTHING`;
  }
  return toAward.map((key) => ({ key, label: ACHIEVEMENTS[key] ? `${ACHIEVEMENTS[key].emoji} ${ACHIEVEMENTS[key].label}` : key }));
}

// Records a finished game session, updates progress, feeds the SAME
// Obsidian Mind tables the AI Tutor reads from (not a parallel system),
// and checks for newly-earned achievements.
export async function POST(req) {
  const db = authSql();
  const user = await getSessionUser(db);
  if (!user) return Response.json({ ok: false }, { status: 401 });
  const student = String(user.id);

  const { gameId, difficulty, score = 0, accuracy = null, durationSec = null, skillConcept, masteryDelta, mistake } = await req.json();
  const game = findGame(gameId);
  if (!game) return Response.json({ ok: false, error: "Unknown game." }, { status: 400 });

  await db`
    INSERT INTO game_progress (student, game_id, difficulty, sessions_played, best_score, last_played_at)
    VALUES (${student}, ${gameId}, ${difficulty || 2}, 1, ${score}, now())
    ON CONFLICT (student, game_id) DO UPDATE SET
      difficulty = ${difficulty || 2},
      sessions_played = game_progress.sessions_played + 1,
      best_score = GREATEST(game_progress.best_score, ${score}),
      last_played_at = now()
  `;
  await db`
    INSERT INTO game_sessions (student, game_id, difficulty, score, accuracy, duration_sec)
    VALUES (${student}, ${gameId}, ${difficulty || null}, ${score}, ${accuracy}, ${durationSec})
  `;

  // Obsidian Mind write — identical shape to chat/route.js's concept
  // extraction, so a Math Duel fractions mistake reads exactly like a
  // chat fractions mistake to the AI Mentor.
  if (skillConcept) {
    const conceptRows = await db`
      INSERT INTO concepts (subject, name) VALUES (${game.subject}, ${skillConcept})
      ON CONFLICT (subject, name) DO UPDATE SET name = EXCLUDED.name
      RETURNING id
    `;
    const conceptId = conceptRows[0].id;
    const existing = await db`SELECT mastery, mistakes FROM student_concept WHERE student = ${student} AND concept_id = ${conceptId}`;
    const prevMastery = existing[0]?.mastery ?? 0.3;
    const prevMistakes = existing[0]?.mistakes ?? [];
    const delta = Math.max(-0.2, Math.min(0.2, Number(masteryDelta) || 0));
    const newMastery = Math.max(0, Math.min(1, prevMastery + delta));
    const newMistakes = mistake ? [...prevMistakes, mistake].slice(-5) : prevMistakes;
    await db`
      INSERT INTO student_concept (student, concept_id, mastery, last_reviewed, mistakes)
      VALUES (${student}, ${conceptId}, ${newMastery}, now(), ${newMistakes})
      ON CONFLICT (student, concept_id) DO UPDATE SET mastery = ${newMastery}, last_reviewed = now(), mistakes = ${newMistakes}
    `;
    await db`
      INSERT INTO learning_events (student, subject, concept, kind, detail)
      VALUES (${student}, ${game.subject}, ${skillConcept}, ${mistake ? "mistake" : "question"}, ${mistake || `${game.title} session — score ${score}`})
    `;
  }

  const newAchievements = await checkAchievements(db, student);

  return Response.json({ ok: true, newAchievements });
}
