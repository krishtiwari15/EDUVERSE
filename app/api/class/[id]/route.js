import { sql as authSql, getSessionUser } from "@/lib/auth";

// Class detail for its owning teacher — roster + assignments, both real.
export async function GET(req, { params }) {
  const { id } = await params;
  const db = authSql();
  const user = await getSessionUser(db);
  if (!user || user.role !== "teacher") return Response.json({ ok: false }, { status: 401 });

  const classRows = await db`SELECT id, name, subject, join_code FROM classes WHERE id = ${id} AND teacher_id = ${user.id}`;
  const cls = classRows[0];
  if (!cls) return Response.json({ ok: false, error: "Not found." }, { status: 404 });

  const roster = await db`
    SELECT u.id, u.name, e.joined_at, COALESCE(p.stars, 0) AS stars
    FROM class_enrollments e
    JOIN users u ON u.id = e.student_id
    LEFT JOIN progress p ON p.student = u.id::text
    WHERE e.class_id = ${cls.id}
    ORDER BY u.name
  `;

  const assignments = await db`
    SELECT a.id, a.title, a.topic, a.content, a.due_date, a.created_at,
      COUNT(ac.student_id)::int AS completed_count
    FROM assignments a LEFT JOIN assignment_completions ac ON ac.assignment_id = a.id
    WHERE a.class_id = ${cls.id}
    GROUP BY a.id ORDER BY a.created_at DESC
  `;

  return Response.json({ class: cls, roster, assignments });
}
