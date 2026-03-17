# Notes of Tomorrow — Product Requirements Document

**Version:** 1.0  
**Status:** Draft  
**Author:** Izaz
**Last Updated:** March 2026

---

## Table of Contents

1. [Product Overview](#1-product-overview)
2. [Problem Statement](#2-problem-statement)
3. [Target Users](#3-target-users)
4. [Goals & Success Metrics](#4-goals--success-metrics)
5. [Tech Stack](#5-tech-stack)
6. [Design System](#6-design-system)
7. [Information Architecture](#7-information-architecture)
8. [Feature Specifications](#8-feature-specifications)
9. [User Flows](#9-user-flows)
10. [AI Architecture](#10-ai-architecture)
11. [Data Models](#11-data-models)
12. [API Endpoints](#12-api-endpoints)
13. [Security & Privacy](#13-security--privacy)
14. [Non-Functional Requirements](#14-non-functional-requirements)
15. [MVP Scope](#15-mvp-scope)
16. [Future Roadmap](#16-future-roadmap)

---

## 1. Product Overview

**Product Name:** Notes of Tomorrow  
**Tagline:** Don't Just Read A Book. Chat With It.  
**Type:** B2C SaaS Web Application  
**Core Value Proposition:** Transform passive reading into active life application. Users upload their highlighted book excerpts or notes exports, then have AI-powered conversations that apply the book's ideas directly to their current life situations — not just summarizing the book, but using it as a thinking partner.

### What It Is Not

- Not a full-book reader or e-reader (avoids copyright issues)
- Not a social reading platform (not Goodreads)
- Not a generic "chat with PDF" tool (not ChatPDF)
- Not a note-taking app (not Notion or Obsidian)

The differentiator is **situational application** — the AI doesn't just retrieve what the book says; it maps the user's real, current life problem onto the book's ideas and gives contextually useful guidance.

---

## 2. Problem Statement

Readers consume hundreds of books over their lifetime. The typical lifecycle:

1. Buy book
2. Read it, highlight passages, feel inspired
3. Finish it, put it on a shelf
4. Forget 90% within 2 weeks (Ebbinghaus forgetting curve)
5. Never act on what they read

The result: a graveyard of purchased wisdom that never changes behavior. Users know they've read something relevant to their current problem but can't recall it. They re-read entire books just to find one idea. The knowledge stays inert.

**Notes of Tomorrow closes this loop** by making every book a living, searchable, conversational resource — permanently available, personally contextualized.

---

## 3. Target Users

### Primary Persona — The Ambitious Reader

- Age: 22–38
- Reads 5–20 books/year (mostly self-help, business, philosophy, psychology)
- Already uses Kindle highlights, Google Play Books exports, or Readwise
- Feels frustrated by forgetting what they read
- Faces real life decisions (career, relationships, finances, health) and wants their reading to actually help
- Comfortable with AI tools (uses ChatGPT, Claude, Notion AI)

### Secondary Persona — The Student / Researcher

- Age: 18–28
- Reads textbooks, academic non-fiction, annotated PDFs
- Needs to cross-reference ideas across multiple books for essays or projects
- Values synthesis and citation over general advice

### Out of Scope (for MVP)

- Teams / organizations reading the same book together (B2B — future)
- Fiction readers (use case is weak for this product)
- Children / students under 18

---

## 4. Goals & Success Metrics

### Business Goals

| Goal             | Metric                        | Target (6 months post-launch) |
| ---------------- | ----------------------------- | ----------------------------- |
| User acquisition | Signups                       | 5,000 registered users        |
| Activation       | Users who complete first chat | >60% of signups               |
| Retention        | DAU/MAU ratio                 | >20%                          |
| Monetization     | Free → Paid conversion        | >5%                           |
| Revenue          | MRR                           | $5,000                        |

### Product Goals

| Goal            | Metric                                                                       |
| --------------- | ---------------------------------------------------------------------------- |
| Core loop works | User uploads book + completes first situational chat within 10 min of signup |
| AI quality      | <10% of chats rated unhelpful (thumbs down)                                  |
| Performance     | Book processing < 30 seconds for standard highlights export                  |
| Reliability     | 99.5% uptime                                                                 |

### Activation Event (North Star)

The single most important moment: **a user says "wow, this actually helped me"** — meaning they described a real life situation and the AI gave a response that used the book's ideas in a genuinely useful, specific way. All UX decisions optimize toward this moment.

---

## 5. Tech Stack

### Frontend

| Layer            | Technology                          | Reason                                                        |
| ---------------- | ----------------------------------- | ------------------------------------------------------------- |
| Framework        | **Next.js 14** (App Router)         | File-based routing, SSR/SSG, API routes, Vercel-native        |
| Language         | **TypeScript**                      | Type safety, better DX, fewer runtime bugs                    |
| UI Components    | **shadcn/ui**                       | Unstyled, composable, Tailwind-based, easy to override        |
| Styling          | **Tailwind CSS v3**                 | Utility-first, pairs perfectly with shadcn                    |
| Animations       | **Framer Motion**                   | Page transitions, chat message animations, micro-interactions |
| State Management | **Zustand**                         | Lightweight, simple, avoids Redux complexity for this scale   |
| Server State     | **TanStack Query (React Query)**    | Data fetching, caching, background sync, optimistic updates   |
| Forms            | **React Hook Form + Zod**           | Performant forms + runtime validation schema                  |
| File Upload      | **react-dropzone**                  | Drag-and-drop upload UX                                       |
| Icons            | **Lucide React**                    | Consistent with shadcn ecosystem                              |
| Fonts            | **next/font** with local font files | American Typewriter, JetBrains Mono                           |

### Backend

| Layer           | Technology                              | Reason                                                            |
| --------------- | --------------------------------------- | ----------------------------------------------------------------- |
| API Routes      | **Next.js API Routes / Route Handlers** | Colocation with frontend, no separate server needed at MVP scale  |
| Database        | **Supabase (PostgreSQL)**               | Managed Postgres, built-in auth, real-time, row-level security    |
| Auth            | **Supabase Auth**                       | Email/password + Google OAuth, session management, JWT            |
| File Storage    | **Supabase Storage**                    | Store uploaded PDFs, exports; integrates with RLS                 |
| Vector Database | **pgvector (via Supabase)**             | Embedding storage for RAG — same DB, less infrastructure          |
| Background Jobs | **Inngest**                             | Async processing: file parsing, embedding generation, email sends |
| Email           | **Resend**                              | Transactional emails (welcome, weekly digest, magic links)        |

### AI / ML

| Layer           | Technology                               | Reason                                                                   |
| --------------- | ---------------------------------------- | ------------------------------------------------------------------------ |
| Primary LLM     | **Anthropic Claude (claude-sonnet-4-5)** | Best for nuanced situational application, good at reasoning              |
| Fallback LLM    | **OpenAI GPT-4o**                        | Redundancy, vision capabilities for handwriting OCR                      |
| Embeddings      | **OpenAI text-embedding-3-small**        | Fast, cheap, high quality for semantic search                            |
| AI SDK          | **Vercel AI SDK**                        | Streaming responses, unified interface for multiple LLMs, Next.js native |
| OCR / Vision    | **GPT-4o Vision**                        | For PDF highlight extraction, handwritten margin notes                   |
| PDF Parsing     | **pdf-parse** (Node.js)                  | Text extraction from standard PDFs                                       |
| Document Parser | **mammoth**                              | Parse Google Play Books .docx exports                                    |

### DevOps & Infrastructure

| Layer         | Technology                                    | Reason                                                           |
| ------------- | --------------------------------------------- | ---------------------------------------------------------------- |
| Hosting       | **Vercel**                                    | Zero-config Next.js deploy, edge network, preview deployments    |
| CDN           | **Vercel Edge Network**                       | Automatic, included                                              |
| Monitoring    | **Sentry**                                    | Error tracking, session replay                                   |
| Analytics     | **PostHog**                                   | Product analytics, feature flags, session recording, open source |
| Logging       | **Axiom**                                     | Structured logging for API routes and background jobs            |
| Rate Limiting | **Upstash Redis**                             | Rate limiting on AI endpoints, caching                           |
| Environment   | **Doppler** or `.env.local` → Vercel env vars | Secrets management                                               |

### Development Tools

| Tool                    | Use                                     |
| ----------------------- | --------------------------------------- |
| **Cursor**              | Primary IDE with Claude integration     |
| **ESLint + Prettier**   | Code formatting, linting                |
| **Husky + lint-staged** | Pre-commit hooks                        |
| **Vitest**              | Unit + integration tests                |
| **Playwright**          | E2E tests for critical flows            |
| **Storybook**           | Component development and documentation |

---

## 6. Design System

### Color Palette

```css
:root {
  --color-black: #000000; /* Primary text, backgrounds */
  --color-white: #ffffff; /* Backgrounds, inverse text */
  --color-yellow: #ffba00; /* Primary accent, CTAs, highlights */
  --color-gray-50: #fafafa;
  --color-gray-100: #f5f5f5;
  --color-gray-200: #e5e5e5;
  --color-gray-400: #a3a3a3;
  --color-gray-600: #525252;
  --color-gray-800: #262626;
}
```

### Typography

```css
/* Display / Headers — Character, editorial feel */
font-family: "American Typewriter", "Courier New", serif;

/* Code, UI labels, metadata, tags */
font-family: "JetBrains Mono", "Fira Code", monospace;

/* Body text — pair with Typewriter for contrast */
/* Use JetBrains Mono for all body text at normal weight */
```

**Font Loading (Next.js):**

```typescript
// app/layout.tsx
import localFont from "next/font/local";
import { JetBrains_Mono } from "next/font/google";

const americanTypewriter = localFont({
  src: "./fonts/AmericanTypewriter.woff2",
  variable: "--font-typewriter",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});
```

### Buttons

All buttons use **fully rounded corners** (`border-radius: 9999px` / `rounded-full`):

```typescript
// Tailwind config override for shadcn
// components.json → set radius to "full"

// Button variants:
// Primary: bg-yellow-400 text-black rounded-full hover:bg-yellow-300
// Secondary: bg-black text-white rounded-full hover:bg-gray-800
// Ghost: bg-transparent border border-black rounded-full hover:bg-black hover:text-white
// Destructive: bg-black text-yellow-400 rounded-full border border-yellow-400
```

### shadcn/ui Configuration

```json
// components.json
{
  "style": "default",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "app/globals.css",
    "baseColor": "neutral",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils"
  }
}
```

### Spacing & Layout

- Max content width: `1200px`
- Grid: 12-column, `gap-6`
- Border radius: `rounded-2xl` for cards, `rounded-full` for all buttons and pills
- Shadows: `shadow-sm` for cards, `shadow-lg` for modals
- Book cards use `border border-gray-200` with subtle `hover:shadow-md hover:-translate-y-1` transition

---

## 7. Information Architecture

```
/ (Landing Page)
├── /sign-in
├── /sign-up
├── /dashboard (protected)
│   ├── /dashboard/library
│   │   ├── /dashboard/library/[bookId]          ← Book detail / highlights view
│   │   └── /dashboard/library/[bookId]/chat     ← Chat interface for a book
│   ├── /dashboard/upload                         ← Upload flow
│   ├── /dashboard/bookmarks                      ← Saved highlights across all books
│   ├── /dashboard/explore                        ← Browse pre-loaded books by category
│   └── /dashboard/settings
│       ├── /dashboard/settings/profile
│       ├── /dashboard/settings/life-context      ← User's current life goals/challenges
│       ├── /dashboard/settings/billing
│       └── /dashboard/settings/export
└── /api (internal API routes)
    ├── /api/upload
    ├── /api/books
    ├── /api/chat
    ├── /api/highlights
    └── /api/webhooks
```

---

## 8. Feature Specifications

---

### F-01: Landing Page

**Priority:** P0 (MVP)

**Description:** Marketing page that communicates the value prop clearly and converts visitors to signups.

**Requirements:**

- Hero section: Tagline "Don't Just Read A Book. Chat With It." with Get Started CTA
- Illustration of person studying (matches Figma design)
- Brief how-it-works section (3 steps: Upload → Chat → Apply)
- Category preview (Finance, Intellect, Occupation, Physique, Social, Spiritual — matching nav)
- Testimonials / social proof (can be placeholder for MVP)
- Sign In / Sign Up in nav
- Fully responsive (mobile-first)

**Acceptance Criteria:**

- [ ] Page loads in < 2s on 4G
- [ ] CTA "Get Started" routes to /sign-up
- [ ] Nav Sign In routes to /sign-in

---

### F-02: Authentication

**Priority:** P0 (MVP)

**Description:** User registration and login.

**Requirements:**

- Sign Up: email + password, OR Google OAuth
- Sign In: email + password, OR Google OAuth
- Password validation: min 8 chars, 1 uppercase, 1 number
- Email verification on signup
- "Forgot password" flow via email magic link
- Persist session (Supabase JWT + refresh token)
- Redirect authenticated users away from /sign-in and /sign-up

**UI Notes (from Figma):**

- Sign in page: left side = form, right side = illustration of girl reading on stack of books
- Copy: "Let's all keep an Open Mind and learn from one another and grow together"
- Username + Password fields with icons, "Sing In" button (note: fix typo to "Sign In" in dev), "Don't have an account? Sign Up" link

**Acceptance Criteria:**

- [ ] User can create account with email/password
- [ ] User can sign in with Google
- [ ] Failed login shows inline error (not alert)
- [ ] Session persists across browser refresh
- [ ] Unauthenticated access to /dashboard redirects to /sign-in

---

### F-03: Book Library / Dashboard

**Priority:** P0 (MVP)

**Description:** The user's home screen showing all their books, organized by category.

**Requirements:**

**Navigation:**

- Top nav: Logo | Category tabs (Finance, Intellect, Occupation, Physique, Social, Spiritual) | Your Bookmarks | Sign Out
- Active category tab highlighted in yellow pill (matches Figma)

**Book Grid:**

- 4-column grid (desktop), 2-column (tablet), 1-column (mobile)
- Each book card shows:
  - Book title (bold, American Typewriter)
  - Author name (pill/tag style)
  - Star rating (user-set, optional)
  - Book description snippet (2-3 lines, truncated)
  - Hover state: slight lift (`hover:-translate-y-1`) + "Chat Now" overlay button
- Empty state: "No books in [Category] yet. Upload your first book." with upload CTA

**Categories:**

- Finance, Intellect, Occupation, Physique, Social, Spiritual
- User assigns category at upload time
- Category filter is client-side (no page reload)

**Bookmarks:**

- "Your Bookmarks" button in top-right shows a slide-over panel of all saved highlights across all books
- Each bookmark shows: highlight text, book title, created date

**Acceptance Criteria:**

- [ ] Books display in correct category
- [ ] Category tabs filter books without page reload
- [ ] Clicking a book navigates to book detail page
- [ ] Empty state shown when no books in category
- [ ] Bookmarks panel opens as slide-over, not a new page

---

### F-04: Book Upload

**Priority:** P0 (MVP)

**Description:** The flow for a user to add a book to their library by uploading their highlights/notes.

**Supported Upload Formats (MVP):**

1. **Google Play Books .docx export** — most structured, parse tables of highlights
2. **Kindle highlights .txt export** — plain text, parseable by structure
3. **Plain text paste** — user pastes their highlights directly
4. **PDF upload** — AI-extracted highlights only (not full book ingestion)

**Upload Flow:**

**Step 1 — Choose method:**

- Drag-and-drop zone (accepts .docx, .txt, .pdf)
- OR paste text directly in a textarea
- File size limit: 10MB (MVP)

**Step 2 — Book metadata:**

- Book title (auto-detected from filename / parsed content, user can edit)
- Author name
- Category selection (Finance / Intellect / Occupation / Physique / Social / Spiritual)
- Rating (1-5 stars, optional)
- Brief personal note: "Why did you read this? What were you hoping to get out of it?" (optional, used as AI context)

**Step 3 — Processing (async):**

- Show processing state: "Extracting your highlights..." with progress indicator
- Background job runs:
  1. Parse file → extract highlight text segments
  2. Extract surrounding context where available
  3. Generate embeddings for each highlight chunk
  4. Store in database
- User receives in-app notification (and email) when ready
- Estimated processing time: < 30 seconds for standard highlights export

**Step 4 — Confirmation:**

- "X highlights extracted from [Book Title]"
- Preview of first 5 highlights
- CTA: "Start Chatting" or "View All Highlights"

**Parsing Logic:**

```typescript
// Google Play Books .docx structure:
// Table rows: [icon | highlight text | page number]
// Extract: highlight text + page reference

// Kindle .txt structure:
// "Your Highlight on Location X-Y | Added on [date]"
// [highlighted text]
// ==========
// Extract: highlighted text, location, date

// PDF:
// Use GPT-4o Vision to identify highlighted/underlined text
// Store as: { text, page_number, confidence_score }
```

**Acceptance Criteria:**

- [ ] Accepts .docx, .txt, .pdf files up to 10MB
- [ ] Processing is async — user not blocked waiting
- [ ] Correctly parses Google Play Books .docx export
- [ ] Correctly parses Kindle .txt export
- [ ] User notified when processing complete
- [ ] Extracted highlights viewable before chatting
- [ ] Failed processing shows clear error with retry option

---

### F-05: Book Detail / Highlights View

**Priority:** P0 (MVP)

**Description:** A clean view of all extracted highlights for a specific book.

**Requirements:**

**Header:**

- Book title, author, category badge, user rating
- Stats: X highlights, uploaded [date]
- Actions: "Chat With This Book" (primary), Export, Delete book

**Highlights List:**

- Each highlight displayed as a card with:
  - Highlight text (JetBrains Mono for the quoted text)
  - Page/location reference (if available)
  - Bookmark toggle (⭐ or 🔖 icon)
  - Tags (user can add tags: "mindset", "relationships", "career" etc.)
- Search/filter highlights within the book
- Sort: by page order (default), by date added, by tag

**Acceptance Criteria:**

- [ ] All highlights displayed in correct order
- [ ] User can bookmark individual highlights
- [ ] User can search within highlights
- [ ] User can tag highlights
- [ ] "Chat With This Book" navigates to chat with book pre-loaded

---

### F-06: Chat Interface — Core Feature

**Priority:** P0 (MVP)

**Description:** The AI chat interface where users converse with their book. This is the core product experience.

**Layout:**

- Left sidebar: book title + author, highlight count, quick access to key highlights
- Main area: chat conversation
- Input area: text input + send button + suggested prompts

**Chat Initialization — The AI Nudge:**

When a user opens the chat for the first time (or after a long gap), the AI opens with a **contextual prompt** rather than waiting for the user to type. This addresses the "I don't know how to apply it to my situation" problem.

```
AI opening message (one of the following, rotated):

1. "Hey! I've read through your highlights from [Book Title].
   Before we dive in — what's going on in your life right now
   that made you want to revisit this book?"

2. "You've got [X] highlights from [Book Title].
   What's on your mind today? Tell me what you're dealing with
   and I'll pull out what's most relevant for you."

3. "Welcome back to [Book Title]. Is there a specific situation
   you're navigating right now, or would you like me to suggest
   some ideas from the book based on common challenges?"
```

**Chat Modes:**

The user doesn't select a mode explicitly — the AI detects intent. But the system prompt supports distinct behaviors:

**1. Application Mode (Primary)** — User describes a life situation, AI maps it to the book's ideas

```
User: "I keep procrastinating on my business idea and I don't know why"
AI: [Searches highlights relevant to fear, procrastination, action]
    "Based on what you highlighted in [Book], here's what stands out for your situation..."
    [Cites actual highlight text inline]
    [Gives specific, actionable framing]
```

**2. Recall Mode** — User asks what the book said about a topic

```
User: "What did this book say about building habits?"
AI: [Retrieves relevant highlights]
    [Summarizes with direct quotes from highlights]
```

**3. Challenge Mode** — User wants to push back or think critically

```
User: "I don't fully agree with the author's take on discipline. Help me think through this."
AI: [Steelmans the author's position using the highlights]
    [Presents counterarguments]
    [Helps user form own view]
```

**4. Quiz Mode** — User wants to be tested on the material

```
User: "Quiz me on the key ideas"
AI: [Generates questions based on highlights]
    [Provides answers with reference to highlight text]
```

**Situation Panel (UI Element):**

A collapsible panel above the chat input labeled **"What are you working through?"** where the user can optionally write a short description of their current life situation. This is pre-populated into the system context for every message in the session.

```
┌─────────────────────────────────────────────────────┐
│ 📌 Your Situation (optional — helps me help you)    │
│ ┌───────────────────────────────────────────────┐   │
│ │ e.g. "I'm thinking about leaving my job..."  │   │
│ └───────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

**Message Display:**

- User messages: right-aligned, black background, white text, rounded-full bubble
- AI messages: left-aligned, white background, black border, includes:
  - Response text
  - **Cited highlights** displayed as inline quote cards:
    ```
    ┌──────────────────────────────────────────────┐
    │ 💬 From your highlights — p.47               │
    │ "Attachment is blinding; it lends an         │
    │  imaginary halo of attractiveness to the     │
    │  object of desire."                          │
    └──────────────────────────────────────────────┘
    ```
  - Thumbs up / thumbs down feedback buttons (for quality data)

**Suggested Prompts:**

Below the input field, show 3 rotating suggested prompts contextual to the book:

```typescript
const suggestedPrompts = [
  "I'm struggling with [situation] — what does this book say about it?",
  "What are the 3 most important ideas I highlighted?",
  "Quiz me on the key concepts",
  "I want to push back on one of the author's ideas",
  "How does this apply to my career right now?",
];
```

**Chat Persistence:**

- All conversations saved to database per user per book
- User can view chat history for any book
- Multiple conversations per book allowed (each starts fresh by default, but history accessible)

**Streaming:**

- AI responses stream token-by-token (no waiting for full response)
- Show typing indicator while first tokens arrive
- Use Vercel AI SDK `useChat` hook

**Acceptance Criteria:**

- [ ] AI opens with a nudge message, not empty chat
- [ ] Situation panel visible and pre-populates context
- [ ] Responses stream in real-time
- [ ] Highlights cited inline in AI responses
- [ ] Thumbs up/down on each AI message
- [ ] Suggested prompts displayed and clickable
- [ ] Chat history persisted and viewable
- [ ] Works on mobile (responsive layout)

---

### F-07: Explore / Pre-loaded Books

**Priority:** P1 (Post-MVP)

**Description:** A library of pre-loaded popular books (key passages only, legally sourced or public domain) browseable by category, allowing users to chat with books they haven't personally uploaded.

**Note:** This requires careful legal review. Only include:

- Books in public domain
- Books where publisher has licensed key passages
- Crowd-sourced highlights (user-contributed, anonymized)

**UI:** Same grid layout as personal library (matches Figma Finance tab)

---

### F-08: Bookmarks & Cross-Book Search

**Priority:** P1 (Post-MVP)

**Description:** Users can bookmark individual highlights. Bookmarks are viewable in a unified panel across all books.

**Requirements:**

- Bookmark any highlight from any book
- View all bookmarks in "Your Bookmarks" slide-over panel
- Filter bookmarks by book or by tag
- Search across all bookmarks
- Export bookmarks (markdown / plain text)

---

### F-09: Life Context Profile

**Priority:** P1 (Post-MVP)

**Description:** A persistent user profile describing their current goals and challenges. The AI references this across all book conversations without the user re-explaining each session.

**Fields:**

- Current top goals (max 3): e.g., "Start a business", "Get fit", "Improve relationships"
- Current challenges (freeform text, max 500 chars)
- Life areas they're focused on (multi-select from categories)
- Updated at: timestamp, prompt to refresh every 30 days

**Usage:** Injected as system context in every chat session:

```
User context: The user is currently focused on [goals].
Their main challenge is: [challenge].
Tailor responses to be relevant to this context.
```

---

### F-10: Daily Highlight (Engagement Loop)

**Priority:** P2 (Future)\*\*

**Description:** Once per day, surface one highlight from the user's library as a push/email notification with a prompt: "How does this apply to your life today?"

---

### F-11: Export

**Priority:** P1 (Post-MVP)

**Description:** Users can export their highlights in various formats.

**Export options:**

- All highlights from one book → Markdown file
- All highlights from all books → Markdown file (like the files created in this conversation)
- Export to Notion (via Notion API integration)
- Export to Readwise (CSV compatible format)

---

### F-12: Settings & Billing

**Priority:** P0 for settings, P1 for billing (MVP: free only)

**Requirements:**

**Profile Settings:**

- Display name, email, password change, profile photo
- Delete account (with data purge)

**Billing (Phase 2):**

- View current plan (Free / Pro)
- Upgrade/downgrade
- Invoice history
- Cancel subscription
- Powered by: **Stripe**

---

## 9. User Flows

### Flow 1: New User Onboarding

```
Landing Page
  → Click "Get Started"
  → /sign-up (email + password OR Google)
  → Email verification (if email/password)
  → Onboarding Step 1: "What brings you here?" (goal selection)
  → Onboarding Step 2: "Upload your first book" (skippable)
  → Dashboard (with empty state + prominent upload CTA if skipped)
```

### Flow 2: Upload a Book

```
Dashboard → "Upload Book" button
  → Upload modal/page opens
  → Step 1: Drag-drop file OR paste text
  → Step 2: Fill metadata (title, author, category, rating)
  → Step 3: Processing state (async, user can navigate away)
  → Notification: "Your book is ready!"
  → Book appears in library
```

### Flow 3: Chat With a Book (Core Flow)

```
Dashboard → Click book card → "Chat Now" hover OR book detail page
  → Chat opens
  → AI sends opening nudge: "What's on your mind today?"
  → User optionally fills "Your Situation" panel
  → User types message OR selects suggested prompt
  → AI streams response with cited highlights
  → User continues conversation
  → At end of session, optional: "Was this helpful?" prompt
```

### Flow 4: Returning User

```
Sign In → Dashboard
  → See all books
  → Resume a previous chat OR start new one
  → "Daily Highlight" banner (post-MVP) with yesterday's prompt
```

---

## 10. AI Architecture

### RAG Pipeline (Retrieval-Augmented Generation)

```
                    ┌─────────────────────────────────┐
                    │         INGESTION PIPELINE        │
                    └─────────────────────────────────┘
                                    │
         File Upload ───────────────┤
                                    │
                    ┌───────────────▼───────────────┐
                    │  Parser (docx / txt / pdf)     │
                    │  → Extract highlight segments  │
                    └───────────────┬───────────────┘
                                    │
                    ┌───────────────▼───────────────┐
                    │  Chunking Strategy             │
                    │  → Each highlight = 1 chunk    │
                    │  → Add metadata: page, book_id │
                    └───────────────┬───────────────┘
                                    │
                    ┌───────────────▼───────────────┐
                    │  OpenAI Embeddings API          │
                    │  text-embedding-3-small         │
                    │  → 1536-dim vector per chunk    │
                    └───────────────┬───────────────┘
                                    │
                    ┌───────────────▼───────────────┐
                    │  Supabase pgvector store        │
                    │  highlights table              │
                    │  + embedding column            │
                    └─────────────────────────────────┘

                    ┌─────────────────────────────────┐
                    │           CHAT PIPELINE          │
                    └─────────────────────────────────┘
                                    │
         User message ──────────────┤
                                    │
                    ┌───────────────▼───────────────┐
                    │  Embed user query              │
                    │  (same embedding model)        │
                    └───────────────┬───────────────┘
                                    │
                    ┌───────────────▼───────────────┐
                    │  Vector similarity search      │
                    │  → Top 5-8 relevant highlights │
                    │  → Filtered by book_id          │
                    └───────────────┬───────────────┘
                                    │
                    ┌───────────────▼───────────────┐
                    │  Build context window          │
                    │  [System prompt]               │
                    │  [User life context]           │
                    │  [Retrieved highlights]        │
                    │  [Chat history (last 10 turns)]│
                    │  [User message]                │
                    └───────────────┬───────────────┘
                                    │
                    ┌───────────────▼───────────────┐
                    │  Claude claude-sonnet-4-5            │
                    │  → Streaming response          │
                    │  → Must cite highlight sources │
                    └───────────────┬───────────────┘
                                    │
                    ┌───────────────▼───────────────┐
                    │  Stream to client              │
                    │  (Vercel AI SDK useChat)       │
                    └─────────────────────────────────┘
```

### System Prompt Template

```
You are a personal reading companion for Notes of Tomorrow.
Your job is not to summarize books — it is to help the user
APPLY the ideas from this book to their actual life.

Book: {book_title} by {book_author}
User's current situation: {life_context}
Session situation: {session_situation}

RELEVANT HIGHLIGHTS FROM THE USER'S READING:
{retrieved_highlights}

RULES:
1. Always ground your response in the actual highlights above.
2. Cite the specific highlight you're drawing from using this format:
   [HIGHLIGHT: "{exact highlight text}"]
3. Make your response specific to the user's situation — not generic.
4. If the user hasn't shared their situation, gently ask before giving advice.
5. Do not make up content not present in the highlights.
6. Be conversational, not academic. Write like a brilliant friend, not a textbook.
7. If the user's question cannot be answered from the highlights, say so honestly
   and suggest what type of book might help.
```

### Intent Detection

Before routing to full RAG, classify the user's message:

```typescript
type ChatIntent =
  | "application" // "I'm dealing with X, what does the book say?"
  | "recall" // "What did this book say about X?"
  | "challenge" // "I disagree with X, help me think through it"
  | "quiz" // "Quiz me" / "Test me"
  | "summary" // "Give me the key ideas"
  | "other";

// Simple keyword detection first (fast, cheap)
// Fall back to LLM classification if ambiguous
```

---

## 11. Data Models

### Supabase Schema

```sql
-- Users (extends Supabase auth.users)
create table public.profiles (
  id          uuid references auth.users primary key,
  display_name text,
  avatar_url  text,
  life_context jsonb,          -- { goals: [], challenges: string, updated_at: timestamp }
  plan        text default 'free', -- 'free' | 'pro'
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- Books
create table public.books (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references public.profiles not null,
  title       text not null,
  author      text,
  category    text,            -- 'finance' | 'intellect' | 'occupation' | 'physique' | 'social' | 'spiritual'
  rating      int,             -- 1-5
  cover_url   text,
  personal_note text,          -- Why did you read this?
  status      text default 'processing', -- 'processing' | 'ready' | 'error'
  highlight_count int default 0,
  source_type text,            -- 'google_play' | 'kindle' | 'pdf' | 'text_paste'
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- Highlights
create table public.highlights (
  id          uuid primary key default gen_random_uuid(),
  book_id     uuid references public.books not null,
  user_id     uuid references public.profiles not null,
  content     text not null,
  page_ref    text,            -- Page number or Kindle location
  position    int,             -- Order within book
  tags        text[],
  is_bookmarked boolean default false,
  embedding   vector(1536),    -- pgvector
  created_at  timestamptz default now()
);

-- Chat Sessions
create table public.chat_sessions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references public.profiles not null,
  book_id     uuid references public.books not null,
  session_situation text,      -- User's described situation for this session
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- Chat Messages
create table public.chat_messages (
  id          uuid primary key default gen_random_uuid(),
  session_id  uuid references public.chat_sessions not null,
  role        text not null,   -- 'user' | 'assistant'
  content     text not null,
  cited_highlights uuid[],     -- highlight IDs referenced in this message
  feedback    text,            -- 'helpful' | 'unhelpful' | null
  created_at  timestamptz default now()
);

-- Enable pgvector
create extension if not exists vector;

-- Vector similarity search index
create index on public.highlights
using ivfflat (embedding vector_cosine_ops)
with (lists = 100);

-- Row Level Security
alter table public.profiles enable row level security;
alter table public.books enable row level security;
alter table public.highlights enable row level security;
alter table public.chat_sessions enable row level security;
alter table public.chat_messages enable row level security;

-- RLS Policies (users can only access their own data)
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Users can view own books" on public.books
  for select using (auth.uid() = user_id);

-- (Similar policies for insert, update, delete on all tables)
```

---

## 12. API Endpoints

```typescript
// POST /api/upload
// Upload and parse a book file
// Body: FormData { file, title, author, category, rating, personal_note }
// Returns: { book_id, status: 'processing' }

// GET /api/books
// Get user's book library
// Query: ?category=finance
// Returns: Book[]

// GET /api/books/:id
// Get single book with highlights
// Returns: Book & { highlights: Highlight[] }

// DELETE /api/books/:id
// Delete a book and all highlights + chat history

// GET /api/books/:id/highlights
// Get all highlights for a book
// Query: ?search=&tags=&sort=position
// Returns: Highlight[]

// PATCH /api/highlights/:id
// Update a highlight (bookmark, tags)
// Body: { is_bookmarked?, tags? }

// POST /api/chat
// Send a chat message (streaming)
// Body: { book_id, session_id?, message, session_situation? }
// Returns: ReadableStream (Vercel AI SDK compatible)

// GET /api/chat/sessions/:bookId
// Get all chat sessions for a book
// Returns: ChatSession[]

// GET /api/chat/sessions/:sessionId/messages
// Get messages for a session
// Returns: ChatMessage[]

// PATCH /api/chat/messages/:id/feedback
// Submit feedback on an AI message
// Body: { feedback: 'helpful' | 'unhelpful' }

// POST /api/webhooks/inngest
// Handle background job callbacks (file processing complete, etc.)

// GET /api/export/:bookId
// Export highlights as markdown
// Returns: text/markdown file download
```

---

## 13. Security & Privacy

### Data Security

- All data encrypted at rest (Supabase default AES-256)
- All data encrypted in transit (HTTPS/TLS)
- Row Level Security (RLS) enforced at database level — users physically cannot access other users' data
- API routes validate session on every request via Supabase auth middleware
- File uploads scanned for malware (via Supabase Storage, or add VirusTotal API)
- Rate limiting on all AI endpoints (Upstash Redis): 50 messages/hour free, 200/hour pro

### Privacy

- User highlights and conversations are **never used to train AI models**
- This must be stated explicitly in Terms of Service and Privacy Policy
- Users can delete all their data at any time (account deletion = full purge within 30 days)
- Life context data stored only in Supabase, never sent to AI providers beyond session context
- No analytics on individual message content (only aggregated counts)
- GDPR / CCPA compliant:
  - Data export available (user can download all their data)
  - Right to erasure honored
  - Cookie consent banner

### Legal

- **Critical:** Users upload their own highlight exports — not full books. ToS must explicitly state:
  - "You may only upload content you have the legal right to share"
  - "Notes of Tomorrow does not store or serve full copyrighted books"
  - "Uploading a full copyrighted book is a violation of these terms"
- Store only highlights (user's intellectual derivative work) + embeddings (mathematical representations, not human-readable text)
- Get legal review before public launch, especially for the Explore feature (pre-loaded books)

---

## 14. Non-Functional Requirements

### Performance

| Metric                              | Target       |
| ----------------------------------- | ------------ |
| Page load (LCP)                     | < 2.5s       |
| Time to First Byte                  | < 600ms      |
| Book processing (highlights export) | < 30 seconds |
| Chat first token latency            | < 1 second   |
| Vector search latency               | < 200ms      |
| API response (non-AI)               | < 500ms      |

### Reliability

| Metric                   | Target                                              |
| ------------------------ | --------------------------------------------------- |
| Uptime                   | 99.5%                                               |
| AI endpoint availability | 99% (with fallback to GPT-4o if Claude unavailable) |
| Failed upload recovery   | Retry 3x, then notify user with error               |

### Scalability

- Stateless Next.js API routes → horizontal scaling via Vercel
- pgvector supports ~1M highlights before needing dedicated vector DB (Pinecone/Qdrant)
- Inngest handles job queue at scale without managing workers

### Accessibility

- WCAG 2.1 AA compliance
- Keyboard navigable (especially chat input and book grid)
- Screen reader compatible (proper ARIA labels)
- Color contrast ratios met (yellow #FFBA00 on black passes AA for large text)

### Browser Support

- Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- Mobile: iOS Safari 14+, Chrome for Android 90+
- No IE11 support

---

## 15. MVP Scope

### In MVP (Must Ship)

| Feature                                   | Priority |
| ----------------------------------------- | -------- |
| Landing page                              | P0       |
| Sign up / Sign in (email + Google)        | P0       |
| Book upload (.docx, .txt formats)         | P0       |
| Book library with category tabs           | P0       |
| Book detail / highlights view             | P0       |
| Chat interface with RAG                   | P0       |
| AI opening nudge ("What's on your mind?") | P0       |
| Situation panel in chat                   | P0       |
| Cited highlights in AI responses          | P0       |
| Streaming AI responses                    | P0       |
| Chat history persistence                  | P0       |
| Settings (profile, password)              | P0       |
| Mobile responsive                         | P0       |

### Not In MVP (Phase 2)

| Feature                      | Why Deferred                                |
| ---------------------------- | ------------------------------------------- |
| PDF upload with OCR          | Complex, expensive, unreliable              |
| Explore / pre-loaded books   | Legal complexity                            |
| Cross-book chat              | Needs multiple books first                  |
| Life context profile         | Nice-to-have; session situation handles MVP |
| Daily highlight notification | Needs email infrastructure to mature        |
| Export (Notion, Readwise)    | Valuable but not core loop                  |
| Stripe billing               | Free only for MVP to validate               |
| Social / sharing features    | Post-PMF                                    |

---

## 16. Future Roadmap

### Phase 2 (Months 2–4)

- PDF upload with AI highlight extraction
- Life context profile (persistent goals/challenges)
- Bookmarks panel + cross-book search
- Export to markdown / Notion
- Stripe billing (Free / Pro tiers)
- Email notifications (Resend)
- Mobile app (React Native / Expo, sharing 80% of logic)

### Phase 3 (Months 4–8)

- Cross-book chat ("What do all your books say about X?")
- Explore / pre-loaded books (legally cleared)
- Daily highlight digest (email + push)
- Readwise sync (import highlights directly)
- Public bookshelves (shared curated lists)
- Analytics dashboard for users (reading stats)

### Phase 4 (Months 8–12+)

- Team/group reading (B2B)
- API access for power users
- Browser extension (highlight while reading on web)
- Kindle direct sync (if Amazon allows)
- Community features (anonymized popular highlights)

---

## Appendix A: Environment Variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# AI
ANTHROPIC_API_KEY=
OPENAI_API_KEY=          # For embeddings + GPT-4o Vision fallback

# Background Jobs
INNGEST_EVENT_KEY=
INNGEST_SIGNING_KEY=

# Email
RESEND_API_KEY=

# Rate Limiting
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# Analytics
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=

# Monitoring
SENTRY_DSN=
NEXT_PUBLIC_SENTRY_DSN=

# Stripe (Phase 2)
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
```

---

## Appendix B: Folder Structure

```
notes-of-tomorrow/
├── app/
│   ├── (auth)/
│   │   ├── sign-in/page.tsx
│   │   └── sign-up/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── dashboard/
│   │   │   ├── page.tsx                    ← Library / home
│   │   │   ├── upload/page.tsx
│   │   │   ├── library/
│   │   │   │   └── [bookId]/
│   │   │   │       ├── page.tsx            ← Book detail
│   │   │   │       └── chat/page.tsx       ← Chat interface
│   │   │   └── settings/
│   │   │       ├── page.tsx
│   │   │       └── billing/page.tsx
│   ├── api/
│   │   ├── upload/route.ts
│   │   ├── books/route.ts
│   │   ├── books/[id]/route.ts
│   │   ├── chat/route.ts
│   │   ├── highlights/[id]/route.ts
│   │   └── webhooks/inngest/route.ts
│   ├── globals.css
│   └── layout.tsx
├── components/
│   ├── ui/                                 ← shadcn components
│   ├── books/
│   │   ├── BookCard.tsx
│   │   ├── BookGrid.tsx
│   │   └── CategoryTabs.tsx
│   ├── chat/
│   │   ├── ChatInterface.tsx
│   │   ├── ChatMessage.tsx
│   │   ├── HighlightCitation.tsx
│   │   ├── SituationPanel.tsx
│   │   └── SuggestedPrompts.tsx
│   ├── upload/
│   │   ├── UploadZone.tsx
│   │   └── BookMetadataForm.tsx
│   └── layout/
│       ├── Navbar.tsx
│       └── BookmarkPanel.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts                       ← Browser client
│   │   ├── server.ts                       ← Server client
│   │   └── middleware.ts
│   ├── ai/
│   │   ├── embeddings.ts
│   │   ├── chat.ts
│   │   └── prompts.ts
│   ├── parsers/
│   │   ├── googlePlayParser.ts
│   │   ├── kindleParser.ts
│   │   └── pdfParser.ts
│   ├── inngest/
│   │   ├── client.ts
│   │   └── functions/
│   │       └── processBook.ts
│   └── utils.ts
├── stores/
│   ├── useBookStore.ts
│   └── useChatStore.ts
├── types/
│   └── index.ts
├── hooks/
│   ├── useBooks.ts
│   └── useChat.ts
├── public/
│   └── fonts/
│       └── AmericanTypewriter.woff2
├── middleware.ts                           ← Auth protection
├── tailwind.config.ts
├── components.json                         ← shadcn config
└── next.config.ts
```

---

_End of PRD — Notes of Tomorrow v1.0_
