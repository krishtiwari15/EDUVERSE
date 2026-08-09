import { neon } from "@neondatabase/serverless";

// Get a student's star count
export async function GET(req) {
  const student = new URL(req.url).searchParams.get("student");
  if (!student) return Response.json({ stars: 0 });
  const sql = neon(process.env.DATABASE_URL);
  const rows = await sql`SELECT stars FROM progress WHERE student = ${student}`;
  return Response.json({ stars: rows[0]?.stars || 0 });
}

// Add stars (returns the new total)
export async function POST(req) {
  const { student, add } = await req.json();
  if (!student) return Response.json({ stars: 0 });
  const sql = neon(process.env.DATABASE_URL);
  const rows = await sql`
    INSERT INTO progress (student, stars, updated_at)
    VALUES (${student}, ${add || 1}, now())
    ON CONFLICT (student) DO UPDATE SET stars = progress.stars + ${add || 1}, updated_at = now()
    RETURNING stars
  `;
  return Response.json({ stars: rows[0]?.stars || 0 });
}