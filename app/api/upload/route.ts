import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { parseGooglePlayBook, extractGooglePlayMeta } from "@/lib/parsers/googlePlayParser";
import { parseKindleExport, extractKindleMeta } from "@/lib/parsers/kindleParser";
import { generateEmbeddingsBatch } from "@/lib/ai/embeddings";
import { FieldValue } from "firebase-admin/firestore";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const maxDuration = 300;

// ── Google Books API: fetch cover + category ──────────────────────────────
async function fetchBookMetadata(
  title: string,
  author: string
): Promise<{ coverUrl: string; category: string }> {
  try {
    const query = encodeURIComponent(`${title} ${author}`);
    const res = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=${query}&maxResults=1`
    );
    const data = await res.json();
    const item = data.items?.[0];
    if (!item) return { coverUrl: "", category: "intellect" };

    const info = item.volumeInfo;
    const coverUrl: string =
      info.imageLinks?.thumbnail?.replace("http://", "https://") ?? "";

    const CATEGORY_MAP: Record<string, string> = {
      business: "finance", finance: "finance", economics: "finance", investing: "finance",
      "self-help": "intellect", psychology: "intellect", philosophy: "intellect", science: "intellect",
      technology: "occupation", career: "occupation",
      health: "physique", fitness: "physique", sports: "physique",
      relationships: "social", communication: "social",
      religion: "spiritual", spirituality: "spiritual", mindfulness: "spiritual",
    };

    const rawCategories: string[] = info.categories ?? [];
    let category = "intellect";
    for (const raw of rawCategories) {
      const lower = raw.toLowerCase();
      for (const [key, val] of Object.entries(CATEGORY_MAP)) {
        if (lower.includes(key)) { category = val; break; }
      }
      if (category !== "intellect") break;
    }

    return { coverUrl, category };
  } catch {
    return { coverUrl: "", category: "intellect" };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
export async function POST(request: Request) {
  // 1. Verify session
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let uid: string;
  try {
    const decoded = await adminAuth.verifySessionCookie(session, true);
    uid = decoded.uid;
  } catch {
    return NextResponse.json({ error: "Invalid session" }, { status: 401 });
  }

  // 2. Get the file
  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

  // 3. Parse highlights + extract metadata directly from the file (no AI API needed)
  let highlights: string[] = [];
  let title = "";
  let author = "";
  const sourceType = file.name.endsWith(".docx") ? "google_play" : "kindle";

  try {
    const buffer = Buffer.from(await file.arrayBuffer());

    if (file.name.endsWith(".docx")) {
      highlights = await parseGooglePlayBook(buffer);
      const meta = await extractGooglePlayMeta(buffer);
      title = meta.title;
      author = meta.author;
    } else if (file.name.endsWith(".txt")) {
      const text = buffer.toString("utf-8");
      highlights = parseKindleExport(text);
      const meta = extractKindleMeta(text);
      title = meta.title;
      author = meta.author;
    } else {
      return NextResponse.json(
        { error: "Unsupported file type. Use .docx (Google Play) or .txt (Kindle)" },
        { status: 400 }
      );
    }
  } catch (err) {
    console.error("Parse error:", err);
    return NextResponse.json({ error: "Failed to parse file" }, { status: 500 });
  }

  if (highlights.length === 0) {
    return NextResponse.json(
      { error: "No highlights found in this file. Make sure you exported your highlights, not the full book." },
      { status: 400 }
    );
  }

  // Fallback: derive title from filename if not found in file
  if (!title) {
    title = file.name.replace(/\.(txt|docx|pdf)$/i, "").replace(/[_\-]+/g, " ").trim() || "Untitled Book";
  }
  if (!author) author = "Unknown Author";

  // 4. Fetch cover + category from Google Books (free, no key needed)
  const { coverUrl, category } = await fetchBookMetadata(title, author);

  // 5. Create Firestore book doc
  const bookRef = adminDb.collection("users").doc(uid).collection("books").doc();
  await bookRef.set({
    title,
    author,
    category,
    coverUrl,
    personalNote: "",
    rating: 0,
    status: "processing",
    highlightCount: 0,
    sourceType,
    createdAt: FieldValue.serverTimestamp(),
  });

  // 6. Store highlights with embeddings (10 at a time → free tier safe)
  try {
    const highlightsRef = bookRef.collection("highlights");
    const EMBED_BATCH = 10; // Google AI free tier: 1500 req/min — 10 at a time is very safe

    for (let i = 0; i < highlights.length; i += EMBED_BATCH) {
      const chunk = highlights.slice(i, i + EMBED_BATCH);

      // Generate embeddings for this chunk (parallel within the chunk)
      let embeddings: number[][] = [];
      try {
        embeddings = await generateEmbeddingsBatch(chunk);
      } catch (embErr) {
        console.warn(`Embedding batch ${i}–${i + EMBED_BATCH} failed, storing without vectors:`, embErr);
        // Fall back: store without embeddings — keyword search still works
        embeddings = chunk.map(() => []);
      }

      // Write this chunk to Firestore as one batch
      const firestoreBatch = adminDb.batch();
      chunk.forEach((content, j) => {
        const ref = highlightsRef.doc();
        const docData: Record<string, unknown> = {
          content,
          position: i + j,
          pageRef: null,
          tags: [],
          isBookmarked: false,
          createdAt: FieldValue.serverTimestamp(),
        };
        // Only store the vector field if we actually got an embedding
        if (embeddings[j]?.length > 0) {
          docData.embedding = FieldValue.vector(embeddings[j]);
        }
        firestoreBatch.set(ref, docData);
      });
      await firestoreBatch.commit();
    }

    await bookRef.update({ status: "ready", highlightCount: highlights.length });

    return NextResponse.json({
      bookId: bookRef.id,
      title,
      author,
      category,
      coverUrl,
      highlightCount: highlights.length,
    });
  } catch (err) {
    console.error("Storage error:", err);
    await bookRef.update({ status: "error" });
    return NextResponse.json({ error: "Failed to save highlights" }, { status: 500 });
  }
}
