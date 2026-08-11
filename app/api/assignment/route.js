import { sql as authSql, getSessionUser } from "@/lib/auth";

async function callGroq(messages) {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.GROQ_API_KEY}` },
    body: JSON.stringify({ model: "llama-3.3-70b-versatile", temperature: 0.7, messages }),
  });
  const data = await res.json();
  return data?.choices?.[0]?.message?.content?.trim() || "";
}

// A teacher describes a topic/goal; the mentor generates real assignment
// content (same model, same honesty bar as the rest of the app) — no fake
// classroom data, no grading system, just genuinely usable material.
export async function POST(req) {
  const db = authSql();
  const user = await getSessionUser(db);
  if (!user || user.role !== "teacher") return Response.json({ ok: false }, { status: 401 });

  const { classId, title, topic, dueDate } = await req.json();
  if (!classId || !title?.trim() || !topic?.trim()) return Response.json({ ok: false, error: "Fill in a title and topic." }, { status: 400 });

  const classRows = await db`SELECT id, name, subject FROM classes WHERE id = ${classId} AND teacher_id = ${user.id}`;
  const cls = classRows[0];
  if (!cls) return Response.json({ ok: false, error: "Not your class." }, { status: 403 });

  const prompt = `You're an excellent teacher creating real classroom material.
Class: ${cls.name}${cls.subject ? ` (${cls.subject})` : ""}
Assignment title: ${title}
Topic/goal the teacher described: ${topic}
Write a clear, well-structured assignment: a short intro (what students will learn/practice), then 4-6 actual questions or tasks at an appropriate level for this class. Plain text, simple numbering, no markdown headers. Be genuinely good material a real teacher could hand out today — not generic filler.`;
  const content = await callGroq([{ role: "user", content: prompt }]);

  const rows = await db`
    INSERT INTO assignments (class_id, title, topic, content, due_date)
    VALUES (${classId}, ${title.trim()}, ${topic.trim()}, ${content}, ${dueDate || null})
    RETURNING id, title, topic, content, due_date, created_at
  `;
  return Response.json({ ok: true, assignment: { ...rows[0], completed_count: 0 } });
}

// A student's own view: assignments from every class they've joined.
export async function GET() {
  const db = authSql();
  const user = await getSessionUser(db);
  if (!user) return Response.json({ assignments: [] });

  const rows = await db`
    SELECT a.id, a.title, a.topic, a.content, a.due_date, a.created_at, c.name AS class_name,
      EXISTS(SELECT 1 FROM assignment_completions ac WHERE ac.assignment_id = a.id AND ac.student_id = ${user.id}) AS completed
    FROM assignments a
    JOIN class_enrollments e ON e.class_id = a.class_id AND e.student_id = ${user.id}
    JOIN classes c ON c.id = a.class_id
    ORDER BY a.created_at DESC
  `;
  return Response.json({ assignments: rows });
}
