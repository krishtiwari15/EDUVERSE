import { sql as authSql, getSessionUser } from "@/lib/auth";

function genJoinCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

export async function GET() {
  const db = authSql();
  const user = await getSessionUser(db);
  if (!user || user.role !== "teacher") return Response.json({ classes: [] });
  const classes = await db`
    SELECT c.id, c.name, c.subject, c.join_code, c.created_at, COUNT(e.student_id)::int AS student_count
    FROM classes c LEFT JOIN class_enrollments e ON e.class_id = c.id
    WHERE c.teacher_id = ${user.id}
    GROUP BY c.id ORDER BY c.created_at DESC
  `;
  return Response.json({ classes });
}

export async function POST(req) {
  const db = authSql();
  const user = await getSessionUser(db);
  if (!user || user.role !== "teacher") return Response.json({ ok: false }, { status: 401 });
  const { name, subject } = await req.json();
  if (!name?.trim()) return Response.json({ ok: false, error: "Name your class." }, { status: 400 });
  const code = genJoinCode();
  const rows = await db`
    INSERT INTO classes (teacher_id, name, subject, join_code)
    VALUES (${user.id}, ${name.trim()}, ${subject || null}, ${code})
    RETURNING id, name, subject, join_code, created_at
  `;
  return Response.json({ ok: true, class: { ...rows[0], student_count: 0 } });
}
