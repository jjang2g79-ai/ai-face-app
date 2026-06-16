# CLAUDE.md — Claude Behavior Rules

## Before Starting Any Task

1. Read `AGENTS.md` — project philosophy, UX rules, coding conventions
2. Read the relevant `docs/` file for the area of work
3. Read the task specification completely before writing a single line of code
4. Check `tasks/README.md` for the task format and confirm the task is properly scoped

---

## When to Proceed vs When to Ask

### Proceed without asking when:
- The task is fully specified with clear inputs and outputs
- The answer is derivable from AGENTS.md, CLAUDE.md, or docs/
- The decision is reversible (UI layout, component structure, naming)
- A reasonable default exists and the stakes are low

### Ask before proceeding when:
- The task requires a new external dependency
- The task requires a schema change or data model decision
- There is a direct conflict between the task spec and a rule in AGENTS.md
- The task scope is ambiguous and could lead to building 3× more than needed

### Never ask about:
- Which component library to use (Tailwind only)
- Whether to use TypeScript (no — plain JSX for now)
- File naming conventions (defined in AGENTS.md)
- Mobile vs desktop priority (mobile always first)

---

## How to Execute Tasks

### Step 1 — Parse the task
Identify: what is being built, where it lives in the file structure, what it depends on, what the acceptance criteria are.

### Step 2 — Plan before coding
State in 3–5 bullet points what you will create or change. Do not start coding until the plan is clear.

### Step 3 — Implement
- Write the minimal code that satisfies the task
- Follow all conventions in AGENTS.md
- Do not add features not in the task spec

### Step 4 — Self-review
Before declaring done, verify:
- [ ] Renders correctly at 375px
- [ ] No unused imports or dead code
- [ ] Follows Tailwind-only styling rule
- [ ] Component is under 200 lines (split if not)
- [ ] No new dependencies added without justification
- [ ] If this touches the result screen: would a user want to share this screenshot?

### Step 5 — Report
State what was created/changed and what (if anything) the next task should address.

---

## Viral Priority

When implementing any UI or feature, apply this lens before considering technical completeness:

- **Shareable output first** — if the result screen isn't screenshot-worthy, that is a higher priority fix than any internal code quality issue
- **User reaction over system complexity** — a visually striking result with simple code beats a technically elegant result that feels flat
- **Copy is part of the UI** — trait labels and descriptions are product decisions, not placeholder text; they must feel emotionally true
- **Every result should prompt the thought "this is me"** — if the language is too generic, rewrite it before shipping

When in doubt about a UI decision, ask: *would someone share this?* If no, redesign before proceeding.

---

## Output Format Rules

- Code blocks must specify language: ` ```jsx `, ` ```js `, ` ```css `
- When creating a new file, show the full file path as a header before the code block
- When editing an existing file, show only the changed section with enough context to locate it (not the full file unless it is small)
- Do not add comments explaining what the code does — the code must be self-explanatory
- Do add a comment only when the WHY is non-obvious (a workaround, a constraint, a subtle invariant)

---

## File Structure Rules

```
src/
  components/       # Reusable UI components
  pages/            # Top-level route pages
  hooks/            # Custom React hooks
  utils/            # Pure utility functions
  assets/           # Static images, fonts, icons
  styles/           # Global styles (minimal — prefer Tailwind)
```

- Do not create new top-level directories without updating this file
- Do not place business logic inside JSX — extract to a hook or util
- Keep `main.jsx` and `App.jsx` minimal (routing and providers only)

---

## Iteration Rules

- Each task is one atomic unit of work — do not bundle unrelated changes
- If a task reveals a necessary prerequisite, complete the prerequisite first and report it
- Do not refactor code outside the scope of the current task
- If you notice a bug outside the task scope, note it in your report but do not fix it silently
- After each task, update `docs/decisions.md` if any architectural or design decision was made
