# Tasks — AI Face Analysis Web App

This directory contains task specifications for development work on this project.

Each task is a single, atomic unit of work. One task = one focused implementation session.

Before starting any task, Claude must read `AGENTS.md` and `CLAUDE.md`.

---

## Task File Naming

```
TASK-NNN-short-description.md
```

Examples:
- `TASK-001-project-scaffold.md`
- `TASK-002-photo-capture-component.md`
- `TASK-003-analysis-api-integration.md`

---

## Task Template

Copy this template when creating a new task file.

```markdown
# TASK-NNN: [Task Title]

## Status
[ ] Not started | [ ] In progress | [x] Done

## Objective
One sentence: what will exist or work after this task is complete that doesn't exist now.

## Scope
What is IN scope for this task (be specific):
- 

What is OUT of scope (explicitly excluded):
- 

## Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

## Inputs / Dependencies
- Depends on: TASK-NNN (if applicable)
- Requires: (any specific data, API keys, assets needed)

## Output / Deliverables
List the files that should be created or modified:
- `src/components/ComponentName.jsx` — created
- `src/hooks/useHookName.js` — created
- `src/App.jsx` — modified (add route)

## Notes
Any constraints, edge cases, or design decisions specific to this task.
If a decision is made during implementation, record it in docs/decisions.md.
```

---

## Example Task

```markdown
# TASK-001: Project Scaffold

## Status
[ ] Not started

## Objective
Initialize the Vite + React + Tailwind project with the correct file structure so development can begin.

## Scope
IN scope:
- Run `npm create vite@latest` with React template
- Install and configure Tailwind CSS v3
- Install React Router v6
- Install html2canvas
- Set up src/ directory structure per architecture.md
- Create stub files for all pages (Home, Analysis, Result) and main components

OUT of scope:
- Any actual UI implementation (that is TASK-002+)
- API integration
- Environment variable setup

## Acceptance Criteria
- [ ] `npm run dev` starts without errors
- [ ] Tailwind classes render correctly (test with a `bg-violet-600` element)
- [ ] React Router renders Home at `/`, Result at `/result`
- [ ] All stub files exist with correct filenames per architecture.md

## Inputs / Dependencies
- No dependencies — this is the first task

## Output / Deliverables
- `package.json` — created
- `vite.config.js` — created
- `tailwind.config.js` — created
- `src/main.jsx` — created
- `src/App.jsx` — created with router
- `src/pages/Home.jsx` — stub
- `src/pages/Analysis.jsx` — stub
- `src/pages/Result.jsx` — stub
- `src/components/PhotoCapture.jsx` — stub
- `src/components/AnalysisCard.jsx` — stub
- `src/components/ResultSummary.jsx` — stub
- `src/components/ShareButton.jsx` — stub
- `src/hooks/usePhotoCapture.js` — stub
- `src/hooks/useFaceAnalysis.js` — stub
- `src/utils/imageUtils.js` — stub
- `src/utils/analysisParser.js` — stub

## Notes
- Use the exact directory structure defined in docs/architecture.md
- Tailwind config must include the `src/**/*.{js,jsx}` content path
- Do not install TypeScript or any testing framework at this stage
```

---

## Task Backlog

| ID | Title | Status | Tier |
|---|---|---|---|
| TASK-001 | Project Scaffold | Not started | MVP |
| TASK-002 | Home Page — Upload UI | Not started | MVP |
| TASK-003 | Photo Capture Hook | Not started | MVP |
| TASK-004 | Analysis Page + Scan Animation | Not started | MVP |
| TASK-005 | AI API Integration | Not started | MVP |
| TASK-006 | Result Page — Trait Cards | Not started | MVP |
| TASK-007 | Share / Save with html2canvas | Not started | MVP |
| TASK-008 | Try Again Flow + Navigation Polish | Not started | MVP |
| TASK-009 | Mobile QA + Safari Fix Pass | Not started | MVP |
| TASK-010 | Shareable Image Branding | Not started | MVP |
