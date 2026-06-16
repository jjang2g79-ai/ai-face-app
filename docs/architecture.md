# Architecture — AI Face Analysis Web App

## Overview

A client-side React SPA. No backend at MVP stage. All processing happens in the browser or via third-party AI APIs called directly from the client.

---

## Technology Stack

| Layer | Choice | Reason |
|---|---|---|
| Framework | React 18 + Vite | Fast dev server, modern bundler, wide ecosystem |
| Styling | Tailwind CSS v3 | Utility-first, no runtime overhead, mobile-first friendly |
| Image export | html2canvas | Render DOM nodes to canvas for shareable result images |
| AI analysis | TBD (OpenAI Vision / Replicate / custom) | Decision deferred — see docs/decisions.md |
| Hosting | TBD (Vercel / Netlify) | Static SPA, any CDN host works |

---

## Application Structure

```
ai-face-app/
├── public/
│   └── favicon, og-image, manifest
├── src/
│   ├── main.jsx          # Entry point, React root
│   ├── App.jsx           # Router and global providers
│   ├── pages/
│   │   ├── Home.jsx      # Landing + upload entry point
│   │   ├── Analysis.jsx  # Analysis in-progress screen
│   │   └── Result.jsx    # Result display + share screen
│   ├── components/
│   │   ├── PhotoCapture.jsx    # Camera / file upload UI
│   │   ├── AnalysisCard.jsx    # Single result trait card
│   │   ├── ResultSummary.jsx   # Shareable result layout
│   │   └── ShareButton.jsx     # html2canvas + share/download
│   ├── hooks/
│   │   ├── usePhotoCapture.js  # File input + camera logic
│   │   └── useFaceAnalysis.js  # API call + result parsing
│   ├── utils/
│   │   ├── imageUtils.js       # Resize/compress before upload
│   │   └── analysisParser.js   # Normalize AI API response
│   └── assets/
└── AGENTS.md, CLAUDE.md, docs/, tasks/
```

---

## Data Flow

```
User selects/captures photo
        ↓
imageUtils.compress() — resize to ≤ 1024px, JPEG 0.8 quality
        ↓
useFaceAnalysis() — sends to AI API
        ↓
analysisParser.normalize() — converts raw response to standard shape
        ↓
Result shape: { traits: [{ label, score, description }], summary: string }
        ↓
ResultSummary renders traits → ShareButton exports via html2canvas
```

---

## Result Data Shape

```js
// Standard result object used across the app
{
  imageUrl: string,          // object URL of the uploaded photo
  traits: [
    {
      label: string,         // e.g. "Charisma", "Symmetry"
      score: number,         // 0–100
      description: string,   // 1–2 sentence explanation
    }
  ],
  summary: string,           // 1–3 sentence overall read
  generatedAt: number,       // Date.now()
}
```

---

## Routing

| Path | Page | Notes |
|---|---|---|
| `/` | Home | Upload / camera entry |
| `/analysis` | Analysis | Shows while API call is in progress |
| `/result` | Result | Displays traits, share button |

State is passed via React Router `location.state` — no URL params, no persistence at MVP.

---

## Constraints

- No user accounts or data storage at MVP
- Photo must never leave the browser if possible — prefer on-device processing or ensure no server-side storage
- App must work without a backend server (Vite dev + static hosting only)
- Must be fully functional on Safari iOS 15+ (html2canvas has known Safari quirks — see docs/decisions.md)
