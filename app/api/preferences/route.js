import { sql, getSessionUser, publicUser } from "@/lib/auth";

export async function POST(req) {
  const db = sql();
  const user = await getSessionUser(db);
  if (!user) return Response.json({ ok: false, error: "Not logged in." }, { status: 401 });

  const { subjects } = await req.json();
  const clean = Array.isArray(subjects) ? subjects.filter((s) => typeof s === "string" && s.trim()).slice(0, 20) : [];
  if (clean.length === 0) return Response.json({ ok: false, error: "Pick at least one subject." }, { status: 400 });

  const rows = await db`UPDATE users SET subjects = ${clean} WHERE id = ${user.id} RETURNING id, email, name, level, subjects`;
  return Response.json({ ok: true, user: publicUser(rows[0]) });
}
