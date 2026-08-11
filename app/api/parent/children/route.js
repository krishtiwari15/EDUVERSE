import { sql as authSql, getSessionUser } from "@/lib/auth";

async function callGroq(messages) {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.GROQ_API_KEY}` },
    body: JSON.stringify({ model: "llama-3.3-70b-versatile", temperature: 0.6, messages }),
  });
  const data = await res.json();
  return data?.choices?.[0]?.message?.content?.trim() || "";
}

// Real data only — stars, subject knowledge, and recent activity already
// sitting in the DB from real conversations, plus a short honest
// plain-language summary generated from exactly that data (never invented).
export async function GET() {
  const db = authSql();
  const user = await getSessionUser(db);
  if (!user || user.role !== "parent") return Response.json({ children: [] });

  const links = await db`
    SELECT u.id, u.name, u.level, u.subjects
    FROM parent_links pl JOIN users u ON u.id = pl.student_id
    WHERE pl.parent_id = ${user.id}
    ORDER BY u.name
  `;

  const children = [];
  for (const child of links) {
    const sKey = String(child.id);
    const starsRows = await db`SELECT stars FROM progress WHERE student = ${sKey}`;
    const stars = starsRows[0]?.stars || 0;
    const knowledge = await db`SELECT subject, level, difficulty FROM subject_knowledge WHERE student = ${sKey} ORDER BY updated_at DESC LIMIT 5`;
    const memRows = await db`SELECT notes FROM memory WHERE student = ${sKey}`;
    const notes = memRows[0]?.notes || "";
    const recentEvents = await db`SELECT concept, kind, subject FROM learning_events WHERE student = ${sKey} ORDER BY created_at DESC LIMIT 4`;

    let summary = "";
    if (notes || recentEvents.length > 0) {
      try {
        const prompt = `You're summarizing a student's recent learning for their parent, in warm plain language, 2-3 sentences, no jargon.
Student: ${child.name}
Notes: ${notes || "none yet"}
Recent activity: ${recentEvents.map((e) => `${e.kind} on ${e.concept} (${e.subject})`).join("; ") || "none yet"}
Stars earned: ${stars}
Write ONLY the summary, speaking about the student in third person, warmly and honestly — don't invent achievements not shown above.`;
        summary = await callGroq([{ role: "user", content: prompt }]);
      } catch {}
    }

    children.push({
      id: child.id,
      name: child.name,
      level: child.level,
      subjects: child.subjects,
      stars,
      knowledge,
      summary: summary || `${child.name} hasn't started learning yet — once they've had a conversation with their mentor, updates will appear here.`,
    });
  }

  return Response.json({ children });
}
