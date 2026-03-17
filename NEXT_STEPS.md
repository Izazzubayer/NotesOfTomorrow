# Notes of Tomorrow — Implementation Roadmap (Google Stack Edition)

**Written:** March 2026  
**Status:** UI prototype complete. Backend pivoting to **Google Ecosystem**.  
**Goal:** Use Google Auth, Firestore (Vector Search), and Gemini for a fully Google-native MVP.

---

## Current State

The UI shell is complete:
- Landing page (`/`)
- Dashboard with mock books (`/dashboard`)
- Book chat interface with mock data (`/dashboard/library/[bookId]/chat`)
- Auth pages exist but are not connected.
- Data is currently hardcoded.

**The Pivot:** We are moving away from Supabase/Anthropic to **Google Cloud, Firebase, and Gemini**.

---

## Phase 0 — Project Foundation

**Estimated time: 1–2 days**  

---

### Step 0.1 — Install Required Packages

```bash
# Firebase & Google AI
npm install firebase firebase-admin
npm install ai @ai-sdk/google
npm install @google/generative-ai

# Parsers & Utils
npm install mammoth
npm install react-dropzone
npm install zustand
npm install @tanstack/react-query
npm install react-hook-form zod @hookform/resolvers
```

---

### Step 0.2 — Set Up Google Cloud & Firebase

1. Create a project in the [Google Cloud Console](https://console.cloud.google.com/).
2. Enable the **Generative AI API** (Vertex AI).
3. Create a project in the [Firebase Console](https://console.firebase.google.com/) (link it to your GCP project).
4. **Authentication:** Enable Google Sign-In and Email/Password.
5. **Firestore:** Create a database in **Native Mode**.
6. **Storage:** Enable Firebase Storage for PDF/file uploads.

---

### Step 0.3 — Create `.env.local`

```bash
# Firebase Client (Public)
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...

# Google AI (Server)
GOOGLE_GENERATIVE_AI_API_KEY=...

# Firebase Admin (Server)
FIREBASE_PROJECT_ID=...
FIREBASE_CLIENT_EMAIL=...
FIREBASE_PRIVATE_KEY="---BEGIN PRIVATE KEY---\n..."
```

---

### Step 0.4 — Database Structure (Firestore)

Since we are using Firestore, we use Collections and Documents. **Firestore now supports Vector Search** which we will use for RAG.

**Collections:**
- `users/{uid}`: Profile data, life context.
- `users/{uid}/books/{bookId}`: Book metadata.
- `users/{uid}/books/{bookId}/highlights/{highlightId}`: Highlight text + **vector embedding field**.
- `users/{uid}/books/{bookId}/chat_sessions/{sessionId}`: Session metadata.
- `users/{uid}/books/{bookId}/chat_sessions/{sessionId}/messages/{msgId}`: Chat history.

---

### Step 0.5 — Create Firebase Client Helpers

**`lib/firebase/client.ts`**:
```typescript
import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);
export const db = getFirestore(app);
```

**`lib/firebase/admin.ts`** (Server-side):
```typescript
import admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

export const adminAuth = admin.auth();
export const adminDb = admin.firestore();
```

---

## Phase 1 — Authentication (Google Auth)

**Estimated time: 1 day**  

---

### Step 1.1 — Sign Up / Sign In Page

Use the `signInWithPopup` or `signInWithEmailAndPassword` from `firebase/auth`.

```typescript
'use client'
import { auth } from '@/lib/firebase/client';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

export default function SignInPage() {
  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
    window.location.href = '/dashboard';
  };
  // ... render UI
}
```

---

## Phase 2 — Book Ingestion (Gemini & Firestore)

**Estimated time: 2 days**

---

### Step 2.1 — Embedding Helper (Google)

**`lib/ai/embeddings.ts`**
```typescript
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!);

export async function generateEmbedding(text: string) {
  const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
  const result = await model.embedContent(text);
  return result.embedding.values;
}
```

---

### Step 2.2 — Upload API (RAG Setup)

When a user uploads a book:
1. Parse text (using `mammoth` for `.docx`).
2. Generate embeddings for each highlight.
3. Save to Firestore under the user's book collection.

---

## Phase 3 — Chat API (Gemini RAG)

**Estimated time: 2 days**

---

### Step 3.1 — Chat API Route

**`app/api/chat/route.ts`**
```typescript
import { google } from '@ai-sdk/google';
import { streamText } from 'ai';
import { generateEmbedding } from '@/lib/ai/embeddings';
// Add Firestore search logic here...

export async function POST(req: Request) {
  const { messages, bookId } = await req.json();
  const lastMessage = messages[messages.length - 1].content;

  // 1. Vector Search in Firestore (search 'highlights' subcollection)
  // 2. Build context
  // 3. Stream from Gemini

  const result = await streamText({
    model: google('gemini-1.5-pro'),
    system: 'You are a reading companion. Apply the book insights to the user life...',
    messages,
  });

  return result.toDataStreamResponse();
}
```

---

## Phase 4 — Polish & Deploy

- Use **Firebase Hosting** or **Vercel** (with Google Cloud env vars).
- Ensure **Google Pro** API limits are handled (quota management).

---
_Last updated: March 2026 to reflect Google Tech Stack_
