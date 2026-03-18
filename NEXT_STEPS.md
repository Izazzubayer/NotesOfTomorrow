# Notes of Tomorrow — Implementation Roadmap

**Written:** March 2026  
**Stack:** Next.js 14 · Firebase (Auth + Firestore + Storage) · Gemini 1.5 · Vercel  
**Status:** UI prototype complete — backend not yet implemented  
**Goal:** Go from static mock UI → fully working MVP

---

## Current State

The UI shell is complete:

- Landing page (`/`)
- Dashboard with mock books (`/dashboard`)
- Book chat interface (`/dashboard/library/[bookId]/chat`)
- Auth pages exist but are **not connected**
- All data (`MOCK_BOOK`, `SAMPLE_HIGHLIGHTS`, chat messages) is **hardcoded**

---

## Tech Stack (Google-Native)

| Layer        | Technology                                                     |
| ------------ | -------------------------------------------------------------- |
| Framework    | Next.js 14 (App Router)                                        |
| Auth         | Firebase Authentication (Google OAuth + Email/Password)        |
| Database     | Firestore (NoSQL, with native Vector Search for RAG)           |
| File Storage | Firebase Storage                                               |
| AI / LLM     | Gemini 1.5 Pro (streaming chat)                                |
| Embeddings   | Google `text-embedding-004`                                    |
| File Parsing | `mammoth` (Google Play `.docx`), custom parser (Kindle `.txt`) |
| Hosting      | Vercel (or Firebase Hosting)                                   |
| State        | Zustand + TanStack Query                                       |
| Forms        | React Hook Form + Zod                                          |

**Cost:** Everything runs on the Firebase Spark (free) tier + Gemini free tier. $0 upfront.

---

## Phase 0 — Project Foundation

**Estimated time: 1–2 days**  
Everything else depends on this. Do not skip.

---

### Step 0.1 — Install Required Packages

```bash
# Firebase
npm install firebase firebase-admin

# Google AI + Vercel AI SDK (handles streaming)
npm install ai @ai-sdk/google
npm install @google/generative-ai

# File parsing
npm install mammoth

# UI & form utilities
npm install react-dropzone
npm install react-hook-form zod @hookform/resolvers

# State management
npm install zustand
npm install @tanstack/react-query
```

---

### Step 0.2 — Set Up Firebase & Google Cloud

Follow these steps **in order:**

1. Go to [console.cloud.google.com](https://console.cloud.google.com) → Create a new project (e.g. `notes-of-tomorrow`)
2. Go to [console.firebase.google.com](https://console.firebaqse.google.com) → Add project → **link it to the GCP project above**
3. In Firebase Console:
   - **Authentication** → Sign-in methods → Enable **Google** and **Email/Password**
   - **Firestore Database** → Create database → select **Native mode** → choose a region (e.g. `us-central1`)
   - **Storage** → Get started → default rules are fine for now
4. In Firebase Console → Project Settings → **Your apps** → Add a **Web** app → copy the config object
5. In Firebase Console → Project Settings → **Service accounts** → Generate new private key → download the JSON file (for server-side Admin SDK)
6. In Google AI Studio ([aistudio.google.com](https://aistudio.google.com)) → Get API Key → copy it

---

### Step 0.3 — Create `.env.local`

Create this file in the project root. **Never commit it.**

```bash
# ─── Firebase Client (public — safe to expose) ───────────────────────
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# ─── Google AI (server-side only) ─────────────────────────────────────
GOOGLE_GENERATIVE_AI_API_KEY=

# ─── Firebase Admin SDK (server-side only) ────────────────────────────
# Copy these values from the JSON file you downloaded in Step 0.2
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

> **Tip:** The `FIREBASE_PRIVATE_KEY` must have the newlines preserved — the `\n` characters must be literal in the string. Wrap the whole value in double quotes.

---

### Step 0.4 — Firestore Data Structure

Firestore is a NoSQL document database. Our structure uses nested subcollections so each user's data is fully isolated.

```
users/
  {uid}/                          ← Profile doc (display name, plan, life context)
    books/
      {bookId}/                   ← Book metadata (title, author, category, status)
        highlights/
          {highlightId}/          ← Highlight text + vector embedding
        chat_sessions/
          {sessionId}/            ← Session metadata + situation context
            messages/
              {messageId}/        ← role, content, cited highlight IDs, feedback
```

**Document shapes:**

```typescript
// users/{uid}
{
  displayName: string,
  avatarUrl: string,
  plan: 'free' | 'pro',
  lifeContext: { goals: string[], challenges: string },
  createdAt: Timestamp
}

// users/{uid}/books/{bookId}
{
  title: string,
  author: string,
  category: 'finance' | 'intellect' | 'occupation' | 'physique' | 'social' | 'spiritual',
  rating: number,           // 1–5
  personalNote: string,
  status: 'processing' | 'ready' | 'error',
  highlightCount: number,
  sourceType: 'google_play' | 'kindle' | 'text_paste',
  createdAt: Timestamp
}

// users/{uid}/books/{bookId}/highlights/{highlightId}
{
  content: string,
  pageRef: string | null,
  position: number,
  tags: string[],
  isBookmarked: boolean,
  embedding: number[],      // 768-dim vector (text-embedding-004)
  createdAt: Timestamp
}

// users/{uid}/books/{bookId}/chat_sessions/{sessionId}
{
  sessionSituation: string,
  createdAt: Timestamp,
  updatedAt: Timestamp
}

// .../messages/{messageId}
{
  role: 'user' | 'assistant',
  content: string,
  citedHighlightIds: string[],
  feedback: 'helpful' | 'unhelpful' | null,
  createdAt: Timestamp
}
```

> **Note on Vector Search:** Firestore Vector Search requires creating a vector index on the `embedding` field. You do this from the Firebase Console or via CLI after adding the first document. More in Phase 2.

---

### Step 0.5 — Firebase Client Helpers

**`lib/firebase/client.ts`** (runs in the browser):

```typescript
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
```

**`lib/firebase/admin.ts`** (runs on the server only — API routes):

```typescript
import admin from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID!,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
      privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, "\n"),
    }),
  });
}

export const adminAuth = admin.auth();
export const adminDb = admin.firestore();
```

---

### Step 0.6 — Auth Middleware (Route Protection)

Create `middleware.ts` in the project root. This protects all `/dashboard` routes.

```typescript
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const session = request.cookies.get("session")?.value;
  const isDashboard = request.nextUrl.pathname.startsWith("/dashboard");
  const isAuthPage = ["/sign-in", "/sign-up"].includes(
    request.nextUrl.pathname,
  );

  if (isDashboard && !session) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }
  if (isAuthPage && session) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api).*)"],
};
```

> **How sessions work with Firebase:** Firebase Auth runs client-side. On login, you call your own `/api/auth/session` route which uses the Firebase Admin SDK to verify the ID token and set a secure `httpOnly` cookie. This is what the middleware reads.

**`app/api/auth/session/route.ts`**:

```typescript
import { adminAuth } from "@/lib/firebase/admin";
import { NextResponse } from "next/server";

// Called after successful client-side login to create a server session cookie
export async function POST(request: Request) {
  const { idToken } = await request.json();
  const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days

  try {
    const sessionCookie = await adminAuth.createSessionCookie(idToken, {
      expiresIn,
    });
    const response = NextResponse.json({ status: "success" });
    response.cookies.set("session", sessionCookie, {
      maxAge: expiresIn / 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });
    return response;
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

// Called on sign-out to clear the cookie
export async function DELETE() {
  const response = NextResponse.json({ status: "success" });
  response.cookies.delete("session");
  return response;
}
```

---

## Phase 1 — Authentication

**Estimated time: 1 day**

---

### Step 1.1 — Sign In Page

Wire `app/(auth)/sign-in/page.tsx` to Firebase Auth:

```typescript
"use client";
import { auth } from "@/lib/firebase/client";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { useRouter } from "next/navigation";

export default function SignInPage() {
  const router = useRouter();

  // After any successful sign-in, exchange ID token for a session cookie
  async function createSession(user: import("firebase/auth").User) {
    const idToken = await user.getIdToken();
    await fetch("/api/auth/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    });
    router.push("/dashboard");
  }

  async function handleGoogleSignIn() {
    const provider = new GoogleAuthProvider();
    const { user } = await signInWithPopup(auth, provider);
    await createSession(user);
  }

  async function handleEmailSignIn(email: string, password: string) {
    const { user } = await signInWithEmailAndPassword(auth, email, password);
    await createSession(user);
  }

  // Render your existing UI and attach these handlers
}
```

### Step 1.2 — Sign Up Page

Same pattern as Sign In, but use `createUserWithEmailAndPassword` from Firebase. On success, create a profile document in Firestore:

```typescript
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/client";

// After successful signup:
await setDoc(doc(db, "users", user.uid), {
  displayName: user.displayName ?? "",
  avatarUrl: user.photoURL ?? "",
  plan: "free",
  lifeContext: { goals: [], challenges: "" },
  createdAt: serverTimestamp(),
});
```

### Step 1.3 — Sign Out

```typescript
import { auth } from "@/lib/firebase/client";
import { signOut } from "firebase/auth";

async function handleSignOut() {
  await signOut(auth);
  await fetch("/api/auth/session", { method: "DELETE" });
  window.location.href = "/sign-in";
}
```

---

## Phase 2 — Book Upload & Parsing

**Estimated time: 2 days**  
The ingestion pipeline: file upload → parse highlights → generate embeddings → store in Firestore.

---

### Step 2.1 — File Parsers

**`lib/parsers/googlePlayParser.ts`**

```typescript
import mammoth from "mammoth";

export async function parseGooglePlayBook(buffer: Buffer): Promise<string[]> {
  const { value } = await mammoth.extractRawText({ buffer });
  const lines = value
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  // Filter out short lines, page numbers, and "Page X" headers
  return lines.filter(
    (line) =>
      line.length > 30 && !line.match(/^\d+$/) && !line.match(/^Page \d+/i),
  );
}
```

**`lib/parsers/kindleParser.ts`**

```typescript
export function parseKindleExport(text: string): string[] {
  const highlights: string[] = [];
  const sections = text.split("==========");

  for (const section of sections) {
    const lines = section.trim().split("\n").filter(Boolean);
    // Structure: [0] Book title  [1] "Your Highlight on Location X..."  [2+] Highlight
    if (
      lines.length >= 3 &&
      lines[1].toLowerCase().includes("your highlight")
    ) {
      const text = lines.slice(2).join(" ").trim();
      if (text.length > 20) highlights.push(text);
    }
  }

  return highlights;
}
```

---

### Step 2.2 — Embedding Helper (Google)

**`lib/ai/embeddings.ts`**

```typescript
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!);

export async function generateEmbedding(text: string): Promise<number[]> {
  const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
  const result = await model.embedContent(text);
  return result.embedding.values; // 768-dimensional vector
}

export async function generateEmbeddingsBatch(
  texts: string[],
): Promise<number[][]> {
  // Process in parallel batches of 10
  const results = await Promise.all(texts.map((t) => generateEmbedding(t)));
  return results;
}
```

> **Note:** Update the embedding dimension in your Firestore vector index to `768` (not 1536 like OpenAI). This is specific to Google's `text-embedding-004`.

---

### Step 2.3 — Upload API Route

**`app/api/upload/route.ts`**

```typescript
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { parseGooglePlayBook } from "@/lib/parsers/googlePlayParser";
import { parseKindleExport } from "@/lib/parsers/kindleParser";
import { generateEmbeddingsBatch } from "@/lib/ai/embeddings";
import { FieldValue } from "firebase-admin/firestore";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  // 1. Verify session
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;
  if (!session) return new Response("Unauthorized", { status: 401 });

  const { uid } = await adminAuth.verifySessionCookie(session, true);

  const formData = await request.formData();
  const file = formData.get("file") as File;
  const title = formData.get("title") as string;
  const author = formData.get("author") as string;
  const category = formData.get("category") as string;
  const note = formData.get("personal_note") as string;

  // 2. Create the book document
  const bookRef = adminDb
    .collection("users")
    .doc(uid)
    .collection("books")
    .doc();
  await bookRef.set({
    title,
    author,
    category,
    personalNote: note,
    status: "processing",
    highlightCount: 0,
    sourceType: file.name.endsWith(".docx") ? "google_play" : "kindle",
    createdAt: FieldValue.serverTimestamp(),
  });

  // 3. Parse highlights
  const buffer = Buffer.from(await file.arrayBuffer());
  let highlights: string[] = [];

  if (file.name.endsWith(".docx")) {
    highlights = await parseGooglePlayBook(buffer);
  } else if (file.name.endsWith(".txt")) {
    highlights = parseKindleExport(buffer.toString("utf-8"));
  }

  // 4. Generate embeddings and store highlights
  const BATCH = 10;
  const highlightsRef = bookRef.collection("highlights");

  for (let i = 0; i < highlights.length; i += BATCH) {
    const chunk = highlights.slice(i, i + BATCH);
    const embeddings = await generateEmbeddingsBatch(chunk);

    const firestoreBatch = adminDb.batch();
    chunk.forEach((content, j) => {
      const ref = highlightsRef.doc();
      firestoreBatch.set(ref, {
        content,
        position: i + j,
        pageRef: null,
        tags: [],
        isBookmarked: false,
        embedding: FieldValue.vector(embeddings[j]),
        createdAt: FieldValue.serverTimestamp(),
      });
    });
    await firestoreBatch.commit();
  }

  // 5. Mark book as ready
  await bookRef.update({
    status: "ready",
    highlightCount: highlights.length,
  });

  // ⚠️ After the first upload, go to Firebase Console → Firestore → Indexes
  // and create a vector index on: Collection: highlights, Field: embedding, Dimension: 768

  return Response.json({
    bookId: bookRef.id,
    highlightCount: highlights.length,
  });
}
```

### Step 2.4 — Wire the Upload UI

In `app/(dashboard)/dashboard/upload/page.tsx`:

1. Use `react-dropzone` for drag-and-drop
2. Use `react-hook-form` for the metadata fields (title, author, category, rating, personal note)
3. On submit, `POST` the file + form data to `/api/upload` as `FormData`
4. Show a loading state: "Processing your highlights…"
5. On success, redirect to `/dashboard/library/{bookId}`

---

## Phase 3 — Books & Highlights API

**Estimated time: 1 day**

---

### Step 3.1 — Books List API

**`app/api/books/route.ts`**

```typescript
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;
  if (!session) return new Response("Unauthorized", { status: 401 });

  const { uid } = await adminAuth.verifySessionCookie(session, true);
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");

  let query = adminDb
    .collection("users")
    .doc(uid)
    .collection("books")
    .where("status", "==", "ready")
    .orderBy("createdAt", "desc");

  if (category && category !== "all") {
    query = query.where("category", "==", category) as any;
  }

  const snap = await query.get();
  const books = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  return Response.json(books);
}
```

### Step 3.2 — Single Book + Highlights

**`app/api/books/[id]/route.ts`** — same pattern: verify session, get book doc, verify it belongs to the user.

**`app/api/books/[id]/highlights/route.ts`** — list the `highlights` subcollection, ordered by `position`.

### Step 3.3 — Wire Dashboard to Real Data

In `app/(dashboard)/dashboard/page.tsx`:

- Replace the mock books array with a `useQuery` call to `GET /api/books?category={activeTab}`
- Show loading skeleton cards while fetching
- Show empty state with upload CTA if the array is empty

---

## Phase 4 — Chat API with RAG (The Core Feature)

**Estimated time: 2–3 days**  
This is the most important part of the product.

---

### Step 4.1 — Firestore Vector Search

After your first upload, create a vector index in the Firebase Console:

1. Firestore → Indexes → Vector indexes → Create index
2. Collection group: `highlights`
3. Field path: `embedding`
4. Dimension: `768`

Then use it in a search helper:

**`lib/ai/search.ts`**

```typescript
import { adminDb } from "@/lib/firebase/admin";
import { generateEmbedding } from "./embeddings";
import { FieldValue } from "firebase-admin/firestore";

export async function searchHighlights(
  query: string,
  uid: string,
  bookId: string,
  limit = 6,
) {
  const embedding = await generateEmbedding(query);

  const collectionRef = adminDb
    .collection("users")
    .doc(uid)
    .collection("books")
    .doc(bookId)
    .collection("highlights");

  const result = await collectionRef.findNearest({
    vectorField: "embedding",
    queryVector: FieldValue.vector(embedding),
    limit,
    distanceMeasure: "COSINE",
  });

  return result.docs.map((d) => ({ id: d.id, ...d.data() }));
}
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
  bookTitle: string;
  bookAuthor: string;
  highlights: { content: string; pageRef?: string }[];
  sessionSituation?: string;
}) {
  const highlightBlock = highlights
    .map(
      (h, i) =>
        `[${i + 1}] "${h.content}"${h.pageRef ? ` — ${h.pageRef}` : ""}`,
    )
    .join("\n\n");

  return `You are a personal reading companion for Notes of Tomorrow.
Your job is NOT to summarize this book — it is to help the user APPLY its ideas to their actual life.

Book: ${bookTitle} by ${bookAuthor}
${sessionSituation ? `User's current situation: ${sessionSituation}` : ""}

RELEVANT HIGHLIGHTS FROM THE USER'S OWN READING:
${highlightBlock}

RULES:
1. Always ground your response in the highlights above. Do not invent content.
2. Cite highlights inline using [1], [2], etc. matching the numbers above.
3. Make your response specific to the user's situation — not generic.
4. If the user hasn't described a situation, gently ask before giving advice.
5. Be conversational, not academic. Write like a brilliant friend, not a textbook.
6. If the question can't be answered from the highlights, say so honestly.`;
}
```

---

### Step 4.3 — Chat API Route (Streaming)

**`app/api/chat/route.ts`**

```typescript
import { google } from "@ai-sdk/google";
import { streamText } from "ai";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { searchHighlights } from "@/lib/ai/search";
import { buildSystemPrompt } from "@/lib/ai/prompts";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  // 1. Auth
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;
  if (!session) return new Response("Unauthorized", { status: 401 });
  const { uid } = await adminAuth.verifySessionCookie(session, true);

  const { messages, bookId, sessionSituation } = await request.json();
  const lastMessage = messages[messages.length - 1].content;

  // 2. Get book info
  const bookDoc = await adminDb
    .collection("users")
    .doc(uid)
    .collection("books")
    .doc(bookId)
    .get();

  if (!bookDoc.exists) return new Response("Book not found", { status: 404 });
  const book = bookDoc.data()!;

  // 3. Vector search — find most relevant highlights
  const relevantHighlights = await searchHighlights(lastMessage, uid, bookId);

  // 4. Build system prompt with RAG context
  const systemPrompt = buildSystemPrompt({
    bookTitle: book.title,
    bookAuthor: book.author,
    highlights: relevantHighlights,
    sessionSituation,
  });

  // 5. Stream from Gemini
  const result = await streamText({
    model: google("gemini-1.5-pro"),
    system: systemPrompt,
    messages,
    maxTokens: 1500,
  });

  return result.toDataStreamResponse();
}
```

---

### Step 4.4 — Wire Chat UI to Real API

In `app/(dashboard)/dashboard/library/[bookId]/chat/page.tsx`:

1. **Load real data:** On mount, fetch book info + highlights via `GET /api/books/{bookId}`
2. **Replace local messages state** with the **Vercel AI SDK `useChat` hook:**

```typescript
import { useChat } from "ai/react";

const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat(
  {
    api: "/api/chat",
    body: {
      bookId,
      sessionSituation: userSituation, // from the context panel state
    },
    initialMessages: [
      {
        id: "opening",
        role: "assistant",
        content: `Hey! I've read through all ${book.highlightCount} of your highlights from **${book.title}**.\n\nBefore we dive in — what's going on in your life right now that made you want to revisit this book?`,
      },
    ],
  },
);
```

3. **Parse citation markers** from AI messages: scan for `[1]`, `[2]` etc. and render them as inline highlight quote cards.

---

### Step 4.5 — Persist Chat Messages

After `useChat` completes each exchange, save to Firestore using the `onFinish` callback:

```typescript
const { messages, ... } = useChat({
  // ...
  onFinish: async (message) => {
    await addDoc(collection(db, `users/${uid}/books/${bookId}/chat_sessions/${sessionId}/messages`), {
      role: message.role,
      content: message.content,
      createdAt: serverTimestamp(),
    });
  },
});
```

---

## Phase 5 — Final Wiring & Polish

**Estimated time: 1–2 days**

---

### Step 5.1 — Replace All Mock Data

| File                 | Replace with                                           |
| -------------------- | ------------------------------------------------------ |
| `chat/page.tsx`      | `MOCK_BOOK`, `SAMPLE_HIGHLIGHTS` → real Firestore data |
| `dashboard/page.tsx` | Mock books array → real `GET /api/books`               |
| `layout.tsx`         | Mock user name/avatar → real Firebase Auth user        |

### Step 5.2 — Loading & Error States

Every data-fetching component needs:

- **Skeleton loaders** — matching card/layout dimensions of the real content
- **Error state** — friendly message + retry button
- **Empty state** — prominent CTA to upload first book

### Step 5.3 — Register for Firestore Vector Index

After your first highlight upload, check if the vector index was created:

- Firebase Console → Firestore → Indexes → **Vector indexes**
- If it shows "Building…" wait a few minutes before testing search
- If it's not there, create it manually (collection: `highlights`, field: `embedding`, dimension: `768`)

### Step 5.4 — Mobile Responsiveness

The 3-column chat layout needs a mobile strategy:

- On screens < 768px: show one column at a time
- Use tabs or swipe navigation between highlights sidebar, document viewer, and chat
- Minimum supported width: 375px

### Step 5.5 — Deploy to Vercel

1. Push code to GitHub
2. Import the repo at [vercel.com](https://vercel.com)
3. Add all `.env.local` variables in the Vercel project Settings → Environment Variables
4. Deploy — Vercel auto-detects Next.js, no config needed

---

## Launch Checklist

Before sharing the link with anyone:

- [ ] Sign up flow works end-to-end (Google + Email)
- [ ] Auth middleware redirects unauthenticated users
- [ ] Book upload works with a real Google Play `.docx` or Kindle `.txt`
- [ ] Highlights are visible in the sidebar after upload
- [ ] Chat streams responses in real time (no full page wait)
- [ ] AI cites highlights inline in responses
- [ ] Chat history persists across browser refresh
- [ ] Firestore vector index status is "Ready" (not "Building")
- [ ] Users cannot access each other's data (test with 2 accounts)
- [ ] `.env.local` is in `.gitignore`
- [ ] All environment vars are set in Vercel

---

## Suggested Build Order

Follow this exact sequence — each step unblocks the next:

```
Phase 0 — Firebase setup, env vars, client helpers, middleware    [1–2 days]
Phase 1 — Auth (sign in, sign up, sign out, session cookie)       [1 day]
Phase 2 — Parsers + embeddings + upload API                       [2 days]
Phase 3 — Books & highlights API + wire dashboard                 [1 day]
Phase 4 — Chat API (RAG: vector search + Gemini + streaming)      [2–3 days]
Phase 4 — Wire chat UI with useChat + persist messages            [1 day]
Phase 5 — Replace mock data, loading states, errors, deploy       [1–2 days]
```

**Total estimated: ~9–12 days of focused work**

---

_Last updated: March 2026_
