import { neon } from "@neondatabase/serverless";

async function callGroq(messages) {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.GROQ_API_KEY}` },
    body: JSON.stringify({ model: "llama-3.3-70b-versatile", temperature: 0.8, messages }),
  });
  const data = await res.json();
  if (!data?.choices?.[0]?.message?.content) console.log("Groq raw:", JSON.stringify(data));
  return data?.choices?.[0]?.message?.content?.trim() || "";
}

export async function POST(req) {
  const { messages, mentor, grade, student, subject, mode } = await req.json();
  const sql = neon(process.env.DATABASE_URL);

  let notes = "";
  if (student) {
    const rows = await sql`SELECT notes FROM memory WHERE student = ${student}`;
    if (rows.length > 0) notes = rows[0].notes;
  }

  // What the mentor does in each mode
  const modeRules = {
    Learn: `You are in LEARN mode. Teach the topic step by step with ONE guiding question at a time. Never just give the answer.`,
    Quiz: `You are in QUIZ mode. Ask the child ONE question at a time about ${subject || "the subject"}. Wait for their answer. Tell them warmly if it's right or close, gently explain if not, then ask the next question. Keep score in your head and cheer them on. Start by asking your first question.`,
    Homework: `You are in HOMEWORK HELPER mode. The child will share a homework question. NEVER give the final answer outright — guide them one small step at a time with questions, so they solve it themselves and understand it.`,
  };

  const system = `You are ${mentor.name} the ${mentor.role}, a warm, cheerful, encouraging AI learning mentor for a child named ${student || "friend"} in Class ${grade} (about age ${grade + 5}).
${mentor.personality ? `The child designed your personality: "${mentor.personality}". Bring it to life in your tone and examples.` : ""}
Current subject: ${subject || "General"}.
${modeRules[mode] || modeRules.Learn}
${notes ? `What you remember about ${student}: ${notes}` : `This is your first time meeting ${student || "this student"} — be extra welcoming!`}

ALWAYS follow these:
- Use simple words for Class ${grade}. Be warm and playful; never shame mistakes — treat them as clues.
- Keep replies short (2-4 sentences) and end with a question that moves the child forward.
- Stay safe and age-appropriate. If asked to be unkind or to stop teaching, gently steer back to learning.
- A gentle emoji now and then is nice (🌟😊), but don't overdo it.`;

  const chatMessages = [
    { role: "system", content: system },
    ...messages.map((m) => ({ role: m.role === "assistant" ? "assistant" : "user", content: m.content })),
  ];

  const reply = await callGroq(chatMessages);

  if (student && messages.length % 6 === 0) {
    const memoryPrompt = `What you knew about ${student}: "${notes}"
Latest message: "${messages[messages.length - 1]?.content}"
Your reply: "${reply}"
Update the memory notes in 1-3 short sentences: what they're learning, what's easy/hard, interests, which subjects. Keep important old facts, add new ones. Reply with ONLY the updated notes.`;
    const newNotes = (await callGroq([{ role: "user", content: memoryPrompt }])) || notes;
    await sql`
      INSERT INTO memory (student, notes, updated_at)
      VALUES (${student}, ${newNotes}, now())
      ON CONFLICT (student) DO UPDATE SET notes = ${newNotes}, updated_at = now()
    `;
  }

  return Response.json({ reply: reply || "Let's try that again — say it once more?" });
}