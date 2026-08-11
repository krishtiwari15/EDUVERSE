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

  return Response.json({ ok: true, message: "Tables ready!" });
}