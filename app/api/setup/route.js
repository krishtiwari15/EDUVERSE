import { neon } from "@neondatabase/serverless";

export async function GET() {
  const sql = neon(process.env.DATABASE_URL);
  await sql`
    CREATE TABLE IF NOT EXISTS memory (
      student TEXT PRIMARY KEY,
      notes TEXT DEFAULT '',
      updated_at TIMESTAMP DEFAULT now()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS mentors (
      id SERIAL PRIMARY KEY,
      student TEXT NOT NULL,
      name TEXT NOT NULL,
      emoji TEXT,
      accent TEXT,
      soft TEXT,
      personality TEXT,
      created_at TIMESTAMP DEFAULT now()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS progress (
      student TEXT PRIMARY KEY,
      stars INTEGER DEFAULT 0,
      updated_at TIMESTAMP DEFAULT now()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      level TEXT DEFAULT 'Kid',
      subjects TEXT[] DEFAULT '{}',
      created_at TIMESTAMP DEFAULT now()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS sessions (
      token TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMP DEFAULT now(),
      expires_at TIMESTAMP NOT NULL
    )
  `;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}'`;

  // ===== Obsidian Mind: knowledge graph tables =====
  await sql`
    CREATE TABLE IF NOT EXISTS concepts (
      id SERIAL PRIMARY KEY,
      subject TEXT NOT NULL,
      name TEXT NOT NULL,
      related TEXT[] DEFAULT '{}',
      UNIQUE(subject, name)
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS student_concept (
      student TEXT NOT NULL,
      concept_id INTEGER NOT NULL REFERENCES concepts(id) ON DELETE CASCADE,
      mastery REAL DEFAULT 0,
      last_reviewed TIMESTAMPTZ DEFAULT now(),
      mistakes TEXT[] DEFAULT '{}',
      PRIMARY KEY (student, concept_id)
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS learning_events (
      id SERIAL PRIMARY KEY,
      student TEXT NOT NULL,
      subject TEXT,
      concept TEXT,
      kind TEXT NOT NULL,
      detail TEXT,
      created_at TIMESTAMPTZ DEFAULT now()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS goals (
      id SERIAL PRIMARY KEY,
      student TEXT NOT NULL,
      text TEXT NOT NULL,
      status TEXT DEFAULT 'active',
      created_at TIMESTAMPTZ DEFAULT now()
    )
  `;

  // ===== Mentor intelligence: knowledge level (separate from age/persona)
  // and a conversationally-captured learner profile =====
  await sql`
    CREATE TABLE IF NOT EXISTS subject_knowledge (
      student TEXT NOT NULL,
      subject TEXT NOT NULL,
      level TEXT DEFAULT 'beginner',
      difficulty INTEGER DEFAULT 2,
      confidence REAL DEFAULT 0.5,
      updated_at TIMESTAMPTZ DEFAULT now(),
      PRIMARY KEY (student, subject)
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS learner_profile (
      student TEXT PRIMARY KEY,
      primary_goal TEXT,
      why TEXT,
      interests TEXT[] DEFAULT '{}',
      available_time TEXT,
      learning_style TEXT,
      preferred_language TEXT,
      updated_at TIMESTAMPTZ DEFAULT now()
    )
  `;
  await sql`ALTER TABLE learner_profile ADD COLUMN IF NOT EXISTS preferred_language TEXT`;

  // ===== Roles: every account is a student by default; parent/teacher
  // accounts don't have subjects/level, they have relationships instead =====
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'student'`;

  // ===== Password recovery: no email infrastructure exists (same reason
  // Parent Copilot uses codes instead of email invites), so "forgot
  // password" is a security question set at signup / in Settings, verified
  // before allowing a reset — not an email reset link. =====
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS security_question TEXT`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS security_answer_hash TEXT`;

  // ===== Parent Copilot: real parent<->student linking via short codes
  // (no email infrastructure exists, so codes are the honest option) =====
  await sql`
    CREATE TABLE IF NOT EXISTS link_codes (
      code TEXT PRIMARY KEY,
      student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ DEFAULT now(),
      expires_at TIMESTAMPTZ NOT NULL
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS parent_links (
      id SERIAL PRIMARY KEY,
      parent_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ DEFAULT now(),
      UNIQUE(parent_id, student_id)
    )
  `;

  // ===== Teacher Copilot: real classes, rosters, and AI-generated
  // assignments — binary completion, no grading/rubric system =====
  await sql`
    CREATE TABLE IF NOT EXISTS classes (
      id SERIAL PRIMARY KEY,
      teacher_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      subject TEXT,
      join_code TEXT UNIQUE NOT NULL,
      created_at TIMESTAMPTZ DEFAULT now()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS class_enrollments (
      class_id INTEGER NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
      student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      joined_at TIMESTAMPTZ DEFAULT now(),
      PRIMARY KEY (class_id, student_id)
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS assignments (
      id SERIAL PRIMARY KEY,
      class_id INTEGER NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      topic TEXT,
      content TEXT,
      due_date DATE,
      created_at TIMESTAMPTZ DEFAULT now()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS assignment_completions (
      assignment_id INTEGER NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
      student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      completed_at TIMESTAMPTZ DEFAULT now(),
      PRIMARY KEY (assignment_id, student_id)
    )
  `;

  // ===== Knowledge Games: session/progress bookkeeping. Skill signals
  // (mastery, mistakes) flow into the SAME Obsidian Mind tables above —
  // concepts/student_concept/learning_events — not a parallel system. =====
  await sql`
    CREATE TABLE IF NOT EXISTS game_progress (
      student TEXT NOT NULL,
      game_id TEXT NOT NULL,
      difficulty INTEGER DEFAULT 2,
      sessions_played INTEGER DEFAULT 0,
      best_score INTEGER DEFAULT 0,
      last_played_at TIMESTAMPTZ DEFAULT now(),
      PRIMARY KEY (student, game_id)
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS game_sessions (
      id SERIAL PRIMARY KEY,
      student TEXT NOT NULL,
      game_id TEXT NOT NULL,
      difficulty INTEGER,
      score INTEGER DEFAULT 0,
      accuracy REAL,
      duration_sec INTEGER,
      created_at TIMESTAMPTZ DEFAULT now()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS game_achievements (
      student TEXT NOT NULL,
      key TEXT NOT NULL,
      earned_at TIMESTAMPTZ DEFAULT now(),
      PRIMARY KEY (student, key)
    )
  `;

  return Response.json({ ok: true, message: "Tables ready!" });
}