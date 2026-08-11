import { sql as authSql, getSessionUser } from "@/lib/auth";

export async function POST(req) {
  const db = authSql();
  const user = await getSessionUser(db);
  if (!user) return Response.json({ ok: false }, { status: 401 });
  const { code } = await req.json();
  if (!code?.trim()) return Response.json({ ok: false, error: "Enter a code." }, { status: 400 });

  const rows = await db`SELECT id, name FROM classes WHERE join_code = ${code.trim().toUpperCase()}`;
  const cls = rows[0];
  if (!cls) return Response.json({ ok: false, error: "That code isn't valid." }, { status: 404 });

  await db`INSERT INTO class_enrollments (class_id, student_id) VALUES (${cls.id}, ${user.id}) ON CONFLICT DO NOTHING`;
  return Response.json({ ok: true, className: cls.name });
}
