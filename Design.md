# DESIGN.md — EduVerse Design System v2 ("Cinematic Void")

## 1. Product Vision

EduVerse is a personal AI learning universe. As of this revision, its visual identity is a restrained, premium "cinematic void": black stage, silver/white Manrope type, white pill CTAs — the same language as the landing page's full-bleed video hero, carried through the entire product instead of stopping at the front door.

Product areas (existing today marked ✅, roadmap marked 🔜):
- ✅ Landing page — the cinematic, full-bleed-video marketing moment shown before login/signup.
- ✅ Onboarding (login/signup, subject preferences) — same cinematic video backdrop, darkened for legibility.
- ✅ AI Tutor — teaches concepts, drives lessons, runs quizzes
- ✅ Mentor Studio (lightweight) — name + personality, with a live monogram preview
- ✅ Student Dashboard — the daily entry point
- ✅ Progress (stars, badges)
- ✅ AI Mentor companion — persistent, voice-first companion (talk/type, interruptible conversation, Focus Sessions with an optional privacy-first camera presence signal)
- ✅ Obsidian Mind knowledge graph ("My Mind") — concepts, mastery, and mistakes built from real conversations
- ✅ Privacy & mentor settings — camera/mic/voice-history/learning-memory/personalization toggles, plus "delete my AI memory"
- 🔜 Parent Copilot, Teacher Copilot
- 🔜 Opportunities (internships, competitions, scholarships)
- 🔜 Formal Progress & Analytics

Roadmap items appear in the product as clearly labeled "coming soon" moments, never as fabricated data pretending to be real.

## 2. Design Principles

1. **Student first** — every screen answers "how does this help me learn, right now?"
2. **Restraint over decoration** — no color accents, no glow, no glassmorphism. Hierarchy comes from white/gray weight and opacity, motion, and type scale — not hue.
3. **Calm over clutter** — generous whitespace, progressive disclosure, one clear focal point per screen.
4. **Progress feels visible** — stars, streaks, mastery are always legible, shown through white intensity rather than a color-coded system.
5. **Trustworthy AI** — the product explains itself; nothing about how the AI mentor works is a black box.
6. **One product, one language** — the cinematic void identity applies everywhere, from the marketing hero to the deepest settings screen.

## 3. Typography

One family, one job: **Manrope** (`--font-body`, variable weight 200–800). Weight and size carry all hierarchy — there is no second display or "personality" typeface.

Scale (`app/globals.css`): `.text-hero` (clamp 40–80px, headline moments), `.text-display` (28–44px, section headers), `.text-heading` (20–24px, card/subsection titles), `.text-eyebrow` (11px, uppercase, tracked-out labels, `--faint` color), body text via Tailwind's default scale.

## 4. Color

| Token | Value | Role |
|---|---|---|
| `--ink` | `#fafafa` | Primary text |
| `--muted` | `#a7a6a6` | Secondary text |
| `--faint` | `#8b8a8a` | Tertiary / eyebrow / disabled text |
| `--void` | `#050505` | Page background |
| `--pill` / `--pill-ink` | `#ffffff` / `#050505` | Primary button fill / text |

**No decorative color accents anywhere.** Achievement, progress, and correctness all read through white opacity/weight (a filled white star vs. a dim locked slot; a white progress fill vs. a 10%-white track), never through hue. The only exceptions are universal, non-brand status colors kept for their established meaning: red for "camera/mic is live" and for destructive actions ("delete my memory") — the same convention virtually every OS and app uses regardless of brand palette.

## 5. Surfaces & Elevation

Flat, hairline-bordered cards — no blur, no backdrop-filter:
- `--surface-1` (3.5% white) — background texture, disabled states
- `--surface-2` / `.glass-card` (5% white, 12% white border) — default cards
- `--surface-3` / `.glass-card-elevated` (8% white, 22% white border) — the one thing on screen that should draw the eye (a modal, a featured recommendation, a live preview)

(Class names are kept from v1 for continuity with the `Surface` component's tier map — they're flat now, not glass.)

Radius scale: `--radius-sm` (12px, chips/inputs) · `--radius-md` (20px, small cards) · `--radius-lg` (28px, primary cards) · `--radius-pill` (badges, tags, buttons).

## 6. Avatars

Every mentor — built-in or custom — is represented by a flat monogram tile (`components/mentor/AIAvatar.jsx`): the mentor's first initial, Manrope bold, on a `rgba(255,255,255,.06)` tile with a hairline border. No illustrated characters, no per-mentor color, no emoji badges. The same component drives every avatar in the app (picker cards, Mentor Studio preview, dashboard hero, chat room, AI Mentor companion, focus sessions) and layers on state — idle/listening/thinking/speaking/happy/confused/encouraging/celebrating — via monochrome rings, a subtle orbit, and scale, never a change in character or color.

## 7. Motion

Signature easing `--ease-premium: cubic-bezier(0.16, 1, 0.3, 1)` — a soft, confident deceleration, used everywhere instead of a different curve per component. Durations: 150ms (micro-interactions) / 250ms (standard) / 450ms (entrances).

Scroll/entrance reveals: small fade + 8–16px translate, implemented with `motion` (Framer Motion)'s `whileInView` (`Reveal`/`RevealGroup`). Celebration is restrained: a single white toast pill sliding up for "correct!" moments, a plain modal for badge unlocks — no confetti particles.

All motion respects `prefers-reduced-motion` (enforced globally in `globals.css`).

## 8. Iconography

`lucide-react` for all functional UI chrome and, as of v2, for everything — emoji is no longer used anywhere in the product, including celebration and achievement moments, matching the restrained cinematic identity.

## 9. Accessibility (non-negotiable, not a phase)

44×44px minimum touch targets, visible `:focus-visible` rings (`.focus-ring` utility) on every interactive element, `aria-label`s on icon-only controls, `role="alert"` on form errors, 4.5:1 minimum text contrast, full `prefers-reduced-motion` support.
