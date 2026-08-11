import { sql as authSql, getSessionUser } from "@/lib/auth";

// A parent redeems a code the student generated in Settings.
export async function POST(req) {
  const db = authSql();
  const user = await getSessionUser(db);
  if (!user || user.role !== "parent") return Response.json({ ok: false, error: "Not authorized." }, { status: 401 });

  const { code } = await req.json();
  if (!code?.trim()) return Response.json({ ok: false, error: "Enter a code." }, { status: 400 });

  const rows = await db`SELECT student_id, expires_at FROM link_codes WHERE code = ${code.trim().toUpperCase()}`;
  const row = rows[0];
  if (!row) return Response.json({ ok: false, error: "That code isn't valid." }, { status: 404 });
  if (new Date(row.expires_at) < new Date()) return Response.json({ ok: false, error: "That code has expired — ask for a new one." }, { status: 410 });

  await db`
    INSERT INTO parent_links (parent_id, student_id) VALUES (${user.id}, ${row.student_id})
    ON CONFLICT (parent_id, student_id) DO NOTHING
  `;
  return Response.json({ ok: true });
}
