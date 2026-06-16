# AGENTS.md — AI Face Analysis Web App

## Project Identity

**Name:** AI Face Analysis Web App  
**Phase:** MVP  
**Positioning:** Fun, viral face analysis tool with a clear expansion path into skin care and AI counseling.

---

## Project Philosophy

**Fast. Simple. Viral-first.**

- Ship the smallest version that makes users want to share it
- Every feature must earn its place — default to removing, not adding
- A result that looks good in a screenshot is more important than one that is technically comprehensive
- Emotional response > technical accuracy at this stage

---

## Product Expansion Path

This project follows a deliberate four-stage growth funnel. All features must support this sequence — do not build features that skip or break the order.

| Stage | Feature | Purpose |
|---|---|---|
| 1 | Face Analysis | Traffic — viral entry point, zero friction |
| 2 | Skin Analysis | Problem Awareness — user sees a real need |
| 3 | Product Recommendation | Revenue — solve the need they just discovered |
| 4 | AI Counseling | Retention — personalized ongoing relationship |

**Rule:** Before building any feature, identify which stage it belongs to. If it does not clearly serve one stage, do not build it.

---

## UX Rules

### The 3-Click Rule
Every core user journey must be completable in 3 clicks or fewer:
1. Land on page → Upload or capture photo (1 click)
2. Photo submitted → See analysis result (automatic)
3. View result → Share / save (1 click)

Any flow that requires more than 3 clicks must be redesigned before shipping.

### Mobile-First, Always
- Design at 375px width first; desktop is secondary
- Touch targets minimum 44×44px
- No hover-only interactions for primary actions
- Bottom navigation / thumb-zone placement for key CTAs
- Avoid modals that are hard to dismiss on mobile

### Visual Feedback
- Every user action must produce immediate visual feedback (loading state, animation, color change)
- Analysis must feel like an "event" — not a form submission
- Result screen must be screenshot-worthy and shareable by design

### Conversion Rule

Every result must guide the user toward a next action.

- The result screen must include a clear next step (share, try another analysis, or future feature)
- The user must never reach a dead-end screen
- Each interaction should increase curiosity or intent

If a screen ends the user journey without prompting action, it is considered incomplete.

---

## Viral Design Rule

Every result screen must be designed to be shared. This is not optional — shareability is the primary growth mechanism.

- The result must look good when captured as an image (no UI chrome, clean layout, strong visual hierarchy)
- The main result must be readable and understood within 3 seconds
- The user must feel: "I want to show this to someone"
- Result language must be specific enough to feel personal, not generic enough to feel like a horoscope

**Gate:** If a feature does not increase shareability or serve the expansion path, it should not be built.

---

## Psychological Response Rule

The result must feel personally accurate. Emotional resonance matters more than technical precision.

- Use emotionally resonant language — "commanding presence" not "high symmetry score"
- Write to the user's identity, not their face data
- Avoid clinical, technical, or numerical descriptions in the user-facing copy
- Prioritize "feels true" over "is scientifically accurate"
- Frame traits as strengths; never frame results as deficiencies

**Principle:** A result the user believes in and shares is more valuable than a result that is objectively correct but feels cold.

---

## Development Principles

### MVP First, Iterate Second
- Build only what is needed for the current task
- Do not pre-build infrastructure for features not yet scoped
- If a feature is not in the current task, do not add it
- Over-engineering is a bug

### No Premature Abstraction
- Prefer duplication over wrong abstraction
- Extract components only when the same UI appears 3+ times
- Keep component files under 150 lines where possible; split if they exceed 200

### Speed Over Perfection
- Ship within hours, not days — a working MVP today beats a polished one next week
- 70% complete is acceptable for MVP; the remaining 30% is discovered through real usage
- Waiting for perfection is a form of failure
- The test is: "Does this work well enough to share?" — not "Is this production-grade?"

### Performance as a Feature
- Images must be compressed before analysis
- Lazy-load anything below the fold
- Target < 3s to first meaningful paint on mobile networks

---

## Coding Style

### Stack
- **Framework:** React 18 + Vite
- **Styling:** Tailwind CSS (utility-first, no custom CSS unless unavoidable)
- **Image export:** html2canvas
- **State:** React hooks only (useState, useReducer) — no external state library until justified

### React Conventions
- Functional components only
- One component per file, filename matches component name (PascalCase)
- Props destructured at function signature
- No prop drilling beyond 2 levels — use context or colocation instead

### Tailwind Conventions
- Mobile-first breakpoints: `sm:` `md:` `lg:`
- Use Tailwind color palette — do not introduce custom hex values unless brand-mandated
- Group classes: layout → spacing → typography → color → effects

### File Naming
- Components: `PascalCase.jsx`
- Hooks: `useCamelCase.js`
- Utilities: `camelCase.js`
- Pages: `PageName.jsx` inside `src/pages/`

---

## Behavior Rules for AI Agents

1. **Read this file and CLAUDE.md before starting any task.** Do not rely on memory of previous sessions.
2. **Do not generate code outside the scope of the current task.**
3. **Do not ask clarifying questions if the answer can be inferred from this file, CLAUDE.md, or docs/.**
4. **Default to the simplest implementation that satisfies the task.**
5. **If a task conflicts with a rule in this file, flag the conflict — do not silently break the rule.**
6. **All new UI must be tested at 375px width before marking the task complete.**
7. **Result images generated by html2canvas must be visually verified before shipping.**
8. **Do not introduce new dependencies without justification. Prefer what is already installed.**
