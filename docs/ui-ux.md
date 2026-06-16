# UI/UX Specification — AI Face Analysis Web App

## Design Principles

1. **Instant delight** — the first screen must communicate "this will be fun" within 2 seconds
2. **Zero friction** — no sign-up, no email, no form fields before the analysis
3. **Screenshot-worthy results** — the result screen is a product; it will be shared on social media
4. **Trust through simplicity** — clean, uncluttered UI signals the app is not sketchy

---

## Screen Specifications

### Screen 1 — Home (Landing + Upload)

**Purpose:** Get the user to upload or take a photo as fast as possible.

**Layout (mobile, 375px):**
- Full-screen background: dark gradient (slate-900 → slate-800) or bold hero color
- Centered vertically:
  - App title: large, punchy (e.g. "AI Face Analysis")
  - 1-line tagline: e.g. "Discover your face's hidden traits"
  - Primary CTA button: "Analyze My Face" — large, full-width on mobile
  - Secondary option: "Take a Photo" (camera icon) — below primary
- Small print at bottom: "No account needed. Results in seconds."

**Interactions:**
- Tapping "Analyze My Face" → opens file picker
- Tapping "Take a Photo" → opens device camera (if supported)
- After photo selected → immediately navigate to Analysis screen

**States:**
- Default (no photo selected)
- Loading (photo processing, before navigation)

---

### Screen 2 — Analysis (In-Progress)

**Purpose:** Manage wait time. Make the user feel something is happening.

**Layout (mobile):**
- User's photo displayed (circular crop, centered, ~200px)
- Animated scanning effect overlay (CSS animation — scan line or pulse ring)
- Progress text cycling: "Reading face geometry..." → "Analyzing symmetry..." → "Almost done..."
- Do not show a percentage — it implies false precision

**Interactions:**
- No user interaction needed — navigates automatically on API response
- Cancel option (small "×" or "Start over") in the top-left

**States:**
- Scanning (API in progress)
- Error (API failed) — show brief message + "Try again" button

---

### Screen 3 — Result

**Purpose:** Deliver the analysis in a shareable, emotionally resonant format.

**Layout (mobile):**
- Top: User's photo (circular, medium size)
- Below photo: Overall summary text (1–2 sentences, large, bold)
- Trait cards (vertical scroll):
  - Each card: trait label + score bar (0–100) + description
  - 4–6 traits max — do not overwhelm
  - Score bar should animate in on mount
- Bottom (sticky or near-bottom):
  - "Save Result" button → html2canvas export → downloads image
  - "Share" button → Web Share API (fallback: copy link / download)
  - "Try Again" → back to Home

**The Shareable Image (html2canvas target):**
- Fixed dimensions: 1080×1080px (square, Instagram-ready)
- Contains: app name, photo, top 3 traits with scores, summary
- Branded footer: app name + URL
- Must look good without the rest of the UI chrome

**States:**
- Result displayed
- Saving/exporting (brief loading state on button)
- Share success toast ("Image saved!" / "Link copied!")

---

## Component Visual Specs

### AnalysisCard
```
┌─────────────────────────────────┐
│  Charisma                  82   │
│  ████████████████████░░░░  ──   │
│  Your natural presence commands │
│  attention in social settings.  │
└─────────────────────────────────┘
```
- Background: white or slate-800 (dark mode)
- Score bar: brand accent color (e.g. violet-500 or rose-400)
- Rounded corners: `rounded-2xl`
- Shadow: `shadow-md`

### Primary Button
- Full width on mobile: `w-full`
- Height: `h-14` (56px)
- Text: `text-lg font-semibold`
- Colors: `bg-violet-600 hover:bg-violet-500 text-white`
- Rounded: `rounded-2xl`

---

## Color System

| Token | Tailwind | Usage |
|---|---|---|
| Background | `slate-900` | App background |
| Surface | `slate-800` | Cards, panels |
| Border | `slate-700` | Subtle separators |
| Primary | `violet-600` | CTAs, highlights |
| Accent | `rose-400` | Score bars, secondary highlights |
| Text primary | `white` | Headings |
| Text secondary | `slate-300` | Body, descriptions |
| Success | `emerald-400` | Toast, positive feedback |

---

## Typography

- Font: system-ui stack (no custom fonts at MVP to avoid load penalty)
- Heading scale: `text-3xl font-bold` / `text-2xl font-semibold` / `text-xl font-semibold`
- Body: `text-base` / `text-sm`
- All text on dark backgrounds must pass WCAG AA contrast minimum

---

## Motion & Animation

- Analysis scan: CSS keyframe, subtle — not distracting
- Score bars: animate from 0 → final value over 800ms on mount (CSS transition)
- Page transitions: simple fade (opacity 0 → 1, 200ms)
- No animations that block interaction or delay perceived load

---

## Accessibility (Minimum Bar)

- All images have `alt` attributes
- Buttons have descriptive labels (not just "Click here")
- Focus styles not removed (Tailwind's `focus:ring`)
- Color is never the only indicator of state (always pair with text or icon)
