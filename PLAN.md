# aston.ai — master plan

> Personal multi-modal chatbot. Text + image + TTS + (later) video via MiniMax. One codebase, one deploy on Vercel.
>
> Legend: `[x]` done · `[~]` in progress · `[ ]` pending · `[?]` open question

---

## 0. Current state snapshot

- **Phase:** 5 done (persistence). Plus error boundary, toasts, and regenerate shipped. Next: Phase 2 images or deploy to Vercel.
- **Last completed:** Dexie-backed IndexedDB persistence with hydrate-on-mount and write-through on every mutation, React ErrorBoundary wrapping App, Sonner toasts for streaming errors, regenerate-last-assistant action wired through Message → MessageList → ChatView, truncateAfter helper in store and DB.
- **Blocker:** none
- **Dev server:** `npm run dev` → http://localhost:5173
- **Build:** `npm run build` passes

---

## 1. Product vision (one paragraph)

A personal ChatGPT-style web app that talks to MiniMax across text, image, speech, and (later) video through a single chat surface. Slash-commands or a mode picker switch modalities. Conversations persist in the browser via IndexedDB (optional cloud sync later). I own the data, I own the key, I control the personality.

---

## 2. Stack (locked)

### Frontend
- [x] Vite 6 + React 18 + TypeScript (strict)
- [x] Tailwind CSS v4 via `@tailwindcss/vite` (no config file, theme in CSS)
- [x] Framer Motion — message enter animations, sidebar slide
- [x] Lucide React — icons
- [x] react-markdown + remark-gfm — render assistant messages
- [x] Geist Variable + Geist Mono Variable (via fontsource)
- [ ] Shiki — code block syntax highlighting (current: plain monospace)
- [ ] cmdk — ⌘K command palette
- [ ] sonner — toast notifications
- [ ] vaul — mobile bottom sheets
- [ ] Recharts — usage page charts
- [ ] rehype-katex + KaTeX — math rendering (nice-to-have)

### State & data
- [x] Zustand — global state (current conversation, settings, usage counters)
- [ ] Dexie — IndexedDB wrapper for conversations/messages/usage

### Backend (serverless proxy)
- [x] Vercel Functions (Node runtime), `/api/*.ts` auto-detected
- [ ] `openai` SDK pointed at `https://api.minimax.io/v1` — chat completions streaming
- [ ] Native `fetch` — image + TTS endpoints (SDK doesn't cover these)
- [ ] Zod — validate request bodies before forwarding to MiniMax

### Auth & cloud (optional, Phase 8+)
- [ ] Clerk — auth when multi-user matters
- [ ] Supabase — Postgres + RLS for synced conversations
- Skipped for v1 — local-only ships faster

### Dev & deploy
- [x] npm (Node 24, npm 11)
- [x] Vercel config (`vercel.json`) — ready for one-click deploy
- [ ] Biome or ESLint + Prettier (deferred — not urgent)

### Fonts
- [x] Geist Sans (UI) + Geist Mono (code) — referenced in CSS tokens
- [ ] Actually load the font files (self-host or `@fontsource/geist`)
- [ ] Optional: Instrument Serif for empty-state display

---

## 3. File structure (target)

```
personal chat/
├── PLAN.md                       ← this file
├── .env                          ← MINIMAX_API_KEY (gitignored)
├── .env.example                  ← [x] template
├── .gitignore                    ← [x]
├── vercel.json                   ← [x]
├── vite.config.ts                ← [x]
├── tsconfig.json                 ← [x]
├── tsconfig.app.json             ← [x]
├── tsconfig.node.json            ← [x]
├── package.json                  ← [x]
├── index.html                    ← [x]
│
├── api/                          ← Vercel serverless
│   ├── hello.ts                  ← [x] placeholder/health check
│   ├── chat.ts                   ← [ ] streaming text proxy (Phase 1)
│   ├── image.ts                  ← [ ] image-01 proxy (Phase 2)
│   └── tts.ts                    ← [ ] speech-02-hd proxy (Phase 3)
│
└── src/
    ├── main.tsx                  ← [x]
    ├── App.tsx                   ← [x] placeholder
    ├── index.css                 ← [x] tailwind + theme tokens
    ├── vite-env.d.ts             ← [x]
    │
    ├── components/
    │   ├── ChatStream.tsx        ← [ ] message list + streaming (Phase 1)
    │   ├── Composer.tsx          ← [ ] input + slash parser (Phase 1)
    │   ├── MessageBubble.tsx     ← [ ] text/image/audio variants (Phase 1-3)
    │   ├── ModePicker.tsx        ← [ ] text/image/voice toggle (Phase 4)
    │   ├── HistorySidebar.tsx    ← [ ] conversation list (Phase 5)
    │   ├── UsagePanel.tsx        ← [ ] per-session stats (Phase 6)
    │   ├── QuotaBar.tsx          ← [ ] rolling 5h request counter (Phase 6)
    │   └── CommandPalette.tsx    ← [ ] ⌘K (Phase 4)
    │
    ├── lib/
    │   ├── api.ts                ← [ ] fetch helpers (no key in browser)
    │   ├── db.ts                 ← [ ] Dexie schema + instance
    │   ├── storage.ts            ← [ ] high-level conv/message ops
    │   ├── store.ts              ← [ ] Zustand global state
    │   ├── commands.ts           ← [ ] slash command parser
    │   ├── pricing.ts            ← [ ] cost rate table by model/modality
    │   ├── titleGen.ts           ← [ ] auto-title after first reply
    │   └── export.ts             ← [ ] Markdown/JSON export
    │
    └── pages/
        ├── Chat.tsx              ← [ ] the only real page (Phase 1)
        └── Usage.tsx             ← [ ] stats dashboard (Phase 6)
```

---

## 4. Phases

### Phase 0 — Bootstrap (done)
- [x] Vite + React + TS scaffold
- [x] Tailwind v4 + theme tokens
- [x] `/api/hello.ts` placeholder
- [x] `.env.example`
- [x] `.gitignore`, `vercel.json`
- [x] `npm install` clean
- [x] `npm run build` passes
- [x] `npm run dev` serves at 5173

### Phase 1 — Streaming text chat (done)
**Goal:** type a message, see tokens stream in, multi-turn works, persists across refresh (basic).

- [x] `.env` populated with `LLM_API_KEY`, `LLM_BASE_URL`, `LLM_MODEL`
- [x] `api/chat.ts` — streaming proxy via `@anthropic-ai/sdk` to MiniMax `/anthropic/v1/messages`
- [x] `src/lib/api.ts` — `streamChat(messages)` async generator of text chunks
- [x] `vite-plugin-api.ts` — dev plugin so `npm run dev` runs `/api/*.ts` handlers
- [x] `src/components/Composer.tsx` — auto-growing textarea, Enter to send, Shift+Enter newline, icon row, send/stop, keyboard hints
- [x] `src/components/MessageList.tsx` — message list, auto-scroll (pauses on user scroll up), "new messages" pill
- [x] `src/components/Message.tsx` — user bubble + bubble-less assistant + hover actions
- [x] `src/components/Markdown.tsx` — GFM markdown rendering with custom components
- [x] `src/components/ChatView.tsx` — composes the above, handles send flow
- [x] `src/components/Sidebar.tsx` — date-grouped conversation list with search
- [x] `src/components/TopBar.tsx` — title, model pill, actions
- [x] `src/components/EmptyState.tsx` — time-based greeting + 4 suggestion cards
- [x] Streaming cursor (thin blinking bar)
- [x] Thinking dots while waiting for first token
- [x] Full message history available in store (stateless server)
- [ ] Conversation state write-through to IndexedDB (Phase 5)
- [ ] System prompt baked in (editable later)
- [ ] Code blocks: Shiki highlight (current: plain mono + copy button)
- [x] Empty state: hero + 4 suggested prompt cards
- [ ] Error states: rate limit, network, auth failure (toast via sonner)
- [x] Keyboard shortcuts: ⌘N new chat, ⌘\ toggle sidebar
- [x] Mock stream so UI is testable before API key drops

**Acceptance:** type "explain quantum entanglement in 3 lines", see tokens stream in, refresh → conversation still there.

### Phase 2 — Image generation
- [ ] `api/image.ts` — POST `{prompt, aspect_ratio}` → MiniMax `/v1/image_generation` → return base64 or signed URL
- [ ] Composer parses `/image <prompt>` → routes to image endpoint
- [ ] `MessageBubble` image variant: rounded, click-to-lightbox, download + "use as reference" buttons
- [ ] Loading skeleton (shimmer) while waiting
- [ ] Aspect ratio picker (1:1, 16:9, 9:16, 4:3, 3:4)
- [ ] [?] Verify MiniMax image quota on Plus plan before building

**Acceptance:** `/image a fox studying physics, watercolour` → image inline.

### Phase 3 — TTS (text to speech)
- [ ] `api/tts.ts` — POST `{text, voice}` → MiniMax `/v1/t2a_v2` → stream MP3
- [ ] Play button on every assistant message → fetches audio, plays via custom player
- [ ] Custom waveform player (not default `<audio>` controls)
- [ ] Voice picker in settings
- [ ] Optional: auto-read mode toggle
- [ ] [?] Verify MiniMax TTS quota/pricing on Plus plan

**Acceptance:** click play on any bot message, hear it spoken.

### Phase 4 — Slash commands + command palette
- [ ] `src/lib/commands.ts` — parser with registry
- [ ] `/image <prompt>` — image gen
- [ ] `/tts <text>` — speak arbitrary text
- [ ] `/clear` — wipe current conversation
- [ ] `/export` — download chat as Markdown
- [ ] `/model <name>` — switch between MiniMax models
- [ ] `/system <prompt>` — edit system prompt inline
- [ ] Autocomplete dropdown as you type `/`
- [ ] ⌘K command palette (cmdk) — global actions
- [ ] Keyboard: ⌘/ focus composer, ⌘\ toggle sidebar, ↑ in empty composer edits last

### Phase 5 — History sidebar + multi-conversation
- [ ] `src/lib/db.ts` — Dexie schema:
  - `conversations` (id, title, created_at, updated_at, model, system_prompt)
  - `messages` (id, conversation_id, role, content, type, created_at, tokens_in, tokens_out, cost_cents, model, modality)
  - `usage_events` (optional: for rolling 5h quota tracking)
- [ ] `src/components/HistorySidebar.tsx` — list all conversations, grouped by date (Today / Yesterday / Last 7 days / Older)
- [ ] "New chat" button → fresh thread
- [ ] Click old chat → loads from IndexedDB
- [ ] Inline rename, delete with confirmation
- [ ] Auto-title: after first assistant reply, fire cheap call → 4-6 word summary
- [ ] Search: Dexie filter, client-side (fine for <10k messages)
- [ ] Sidebar collapses on mobile (vaul bottom sheet)
- [ ] `/export` produces JSON and Markdown for one conversation
- [ ] Settings → "Export all" → zip of everything

**Acceptance:** start 3 conversations, switch between them, refresh page → all still there.

### Phase 6 — Usage tracking + quota bar
- [ ] Store `prompt_tokens`, `completion_tokens`, `model`, `modality`, `cost_cents` on every message
- [ ] `src/lib/pricing.ts` — rate table per model + modality
- [ ] In-conversation footer under each assistant message: `1,284 tok · $0.003` (muted, hover-only option)
- [ ] Right-drawer session panel: tokens in/out/total, cost, messages count, model breakdown
- [ ] `src/pages/Usage.tsx` — global stats
  - [ ] Today / This week / This month tabs
  - [ ] Line chart: tokens per day (Recharts)
  - [ ] Stacked bars: text vs image vs tts
  - [ ] Breakdown by model
  - [ ] Running total cost
- [ ] **Quota bar** in top bar (always visible):
  - Rolling 5h window of request timestamps in IndexedDB
  - "4238 / 4500 requests · resets in 1h 12m"
  - Green → amber at 80% → red at 95%
- [ ] Toast at 80% quota: subtle warning
- [ ] Persistent banner at 95%: rate limit imminent

### Phase 7 — Voice input (optional)
- [ ] Mic button in composer
- [ ] Browser Web Speech API → dictates into composer
- [ ] Hold-to-talk style
- [ ] Fallback: MiniMax ASR endpoint if browser API unavailable

### Phase 8 — Image input / vision (optional)
- [ ] Drag-drop image into composer
- [ ] Send as base64 with question in M2.7 multimodal mode
- [ ] [?] Verify M2.7 supports image input — fallback provider needed?

### Phase 9 — Personality presets (optional)
- [ ] Settings page: system prompt editor
- [ ] Presets: coding tutor, tax advisor, marketing copywriter, custom
- [ ] Per-conversation persona (override default)
- [ ] Export/import preset JSON

### Phase 10 — Video + music (future)
- [ ] `/video <prompt>` → MiniMax `/v1/video_generation` (T2V-01)
- [ ] `/music <prompt>` → MiniMax `/v1/music_generation` (music-01)
- [ ] Needs Vercel Pro tier (10s Hobby timeout too tight for video)

### Phase 11 — Cloud sync (optional)
- [ ] Clerk auth
- [ ] Supabase schema mirror of Dexie (`user_id` + RLS)
- [ ] Optimistic write: IndexedDB first, Supabase in background
- [ ] `synced_at` column + sync worker
- [ ] Conflict resolution: last-write-wins (single-user across devices)

---

## 5. UI / UX spec (the "nice chat screen")

### Layout
- [ ] 3-column shell: collapsible sidebar · centered chat column (max 780px) · optional right panel
- [ ] Sticky top bar: conversation title (inline-editable), model badge, mode indicator, quota bar, "…" menu
- [ ] Generous vertical padding, ~16px gap between turns, 24px between sender changes
- [ ] Composer pinned bottom, floating card, subtle shadow, auto-grows to ~8 lines then scrolls

### Messages
- [ ] User: right-aligned, subtle tinted background, rounded-2xl
- [ ] Assistant: left-aligned, **no bubble** — text on canvas
- [ ] Avatar only on assistant, small, monochrome
- [ ] Hover reveals: copy · regenerate · play TTS · branch · delete
- [ ] Streaming: thin blinking bar at end of last token
- [ ] Code blocks: Shiki, copy button top-right, language label
- [ ] Image messages: rounded, click-to-lightbox
- [ ] Audio messages: custom waveform player

### Motion & micro-details
- [ ] Autoscroll that pauses on user scroll-up, shows "↓ New messages" pill
- [ ] Skeleton shimmer (not spinners) while waiting
- [ ] Message enter: 8px rise + fade, 200ms, no bouncy springs
- [ ] Keyboard-first: ⌘K, ⌘/, ⌘\, ↑-to-edit
- [ ] Dark mode default, light mode toggle

### Typography
- [ ] Geist Sans body
- [ ] Geist Mono code
- [ ] Optional Instrument Serif for empty-state hero

### References (visual mimicry)
- Claude.ai — typography, spacing
- T3 Chat — speed feel + model switcher
- Raycast AI — command palette
- Vercel AI Playground — parameter controls

---

## 6. Storage schema (Dexie / IndexedDB)

```ts
// conversations
{
  id: string              // uuid
  title: string           // auto-generated or user-set
  created_at: number      // ms
  updated_at: number
  model: string           // MiniMax-M2.7 etc.
  system_prompt: string
  archived?: boolean
}

// messages
{
  id: string
  conversation_id: string  // fk
  role: 'user' | 'assistant' | 'system'
  content: string          // text OR image base64/url OR audio url
  type: 'text' | 'image' | 'audio'
  created_at: number
  model?: string
  modality?: 'text' | 'image' | 'tts'
  tokens_in?: number
  tokens_out?: number
  cost_cents?: number      // computed at write-time
}

// request_log (for rolling 5h quota)
{
  id: string
  timestamp: number
  endpoint: 'chat' | 'image' | 'tts'
  ok: boolean
}
```

Indexes: `messages.conversation_id`, `conversations.updated_at`, `request_log.timestamp`.

---

## 7. API endpoints used (MiniMax)

| Endpoint | Purpose | Phase |
|---|---|---|
| `POST /v1/chat/completions` | Text chat (OpenAI-compatible), model `MiniMax-M2.7` | 1 |
| `POST /v1/image_generation` | Images, model `image-01` | 2 |
| `POST /v1/t2a_v2` | TTS, model `speech-02-hd` | 3 |
| `POST /v1/video_generation` | Video, model `T2V-01` | 10 |
| `POST /v1/music_generation` | Music, model `music-01` | 10 |

Base URL: `https://api.minimax.io/v1`
Auth: `Authorization: Bearer ${MINIMAX_API_KEY}` (server-side only)

---

## 8. Deployment (Vercel)

- [x] `vercel.json` present
- [ ] Push repo to GitHub
- [ ] Import in Vercel dashboard → auto-detects Vite
- [ ] Add `MINIMAX_API_KEY` in project settings → Environment Variables
- [ ] Every push to `main` → production; every branch → preview URL
- [ ] Hobby tier limits to watch:
  - Serverless function timeout: **10s** (60s on Pro) — OK for chat stream, image, TTS. NOT ok for video.
  - 100 GB-hours function execution / month — way beyond personal use
  - Bandwidth unlimited (static)

---

## 9. Open questions / things to confirm

- [?] Does MiniMax Plus plan (4500 chat req / 5h) include image + TTS quota, or pay-as-you-go?
- [?] Does M2.7 return `usage` field in streaming responses? (needed for Phase 6 cost tracking)
- [?] Do image and TTS endpoints return `usage`? If not, compute from inputs at request time.
- [?] Does M2.7 support image input (vision)? Or need fallback provider for Phase 8?
- [?] Single-user forever, or will friends use it? → affects auth decision (skip Clerk vs add Clerk)
- [?] Sync across devices needed? → affects Supabase decision
- [x] Brand identity: name `aston.ai`, coral bloom logo, warm-neutral palette with coral accent.
- [?] Mobile-first or desktop-first? Current plan: desktop-first, mobile pass after Phase 5.

---

## 10. Decisions locked

- **Vite, not Next.js** — one page, no SEO, faster dev
- **Vercel monorepo** — frontend + `/api/*` together, one deploy
- **IndexedDB first, cloud later** — ship faster, add sync if felt
- **Proxy through `/api`** — never ship MiniMax key to browser
- **Dark mode default** — feels more premium
- **No bubble for assistant messages** — Claude-style, feels like reading
- **Tailwind v4** — no config file, theme in CSS

---

## 11. Timeline (rough)

| Milestone | Effort |
|---|---|
| Phase 0 (bootstrap) | done |
| Phase 1 (streaming chat) | 1 evening |
| UI polish pass (before modalities) | 1 evening |
| Phase 2 (image) | 1 evening |
| Phase 3 (TTS) | ½ evening |
| Phase 4 (slash + palette) | ½ evening |
| Phase 5 (history + Dexie) | 1 evening |
| Phase 6 (usage + quota) | 1 evening |
| **End of weekend 1** | working chatbot, 1 modality polished |
| **End of weekend 2** | full multi-modal app, daily-drivable |
| Phases 7–11 | as desired, optional |

---

## 12. Next action

**User:** drop `MINIMAX_API_KEY=sk-...` into `.env` (same folder as `.env.example`).

**Then I build Phase 1:**
1. `api/chat.ts` streaming proxy
2. `src/lib/api.ts` client helper
3. `Composer` + `ChatStream` + `MessageBubble` components
4. Wire it into `App.tsx`
5. First real conversation works end-to-end
