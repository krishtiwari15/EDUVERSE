import { neon } from "@neondatabase/serverless";

// Read a student's Obsidian Mind — the concepts they've actually covered in
// real conversations, joined with mastery/mistakes, plus their active goals.
export async function GET(req) {
  const student = new URL(req.url).searchParams.get("student");
  if (!student) return Response.json({ concepts: [], goals: [] });
  const sql = neon(process.env.DATABASE_URL);
  const concepts = await sql`
    SELECT c.id, c.subject, c.name, sc.mastery, sc.mistakes, sc.last_reviewed
    FROM student_concept sc JOIN concepts c ON c.id = sc.concept_id
    WHERE sc.student = ${student}
    ORDER BY c.subject, sc.last_reviewed DESC
  `;
  const goals = await sql`SELECT id, text, status, created_at FROM goals WHERE student = ${student} AND status = 'active' ORDER BY created_at DESC`;
  return Response.json({ concepts, goals });
}

// Add a learning goal
export async function POST(req) {
  const { student, text } = await req.json();
  if (!student || !text?.trim()) return Response.json({ ok: false });
  const sql = neon(process.env.DATABASE_URL);
  await sql`INSERT INTO goals (student, text) VALUES (${student}, ${text.trim()})`;
  return Response.json({ ok: true });
}
