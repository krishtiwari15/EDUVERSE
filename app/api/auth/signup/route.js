import { sql, hashPassword, hashAnswer, createSession, publicUser } from "@/lib/auth";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const LEVELS = ["Kid", "Teen", "Adult"];
const ROLES = ["student", "parent", "teacher"];

export async function POST(req) {
  const { email, password, name, level, role, securityQuestion, securityAnswer } = await req.json();
  const cleanEmail = (email || "").trim().toLowerCase();
  const cleanName = (name || "").trim();
  const cleanQuestion = (securityQuestion || "").trim();
  const cleanAnswer = (securityAnswer || "").trim();

  if (!EMAIL_RE.test(cleanEmail)) return Response.json({ ok: false, error: "Enter a valid email address." }, { status: 400 });
  if (!password || password.length < 6) return Response.json({ ok: false, error: "Password must be at least 6 characters." }, { status: 400 });
  if (!cleanName) return Response.json({ ok: false, error: "Enter a name." }, { status: 400 });
  if (!cleanQuestion || !cleanAnswer) return Response.json({ ok: false, error: "Set a security question and answer so you can recover your account later." }, { status: 400 });
  const cleanLevel = LEVELS.includes(level) ? level : "Kid";
  const cleanRole = ROLES.includes(role) ? role : "student";

  const db = sql();
  const existing = await db`SELECT id FROM users WHERE email = ${cleanEmail}`;
  if (existing.length > 0) return Response.json({ ok: false, error: "An account with that email already exists." }, { status: 409 });

  const rows = await db`
    INSERT INTO users (email, password_hash, name, level, role, security_question, security_answer_hash)
    VALUES (${cleanEmail}, ${hashPassword(password)}, ${cleanName}, ${cleanLevel}, ${cleanRole}, ${cleanQuestion}, ${hashAnswer(cleanAnswer)})
    RETURNING id, email, name, level, subjects, role
  `;
  await createSession(db, rows[0].id);
  return Response.json({ ok: true, user: publicUser(rows[0]) });
}
