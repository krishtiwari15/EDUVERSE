import { sql, hashPassword, verifyAnswer, createSession, publicUser } from "@/lib/auth";

// Step 2 of password recovery: verify the security-question answer, then
// set a new password and sign the student straight in.
export async function POST(req) {
  const { email, answer, newPassword } = await req.json();
  const cleanEmail = (email || "").trim().toLowerCase();
  if (!cleanEmail || !answer) return Response.json({ ok: false, error: "Answer the security question." }, { status: 400 });
  if (!newPassword || newPassword.length < 6) return Response.json({ ok: false, error: "New password must be at least 6 characters." }, { status: 400 });

  const db = sql();
  const rows = await db`SELECT id, security_answer_hash FROM users WHERE email = ${cleanEmail}`;
  const user = rows[0];
  if (!user || !verifyAnswer(answer, user.security_answer_hash)) {
    return Response.json({ ok: false, error: "That answer doesn't match." }, { status: 401 });
  }

  await db`UPDATE users SET password_hash = ${hashPassword(newPassword)} WHERE id = ${user.id}`;
  const updated = await db`SELECT id, email, name, level, subjects, role FROM users WHERE id = ${user.id}`;
  await createSession(db, user.id);
  return Response.json({ ok: true, user: publicUser(updated[0]) });
}
