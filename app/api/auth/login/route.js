import { sql, verifyPassword, createSession, publicUser } from "@/lib/auth";

export async function POST(req) {
  const { email, password } = await req.json();
  const cleanEmail = (email || "").trim().toLowerCase();
  if (!cleanEmail || !password) return Response.json({ ok: false, error: "Enter your email and password." }, { status: 400 });

  const db = sql();
  const rows = await db`SELECT id, email, name, level, subjects, role, password_hash FROM users WHERE email = ${cleanEmail}`;
  const user = rows[0];
  if (!user || !verifyPassword(password, user.password_hash)) {
    return Response.json({ ok: false, error: "Wrong email or password." }, { status: 401 });
  }

  await createSession(db, user.id);
  return Response.json({ ok: true, user: publicUser(user) });
}
