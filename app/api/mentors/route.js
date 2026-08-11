import { neon } from "@neondatabase/serverless";

// Save a new custom mentor
export async function POST(req) {
  const { student, mentor } = await req.json();
  if (!student || !mentor?.name) return Response.json({ ok: false });
  const sql = neon(process.env.DATABASE_URL);
  await sql`
    INSERT INTO mentors (student, name, emoji, accent, soft, personality)
    VALUES (${student}, ${mentor.name}, ${mentor.emoji}, ${mentor.accent}, ${mentor.soft}, ${mentor.personality || ""})
  `;
  return Response.json({ ok: true });
}

// Load a student's saved mentors
export async function GET(req) {
  const student = new URL(req.url).searchParams.get("student");
  if (!student) return Response.json({ mentors: [] });
  const sql = neon(process.env.DATABASE_URL);
  const rows = await sql`SELECT * FROM mentors WHERE student = ${student} ORDER BY created_at DESC`;
  return Response.json({ mentors: rows });
}
