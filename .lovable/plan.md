
## MindCandle — Plan

A calm, premium dark UI for an AI trading-psychology coach. Five routes, fully designed with realistic mock data, mobile-first, with subtle Framer Motion animations. No backend in this pass.

### Design system (`src/styles.css`)
- Dark theme by default (`.dark` applied on `<html>`).
- Tokens (oklch):
  - `--background` deep noir `#0d0d0d`
  - `--card` / elevated surface `#141414` → `#1a1a1a`
  - `--foreground` warm off-white
  - `--primary` soft sage `#a8c0a0` (discipline / positive)
  - `--accent` blush pink `#e8c5d0` (emotional / AI)
  - `--destructive` pastel red `#e89b9b` (fear/revenge)
  - `--muted` / `--muted-foreground` neutral grays
  - `--border` low-contrast hairline
  - Custom: `--gradient-aurora` (sage → blush radial), `--shadow-soft`, `--shadow-glow`
- Fonts loaded via Google Fonts in `__root.tsx` head: **Sora** (headings) + **Manrope** (body). Tailwind `font-display` and `font-sans` mapped in `@theme inline`.
- Global: rounded-2xl cards, hairline borders, generous spacing, blurred floating gradient orbs as ambient background.

### Routes (TanStack Start file-based)
```text
src/routes/
  __root.tsx          → fonts, dark class, ambient gradient bg, AppShell with sidebar+topbar
  index.tsx           → Landing page (public, no shell)
  dashboard.tsx       → Dashboard
  coach.tsx           → AI Coach (mock chat)
  journal.tsx         → Trading Journal
  analytics.tsx       → Analytics
```
Root renders a layout that conditionally shows the sidebar (hidden on `/`). Each route gets unique `head()` meta (title, description, og).

### Shared components (`src/components/`)
- `layout/AppShell.tsx` — sidebar + topbar + ambient `GradientOrbs`
- `layout/Sidebar.tsx` — collapsible on mobile (Sheet), nav links with active state, MindCandle wordmark
- `layout/Topbar.tsx` — greeting, date, session status pill, profile avatar
- `layout/GradientOrbs.tsx` — two blurred sage/blush orbs, subtle float animation
- `ui/MotionCard.tsx` — rounded-2xl card with hover lift + soft glow
- `ui/StatTile.tsx` — label, big number, delta, sparkline
- `ui/MoodChip.tsx` — Calm / Fear / Revenge / Greedy with color mapping
- `coach/ChatBubble.tsx`, `coach/ComposerBar.tsx`
- `journal/EntryCard.tsx`, `journal/NewEntryDialog.tsx` (mood picker, emotion slider, free text)
- `analytics/DisciplineChart.tsx`, `analytics/EmotionDonut.tsx`, `analytics/EquityLine.tsx` (recharts)

### Page contents

**Landing (`/`)**
- Sticky transparent nav, hero with soft animated gradient: "Trade your mind, not the market."
- Sub-CTA → `/dashboard`
- 3 feature cards (AI Coach, Emotion Journal, Discipline Score) with Framer Motion stagger
- Section: "How it works" (3 steps), testimonial-style quotes from beginner traders
- Footer with calm copy

**Dashboard (`/dashboard`)**
- Greeting + today's intention
- 4 stat tiles: Discipline Score (87/100, sage), Emotional State (Calm, blush), Session Awareness (Focused), Daily Goal (2/3)
- "AI Reflections" card — 2-3 short coaching notes with sparkle icon
- "Recent Trades" table — symbol, P&L, mood at entry, mood at exit, discipline tag
- Right rail: weekly mood trend mini-chart

**AI Coach (`/coach`)**
- Two-pane: conversation + suggested prompts ("Why did I revenge trade?", "Help me reset", "Pre-market check-in")
- Messages with typing animation (mock); composer with emotion selector chip

**Journal (`/journal`)**
- Filter bar (mood, date)
- Grid of entry cards: date, mood chip, snippet, P&L pill, "AI insight" footnote
- "New entry" opens Dialog: mood (Calm/Fear/Revenge/Greedy), confidence slider, journal textarea, trade context

**Analytics (`/analytics`)**
- Discipline over time (line)
- Emotion distribution (donut: Calm/Fear/Revenge/Greedy)
- P&L vs emotion (bar)
- Behavioral patterns list ("You overtrade after losses on Mondays")

### Animation system (Framer Motion)
- Page transitions: fade + 8px y-slide
- Card hover: `whileHover={{ y: -2 }}` + shadow-glow
- Stat numbers: count-up on mount
- Stagger children for grids
- Modal: scale-in 0.96→1
- Mood chip select: spring scale

### Mock data
Centralize in `src/lib/mock.ts` — trades, journal entries, chat messages, chart series — so future Lovable Cloud integration only swaps the data source.

### Dependencies to add
- `framer-motion`
- `recharts` (likely already available via shadcn chart) — verify, otherwise add

### Out of scope (this pass)
- Auth, persistence, real AI streaming. Architecture is structured so we can later enable Lovable Cloud + Lovable AI Gateway without redesigning components.

### Acceptance
- All 5 routes render with no placeholder; mobile (≤375), tablet, desktop layouts clean.
- Dark theme only; no hard-coded color classes — all via tokens.
- Smooth, restrained motion; no flashy effects.
- Each route has unique SEO meta.
