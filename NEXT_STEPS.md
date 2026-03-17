# Notes of Tomorrow — Implementation Roadmap

**Written:** March 2026  
**Status:** UI prototype complete. Backend not yet implemented.  
**Goal:** Go from static mock UI → fully working MVP

---

## Current State

The UI shell is complete:
- Landing page (`/`)
- Dashboard with mock books (`/dashboard`)
- Book chat interface with mock data (`/dashboard/library/[bookId]/chat`)
- Auth pages exist but are not connected to any backend
- All data (`MOCK_BOOK`, `SAMPLE_HIGHLIGHTS`, messages) is hardcoded

**What's missing:** Everything real — auth, database, file parsing, AI, and wiring the UI to live data.

---

## Phase 0 — Project Foundation

**Estimated time: 1–2 days**  
Everything else depends on this. Do not skip.

---

### Step 0.1 — Install Required Packages

```bash
npm install @supabase/supabase-js @supabase/ssr
npm install ai @ai-sdk/anthropic
npm install openai
npm install mammoth
npm install react-dropzone
npm install zustand
npm install @tanstack/react-query
npm install inngest
npm install react-hook-form zod @hookform/resolvers
```

---

### Step 0.2 — Set Up Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project called `notes-of-tomorrow`
2. Once created, go to **Settings → API** and copy:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`

---

### Step 0.3 — Create `.env.local`

Create this file in the project root (never commit it):

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# AI
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...       # Used for embeddings only

# (Add these later)
# INNGEST_EVENT_KEY=
# INNGEST_SIGNING_KEY=
# RESEND_API_KEY=
```

---

### Step 0.4 — Run the Database Schema

In the Supabase dashboard, go to **SQL Editor** and run the following in order:

**Part 1 — Enable pgvector:**
```sql
create extension if not exists vector;
```

**Part 2 — Create tables:**
```sql
-- Profiles (extends Supabase auth.users)
create table public.profiles (
  id            uuid references auth.users primary key,
  display_name  text,
  avatar_url    text,
  life_context  jsonb,
  plan          text default 'free',
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- Books
create table public.books (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid references public.profiles not null,
  title           text not null,
  author          text,
  category        text,
  rating          int,
  cover_url       text,
  personal_note   text,
  status          text default 'processing',
  highlight_count int default 0,
  source_type     text,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- Highlights
create table public.highlights (
  id            uuid primary key default gen_random_uuid(),
  book_id       uuid references public.books not null,
  user_id       uuid references public.profiles not null,
  content       text not null,
  page_ref      text,
  position      int,
  tags          text[],
  is_bookmarked boolean default false,
  embedding     vector(1536),
  created_at    timestamptz default now()
);

-- Chat Sessions
create table public.chat_sessions (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid references public.profiles not null,
  book_id           uuid references public.books not null,
  session_situation text,
  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);

-- Chat Messages
create table public.chat_messages (
  id                uuid primary key default gen_random_uuid(),
  session_id        uuid references public.chat_sessions not null,
  role              text not null,
  content           text not null,
  cited_highlights  uuid[],
  feedback          text,
  created_at        timestamptz default now()
);
```

**Part 3 — Vector search index:**
```sql
create index on public.highlights
using ivfflat (embedding vector_cosine_ops)
with (lists = 100);
```

**Part 4 — Row Level Security:**
```sql
alter table public.profiles enable row level security;
alter table public.books enable row level security;
alter table public.highlights enable row level security;
alter table public.chat_sessions enable row level security;
alter table public.chat_messages enable row level security;

-- Profiles
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles
  for insert with check (auth.uid() = id);
create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

-- Books
create policy "Users can view own books" on public.books
  for select using (auth.uid() = user_id);
create policy "Users can insert own books" on public.books
  for insert with check (auth.uid() = user_id);
create policy "Users can update own books" on public.books
  for update using (auth.uid() = user_id);
create policy "Users can delete own books" on public.books
  for delete using (auth.uid() = user_id);

-- Highlights
create policy "Users can view own highlights" on public.highlights
  for select using (auth.uid() = user_id);
create policy "Users can insert own highlights" on public.highlights
  for insert with check (auth.uid() = user_id);
create policy "Users can update own highlights" on public.highlights
  for update using (auth.uid() = user_id);

-- Chat Sessions
create policy "Users can view own sessions" on public.chat_sessions
  for select using (auth.uid() = user_id);
create policy "Users can insert own sessions" on public.chat_sessions
  for insert with check (auth.uid() = user_id);

-- Chat Messages (access through session ownership)
create policy "Users can view own messages" on public.chat_messages
  for select using (
    exists (
      select 1 from public.chat_sessions s
      where s.id = session_id and s.user_id = auth.uid()
    )
  );
create policy "Users can insert own messages" on public.chat_messages
  for insert with check (
    exists (
      select 1 from public.chat_sessions s
      where s.id = session_id and s.user_id = auth.uid()
    )
  );
```

**Part 5 — Auto-create profile on signup:**
```sql
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

---

### Step 0.5 — Create Supabase Client Helpers

**`lib/supabase/client.ts`** (browser-side):
```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

**`lib/supabase/server.ts`** (server-side, use in Server Components & API routes):
```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )
}
```

---

### Step 0.6 — Add Auth Middleware

Create `middleware.ts` in the project root to protect all dashboard routes:

```typescript
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  if (!user && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/sign-in', request.url))
  }

  if (user && (
    request.nextUrl.pathname === '/sign-in' ||
    request.nextUrl.pathname === '/sign-up'
  )) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
```

---

## Phase 1 — Authentication

**Estimated time: 1 day**  
Wire the existing sign-in and sign-up pages to Supabase Auth.

---

### Step 1.1 — Sign Up Page

In `app/(auth)/sign-up/page.tsx`, replace the static form with a real one:

```typescript
'use client'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function SignUpPage() {
  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit(formData: FormData) {
    const { error } = await supabase.auth.signUp({
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    })
    if (!error) router.push('/dashboard')
  }

  async function handleGoogleSignUp() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${location.origin}/auth/callback` },
    })
  }

  // ... render your existing UI with these handlers
}
```

### Step 1.2 — Sign In Page

Same pattern as Sign Up but uses `supabase.auth.signInWithPassword()`.

### Step 1.3 — Auth Callback Route

Create `app/auth/callback/route.ts` (required for OAuth and email verification):

```typescript
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    await supabase.auth.exchangeCodeForSession(code)
  }

  return NextResponse.redirect(`${origin}/dashboard`)
}
```

### Step 1.4 — Sign Out

In `app/(dashboard)/layout.tsx`, replace the mock sign-out with:
```typescript
const supabase = createClient()
await supabase.auth.signOut()
router.push('/sign-in')
```

---

## Phase 2 — Book Upload & Parsing

**Estimated time: 2–3 days**  
The core ingestion pipeline: user uploads → parse highlights → store in DB → generate embeddings.

---

### Step 2.1 — File Parsers

**`lib/parsers/googlePlayParser.ts`**

Google Play Books exports `.docx` files containing a table with highlighted text. Use `mammoth`:

```typescript
import mammoth from 'mammoth'

export async function parseGooglePlayBook(buffer: Buffer): Promise<string[]> {
  const result = await mammoth.extractRawText({ buffer })
  const lines = result.value.split('\n').map(l => l.trim()).filter(Boolean)
  
  // Google Play format: each highlight is on its own line block
  // Filter out metadata lines (dates, page numbers, headers)
  const highlights = lines.filter(line =>
    line.length > 30 &&        // Skip very short lines (headers/metadata)
    !line.match(/^\d+$/) &&    // Skip pure numbers (page refs)
    !line.match(/^Page \d+/)   // Skip "Page X" lines
  )
  
  return highlights
}
```

**`lib/parsers/kindleParser.ts`**

Kindle exports `.txt` files with a specific structure:

```typescript
export function parseKindleExport(text: string): string[] {
  const highlights: string[] = []
  const sections = text.split('==========')
  
  for (const section of sections) {
    const lines = section.trim().split('\n').filter(Boolean)
    // Line 0: Book title
    // Line 1: "Your Highlight on Location X | Added on..."
    // Line 2+: The actual highlight text
    if (lines.length >= 3 && lines[1].includes('Your Highlight')) {
      const highlightText = lines.slice(2).join(' ').trim()
      if (highlightText.length > 20) {
        highlights.push(highlightText)
      }
    }
  }
  
  return highlights
}
```

---

### Step 2.2 — Embedding Helper

**`lib/ai/embeddings.ts`**

```typescript
import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
  })
  return response.data[0].embedding
}

export async function generateEmbeddingsBatch(texts: string[]): Promise<number[][]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: texts,
  })
  return response.data.map(d => d.embedding)
}
```

---

### Step 2.3 — Upload API Route

**`app/api/upload/route.ts`**

This route accepts a file + book metadata, stores the book record, parses highlights, generates embeddings, and stores everything:

```typescript
import { createClient } from '@/lib/supabase/server'
import { parseGooglePlayBook } from '@/lib/parsers/googlePlayParser'
import { parseKindleExport } from '@/lib/parsers/kindleParser'
import { generateEmbeddingsBatch } from '@/lib/ai/embeddings'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  const formData = await request.formData()
  const file = formData.get('file') as File
  const title = formData.get('title') as string
  const author = formData.get('author') as string
  const category = formData.get('category') as string
  const personalNote = formData.get('personal_note') as string

  // 1. Insert book record
  const { data: book, error: bookError } = await supabase
    .from('books')
    .insert({
      user_id: user.id,
      title,
      author,
      category,
      personal_note: personalNote,
      status: 'processing',
      source_type: file.name.endsWith('.docx') ? 'google_play' : 'kindle',
    })
    .select()
    .single()

  if (bookError) return new Response('Failed to create book', { status: 500 })

  // 2. Parse highlights
  const buffer = Buffer.from(await file.arrayBuffer())
  let highlights: string[] = []

  if (file.name.endsWith('.docx')) {
    highlights = await parseGooglePlayBook(buffer)
  } else if (file.name.endsWith('.txt')) {
    highlights = parseKindleExport(buffer.toString('utf-8'))
  }

  // 3. Generate embeddings in batches of 20
  const BATCH_SIZE = 20
  const highlightRows = []

  for (let i = 0; i < highlights.length; i += BATCH_SIZE) {
    const batch = highlights.slice(i, i + BATCH_SIZE)
    const embeddings = await generateEmbeddingsBatch(batch)

    for (let j = 0; j < batch.length; j++) {
      highlightRows.push({
        book_id: book.id,
        user_id: user.id,
        content: batch[j],
        position: i + j,
        embedding: embeddings[j],
      })
    }
  }

  // 4. Store highlights
  await supabase.from('highlights').insert(highlightRows)

  // 5. Update book status + count
  await supabase
    .from('books')
    .update({ status: 'ready', highlight_count: highlights.length })
    .eq('id', book.id)

  return Response.json({ book_id: book.id, highlight_count: highlights.length })
}
```

> **Note:** For large files, this will be slow as a synchronous request. For MVP it's fine. Post-MVP, move parsing+embedding to an Inngest background job.

---

### Step 2.4 — Wire the Upload UI

In `app/(dashboard)/dashboard/upload/page.tsx`:
1. Use `react-dropzone` for the drag-and-drop area
2. Use `react-hook-form` for the metadata form (title, author, category, rating)
3. On submit, POST to `/api/upload` as `FormData`
4. Show a loading state ("Processing your highlights...")
5. On success, redirect to `/dashboard/library/{book_id}`

---

## Phase 3 — Books & Highlights API

**Estimated time: 1 day**

---

### Step 3.1 — Books List API

**`app/api/books/route.ts`**
```typescript
export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')

  let query = supabase
    .from('books')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'ready')
    .order('created_at', { ascending: false })

  if (category && category !== 'all') {
    query = query.eq('category', category)
  }

  const { data } = await query
  return Response.json(data ?? [])
}
```

### Step 3.2 — Single Book + Highlights API

**`app/api/books/[id]/route.ts`** and **`app/api/books/[id]/highlights/route.ts`**

Similar pattern: validate user owns the book, return data.

---

### Step 3.3 — Wire Dashboard to Real Data

In `app/(dashboard)/dashboard/page.tsx`:
- Replace mock book array with a `useQuery` (TanStack Query) call to `GET /api/books?category={activeTab}`
- Show a real empty state if the user has no books
- Show a loading skeleton while fetching

---

## Phase 4 — Chat API with RAG

**Estimated time: 2–3 days**  
This is the most important part of the entire product.

---

### Step 4.1 — Vector Search Helper

**`lib/ai/search.ts`**
```typescript
import { createClient } from '@/lib/supabase/server'
import { generateEmbedding } from './embeddings'

export async function searchHighlights(
  query: string,
  bookId: string,
  limit = 6
) {
  const supabase = await createClient()
  const embedding = await generateEmbedding(query)

  const { data } = await supabase.rpc('match_highlights', {
    query_embedding: embedding,
    book_id_filter: bookId,
    match_count: limit,
  })

  return data ?? []
}
```

You also need to create the RPC function in Supabase SQL Editor:
```sql
create or replace function match_highlights(
  query_embedding vector(1536),
  book_id_filter uuid,
  match_count int default 6
)
returns table (
  id uuid,
  content text,
  page_ref text,
  similarity float
)
language sql stable
as $$
  select
    id,
    content,
    page_ref,
    1 - (embedding <=> query_embedding) as similarity
  from public.highlights
  where book_id = book_id_filter
  order by embedding <=> query_embedding
  limit match_count;
$$;
```

---

### Step 4.2 — System Prompt Builder

**`lib/ai/prompts.ts`**
```typescript
export function buildSystemPrompt({
  bookTitle,
  bookAuthor,
  highlights,
  sessionSituation,
}: {
  bookTitle: string
  bookAuthor: string
  highlights: { content: string; page_ref: string | null }[]
  sessionSituation?: string
}) {
  const highlightBlock = highlights
    .map((h, i) => `[${i + 1}] "${h.content}"${h.page_ref ? ` — ${h.page_ref}` : ''}`)
    .join('\n\n')

  return `You are a personal reading companion for Notes of Tomorrow.
Your job is not to summarize books — it is to help the user APPLY the ideas from this book to their actual life.

Book: ${bookTitle} by ${bookAuthor}
${sessionSituation ? `User's current situation: ${sessionSituation}` : ''}

RELEVANT HIGHLIGHTS FROM THE USER'S READING:
${highlightBlock}

RULES:
1. Always ground your response in the actual highlights above.
2. When citing a highlight, use this format inline: [c1], [c2], etc. (matching the numbers above)
3. Make your response specific to the user's situation — not generic.
4. If the user hasn't shared their situation, gently ask before giving advice.
5. Do not make up content not present in the highlights.
6. Be conversational, not academic. Write like a brilliant friend, not a textbook.
7. If the user's question cannot be answered from the highlights, say so honestly.`
}
```

---

### Step 4.3 — Chat API Route

**`app/api/chat/route.ts`**
```typescript
import { createAnthropic } from '@ai-sdk/anthropic'
import { streamText } from 'ai'
import { createClient } from '@/lib/supabase/server'
import { searchHighlights } from '@/lib/ai/search'
import { buildSystemPrompt } from '@/lib/ai/prompts'

const anthropic = createAnthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  const { messages, bookId, sessionSituation } = await request.json()
  const lastUserMessage = messages[messages.length - 1].content

  // 1. Get book info
  const { data: book } = await supabase
    .from('books')
    .select('title, author')
    .eq('id', bookId)
    .eq('user_id', user.id)
    .single()

  if (!book) return new Response('Book not found', { status: 404 })

  // 2. Retrieve relevant highlights via vector search
  const relevantHighlights = await searchHighlights(lastUserMessage, bookId)

  // 3. Build system prompt
  const systemPrompt = buildSystemPrompt({
    bookTitle: book.title,
    bookAuthor: book.author,
    highlights: relevantHighlights,
    sessionSituation,
  })

  // 4. Stream response from Claude
  const result = await streamText({
    model: anthropic('claude-sonnet-4-5'),
    system: systemPrompt,
    messages,
    maxTokens: 1024,
  })

  return result.toDataStreamResponse()
}
```

---

### Step 4.4 — Wire Chat UI to Real API

In `app/(dashboard)/dashboard/library/[bookId]/chat/page.tsx`:

1. Replace mock data with a real fetch of book + highlights from the API
2. Replace the local `messages` state with the **Vercel AI SDK `useChat` hook**:

```typescript
import { useChat } from 'ai/react'

const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
  api: '/api/chat',
  body: {
    bookId: params.bookId,
    sessionSituation: situationText, // from the context panel
  },
  initialMessages: [
    {
      id: '0',
      role: 'assistant',
      content: OPENING_NUDGES[Math.floor(Math.random() * OPENING_NUDGES.length)],
    }
  ]
})
```

3. This handles streaming automatically — no custom logic needed
4. Parse `[c1]`, `[c2]` citation markers from AI responses and render them as highlighted quote cards

---

### Step 4.5 — Persist Chat Messages

After `useChat` returns a completed message, save it to the DB:
- Create a `chat_session` on first message if one doesn't exist
- Use the `onFinish` callback in `useChat` to call `POST /api/chat/save`
- This stores both the user message and the AI response to `chat_messages`

---

## Phase 5 — Final Wiring & Polish

**Estimated time: 1–2 days**

---

### Step 5.1 — Replace All Mock Data

| File | Replace |
|---|---|
| `dashboard/library/[bookId]/chat/page.tsx` | `MOCK_BOOK`, `SAMPLE_HIGHLIGHTS` → real API data |
| `dashboard/page.tsx` | Mock books array → real `GET /api/books` |
| `layout.tsx` | Mock user name/avatar → real `supabase.auth.getUser()` |

### Step 5.2 — Loading & Error States

Every data-fetching component needs:
- **Loading skeleton** — show placeholder cards matching the real layout
- **Error state** — show a friendly message + retry button
- **Empty state** — show a clear CTA to upload the first book

### Step 5.3 — Render Cited Highlights in Chat

Parse AI messages for `[c1]`, `[c2]` markers and render inline citation cards that show the actual highlight text. This is what makes the AI responses feel grounded and trustworthy.

### Step 5.4 — Mobile Responsiveness

The 3-column chat layout needs special handling:
- On mobile: show one column at a time with tab navigation or swipe
- Minimum supported width: 375px (iPhone SE)

### Step 5.5 — Enable Google Auth in Supabase

In Supabase dashboard → **Authentication → Providers → Google**:
1. Enable Google provider
2. Add your Google OAuth Client ID and Secret (from Google Cloud Console)
3. Add `http://localhost:3000/auth/callback` and your production URL as redirect URIs

---

## Launch Checklist

Before going live:

- [ ] All P0 features from PRD §15 are working
- [ ] Auth flow tested end-to-end (sign up → upload → chat)
- [ ] Google Play Books `.docx` upload tested with a real export
- [ ] Kindle `.txt` upload tested with a real export
- [ ] Chat responses are streaming (not waiting for full response)
- [ ] Highlights are cited in AI responses
- [ ] Chat history persists across browser refreshes
- [ ] RLS verified — user A cannot access user B's books
- [ ] `middleware.ts` verified — `/dashboard` redirects unauthenticated users
- [ ] `.env.local` is in `.gitignore`
- [ ] Deploy to Vercel with env vars set

---

## Suggested Build Order (Strict Priority)

If time-boxing, build in this exact order — each step unblocks the next:

```
1. Phase 0 — Supabase schema + env vars + client helpers   [1–2 days]
2. Phase 1 — Auth (sign up, sign in, middleware)           [1 day]
3. Phase 2 Step 2.1-2.2 — Parsers + embedding helper      [half day]
4. Phase 2 Step 2.3 — Upload API route                     [half day]
5. Phase 4 Step 4.1-4.3 — Vector search + Chat API        [1–2 days]
6. Phase 4 Step 4.4 — Wire chat UI with useChat            [half day]
7. Phase 3 — Books API + wire dashboard                    [1 day]
8. Phase 5 — Replace all mock data, polish, launch        [1–2 days]
```

**Total estimated: ~8–12 days of focused work**

---

_Last updated: March 2026_
