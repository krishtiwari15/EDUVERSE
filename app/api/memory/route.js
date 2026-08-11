import { neon } from "@neondatabase/serverless";

// The real "delete my AI memory" control — wipes every trace of the
// student's Obsidian Mind: free-form notes, concept mastery, the event
// trail, and goals. Nothing here is a soft-delete.
export async function DELETE(req) {
  const student = new URL(req.url).searchParams.get("student");
  if (!student) return Response.json({ ok: false });
  const sql = neon(process.env.DATABASE_URL);
  await sql`DELETE FROM memory WHERE student = ${student}`;
  await sql`DELETE FROM student_concept WHERE student = ${student}`;
  await sql`DELETE FROM learning_events WHERE student = ${student}`;
  await sql`DELETE FROM goals WHERE student = ${student}`;
  return Response.json({ ok: true });
}
