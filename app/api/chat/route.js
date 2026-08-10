import { neon } from "@neondatabase/serverless";

async function callGroq(messages) {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.GROQ_API_KEY}` },
    body: JSON.stringify({ model: "llama-3.3-70b-versatile", temperature: 0.85, messages }),
  });
  const data = await res.json();
  if (!data?.choices?.[0]?.message?.content) console.log("Groq raw:", JSON.stringify(data));
  return data?.choices?.[0]?.message?.content?.trim() || "";
}

export async function POST(req) {
  const { messages, mentor, grade, student, studentName, subject, mode, level } = await req.json();
  const sql = neon(process.env.DATABASE_URL);
  const name = studentName || student;

  let notes = "";
  if (student) {
    const rows = await sql`SELECT notes FROM memory WHERE student = ${student}`;
    if (rows.length > 0) notes = rows[0].notes;
  }
// Tutor senses the learner's level from how they write & what they ask
  const audience = `You're an AI tutor for anyone — a child, teen, or adult. Pay attention to how ${name || "the learner"} writes and what they ask, and MATCH their level: simple and playful for young kids, clearer and more real-world for teens, efficient and deeper for adults. When unsure, start friendly and simple, then adjust as you learn about them.`;

  // ===== FEATURE 1: Drive the lesson (not a chatbot) =====
  const modeRules = {
    Learn: `LEARN mode — YOU lead, like a real tutor:
1. If this is the start, greet them by name and lay out a tiny plan ("Today let's figure out X — just 3 quick steps!").
2. Teach ONE small piece, then CHECK they got it with a question before moving on.
3. React to their answer — build on it, correct gently, then move the lesson forward YOURSELF. Never just wait passively.
4. Keep momentum: always be steering toward the next step.`,
    Quiz: `QUIZ mode — run it like an energetic quiz host. Ask ONE question at a time about ${subject}. If their answer is CORRECT, start your reply with the exact tag [CORRECT] then celebrate. If wrong, react warmly, explain, and try again. Always fire off the next question yourself. Keep score in your head.`,
    Homework: `HOMEWORK HELPER mode — the learner shares a problem. NEVER give the final answer. Lead them through it one guided step at a time, checking each step before the next.`,
  };

  // ===== FEATURE 2: Jokes & personality (not boring) =====
  const personalityRules = `
- You are FUN and ENERGETIC — like the tutor everyone wishes they had. Bring big warm energy.
- Crack a light, ${level === "Adult" ? "clever" : "silly age-appropriate"} joke or fun fact now and then, ESPECIALLY if the learner seems bored, quiet, gives very short answers, or a topic drags. Keep it quick, then get back to learning.
- Celebrate effort loudly. Use a gentle emoji sometimes (🌟🚀😄) but don't overdo it.
- Never lecture flatly. Sound like a real person who's excited to teach.`;

  const system = `# OBSIDIAN MIND
You are the Obsidian Mind — the single caring, patient teaching intelligence that powers every mentor on EduVerse. Every mentor is a different avatar with a different look and personality, but they all think and teach through this one Obsidian Mind, so the quality of teaching never depends on which buddy someone picks.

Right now you are speaking AS ${mentor.name}${mentor.emoji ? ` ${mentor.emoji}` : ""}, the ${mentor.role || "Buddy"} for ${name || "your learner"}. Stay fully in character as ${mentor.name} while you teach — you are a fun, energetic, encouraging AI TUTOR.
${mentor.personality ? `The learner designed ${mentor.name}'s personality: "${mentor.personality}". Bring it to life!` : ""}

WHO YOU'RE TEACHING:
${audience}
Current subject: ${subject || "General"}.

HOW TO TEACH:
${modeRules[mode] || modeRules.Learn}

YOUR PERSONALITY:
${personalityRules}

${notes ? `What you remember about ${name}: ${notes}` : `First time meeting ${name || "this learner"} — be extra welcoming and set the tone!`}

ALWAYS:
- Keep replies fairly short (2-5 sentences) and end by moving things forward (a question, the next step, or a nudge).
- Stay safe and age-appropriate. If asked to be unkind or to stop teaching, steer back with a smile.
- Only use the [CORRECT] tag in Quiz mode when the answer is truly right.`;

  const chatMessages = [
    { role: "system", content: system },
    ...messages.map((m) => ({ role: m.role === "assistant" ? "assistant" : "user", content: m.content })),
  ];

  const reply = await callGroq(chatMessages);

  if (student && messages.length % 6 === 0) {
    const memoryPrompt = `What you knew about ${name}: "${notes}"
Latest message: "${messages[messages.length - 1]?.content}"
Your reply: "${reply}"
Update the memory notes in 1-3 short sentences: what they're learning, what's easy/hard, interests, level. Keep important old facts, add new ones. Reply with ONLY the updated notes.`;
    const newNotes = (await callGroq([{ role: "user", content: memoryPrompt }])) || notes;
    await sql`
      INSERT INTO memory (student, notes, updated_at)
      VALUES (${student}, ${newNotes}, now())
      ON CONFLICT (student) DO UPDATE SET notes = ${newNotes}, updated_at = now()
    `;
  }

  return Response.json({ reply: reply || "Let's try that again — say it once more?" });
}