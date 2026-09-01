# Decisions Log — AI Face Analysis Web App

This file records architectural, design, and product decisions made during development. Each entry explains what was decided, why, and what alternatives were considered.

When a new decision is made during a task, append it here before closing the task.

---

## Decision Template

```
## DEC-NNN: [Short title]
**Date:** YYYY-MM-DD
**Status:** Decided | Superseded | Under Review
**Decision:** [What was decided in one sentence]
**Reason:** [Why this choice was made]
**Alternatives considered:** [What else was evaluated]
**Consequences:** [What this rules in or out going forward]
```

---

## DEC-001: No Backend at MVP
**Date:** 2026-05-06  
**Status:** Decided  
**Decision:** The MVP will be a fully client-side SPA with no custom backend server.  
**Reason:** Reduces infrastructure cost and complexity. Allows rapid iteration. Static hosting (Vercel/Netlify) is zero-config.  
**Alternatives considered:** Next.js with API routes, Express backend, Supabase edge functions.  
**Consequences:** AI API must be callable from the browser (requires a proxy or API that allows CORS). User data cannot be persisted server-side. No server-side auth at MVP.

---

## DEC-002: Tailwind CSS Only — No Component Library
**Date:** 2026-05-06  
**Status:** Decided  
**Decision:** Styling uses Tailwind utility classes only. No shadcn/ui, MUI, Chakra, or other component libraries.  
**Reason:** Component libraries add bundle weight and impose design constraints that conflict with a custom viral aesthetic. Tailwind is sufficient and faster to iterate with.  
**Alternatives considered:** shadcn/ui (considered but deferred — may revisit for Tier 2 admin/dashboard screens).  
**Consequences:** All UI must be hand-built. Higher initial effort, but total control over visual output.

---

## DEC-003: Plain JSX — No TypeScript at MVP
**Date:** 2026-05-06  
**Status:** Decided  
**Decision:** The project uses plain JavaScript with JSX. TypeScript is not introduced at MVP.  
**Reason:** TypeScript adds friction for rapid solo/small-team iteration. The codebase is small enough that types do not provide meaningful safety yet.  
**Alternatives considered:** TypeScript from day one (preferred for larger teams, deferred here).  
**Consequences:** No type checking on API response shapes — use runtime validation in `analysisParser.js` instead.

---

## DEC-004: AI API Provider — Deferred
**Date:** 2026-05-06  
**Status:** Under Review  
**Decision:** The specific AI vision API provider has not been chosen yet.  
**Reason:** Need to evaluate: response quality for face trait labeling, latency, pricing, CORS support for browser calls.  
**Alternatives under consideration:**  
- OpenAI GPT-4o Vision (high quality, requires proxy for browser use due to API key exposure)  
- Google Cloud Vision (structured responses, good for attributes)  
- Replicate (open models, flexible)  
- Claude claude-haiku-4-5-20251001 with vision (fast, cost-effective, Anthropic ecosystem)  
**Consequences:** `useFaceAnalysis.js` must be written against an abstract interface so the provider can be swapped without touching UI code.

---

## DEC-005: Result State via React Router location.state
**Date:** 2026-05-06  
**Status:** Decided  
**Decision:** Analysis result is passed between pages using React Router's `location.state`, not URL params or global state.  
**Reason:** Simple, no external state library needed, result is ephemeral (not persisted).  
**Alternatives considered:** Zustand/Jotai global store (overkill for MVP), URL query params (result object is too large and not serializable cleanly).  
**Consequences:** Refreshing the result page will lose state (acceptable at MVP — user must re-analyze). History navigation must be managed carefully to avoid stale state.

---

## DEC-006: html2canvas for Image Export
**Date:** 2026-05-06  
**Status:** Decided  
**Decision:** Use html2canvas to render the result panel as a downloadable PNG.  
**Reason:** Allows pixel-perfect render of the React result layout without maintaining a separate image template. Users share what they see.  
**Alternatives considered:** Canvas API (manual draw — too much code), server-side image generation (requires backend — ruled out by DEC-001).  
**Consequences:** html2canvas has known issues with: (a) cross-origin images — user's photo must be loaded as a data URL not a blob URL; (b) Safari iOS rendering bugs — test on Safari before shipping F-04.

---

## DEC-007: Single-file screen state machine in App.jsx
**Date:** 2026-05-06  
**Status:** Decided  
**Decision:** All screen transitions are managed via a `screen` state string in `App.jsx` using a `SCREENS` constant object. No routing library is used at MVP.  
**Reason:** The flow is strictly linear (Landing → Upload → Loading → Result). React Router adds dependency weight and history management complexity without benefit for a single linear flow.  
**Alternatives considered:** React Router v6 `location.state` pattern (designed for this in architecture.md — deferred until multi-entry flows exist).  
**Consequences:** Browser back button does not navigate between screens. Acceptable at MVP.

---

## DEC-008: Photo stored as base64 data URL in React state
**Date:** 2026-05-06  
**Status:** Decided  
**Decision:** Uploaded photo is converted to a base64 data URL via `FileReader` and stored in React state, not as a blob URL.  
**Reason:** html2canvas cannot render blob URLs reliably (CORS taint). Data URLs are self-contained and work cross-browser including Safari iOS.  
**Alternatives considered:** Object URL via `URL.createObjectURL` (simpler, but breaks html2canvas export).  
**Consequences:** Large photos held in memory as base64 strings. Acceptable at MVP given single-photo flow with no persistence.

## 2026-09-02 — Vision API 연결

**결정**: 이미지 분석을 해시 기반 시뮬레이션에서 OpenAI Vision 호출로 교체.

**배경**: `analyzeImage.js`가 data URL의 앞부분을 해시로 바꿔 결과 풀에서 하나를 고르고 있었다.
사진 내용과 무관하므로 회색 단색 이미지에도 정상 결과가 나왔다.

**적용**
- `generateAnalysisSummary`가 async가 되고 `gpt-4o-mini` 비전 호출을 사용한다.
- 응답은 `{ found, observed, index }` JSON. `observed`가 결과 카드의 "AI가 본 첫 느낌"에 들어간다.
- 요청한 종을 찾지 못하면(`found: false`) 결과 대신 `NotFoundScreen`을 보여준다.
- API 실패·타임아웃(20초) 시 기존 해시 로직으로 폴백한다. 결과 화면이 비는 경우는 없다.
- 새 의존성 없음. `fetch`만 사용.

**함께 고친 것**: `ResultCard.jsx`가 고양이·강아지의 경우 `result.analysisPool`에서 문구를 다시 뽑아
API 관찰을 덮어쓰고 있었다. 실제 관찰(`analyzed: true`)이 있으면 그것을 우선하도록 변경.

**남은 문제**: `VITE_` 접두 환경변수는 클라이언트 번들에 그대로 포함된다.
현재는 로컬 실행 전용이므로 허용하지만, 배포하려면 서버 프록시가 필요하다.
