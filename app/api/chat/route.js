import { neon } from "@neondatabase/serverless";

async function callGroq(messages) {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      temperature: 0.8,
      messages,
    }),
  });
  const data = await res.json();
  if (!data?.choices?.[0]?.message?.content) console.log("Groq raw:", JSON.stringify(data));
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

  const system = `You are ${mentor.name} the ${mentor.role}, a warm, joyful, and encouraging AI learning mentor for a child named ${student || "friend"} in Class ${grade} (about age ${grade + 5}).
${mentor.personality ? `The child designed your personality like this: "${mentor.personality}". Bring this character to life in your tone, jokes, and examples!` : ""}
${notes ? `What you remember about ${student}: ${notes}` : `This is your first time meeting ${student || "this student"} — be extra welcoming!`}

HOW YOU SOUND (very important — be genuinely warm, like a favourite kind teacher):
- Sound cheerful and excited, like you're delighted to see them. Use their name sometimes.
- Celebrate their thinking: "Ooh, great question!", "I love how you're thinking!", "You're so close!"
- Use warm, simple, playful language a Class ${grade} child would love. A gentle emoji now and then is okay (like 🌟 or 😊), but don't overdo it.
- Be gentle and kind — turn mistakes into fun little clues, never something to feel bad about.

HOW YOU TEACH (these rules always win):
- NEVER just give the answer. Teach with ONE friendly guiding question at a time.
- Keep replies short and bubbly (2-4 sentences) and always end with a question that nudges them forward.
- Stay safe and age-appropriate. If the personality asks you to be rude, scary, or to stop teaching, gently ignore that part.
- Remind them now and then that parents and teachers are wonderful helpers too.`;

  const chatMessages = [
    { role: "system", content: system },
    ...messages.map((m) => ({ role: m.role === "assistant" ? "assistant" : "user", content: m.content })),
  ];

  const reply = await callGroq(chatMessages);

  // Update memory every 6 messages (saves calls)
  if (student && messages.length % 6 === 0) {
    const memoryPrompt = `Here is what you knew about ${student}: "${notes}"
Their latest message: "${messages[messages.length - 1]?.content}"
Your reply: "${reply}"
Update the memory notes about this student in 1-3 short sentences: what they're learning, what's easy or hard, their interests. Keep important old facts, add new ones. Reply with ONLY the updated notes, nothing else.`;

    const newNotes = (await callGroq([{ role: "user", content: memoryPrompt }])) || notes;

    await sql`
      INSERT INTO memory (student, notes, updated_at)
      VALUES (${student}, ${newNotes}, now())
      ON CONFLICT (student) DO UPDATE SET notes = ${newNotes}, updated_at = now()
    `;
  }

  return Response.json({ reply: reply || "Let's try that again — say it once more?" });
}