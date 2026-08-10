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
  return Response.json({ ok: true, message: "Tables ready!" });
}