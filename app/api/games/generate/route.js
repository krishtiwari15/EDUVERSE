import { sql as authSql, getSessionUser } from "@/lib/auth";
import { DIFFICULTY_LABELS } from "@/lib/games";

async function callGroq(messages) {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.GROQ_API_KEY}` },
    body: JSON.stringify({ model: "llama-3.3-70b-versatile", temperature: 0.9, messages }),
  });
  const data = await res.json();
  return data?.choices?.[0]?.message?.content?.trim() || "";
}

function parseJson(raw) {
  return JSON.parse(raw.replace(/```json|```/g, "").trim());
}

const FALLBACKS = {
  "logic-detective": {
    setting: "A prize pie vanished from the school bake sale table minutes before judging.",
    suspects: [
      { name: "Mia", statement: "I was refilling lemonade the whole time, ask anyone at the drinks table." },
      { name: "Jon", statement: "I never left the ticket booth — I sold tickets nonstop." },
      { name: "Ravi", statement: "I was outside decorating balloons until the judging started." },
    ],
    clues: ["A trail of flour led toward the ticket booth.", "The drinks table ran out of lemonade cups an hour before the theft.", "Balloon string was found snagged on the dessert table."],
    solution: { culprit: "Jon", inconsistentClueIndex: 0, explanation: "The flour trail led to the ticket booth, contradicting Jon's claim he never left it." },
  },
  "science-lab": {
    topic: "Buoyancy",
    setup: "A ball made of solid iron and a ball of the same size made of wood are both dropped into a tank of water.",
    variable: "material density",
    question: "What happens to each ball?",
    options: ["Both float", "Both sink", "The wood floats, the iron sinks", "The iron floats, the wood sinks"],
    correctIndex: 2,
    explanation: "An object floats when it's less dense than water. Wood is less dense than water, so it floats; iron is denser, so it sinks — size alone doesn't decide it, density does.",
  },
  "finance-simulator": {
    scenario: "Your car needs an unexpected repair costing 3,000 credits.",
    choices: [
      { label: "Pay from your emergency fund", severity: "mild" },
      { label: "Put it on a high-interest loan", severity: "severe" },
      { label: "Delay the repair and risk it getting worse", severity: "moderate" },
    ],
    insight: "An emergency fund exists exactly for moments like this — it turns a crisis into a manageable expense.",
  },
  "research-hunt": {
    question: "Which energy source produces the lowest lifecycle greenhouse gas emissions per unit of electricity, based on major scientific assessments?",
    sources: [
      { label: "Peer-reviewed lifecycle assessment (IPCC-cited)", excerpt: "Nuclear and wind show the lowest median lifecycle emissions among major electricity sources.", reliability: "high", reason: "Cites a broad scientific consensus assessment, not a single study." },
      { label: "Anonymous blog post", excerpt: "Everyone knows solar is basically zero emissions, no need to check further.", reliability: "low", reason: "No source cited, dismissive of nuance, appeals to 'everyone knows'." },
      { label: "Energy company press release", excerpt: "Our new plant is the cleanest option available, full stop.", reliability: "medium", reason: "Self-interested source promoting its own product without independent verification." },
    ],
    correctIndex: 0,
    weakIndex: 1,
  },
};

export async function POST(req) {
  const db = authSql();
  const user = await getSessionUser(db);
  if (!user) return Response.json({ ok: false }, { status: 401 });

  const { gameId, difficulty = 2 } = await req.json();
  const diffLabel = DIFFICULTY_LABELS[difficulty] || "Medium";

  let language = "";
  try {
    const rows = await db`SELECT preferred_language FROM learner_profile WHERE student = ${String(user.id)}`;
    language = rows[0]?.preferred_language || "";
  } catch {}
  const langNote = language ? `Write it in ${language}.` : "";

  const prompts = {
    "logic-detective": `Create an original, family-friendly detective logic puzzle at ${diffLabel} difficulty. ${langNote}
Reply with ONLY compact JSON, no prose, no markdown fences, in exactly this shape:
{"setting": "1-2 sentence scenario", "suspects": [{"name": "...", "statement": "their alibi, 1 sentence"}] (3 suspects), "clues": ["...", "...", "..."] (3 clues, one of which contradicts exactly one suspect's statement), "solution": {"culprit": "name matching a suspect", "inconsistentClueIndex": 0-2, "explanation": "1 sentence, why the clue contradicts the culprit's alibi"}}
Make it genuinely solvable from the clues alone — fair play, no missing information.`,

    "science-lab": `Create an original "predict then discover" science scenario at ${diffLabel} difficulty (physics, chemistry, biology, or astronomy). ${langNote}
Reply with ONLY compact JSON, no prose, no markdown fences:
{"topic": "short topic name", "setup": "1-2 sentence scenario", "variable": "what's being changed/tested", "question": "what do you predict happens?", "options": ["...", "...", "...", "..."] (4 options, plausible-sounding), "correctIndex": 0-3, "explanation": "2-3 sentences, the real scientific reason, accurate and not oversimplified to the point of being wrong"}`,

    "finance-simulator": `Create an original personal-finance decision scenario at ${diffLabel} difficulty, for a financial-literacy game using ONLY virtual credits (never real money, never personalized advice). ${langNote}
Reply with ONLY compact JSON, no prose, no markdown fences:
{"scenario": "1-2 sentence situation involving a financial decision", "choices": [{"label": "a realistic option", "severity": "mild"|"moderate"|"severe"}] (3 choices with varying severity of financial consequence), "insight": "1-2 sentences, the general financial-literacy principle this illustrates"}`,

    "research-hunt": `Create an original research-evaluation exercise at ${diffLabel} difficulty: a research question plus 3 short source excerpts of clearly different reliability (one strong, one weak/misleading, one middling). ${langNote} Do not use real living people's names or real specific unverifiable statistics — keep it illustrative.
Reply with ONLY compact JSON, no prose, no markdown fences:
{"question": "a real-sounding research question", "sources": [{"label": "type of source, e.g. 'Peer-reviewed study'", "excerpt": "1-2 sentence excerpt", "reliability": "high"|"medium"|"low", "reason": "1 sentence why"}] (exactly 3, one of each reliability), "correctIndex": index of the "high" one, "weakIndex": index of the "low" one}`,
  };

  const prompt = prompts[gameId];
  if (!prompt) return Response.json({ ok: false, error: "This game doesn't use AI generation." }, { status: 400 });

  try {
    const raw = await callGroq([{ role: "user", content: prompt }]);
    const parsed = parseJson(raw);
    return Response.json({ ok: true, data: parsed });
  } catch {
    return Response.json({ ok: true, data: FALLBACKS[gameId], fallback: true });
  }
}
