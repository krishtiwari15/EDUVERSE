# EDUVERSE — Design System

> **North Star:** *"It should feel like stepping into a living, breathing galaxy where learning is an adventure — every screen alive, every tap delightful, every moment beautiful."*

EduVerse is a **motion-first** AI learning universe. Motion and beauty are not decoration here — they ARE the product. Where a normal app asks "do we need this animation?", EduVerse asks "how do we make this moment magical?"

The feeling we're always chasing:

**Alive. Dreamy. Playful. Magical. Premium. Warm.**

Never:

**Static. Flat. Corporate. Boring. Cold.**

---

## 1. The Vibe

EduVerse lives in a **moonlit galaxy**. Deep violet-black space, a glowing moon, drifting stars, shooting stars, floating sparkles. A friendly animated buddy is your guide. Everything floats, glows, breathes, and reacts.

Think: the wonder of a planetarium + the delight of a Pixar short + the warmth of a favorite teacher.

---

## 2. Color System

The palette is a **dreamy galaxy** — deep space backgrounds with luminous accents.

### Background (the galaxy)
The signature radial gradient, used on every main screen:
```
radial-gradient(ellipse at 70% 15%, #3B2E63 0%, #241B47 30%, #150F2E 60%, #0A0718 100%)
```
- Deep violet → indigo → near-black. Feels infinite and calm.

### Accent colors (the buddies & glow)
| Purpose | Color | Use |
|---|---|---|
| Violet (primary) | `#A78BFA` | Luna, primary glow, main actions |
| Green | `#34D399` | Ellie, success, "correct" |
| Blue | `#60A5FA` | Pip, calm highlights |
| Pink | `#F472B6` | playful accents, "My Buddy" |
| Gold | `#FBBF24` | stars, the moon, rewards |

Each buddy has an **accent** (vivid) + **soft** (pale) pair. Soft colors back the buddy avatars; accents drive glows, buttons, and rings.

### Surfaces
- **Glassmorphism everywhere:** `bg-white/10` + `backdrop-blur-xl` + `ring-1 ring-white/20`.
- Cards are frosted glass floating in space — never solid flat boxes.
- Text on space: white for headings, `violet-200` for secondary, `white/60` for hints.

### Rule
Color should **glow and guide**. Accents point the eye to what's alive and tappable. The background stays dark so the glow pops.

---

## 3. Typography

Two rounded, friendly fonts (via `next/font/google`):

- **Fredoka** — headings, buddy names, big moments. Rounded, warm, characterful. (`--font-fredoka`)
- **Quicksand** — body, labels, chat. Clean and soft. (`--font-quicksand`)

Rules:
- Headings are **bold and generous** — this is a playful app, be confident.
- Never small-and-cramped. Text breathes.
- White headings with a subtle `drop-shadow` so they lift off the dark galaxy.

---

## 4. Motion Principles (the heart of EduVerse)

Motion is the soul of this app. Five rules:

### 4.1 Everything Breathes
Nothing is perfectly still. Cards **float** gently (`floatCard`, ~4s ease-in-out). The buddy bobs. Sparkles drift. A static element feels dead here.

### 4.2 Everything Arrives
Elements never just appear — they **enter**. Cascade in from above (`dropIn`), pop with a bounce (`bounceIn`, spring easing `cubic-bezier(0.34,1.56,0.64,1)`), or scale up (`popIn`). Staggered delays (~0.08s apart) make groups feel choreographed.

### 4.3 Everything Reacts
Tap → `active:scale-95`. Correct answer → party poppers + glow. Buddy speaking → aura pulses, rings ripple, stars rise. The app responds to *everything* so it feels alive and aware.

### 4.4 Celebrate Loudly
Big moments deserve big motion: **party-popper bursts** from the corners, **badge-unlock** pop-ups with spring scale, confetti. Learning should *feel* rewarding.

### 4.5 Enter AND Exit
Transitions go both ways. The welcome screen cascades in, then **flies up and away** on exit. Screens should feel like you're traveling between them, not snapping.

### Timing
- Micro-interactions (taps): 150–250ms
- Entrances: 400–900ms with spring easing
- Ambient loops (float, twinkle, glow): 3–8s, infinite, ease-in-out
- Celebrations: ~1–2s

### The one guardrail
Motion serves *delight and clarity*, never chaos. If two things fight for attention, calm one down. Alive ≠ noisy.

---

## 5. Signature Animations (the toolkit)

These are EduVerse's house animations — reuse them everywhere:

| Name | What it does | Where |
|---|---|---|
| `floatCard` | gentle up-down bob | cards, buddy, planets |
| `bounceIn` | spring scale-in | cards appearing, badges |
| `popIn` | scale + fade up | messages, screens |
| `dropIn` / cascade | slides down from sky | welcome elements |
| `flyUp` | lifts up & fades | welcome exit |
| `twinkle` | stars fade in/out | background |
| `shoot` | shooting star streak | background |
| `moonGlow` | moon halo pulses | background moon |
| `ring` | sound-wave rings ripple out | buddy while speaking |
| `riseUp` | stars float up | buddy while speaking |
| `popperBurst` | confetti bursts from corners | correct answers |
| `badgePop` | spring scale + rotate | badge unlock |
| `wBtnPulse` | soft pulsing halo | primary CTAs |

---

## 6. The Buddy (star of the show)

The animated Lottie character is the emotional core. It must always feel **present and alive**:

- **Idle:** floats gently, calm glow, slow animation.
- **Speaking:** faster animation, aura brightens, **sound-wave rings** ripple out, **stars rise** around it.
- **Big (200px+)** in the chat room — center stage, not a tiny corner icon.
- Sits in a **soft-colored glowing orb** (`radial-gradient` of its soft color + white highlight), ringed in `white/30`.
- A **speech bubble** shows its latest words with a little tail pointing at it — like it's really talking to you.

The buddy is a character, not a chatbot avatar. Give it life.

---

## 7. Components

### Cards
- Frosted glass: `bg-white/10 backdrop-blur-xl ring-1 ring-white/20`.
- Rounded generously: `rounded-[1.4rem]` to `rounded-[2rem]`.
- Float gently, bounce in on load, `active:scale-95` on tap.
- Hover (desktop): lift + brighten ring (`hover:-translate-y-2 hover:ring-white/50`).

### Buttons
- Primary: filled with an accent color, bold, `shadow-lg`, `active:scale-95`. CTAs get a `wBtnPulse` halo.
- Secondary: glassy `bg-white/15 ring-1 ring-white/30 text-white`.
- Always give tactile feedback + a tap sound.

### Planet tiles (home base)
- Big glowing orbs: `radial-gradient(circle at 38% 32%, #ffffff40, <color>)` with a colored `box-shadow` glow.
- Float on a loop, staggered. Tap to "fly into" a room.

### Pills (modes, subjects)
- Rounded-full. Selected = solid white text-on-accent; unselected = glassy.
- Subject bar scrolls sideways on mobile (no wrapping mess).

---

## 8. Sound (motion for the ears)

Motion isn't only visual. Subtle Web-Audio tones (no files) reinforce every action:
- **Tap** — soft triangle blip
- **Reply** — gentle two-note chime
- **Correct** — rising happy arpeggio
- **Badge** — sparkly three-note flourish

Sound + motion together = premium feel. Keep it gentle, never annoying. Respect the mute toggle.

---

## 9. Layout & Flow

The journey is a series of *places* you travel between:

```
Welcome (cascade in → fly up)
   ↓
Pick your buddy
   ↓
🏠 Home Base  (planet tiles: Learn · Quiz · Homework · My Buddy · Badges)
   ↓  (tap a planet → fly in)
Immersive Room  (big buddy center stage, speech bubble, chat)
```

- **Mobile-first.** 2-column grids, big tap targets (44px+), sideways-scroll subject bar, sizes that scale up on desktop.
- One clear focus per screen. The buddy or the current action is always the hero.
- Generous spacing — let the galaxy breathe around content.

---

## 10. Rewards & Progress

Learning should feel like an adventure with treasures:
- ⭐ **Stars** earned for correct answers (saved to the database, follow you everywhere).
- 🏅 **Badges** unlock at milestones (First Star → Galaxy Master), shown glowing vs locked.
- Every unlock is a **motion moment** — pop-up, spring, sound, confetti.
- Rewards tie to *real learning*, never meaningless taps. (Delightful, not manipulative.)

---

## 11. The AI Tutor Feel

The tutor should feel like a real teacher, not a chatbot:
- It **drives** the lesson — greets with a plan, teaches a step, checks understanding, moves forward itself.
- **Fun and energetic** — cracks light, age-appropriate jokes when things drag.
- **Adapts** to Kid / Teen / Adult (chosen at welcome) — playful for kids, deeper for adults.
- Short replies (2–5 sentences) that always move things forward.

Personality + motion + voice = it feels *alive*, which is the whole point.

---

## 12. Do / Don't

**Do**
- Make everything breathe, arrive, and react.
- Lead the eye with glow and motion.
- Celebrate learning loudly.
- Keep the buddy alive and central.
- Test every screen on a real phone.

**Don't**
- Ship a static, flat, or snappy-cut screen.
- Let motion become chaotic or fight for attention.
- Shrink the buddy into an afterthought.
- Use flat solid boxes instead of glass.
- Add motion with no meaning (motion should delight or clarify).

---

## 13. North Star (again, because it matters)

Every design decision answers one question:

> **"Does this make EduVerse feel more alive, more magical, and more delightful to learn in?"**

If yes — ship it. If it makes things flatter, colder, or more boring — it's not EduVerse.

*Build the galaxy. Make it breathe. 🌌*