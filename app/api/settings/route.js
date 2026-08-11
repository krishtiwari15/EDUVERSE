import { neon } from "@neondatabase/serverless";

const DEFAULTS = {
  camera: false,
  microphone: true,
  voiceHistory: true,
  learningMemory: true,
  aiPersonalization: true,
  proactiveMentor: true,
  focusReminders: true,
};

export async function GET(req) {
  const student = new URL(req.url).searchParams.get("student");
  if (!student) return Response.json({ settings: DEFAULTS });
  const sql = neon(process.env.DATABASE_URL);
  const rows = await sql`SELECT settings FROM users WHERE id = ${Number(student)}`;
  return Response.json({ settings: { ...DEFAULTS, ...(rows[0]?.settings || {}) } });
}

export async function POST(req) {
  const { student, settings } = await req.json();
  if (!student || !settings) return Response.json({ ok: false });
  const sql = neon(process.env.DATABASE_URL);
  await sql`UPDATE users SET settings = ${JSON.stringify(settings)}::jsonb WHERE id = ${Number(student)}`;
  return Response.json({ ok: true });
}
