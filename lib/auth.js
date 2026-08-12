import crypto from "crypto";
import { cookies } from "next/headers";
import { neon } from "@neondatabase/serverless";

export const SESSION_COOKIE = "eduverse_session";
const SESSION_DAYS = 30;

export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password, stored) {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const check = crypto.scryptSync(password, salt, 64).toString("hex");
  const a = Buffer.from(hash, "hex");
  const b = Buffer.from(check, "hex");
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

// Security-question answers reuse the same hashing as passwords — just
// normalized first (trim + lowercase) so "Rex" and "rex " both match what
// the student typed at signup.
function normalizeAnswer(answer) {
  return (answer || "").trim().toLowerCase();
}
export function hashAnswer(answer) {
  return hashPassword(normalizeAnswer(answer));
}
export function verifyAnswer(answer, stored) {
  if (!stored) return false;
  return verifyPassword(normalizeAnswer(answer), stored);
}

// One-time codes for email-based password recovery — works for anyone
// with a valid email on the account, including students who never set up
// a security question (the gap that motivated adding this).
export function generateOtp() {
  return crypto.randomInt(100000, 1000000).toString();
}
export function hashOtp(code) {
  return hashPassword(code);
}
export function verifyOtp(code, stored) {
  if (!stored) return false;
  return verifyPassword(code, stored);
}

export async function createSession(sql, userId) {
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  await sql`INSERT INTO sessions (token, user_id, expires_at) VALUES (${token}, ${userId}, ${expiresAt})`;
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  });
  return token;
}

export async function clearSession(sql) {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) await sql`DELETE FROM sessions WHERE token = ${token}`;
  jar.delete(SESSION_COOKIE);
}

export async function getSessionUser(sql) {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const rows = await sql`
    SELECT users.id, users.email, users.name, users.level, users.subjects, users.role
    FROM sessions
    JOIN users ON users.id = sessions.user_id
    WHERE sessions.token = ${token} AND sessions.expires_at > now()
  `;
  return rows[0] || null;
}

export function publicUser(row) {
  if (!row) return null;
  return { id: row.id, email: row.email, name: row.name, level: row.level, subjects: row.subjects || [], role: row.role || "student" };
}

export function sql() {
  return neon(process.env.DATABASE_URL);
}
