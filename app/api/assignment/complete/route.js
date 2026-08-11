import { sql as authSql, getSessionUser } from "@/lib/auth";

export async function POST(req) {
  const db = authSql();
  const user = await getSessionUser(db);
  if (!user) return Response.json({ ok: false }, { status: 401 });
  const { assignmentId } = await req.json();
  if (!assignmentId) return Response.json({ ok: false });
  await db`INSERT INTO assignment_completions (assignment_id, student_id) VALUES (${assignmentId}, ${user.id}) ON CONFLICT DO NOTHING`;
  return Response.json({ ok: true });
}
