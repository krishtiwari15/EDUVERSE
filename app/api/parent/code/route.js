import { sql as authSql, getSessionUser } from "@/lib/auth";

function genCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no ambiguous chars
  let code = "";
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

// A student generates a short-lived code from Settings; a parent redeems
// it via /api/parent/link. No email infrastructure exists, so this is the
// honest way to link accounts without inventing an invite-by-email system.
export async function POST() {
  const db = authSql();
  const user = await getSessionUser(db);
  if (!user) return Response.json({ ok: false }, { status: 401 });

  const code = genCode();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await db`INSERT INTO link_codes (code, student_id, expires_at) VALUES (${code}, ${user.id}, ${expiresAt})`;
  return Response.json({ ok: true, code, expiresAt });
}
