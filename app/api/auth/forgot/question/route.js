import { sql } from "@/lib/auth";

// Step 1 of password recovery: look up the security question for an email.
// No email infrastructure exists in this app (same reason Parent/Teacher
// linking uses codes, not invites) — so recovery is question-based rather
// than a reset-link email.
export async function POST(req) {
  const { email } = await req.json();
  const cleanEmail = (email || "").trim().toLowerCase();
  if (!cleanEmail) return Response.json({ ok: false, error: "Enter your email." }, { status: 400 });

  const db = sql();
  const rows = await db`SELECT security_question FROM users WHERE email = ${cleanEmail}`;
  const user = rows[0];
  if (!user) return Response.json({ ok: false, error: "No account found with that email." }, { status: 404 });
  if (!user.security_question) {
    return Response.json({ ok: false, error: "This account doesn't have a security question set up yet — sign in normally and set one in Settings so you can recover it next time." }, { status: 404 });
  }
  return Response.json({ ok: true, question: user.security_question });
}
