import { sql, hashPassword, verifyOtp, createSession, publicUser } from "@/lib/auth";

const MAX_ATTEMPTS = 5;

// Step 2: check the code against the latest (unexpired, not-overused) OTP
// row for this account, then set the new password and sign in.
export async function POST(req) {
  const { email, code, newPassword } = await req.json();
  const cleanEmail = (email || "").trim().toLowerCase();
  const cleanCode = (code || "").trim();
  if (!cleanEmail || !cleanCode) return Response.json({ ok: false, error: "Enter the code from your email." }, { status: 400 });
  if (!newPassword || newPassword.length < 6) return Response.json({ ok: false, error: "New password must be at least 6 characters." }, { status: 400 });

  const db = sql();
  const users = await db`SELECT id FROM users WHERE email = ${cleanEmail}`;
  const user = users[0];
  if (!user) return Response.json({ ok: false, error: "No account found with that email." }, { status: 404 });

  const otps = await db`
    SELECT id, code_hash, attempts, expires_at FROM password_reset_otps
    WHERE user_id = ${user.id} ORDER BY created_at DESC LIMIT 1
  `;
  const otp = otps[0];
  if (!otp || new Date(otp.expires_at).getTime() < Date.now()) {
    return Response.json({ ok: false, error: "That code has expired — request a new one." }, { status: 410 });
  }
  if (otp.attempts >= MAX_ATTEMPTS) {
    return Response.json({ ok: false, error: "Too many incorrect attempts — request a new code." }, { status: 429 });
  }
  if (!verifyOtp(cleanCode, otp.code_hash)) {
    await db`UPDATE password_reset_otps SET attempts = attempts + 1 WHERE id = ${otp.id}`;
    return Response.json({ ok: false, error: "That code isn't right." }, { status: 401 });
  }

  await db`UPDATE users SET password_hash = ${hashPassword(newPassword)} WHERE id = ${user.id}`;
  await db`DELETE FROM password_reset_otps WHERE user_id = ${user.id}`;
  const updated = await db`SELECT id, email, name, level, subjects, role FROM users WHERE id = ${user.id}`;
  await createSession(db, user.id);
  return Response.json({ ok: true, user: publicUser(updated[0]) });
}
