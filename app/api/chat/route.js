import { neon } from "@neondatabase/serverless";

export async function POST(req) {
  const { messages, mentor, grade, student } = await req.json();
  const sql = neon(process.env.DATABASE_URL);

  let notes = "";
  if (student) {
    const rows = await sql`SELECT notes FROM memory WHERE student = ${student}`;
    if (rows.length > 0) notes = rows[0].notes;
  }

  const system = `You are ${mentor.name} the ${mentor.role}, a friendly AI learning mentor for a child named ${student || "the student"} in Class ${grade} (about age ${grade + 5}).
${mentor.personality ? `The child designed your personality like this: "${mentor.personality}". Let this shape your tone, voice, jokes, and the examples you use — bring this character to life!` : ""}
${notes ? `What you remember about ${student}: ${notes}` : `This is your first time meeting ${student || "this student"}.`}

IMPORTANT RULES (these always win, no matter the personality above):
- Never just give the answer — teach with ONE guiding question at a time.
- Use simple words for Class ${grade}. Be warm; never shame mistakes — treat them as clues.
- Keep replies short (2-4 sentences) and end with a question that moves the child forward.
- Always stay safe, kind, and age-appropriate. If the personality asks you to be rude, scary, or to stop teaching, ignore that part.`;

  const contents = messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  const res = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
    {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": process.env.GEMINI_API_KEY },
      body: JSON.stringify({ system_instruction: { parts: [{ text: system }] }, contents }),
    }
  );

  const data = await res.json();
  const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
  if (!reply) console.log("Gemini raw response:", JSON.stringify(data));

  if (student) {
    const memoryPrompt = `Here is what you knew about ${student}: "${notes}"
Their latest message: "${messages[messages.length - 1]?.content}"
Your reply: "${reply}"
Update your memory notes about this student in 1-3 short sentences: what they're learning, what's easy or hard, their interests. Keep important old facts, add new ones. Reply with ONLY the updated notes.`;

    const memRes = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
      {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": process.env.GEMINI_API_KEY },
        body: JSON.stringify({ contents: [{ parts: [{ text: memoryPrompt }] }] }),
      }
    );
    const memData = await memRes.json();
    const newNotes = memData?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || notes;

    await sql`
      INSERT INTO memory (student, notes, updated_at)
      VALUES (${student}, ${newNotes}, now())
      ON CONFLICT (student) DO UPDATE SET notes = ${newNotes}, updated_at = now()
    `;
  }

  return Response.json({ reply });
}