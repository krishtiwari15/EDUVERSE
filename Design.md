# DESIGN.md — AI Learning Platform Design System

## 1. Product Vision

Design a learning platform that feels like a **personal AI learning universe**, not a traditional school management system.

The experience should make students feel:

* Curious
* Motivated
* Safe
* Supported
* Independent
* Excited to learn

The platform should combine the warmth of a great teacher with the intelligence of an AI assistant.

Primary product areas:

* AI Tutor
* AI Mentor
* Mentor Studio
* Parent Copilot
* Teacher Copilot
* Student Dashboard
* Learning Paths
* Assignments
* Quizzes
* Progress & Analytics
* Opportunities
* AI-powered study tools

---

# 2. Design Principles

## 2.1 Student First

Every screen should answer:

> "How does this help the student learn?"

Avoid unnecessary dashboards, statistics, buttons, or complicated navigation.

## 2.2 Friendly Intelligence

The interface should feel intelligent without feeling robotic.

Use:

* Friendly language
* Helpful microcopy
* Conversational AI interfaces
* Small moments of encouragement
* Clear explanations

Avoid:

* Corporate jargon
* Overly technical language
* Cold enterprise UI

## 2.3 Calm Over Clutter

Students should never feel overwhelmed.

Use:

* Generous whitespace
* Clear hierarchy
* Progressive disclosure
* Short sections
* Visual grouping

Do not place too many cards or statistics on one screen.

## 2.4 Learning Should Feel Like Progress

Use visual progress indicators such as:

* XP
* Levels
* Learning streaks
* Skill progress
* Completed lessons
* Mastery percentages
* Learning journeys

Gamification should motivate learning rather than distract from it.

## 2.5 Trustworthy AI

AI should feel helpful and transparent.

When appropriate, communicate:

* Why the AI is making a recommendation
* Where information comes from
* Confidence or uncertainty
* When a teacher or parent should be involved

Never make the AI appear omniscient.

---

# 3. Visual Identity

## Overall Style

Use a:

**Modern + Educational + Futuristic + Playful + Premium**

visual language.

The interface should feel closer to a modern consumer technology product than an old-school education portal.

Use subtle futuristic elements without making the product look like a science-fiction game.

---

# 4. Color System

Use a restrained color palette.

## Primary

Primary brand color:

`#6366F1`

Use for:

* Primary buttons
* Active navigation
* Important links
* Selected states
* AI interactions

## Secondary

Secondary accent:

`#8B5CF6`

Use for:

* AI Mentor
* Special learning features
* Highlights
* Secondary actions

## Success

`#22C55E`

Use for:

* Completed lessons
* Correct answers
* Achievements
* Positive progress

## Warning

`#F59E0B`

Use for:

* Attention states
* Pending tasks
* Important reminders

## Error

`#EF4444`

Use for:

* Errors
* Failed actions
* Incorrect answers
* Critical warnings

## Background

Light mode:

`#F8FAFC`

Dark mode:

`#0F172A`

## Surface

Light:

`#FFFFFF`

Dark:

`#1E293B`

## Text

Primary:

`#0F172A`

Secondary:

`#64748B`

Muted:

`#94A3B8`

In dark mode, use appropriate light equivalents.

Do not use excessive colors.

Color should communicate meaning, not decoration.

---

# 5. Typography

Use **Inter** as the primary font.

Fallback:

`system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`

## Headings

Use bold or semibold typography.

H1:

* Large
* Bold
* Clear
* Strong visual hierarchy

H2:

* Semibold
* Clear section separation

H3:

* Medium/Semibold

## Body

Body text should be:

* Easy to read
* Comfortable line height
* Short paragraphs
* Appropriate contrast

Avoid extremely small text.

Minimum recommended body size:

`14px`

Preferred:

`15–16px`

---

# 6. Spacing

Use a consistent spacing scale based on multiples of 4.

Recommended:

* 4px
* 8px
* 12px
* 16px
* 20px
* 24px
* 32px
* 40px
* 48px
* 64px

Do not create random spacing values unless necessary.

---

# 7. Border Radius

Use modern rounded components.

Small:

`8px`

Medium:

`12px`

Large:

`16px`

Cards:

`16px`

Large feature cards:

`20px`

Avoid excessive pill-shaped UI.

Use pills primarily for:

* Tags
* Status indicators
* Categories
* Filters

---

# 8. Shadows

Use subtle shadows.

Cards should generally use:

* Very light shadow
* Subtle border
* Clear separation from background

Avoid heavy drop shadows.

The UI should feel lightweight.

---

# 9. Layout

Use a responsive layout.

Desktop:

* Persistent sidebar
* Main content area
* Optional right-side contextual panel

Tablet:

* Collapsible sidebar

Mobile:

* Bottom navigation or compact navigation
* Full-width content
* Stacked cards
* Touch-friendly controls

Minimum touch target:

`44px`

---

# 10. Navigation

Primary student navigation:

* Home
* AI Tutor
* AI Mentor
* Learn
* Practice
* Progress
* Opportunities

Secondary:

* Profile
* Settings
* Help

Navigation should remain predictable.

Do not hide important learning features behind multiple levels of menus.

---

# 11. AI Tutor

The AI Tutor should feel like a personal teacher.

The interface should prioritize conversation and learning.

Recommended layout:

```text
┌──────────────────────────────────────┐
│ AI Tutor                             │
│                                      │
│  👋 Hi! What are we learning today? │
│                                      │
│  ┌──────────────────────────────┐    │
│  │ Explain photosynthesis       │    │
│  └──────────────────────────────┘    │
│                                      │
│  Suggested questions                │
│                                      │
│  [Explain simply] [Give example]    │
│                                      │
│  ┌──────────────────────────────┐    │
│  │ Ask your question...     🎤  │    │
│  └──────────────────────────────┘    │
└──────────────────────────────────────┘
```

The tutor should support:

* Text
* Voice
* Images
* Follow-up questions
* Step-by-step explanations
* Examples
* Quizzes
* Hints
* Socratic questioning

Never overwhelm students with long AI responses.

Prefer:

1. Explanation
2. Example
3. Check understanding
4. Next step

---

# 12. AI Mentor

The AI Mentor should feel more personal than the AI Tutor.

The Mentor helps students with:

* Goals
* Career exploration
* Motivation
* Study planning
* Habits
* Projects
* Opportunities
* Personal growth

The mentor should have a distinct visual identity.

Use:

* Avatar
* Friendly greeting
* Progress context
* Personalized recommendations

Example:

> "You've been consistent with Python this week. Want to build a small project to apply what you've learned?"

Avoid making the mentor feel like a generic chatbot.

---

# 13. Mentor Studio

Mentor Studio is the workspace for creating and managing AI mentors.

Design it like a professional creation studio.

Sections:

* Mentor Identity
* Personality
* Knowledge
* Teaching Style
* Goals
* Rules
* Conversation Examples
* Preview
* Analytics

Use a split-screen interface where appropriate:

```text
┌──────────────┬───────────────────────┐
│ Configuration│                       │
│              │   Mentor Preview      │
│ Personality  │                       │
│ Knowledge    │   AI conversation      │
│ Goals        │                       │
│ Rules        │                       │
│              │                       │
└──────────────┴───────────────────────┘
```

Mentor creation should feel simple enough for a teacher.

---

# 14. Parent Copilot

Parent Copilot should prioritize clarity and trust.

Parents should be able to understand:

* Learning progress
* Strengths
* Areas needing attention
* Attendance/activity
* Learning habits
* Upcoming assignments
* AI recommendations

Avoid overwhelming parents with raw technical analytics.

Instead of:

> "Student completed 87.43% of adaptive learning objectives."

Prefer:

> "Your child is making strong progress in Mathematics."

Use clear summaries with optional detailed views.

---

# 15. Teacher Copilot

Teacher Copilot should prioritize productivity.

Features may include:

* Lesson planning
* Assignment generation
* Quiz creation
* Student insights
* Classroom analytics
* Personalized learning recommendations
* Feedback generation
* Difficulty adjustment

Use dense information only when useful.

Teachers should be able to quickly:

* Create
* Review
* Assign
* Analyze
* Give feedback

---

# 16. Student Dashboard

The dashboard should not feel like an analytics spreadsheet.

Top section:

> Good morning, [Name] 👋

Then show:

### Continue Learning

The student's current learning activity.

### Today's Goals

Keep goals limited.

Example:

* Complete Mathematics lesson
* Practice 10 Python questions
* Read one chapter

### Progress

Show:

* Current streak
* XP
* Skills
* Course progress

### AI Recommendations

Personalized recommendations generated by the AI Tutor/Mentor.

### Opportunities

Show relevant:

* Internships
* Competitions
* Scholarships
* Fellowships
* Projects

---

# 17. Planet / Space Learning Theme

The platform may use a subtle **space exploration theme** to make learning feel like discovery.

Possible concepts:

* Subjects = Planets
* Chapters = Moons
* Skills = Stars
* Completed lessons = Explored regions
* Learning paths = Missions
* Achievements = Badges
* AI Mentor = Guide

Example:

```text
        ✦ Mathematics
             🪐
       Explore Algebra

   ───────────────────

      Your Mission
      ███████░░░ 70%

        [Continue]
```

Keep the space theme subtle.

Do not turn every screen into a cartoon.

The core UI should remain professional.

---

# 18. Cards

Cards should communicate one clear idea.

Good:

* Progress Card
* Continue Learning Card
* AI Recommendation Card
* Assignment Card
* Opportunity Card

Avoid:

* Nested cards
* Excessive borders
* Too many cards on one screen

Each card should have:

* Clear title
* Short supporting information
* Relevant action

---

# 19. Buttons

Primary button:

Use the primary brand color.

Examples:

* Start Learning
* Continue
* Ask AI
* Create Mentor
* Generate Quiz

Secondary button:

Use subtle background or outline.

Tertiary:

Use text-only actions when appropriate.

Buttons should clearly communicate what will happen.

Avoid vague buttons such as:

* Click Here
* Submit
* Proceed

Prefer:

* Start Quiz
* Generate Lesson
* View Progress

---

# 20. Forms

Forms should be simple.

Use:

* Clear labels
* Helpful placeholders
* Inline validation
* Error messages
* Logical grouping

Never rely only on placeholder text as the field label.

---

# 21. AI Loading States

Never show a generic frozen screen while AI is processing.

Use contextual messages such as:

* "Thinking..."
* "Building your quiz..."
* "Finding examples..."
* "Preparing your learning plan..."
* "Analyzing your progress..."

Use subtle animation.

Do not make loading animations distracting.

---

# 22. Empty States

Empty states should guide users.

Bad:

> No data.

Good:

> You haven't started a learning path yet.

> Start your first lesson and your progress will appear here.

Include an appropriate action.

---

# 23. Error States

Errors should be friendly and actionable.

Bad:

> Error 500.

Better:

> Something went wrong while generating your lesson.

> Try again.

Never blame the user.

---

# 24. Accessibility

The application must prioritize accessibility.

Requirements:

* High color contrast
* Keyboard navigation
* Screen-reader-friendly labels
* Visible focus states
* Alt text for meaningful images
* Captions for educational videos
* Large enough touch targets
* Do not communicate information through color alone

AI-generated educational content should also be readable and understandable.

---

# 25. Responsive Design

Design mobile-first.

The application must work well on:

* Mobile phones
* Tablets
* Laptops
* Desktop monitors

Do not simply shrink desktop layouts.

Reorganize content appropriately for smaller screens.

---

# 26. Animations

Use animations sparingly.

Good uses:

* Page transitions
* AI response appearance
* Progress updates
* Achievement celebrations
* Hover states
* Loading states

Avoid:

* Constant floating animations
* Excessive particle effects
* Long transitions
* Distracting backgrounds

Animation duration should generally be:

`150–300ms`

---

# 27. AI Conversation Design

AI responses should be:

* Clear
* Conversational
* Structured
* Age-appropriate
* Context-aware

Prefer:

```text
Explanation

Example

Try it yourself

Need a hint?
```

over large walls of text.

The AI should encourage students to think rather than immediately giving answers when educationally appropriate.

---

# 28. Gamification

Use gamification carefully.

Possible elements:

* XP
* Streaks
* Levels
* Badges
* Missions
* Skill trees
* Learning milestones

Do not reward meaningless clicking.

Rewards should be connected to genuine learning behavior.

---

# 29. Notifications

Notifications should be:

* Useful
* Timely
* Relevant
* Non-intrusive

Examples:

> Your Mathematics assignment is due tomorrow.

> You've completed your weekly learning goal 🎉

Avoid excessive notification badges.

---

# 30. Data Visualization

Use simple visualizations.

Recommended:

* Progress bars
* Line charts
* Bar charts
* Skill maps
* Completion rings

Avoid complicated charts unless they provide meaningful insight.

Teachers may receive more detailed analytics than students.

Parents should receive simplified summaries.

---

# 31. Content Hierarchy

Every screen should have one primary goal.

Use:

1. Page title
2. Main action
3. Important information
4. Supporting information
5. Secondary actions

Do not give every element equal visual importance.

---

# 32. Dark Mode

Dark mode should be fully supported.

Do not simply invert colors.

Use dark surfaces and maintain appropriate contrast.

Avoid pure black backgrounds when possible.

Recommended base:

`#0F172A`

---

# 33. Design Don'ts

Never:

* Use excessive gradients
* Overload dashboards
* Use tiny text
* Create confusing navigation
* Use too many colors
* Use giant paragraphs
* Add unnecessary animations
* Make AI responses feel robotic
* Hide important actions
* Use inconsistent spacing
* Create components with different visual styles for the same purpose
* Sacrifice usability for visual effects

---

# 34. Design Consistency

All new features must reuse existing:

* Colors
* Typography
* Spacing
* Buttons
* Cards
* Inputs
* Navigation
* Modal styles
* AI interaction patterns

Do not create a new visual style for every feature.

Before creating a new component, check whether an existing component can be reused.

---

# 35. AI Coding Agent Instructions

When modifying or creating UI:

1. Read this `DESIGN.md` first.
2. Inspect existing components before creating new ones.
3. Reuse existing design tokens.
4. Maintain responsive behavior.
5. Maintain accessibility.
6. Do not introduce unnecessary dependencies.
7. Do not redesign unrelated screens.
8. Keep visual consistency across the application.
9. Prefer reusable components.
10. Test mobile and desktop layouts.
11. Use the existing project architecture.
12. If a design decision is unclear, choose the simplest option consistent with this document.

When implementing AI features, prioritize:

**Learning value > visual effects.**

When implementing dashboards, prioritize:

**Clarity > information density.**

When implementing student experiences, prioritize:

**Engagement + simplicity + curiosity.**

---

# 36. Design North Star

Every design decision should move the product toward this feeling:

> **"This feels like my personal learning universe, and I always know what to do next."**

The product should feel:

**Smart.
Human.
Playful.
Trustworthy.
Personal.
Simple.
Beautiful.**

But never:

**Complicated.
Corporate.
Overwhelming.
Distracting.
Robotic.**
