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

  // ===== Obsidian Mind retrieval: pull what this student's mind already
  // knows about recent concepts, so the mentor picks up threads instead of
  // treating every conversation as isolated =====
  let mindContext = "";
  if (student) {
    const conceptRows = await sql`
      SELECT c.subject, c.name, sc.mastery, sc.mistakes
      FROM student_concept sc JOIN concepts c ON c.id = sc.concept_id
      WHERE sc.student = ${student}
      ORDER BY sc.last_reviewed DESC
      LIMIT 6
    `;
    if (conceptRows.length > 0) {
      mindContext = conceptRows.map((r) => {
        const lastMistake = r.mistakes?.length ? r.mistakes[r.mistakes.length - 1] : null;
        return `- ${r.name} (${r.subject}, mastery ${Math.round((r.mastery || 0) * 100)}%)${lastMistake ? ` — common mistake: ${lastMistake}` : ""}`;
      }).join("\n");
    }
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
    Companion: `COMPANION mode — this isn't a lesson, it's a check-in. Be a warm, curious study companion: ask how they're doing, what they're working on or stuck on, offer encouragement, and help them think out loud. Follow their lead rather than driving a curriculum — but if they want to dive into a subject or start a focus session, support that enthusiastically.`,
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
${mindContext ? `\nOBSIDIAN MIND — concepts ${name || "they"}'ve worked on recently:\n${mindContext}\nWeave this in naturally when relevant (e.g. pick up where a mistake was left off) — don't just recite it.` : ""}

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

  // ===== Obsidian Mind: extract a structured concept signal from this turn
  // so the knowledge graph grows from real conversations, not fake data =====
  if (student && ["Learn", "Quiz", "Homework", "Companion"].includes(mode || "Learn")) {
    try {
      const lastUser = messages[messages.length - 1]?.content || "";
      const extractPrompt = `From this single exchange, identify ONE specific concept the learner is working on, if any is clear.
Subject: ${subject || "General"}
Learner said: "${lastUser}"
Mentor replied: "${reply}"
Reply with ONLY compact JSON, no prose, no markdown fences, in exactly this shape:
{"concept": "short concept name or null", "masteryDelta": number between -0.2 and 0.2 (positive if they showed understanding, negative if they struggled, 0 if unclear), "mistake": "short specific mistake or null"}
Use JSON null (not the string "null") when nothing applies.`;
      const raw = await callGroq([{ role: "user", content: extractPrompt }]);
      const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
      if (parsed?.concept) {
        const conceptRows = await sql`
          INSERT INTO concepts (subject, name) VALUES (${subject || "General"}, ${parsed.concept})
          ON CONFLICT (subject, name) DO UPDATE SET name = EXCLUDED.name
          RETURNING id
        `;
        const conceptId = conceptRows[0].id;
        const existing = await sql`SELECT mastery, mistakes FROM student_concept WHERE student = ${student} AND concept_id = ${conceptId}`;
        const prevMastery = existing[0]?.mastery ?? 0.3;
        const prevMistakes = existing[0]?.mistakes ?? [];
        const delta = Math.max(-0.2, Math.min(0.2, Number(parsed.masteryDelta) || 0));
        const newMastery = Math.max(0, Math.min(1, prevMastery + delta));
        const newMistakes = parsed.mistake ? [...prevMistakes, parsed.mistake].slice(-5) : prevMistakes;
        await sql`
          INSERT INTO student_concept (student, concept_id, mastery, last_reviewed, mistakes)
          VALUES (${student}, ${conceptId}, ${newMastery}, now(), ${newMistakes})
          ON CONFLICT (student, concept_id) DO UPDATE SET mastery = ${newMastery}, last_reviewed = now(), mistakes = ${newMistakes}
        `;
        await sql`
          INSERT INTO learning_events (student, subject, concept, kind, detail)
          VALUES (${student}, ${subject || "General"}, ${parsed.concept}, ${parsed.mistake ? "mistake" : "question"}, ${parsed.mistake || lastUser.slice(0, 200)})
        `;
      }
    } catch {}
  }

  return Response.json({ reply: reply || "Let's try that again — say it once more?" });
}