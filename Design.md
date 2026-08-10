# DESIGN.md — EduVerse Design System

## 1. Product Vision

EduVerse is a personal AI learning universe, not a school management system. It should feel like the warmth of a great teacher combined with the intelligence of an AI companion — and, as of this revision, it should also *look* like a serious, next-generation product: premium, futuristic, human, calm, and memorable, not a collection of default cards.

Product areas (existing today marked ✅, roadmap marked 🔜):
- ✅ AI Tutor — teaches concepts, drives lessons, runs quizzes
- ✅ Mentor Studio (lightweight) — build a custom mentor with a live preview
- ✅ Student Dashboard — the daily entry point
- ✅ Progress (stars, badges)
- 🔜 AI Mentor as a distinct, persistent companion (journey-level guidance, separate from concept-teaching)
- 🔜 Parent Copilot, Teacher Copilot
- 🔜 Opportunities (internships, competitions, scholarships)
- 🔜 Formal Progress & Analytics

Roadmap items appear in the product as clearly labeled "coming soon" moments, never as fabricated data pretending to be real.

## 2. Design Principles

1. **Student first** — every screen answers "how does this help me learn, right now?"
2. **Friendly intelligence** — warm and conversational, never cold or corporate; never robotic either.
3. **Calm over clutter** — generous whitespace, progressive disclosure, one clear focal point per screen.
4. **Progress feels visible** — XP, streaks, mastery are always legible, never buried in a table.
5. **Trustworthy AI** — the product explains itself; nothing about how the AI mentor works is a black box.
6. **One product, not a theme park** — the galaxy motif is an accent applied with restraint, not the entire UI.

## 3. Typography

Two families, two jobs:

- **Space Grotesk** (`--font-display`) — the product's voice. Headlines, section titles, stats. Confident, geometric, technical without being cold.
- **Inter** (`--font-body`) — body copy, UI chrome, forms. Optimized for legibility at small sizes.
- **Fredoka** (`--font-companion`) — the *mentors'* voice only: mentor names, badge callouts, celebration moments. Used sparingly — it's personality, not UI.

Scale (`app/globals.css`): `.text-hero` (clamp 40–80px, headline moments), `.text-display` (28–44px, section headers), `.text-heading` (20–24px, card/subsection titles), `.text-eyebrow` (11px, uppercase, tracked-out labels above headings), body text via Tailwind's default scale on Inter.

## 4. Color

Two accents with distinct jobs instead of one color doing everything:

| Token | Value | Role |
|---|---|---|
| `--color-primary` | `#A78BFA` (violet) | Brand, primary actions, navigation |
| `--color-aurora` | `#5EEAD4` (cyan) | AI/intelligence moments, progress, "your mentor noticed…" |
| `--color-gold` | `#FBBF24` | Achievement and reward only — stars, badges, streaks |
| `--color-void` → `--color-nebula-3` | `#0A0718` → `#3B2E63` | Background gradient layers |
| `--color-ink` / `--color-ink-muted` / `--color-ink-faint` | — | Text hierarchy on dark surfaces |

Never introduce a fourth accent without a specific job for it.

## 5. Surfaces & Elevation

Three glass tiers, not one flat translucency everywhere:
- `--surface-1` (6% white) — background texture, disabled states
- `--surface-2` / `.glass-card` (10% white) — default cards
- `--surface-3` / `.glass-card-elevated` (15% white + shadow) — the one thing on screen that should draw the eye (a modal, a featured recommendation, the mentor preview)

Radius scale: `--radius-sm` (12px, chips/inputs) · `--radius-md` (20px, small cards) · `--radius-lg` (28px, primary cards) · `--radius-pill` (badges, tags).

## 6. Motion

Signature easing `--ease-premium: cubic-bezier(0.16, 1, 0.3, 1)` — a soft, confident deceleration, used everywhere instead of a different curve per component. Durations: 150ms (micro-interactions) / 250ms (standard) / 450ms (entrances).

Scroll/entrance reveals: small fade + 8–16px translate, never a bounce, never SEO-hiding content. Implemented with `motion` (Framer Motion)'s `whileInView`. Celebratory moments (confetti, badge pop) keep their existing playful spring easing — that's an intentional exception for reward moments, not the default.

All motion respects `prefers-reduced-motion` (enforced globally in `globals.css`).

## 7. Iconography

`lucide-react` for all functional UI chrome (navigation, buttons, states) — minimal, consistent stroke weight. Emoji is reserved exclusively for mentor personality and celebration (mentor faces, badges, confetti) — never used as a stand-in for a functional icon like "home" or "back."

## 8. Accessibility (non-negotiable, not a phase)

44×44px minimum touch targets, visible `:focus-visible` rings (`.focus-ring` utility) on every interactive element, `aria-label`s on icon-only controls, `role="alert"` on form errors, 4.5:1 minimum text contrast, full `prefers-reduced-motion` support.
