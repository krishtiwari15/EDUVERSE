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
  return Response.json({ ok: true, message: "Tables ready!" });
}