# Features — AI Face Analysis Web App

## Feature Tiers

Features are organized into tiers. Only Tier 1 is in scope for MVP. Later tiers exist to guide decisions but must not influence MVP implementation.

---

## Tier 1 — MVP (Ship First)

### F-01: Photo Input
- Upload a photo from device storage (file input, accept image/*)
- Capture a photo directly from device camera (getUserMedia or input[capture])
- Show preview of selected photo before submission
- Compress image client-side before sending to API (max 1024px, JPEG 0.8)

**Acceptance:** User can select or capture a photo and it is immediately shown back to them.

---

### F-02: Face Analysis
- Send photo to AI analysis API
- Receive structured response: traits with labels, scores (0–100), and descriptions
- Parse and normalize API response into standard result shape (see architecture.md)
- Handle API errors gracefully: show retry screen, never crash silently

**Acceptance:** User sees 4–6 labeled trait scores with descriptions within a reasonable wait time.

---

### F-03: Result Display
- Show user's photo (circular crop)
- Show overall summary sentence
- Show trait cards with animated score bars
- Traits displayed: e.g. Charisma, Symmetry, Approachability, Confidence, Creativity, Magnetism

**Acceptance:** Result screen is readable, complete, and looks good at 375px width.

---

### F-04: Share / Save Result
- "Save Image" — renders result panel to canvas via html2canvas, triggers download as PNG
- "Share" — Web Share API where available; falls back to download
- Shared image is 1080×1080px, contains photo + top traits + app branding

**Acceptance:** User can save a shareable image of their result to their device.

---

### F-05: Try Again Flow
- "Try Again" button on result screen returns user to Home
- Clears current result state completely
- No back-button confusion (result should replace analysis in history, not stack)

**Acceptance:** User can restart cleanly without a page refresh.

---

## Tier 2 — Growth (Post-MVP)

### F-06: Skin Analysis Mode
- Separate entry flow for skin analysis (not face shape/traits)
- Focus on: skin tone, texture, visible concerns
- Separate result display with skincare-oriented language

### F-07: Product Recommendation
- After skin analysis, show 3–5 product recommendations
- Each recommendation: product name, category, why it fits this user's profile
- Affiliate links or brand partnership integration

### F-08: History / Gallery
- Store past analyses in localStorage (no account required)
- Gallery screen: past results as thumbnail cards
- Tap to re-view full result

### F-09: Comparison Mode
- Upload two photos, compare face trait scores side by side
- "You vs Friend" viral mechanic

---

## Tier 3 — Expansion (Future Vision)

### F-10: AI Counseling Mode
- Chat interface after analysis
- AI responds as a "face reader" / "personality analyst" persona
- Draws on the analysis result as context for the conversation

### F-11: User Accounts
- Optional sign-up via Google
- Cloud storage of analysis history
- Personalized recommendations over time

### F-12: Subscription / Monetization
- Free tier: basic analysis (4 traits)
- Pro tier: full analysis (10+ traits), detailed breakdown, priority API
- Pricing TBD

---

## Out of Scope (Forever or Until Explicitly Decided)

- Video analysis
- Real-time camera analysis (webcam streaming)
- Native mobile app (web-only for now)
- Explicit age/gender detection (ethical risk, not aligned with brand)
- Medical or clinical claims of any kind
