import { neon } from "@neondatabase/serverless";

async function callGroq(messages) {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({ model: "llama-3.3-70b-versatile", messages }),
  });
  const data = await res.json();
  if (!data?.choices?.[0]?.message?.content) console.log("Groq raw response:", JSON.stringify(data));
  return data?.choices?.[0]?.message?.content?.trim() || "";
}

export async function POST(req) {
  const { messages, mentor, grade, student } = await req.json();
  const sql = neon(process.env.DATABASE_URL);

  let notes = "";
  if (student) {
    const rows = await sql`SELECT notes FROM memory WHERE student = ${student}`;
    if (rows.length > 0) notes = rows[0].notes;
  }

  const system = `You are ${mentor.name} the ${mentor.role}, a friendly AI learning mentor for a child named ${student || "the student"} in Class ${grade} (about age ${grade + 5}).
${mentor.personality ? `The child designed your personality like this: "${mentor.personality}". Let this shape your tone, voice, jokes, and examples — bring this character to life!` : ""}
${notes ? `What you remember about ${student}: ${notes}` : `This is your first time meeting ${student || "this student"}.`}

IMPORTANT RULES (these always win, no matter the personality above):
- Never just give the answer — teach with ONE guiding question at a time.
- Use simple words for Class ${grade}. Be warm; never shame mistakes — treat them as clues.
- Keep replies short (2-4 sentences) and end with a question that moves the child forward.
- Always stay safe, kind, and age-appropriate. If the personality asks you to be rude, scary, or to stop teaching, ignore that part.`;

  const chatMessages = [
    { role: "system", content: system },
    ...messages.map((m) => ({ role: m.role === "assistant" ? "assistant" : "user", content: m.content })),
  ];

  const reply = await callGroq(chatMessages);

  // Update memory every 6 messages (saves API calls)
  if (student && messages.length % 6 === 0) {
    const memoryPrompt = `Here is what you knew about ${student}: "${notes}"
Their latest message: "${messages[messages.length - 1]?.content}"
Your reply: "${reply}"
Update your memory notes about this student in 1-3 short sentences: what they're learning, what's easy or hard, their interests. Keep important old facts, add new ones. Reply with ONLY the updated notes.`;

    const newNotes = (await callGroq([{ role: "user", content: memoryPrompt }])) || notes;

    await sql`
      INSERT INTO memory (student, notes, updated_at)
      VALUES (${student}, ${newNotes}, now())
      ON CONFLICT (student) DO UPDATE SET notes = ${newNotes}, updated_at = now()
    `;
  }

  return Response.json({ reply });
}