import { sql as authSql, getSessionUser, hashAnswer } from "@/lib/auth";

// Lets an account that signed up before this feature existed (or just
// wants to change it) set/update the security question used for password
// recovery. Requires an active session — this isn't part of signup, so a
// client-supplied id isn't trustworthy here the way it is for preferences.
export async function GET() {
  const db = authSql();
  const user = await getSessionUser(db);
  if (!user) return Response.json({ ok: false }, { status: 401 });
  const rows = await db`SELECT security_question FROM users WHERE id = ${user.id}`;
  return Response.json({ ok: true, question: rows[0]?.security_question || null });
}

export async function POST(req) {
  const db = authSql();
  const user = await getSessionUser(db);
  if (!user) return Response.json({ ok: false }, { status: 401 });

  const { question, answer } = await req.json();
  const cleanQuestion = (question || "").trim();
  const cleanAnswer = (answer || "").trim();
  if (!cleanQuestion || !cleanAnswer) return Response.json({ ok: false, error: "Enter both a question and an answer." }, { status: 400 });

  await db`UPDATE users SET security_question = ${cleanQuestion}, security_answer_hash = ${hashAnswer(cleanAnswer)} WHERE id = ${user.id}`;
  return Response.json({ ok: true });
}
