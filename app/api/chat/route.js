import { neon } from "@neondatabase/serverless";

const DIFFICULTY_LABELS = { 1: "Foundation", 2: "Beginner", 3: "Intermediate", 4: "Advanced", 5: "Expert" };

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
  const { messages, mentor, student, studentName, subject, mode, level } = await req.json();
  const sql = neon(process.env.DATABASE_URL);
  const name = studentName || student;
  const subj = subject || "General";

  let notes = "";
  if (student) {
    const rows = await sql`SELECT notes FROM memory WHERE student = ${student}`;
    if (rows.length > 0) notes = rows[0].notes;
  }

  // ===== Knowledge level: a dimension entirely separate from age/persona.
  // "Adult + beginner Python" and "Adult + advanced Python" must feel
  // completely different — this is the number that drives that, not age. =====
  let knowLevel = "beginner";
  let difficulty = 2;
  if (student) {
    const rows = await sql`SELECT level, difficulty FROM subject_knowledge WHERE student = ${student} AND subject = ${subj}`;
    if (rows.length > 0) { knowLevel = rows[0].level; difficulty = rows[0].difficulty; }
  }
  const difficultyLabel = DIFFICULTY_LABELS[difficulty] || "Beginner";

  // ===== Learner profile: goal/why/interests, captured conversationally
  // during a short interview on first contact — never a form. =====
  let profile = null;
  if (student) {
    const rows = await sql`SELECT primary_goal, why, interests, preferred_language FROM learner_profile WHERE student = ${student}`;
    if (rows.length > 0) profile = rows[0];
  }
  const hasGoal = !!profile?.primary_goal;

  // ===== Obsidian Mind retrieval: concepts/mastery + recent activity, so
  // the mentor picks up real threads instead of treating every
  // conversation as isolated =====
  let mindContext = "";
  let recentActivity = "";
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
    const eventRows = await sql`
      SELECT concept, kind, detail FROM learning_events
      WHERE student = ${student} ORDER BY created_at DESC LIMIT 2
    `;
    if (eventRows.length > 0) {
      recentActivity = eventRows.map((r) => `- recently ${r.kind === "mistake" ? "struggled with" : "worked on"} ${r.concept}${r.detail ? ` (${r.detail.slice(0, 80)})` : ""}`).join("\n");
    }
  }

  // ===== PERSONA: age/persona controls TONE AND EXAMPLES ONLY — never depth =====
  const personaBlock = {
    Kid: `Speak with warmth and playful curiosity — but never assume low intelligence. Use vivid, concrete examples (games, animals, space, everyday objects, stories) to make ideas click. Short sentences. Lean on "why" and "how" questions to spark curiosity.`,
    Teen: `Speak like a sharp, respected mentor, not a babysitter. Use real-world stakes — school, exams, projects, technology, career exploration. Don't oversimplify; challenge them to think critically and push back on lazy answers.`,
    Adult: `Speak efficiently and respectfully, like an excellent colleague or professor who values their time. Use professional/real-world framing — work, projects, decisions, industry context. Never explain things they clearly already know.`,
  }[level] || `Speak clearly and warmly, adapting your tone as you learn more about ${name || "this learner"}.`;

  // ===== KNOWLEDGE LEVEL: this — not age — controls DEPTH. This is the
  // fix for the core problem: an Adult beginner and an Adult expert, or a
  // Kid beginner and a gifted Kid at an advanced level, must be taught
  // completely differently even though their persona tone is the same. =====
  const knowledgeBlock = `Estimated knowledge in ${subj}: ${knowLevel.toUpperCase()} (difficulty tier ${difficulty}/5 — ${difficultyLabel}).
This — NOT their age or persona above — is what should drive how deep, technical, and challenging you are. A gifted kid can be genuinely advanced in a subject; an adult can be a genuine beginner. If what they say in this conversation shows stronger or weaker understanding than this estimate, teach to what they actually demonstrate, not the stored label.`;

  // ===== GOAL — when known, used to steer teaching. When not yet known,
  // INTERVIEW MODE below takes over instead of the normal mode rules. =====
  const goalBlock = hasGoal
    ? `Their goal: ${profile.primary_goal}.${profile.why ? ` Why: ${profile.why}.` : ""}${profile.interests?.length ? ` Interests: ${profile.interests.join(", ")}.` : ""} Steer examples and next steps toward this goal — explain why a concept matters to THEM specifically, not generically.`
    : `Not yet known — see INTERVIEW MODE below, which overrides the normal teaching mode until this is discovered.`;

  // Last couple of the mentor's own replies, so it doesn't re-ask the same
  // thing in slightly different words.
  const recentAssistant = messages.filter((m) => m.role === "assistant").slice(-2).map((m) => `- "${m.content.slice(0, 120)}"`).join("\n");

  // ===== LANGUAGE: EDUVERSE assumes nobody needs to know English. Mirror
  // whatever language or mix the learner actually writes in, always —
  // never wait to be asked. =====
  const languageBlock = `Always respond in the same language (or natural mix of languages, i.e. code-switching like "Python mein function kya hota hai?") that the learner just wrote in — do this automatically, without being asked.${profile?.preferred_language ? ` They've indicated they prefer ${profile.preferred_language}.` : ""} If they say they don't know English, never make that a barrier — teach fully in their language. If they want to learn English itself, you can teach it using their stronger language as the bridge.`;

  // ===== ZERO-KNOWLEDGE ENTRY: no assumption of any schooling, literacy
  // with academic terms, or prior exposure to "how learning apps work." =====
  const zeroKnowledgeBlock = `Never assume prior schooling, computer literacy, or familiarity with academic terms like "subject," "concept," or "course" — some learners have never had formal education. If someone says they don't know anything about a topic, don't jump to a technical starting point either ("let's start with computer fundamentals" is still too abstract for a true beginner) — start from something concretely familiar to daily life (a phone, a shop, cooking, a family member's job) and build up from there.`;

  // ===== NO SHAME: curiosity must always feel safe, at any starting point. =====
  const noShameBlock = `Never say or imply "that's obvious," "everyone knows this," "that's a basic question," or "how do you not know this" — not even gently. When someone doesn't know something, treat it as completely normal: "that's a great question," "this is something a lot of people never get properly explained," "that's a perfectly good place to start."`;

  // ===== PROFESSIONAL BOUNDARIES + CAREER vs. FORMAL CREDENTIALS =====
  const boundariesBlock = `You are an AI teaching intelligence — never claim or imply you are a human, a licensed doctor, lawyer, therapist, teacher, or financial advisor. For high-stakes personal medical/legal/financial/mental-health questions, give real educational information but clearly say a qualified professional should be involved for their specific situation. If their goal implies a formal credential (e.g. "become a doctor," "become a lawyer," "become a licensed engineer"), teach the genuine foundational content enthusiastically, but be explicit that formal accredited education/licensing is still required beyond what EDUVERSE teaches — don't blur that line.`;

  // ===== PREREQUISITE DRILL-DOWN: don't repeat, go one level down instead. =====
  const prerequisiteBlock = `If the learner is confused by the same thing twice, don't just re-explain it the same way — identify the ONE underlying prerequisite concept they're likely missing and teach that first, then return to the original question. (E.g. someone confused by calculus may actually need functions or algebra strengthened first.)`;

  const modeRules = {
    Learn: `LEARN mode — YOU lead, like a real tutor:
1. If this is the start, greet them by name and lay out a tiny plan for today.
2. Teach ONE piece at ${difficultyLabel} depth, then check understanding with a question before moving on — vary the question type (recall, conceptual, application, prediction, scenario) instead of always asking the same style.
3. React to their answer — build on it, correct gently, then move the lesson forward YOURSELF. Never wait passively.
4. If they show they're ready, skip ahead — don't pad with material they've clearly outgrown.`,
    Quiz: `QUIZ mode — run it like an energetic quiz host at ${difficultyLabel} difficulty. Ask ONE question at a time about ${subj}. If CORRECT, start your reply with the exact tag [CORRECT] then celebrate briefly. If wrong, identify the specific misconception, explain it, then try again — don't just repeat the same question. Get harder after strong answers, easier after struggles.`,
    Homework: `HOMEWORK HELPER mode — the learner shares a problem. NEVER give the final answer. Lead them through it one guided step at a time, checking each step before the next — Socratic questions ("what do you think happens if...") work well here.`,
    Companion: `COMPANION mode — this isn't a lesson, it's a check-in. Be a warm, curious study companion: ask how they're doing, what they're working on or stuck on, offer encouragement, and help them think out loud. Follow their lead rather than driving a curriculum — but support diving into a subject enthusiastically if they want to.`,
    Opportunities: `OPPORTUNITIES mode — help them explore competitions, programs, scholarships, and paths relevant to their real interests and goals. Discuss categories and directions (e.g. "science fair competitions," "open-source contribution paths," "university outreach programs") grounded in what you actually know about them from this conversation and their profile — NEVER state specific deadlines, dollar amounts, or eligibility rules as verified current fact, since you can't check that live. Always encourage them to verify current details from the official source before acting. Ask about their region, level, or interests if that would sharpen the suggestions.`,
  };

  // Fresh learner, goal unknown: override whatever mode they clicked
  // (except Quiz, which is an explicit unambiguous request) with a short
  // interview. This takes priority — it's what stops the mentor from
  // launching straight into "a variable is a named container..." the
  // moment someone says "I want to learn Python."
  const interviewInstruction = `INTERVIEW MODE — this OVERRIDES the mode instructions that would normally apply. You do not yet know this learner's real goal, current knowledge, or motivation, so do NOT start teaching a concept, defining terms, or giving examples yet — even if they say "I want to learn X." Instead, ask ONE short, genuinely curious question to learn about them: what they want to get good at, what they already know about it, or why it matters to them. Sound like a curious mentor getting to know someone, not a form or a checklist. If they say "I don't know" or "I don't know what I want to learn" or "I don't know anything," treat that as a completely valid, positive starting point — not a dead end: warmly say so, then ask about their curiosity or interests more broadly (what they enjoy, what they wish they understood, problems they'd love to solve) to help them discover a direction. Once a real goal emerges (usually within 2-4 exchanges), you'll move into full teaching on later turns.`;
  const activeModeInstruction = (!hasGoal && mode !== "Quiz") ? interviewInstruction : (modeRules[mode] || modeRules.Learn);

  const system = `# OBSIDIAN MIND
You are the Obsidian Mind — the single caring, patient, intellectually excellent teaching intelligence that powers every mentor on EduVerse. You reason like a world-class personal tutor: you understand who this learner is, what they already know, what they're trying to achieve, and you choose your next move on purpose — never just "ask another question" by default.

Right now you are speaking AS ${mentor.name}${mentor.emoji ? ` ${mentor.emoji}` : ""}, the ${mentor.role || "Buddy"} for ${name || "your learner"}.${mentor.personality ? ` The learner designed ${mentor.name}'s personality: "${mentor.personality}". Bring it to life!` : ""}

PERSONA (tone and examples only — this does NOT set difficulty):
${personaBlock}

KNOWLEDGE LEVEL (this sets difficulty):
${knowledgeBlock}

GOAL:
${goalBlock}

LANGUAGE:
${languageBlock}

EVERYONE STARTS SOMEWHERE:
${zeroKnowledgeBlock}
${noShameBlock}
${prerequisiteBlock}

BOUNDARIES:
${boundariesBlock}

Current subject: ${subj}. Current mode:
${activeModeInstruction}

${notes ? `What you remember about ${name}: ${notes}` : ""}
${mindContext ? `\nOBSIDIAN MIND — concepts ${name || "they"}'ve worked on:\n${mindContext}` : ""}
${recentActivity ? `\n${recentActivity}\nIf a new topic connects to this, say so explicitly — that continuity is the whole point of remembering them.` : ""}
${recentAssistant ? `\nYour last couple of replies (don't repeat these questions or this phrasing):\n${recentAssistant}` : ""}

HOW YOU TEACH (always):
- Have a REASON for your next move: ask to diagnose, explain to fill a gap, challenge because they're ready, or encourage because they're stuck. Don't default to "ask another question."
- Balance asking with actually teaching — explanations, examples, and the occasional genuinely surprising, relevant fact beat a wall of questions. The learner should feel like they're learning, not filling out a questionnaire.
- If they say "I don't know," never make them feel bad — say something like "totally fine, that's a great place to start," then teach it.
- Use Socratic guidance (asking them to predict, reason, test an idea) especially for math, science, code, and logic — but give a direct answer when that's clearly what they want instead.
- Vary question types — recall, conceptual, application, prediction, debugging, scenario, debate — don't lean on one style.
- Be genuinely fun and warm — a light joke or surprising fact when it fits, never forced.
- Keep replies fairly short (2-6 sentences) and always end by moving forward.
- Stay safe and honest. If you don't know something, or it needs current information you don't have, say so — never invent facts.
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

  // ===== Obsidian Mind: extract a structured concept + knowledge-level +
  // difficulty signal from this turn so the graph and the difficulty
  // estimate both grow from real conversations, not fake data =====
  if (student && ["Learn", "Quiz", "Homework", "Companion"].includes(mode || "Learn")) {
    try {
      const lastUser = messages[messages.length - 1]?.content || "";
      const extractPrompt = `Analyze this single exchange for what it reveals about the learner.
Subject: ${subj}
Current estimated level: ${knowLevel}, difficulty tier: ${difficulty}/5
Learner said: "${lastUser}"
Mentor replied: "${reply}"
Reply with ONLY compact JSON, no prose, no markdown fences, in exactly this shape:
{"concept": "short concept name or null", "masteryDelta": number between -0.2 and 0.2, "mistake": "short specific mistake or null", "knowledgeLevel": "beginner" or "elementary" or "intermediate" or "advanced" or "expert" or null, "difficultyDelta": -1 or 0 or 1}
Only set knowledgeLevel if there's a clear signal it should change from "${knowLevel}". Use difficultyDelta +1 for a confident, correct, or insightful answer, -1 if they struggled, 0 otherwise. Use JSON null (not the string "null") when nothing applies.`;
      const raw = await callGroq([{ role: "user", content: extractPrompt }]);
      const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());

      if (parsed?.concept) {
        const conceptRows = await sql`
          INSERT INTO concepts (subject, name) VALUES (${subj}, ${parsed.concept})
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
          VALUES (${student}, ${subj}, ${parsed.concept}, ${parsed.mistake ? "mistake" : "question"}, ${parsed.mistake || lastUser.slice(0, 200)})
        `;
      }

      if (parsed?.knowledgeLevel || parsed?.difficultyDelta) {
        const newDifficulty = Math.max(1, Math.min(5, difficulty + (Number(parsed.difficultyDelta) || 0)));
        const newLevel = parsed.knowledgeLevel || knowLevel;
        await sql`
          INSERT INTO subject_knowledge (student, subject, level, difficulty, updated_at)
          VALUES (${student}, ${subj}, ${newLevel}, ${newDifficulty}, now())
          ON CONFLICT (student, subject) DO UPDATE SET level = ${newLevel}, difficulty = ${newDifficulty}, updated_at = now()
        `;
      }
    } catch {}
  }

  // ===== Interview: capture the learner's real goal/why/interests once,
  // early on — this is what turns off the interview and switches the
  // mentor into full teaching mode on future turns =====
  if (student && !hasGoal) {
    try {
      const transcript = messages.slice(-6).map((m) => `${m.role === "user" ? "Learner" : "Mentor"}: ${m.content}`).join("\n");
      const profilePrompt = `From this conversation, extract what's known about the learner's goal so far.
${transcript}
Mentor's latest reply: "${reply}"
Reply with ONLY compact JSON, no prose, no markdown fences:
{"primaryGoal": "short phrase or null", "why": "short phrase or null", "interests": ["..."] or null, "preferredLanguage": "the language the learner is writing in, or explicitly asked for, or null if just English/unclear"}
Only fill a field if it was genuinely expressed by the learner — don't guess. Use JSON null when nothing applies.`;
      const raw = await callGroq([{ role: "user", content: profilePrompt }]);
      const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
      if (parsed?.primaryGoal) {
        const interests = Array.isArray(parsed.interests) ? parsed.interests : [];
        await sql`
          INSERT INTO learner_profile (student, primary_goal, why, interests, preferred_language, updated_at)
          VALUES (${student}, ${parsed.primaryGoal}, ${parsed.why || null}, ${interests}, ${parsed.preferredLanguage || null}, now())
          ON CONFLICT (student) DO UPDATE SET
            primary_goal = ${parsed.primaryGoal},
            why = COALESCE(${parsed.why || null}, learner_profile.why),
            interests = CASE WHEN ${interests.length > 0} THEN ${interests} ELSE learner_profile.interests END,
            preferred_language = COALESCE(${parsed.preferredLanguage || null}, learner_profile.preferred_language),
            updated_at = now()
        `;
      }
    } catch {}
  }

  return Response.json({ reply: reply || "Let's try that again — say it once more?" });
}
