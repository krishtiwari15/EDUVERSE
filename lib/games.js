// The Knowledge Games registry — one source of truth for the hub, the
// progress API, and each game's Obsidian Mind subject mapping. Adding a
// future game (section 31 of the brief) means adding one entry here plus
// a component; nothing else needs to change.
export const GAMES = [
  { id: "sudoku", title: "Sudoku", category: "Brain", icon: "Grid3x3", subject: "Logic", tagline: "Classic number logic, sharpened.", ai: false },
  { id: "math-duel", title: "Math Duel", category: "Math", icon: "Calculator", subject: "Math", tagline: "Fast-paced mental math.", ai: false },
  { id: "logic-detective", title: "Logic Detective", category: "Brain", icon: "Search", subject: "Logic", tagline: "Solve the mystery from the clues.", ai: true },
  { id: "memory-matrix", title: "Memory Matrix", category: "Brain", icon: "Grid2x2", subject: "Memory", tagline: "Remember the pattern before it fades.", ai: false },
  { id: "word-quest", title: "Word Quest", category: "Language", icon: "BookOpen", subject: "Language", tagline: "Build your vocabulary.", ai: false },
  { id: "geography-explorer", title: "Geography Explorer", category: "World", icon: "Globe2", subject: "Geography", tagline: "Explore the world, one clue at a time.", ai: false },
  { id: "science-lab", title: "Science Lab", category: "Science", icon: "FlaskConical", subject: "Science", tagline: "Predict, then discover why.", ai: true },
  { id: "code-runner", title: "Code Runner", category: "Technology", icon: "Code2", subject: "Coding", tagline: "Read code like a real engineer.", ai: false },
  { id: "finance-simulator", title: "Finance Simulator", category: "Life Skills", icon: "Wallet", subject: "Finance", tagline: "Practice real money decisions, risk-free.", ai: true },
  { id: "research-hunt", title: "Research Hunt", category: "Research", icon: "SearchCheck", subject: "Research", tagline: "Which source can you trust?", ai: true },
];

export const CATEGORIES = [...new Set(GAMES.map((g) => g.category))];

export function findGame(id) {
  return GAMES.find((g) => g.id === id) || null;
}

export const DIFFICULTY_LABELS = { 1: "Easy", 2: "Medium", 3: "Hard", 4: "Expert" };

export const ACHIEVEMENTS = {
  first_challenge: { label: "First Logic Challenge", emoji: "🧠" },
  streak_7day: { label: "7 Day Learning Streak", emoji: "🔥" },
  math_explorer: { label: "Math Explorer", emoji: "🔢" },
  world_explorer: { label: "World Explorer", emoji: "🌍" },
  code_thinker: { label: "Code Thinker", emoji: "💻" },
  science_explorer: { label: "Science Explorer", emoji: "🔬" },
  word_builder: { label: "Word Builder", emoji: "📚" },
  researcher: { label: "Researcher", emoji: "🔎" },
  problem_solver: { label: "Problem Solver", emoji: "🎯" },
  knowledge_master: { label: "Knowledge Master", emoji: "🏆" },
};
