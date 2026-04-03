import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { generateEmbedding } from "@/lib/ai/embeddings";
import { FieldValue } from "firebase-admin/firestore";

export const maxDuration = 300;

export async function POST(request: Request) {
  // 1. Auth
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

  // 2. Parse body
  const { bookId, message, context, history } = await request.json();
  if (!bookId || !message) {
    return NextResponse.json({ error: "Missing bookId or message" }, { status: 400 });
  }

  // 3. Fetch book info
  const bookSnap = await adminDb
    .collection("users").doc(uid)
    .collection("books").doc(bookId)
    .get();

  const book = bookSnap.data();
  const bookTitle = book?.title ?? "this book";
  const bookAuthor = book?.author ?? "the author";

  // 4. Vector search — find the most semantically relevant highlights
  // We now collect full docs so we can return IDs to the client for citation chips
  type HighlightDoc = { id: string; content: string; pageRef?: string };
  let retrievedDocs: HighlightDoc[] = [];
  let usedVectorSearch = false;

  try {
    const queryEmbedding = await generateEmbedding(message);
    const highlightsRef = adminDb
      .collection("users").doc(uid)
      .collection("books").doc(bookId)
      .collection("highlights");

    const vectorQuery = highlightsRef.findNearest({
      vectorField: "embedding",
      queryVector: FieldValue.vector(queryEmbedding),
      limit: 12,
      distanceMeasure: "COSINE",
    });

    const vectorResults = await vectorQuery.get();
    retrievedDocs = vectorResults.docs
      .map((d: FirebaseFirestore.QueryDocumentSnapshot) => ({
        id: d.id,
        content: d.data().content as string,
        pageRef: d.data().pageRef as string | undefined,
      }))
      .filter((h: HighlightDoc) => Boolean(h.content));

    usedVectorSearch = retrievedDocs.length > 0;
  } catch (vecErr) {
    console.warn("Vector search failed, falling back to keyword search:", vecErr);
  }

  // 5. Fallback: keyword search if vector search failed or returned nothing
  if (!usedVectorSearch) {
    const hSnap = await adminDb
      .collection("users").doc(uid)
      .collection("books").doc(bookId)
      .collection("highlights")
      .orderBy("position")
      .limit(200)
      .get();

    const allDocs: HighlightDoc[] = hSnap.docs.map((d: any) => ({
      id: d.id,
      content: d.data().content as string,
      pageRef: d.data().pageRef as string | undefined,
    }));

    const keywords = message.toLowerCase().split(/\s+/).filter((w: string) => w.length > 3);
    const relevant = allDocs.filter((h) =>
      keywords.some((kw: string) => h.content.toLowerCase().includes(kw))
    ).slice(0, 12);

    retrievedDocs = relevant.length >= 3 ? relevant : allDocs.slice(0, 12);
  }

  const highlightsToUse = retrievedDocs.map((d) => d.content);

  // 6. Build Gemini prompt with the retrieved highlights
  const systemPrompt = `You are a thoughtful book companion for "Notes of Tomorrow".
The user has uploaded their personal highlights from "${bookTitle}" by ${bookAuthor}.
Your entire knowledge of this book comes from these highlights — do NOT invent content beyond them.

Your job: help the user APPLY the ideas in this book to their actual life situation.

Rules:
- Ground every insight in the highlights below — cite ideas inline, e.g. "As Frankl writes, [idea from highlight]"
- Use **bold** for key concepts and named ideas
- Be warm, conversational, and specific — not generic or academic
- Keep responses focused: 2-4 paragraphs max
- If the user hasn't shared what's going on in their life, gently ask before giving advice
- If a question can't be answered from the highlights, say so honestly
- When citing highlights, use [1], [2], etc. corresponding to the numbered list below

${context ? `User's personal context: ${context}\n` : ""}
MOST RELEVANT HIGHLIGHTS (${usedVectorSearch ? "selected by semantic search" : "keyword match"}):
${highlightsToUse.map((h, i) => `[${i + 1}] "${h}"`).join("\n\n")}`;

  const conversationHistory = (history ?? [])
    .map((m: { role: string; content: string }) =>
      `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`
    )
    .join("\n");

  const fullPrompt = `${systemPrompt}

${conversationHistory ? `Previous conversation:\n${conversationHistory}\n` : ""}
User: ${message}
Assistant:`;

  // Serialize citations so the client can map [1][2] chips to real highlight IDs
  const citedMeta = retrievedDocs.map((d) => ({
    id: d.id,
    text: d.content,
    page: d.pageRef ? `p.${d.pageRef}` : "",
  }));

  // 7. Stream Gemini response
  try {
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || "");
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const result = await model.generateContentStream(fullPrompt);

    const stream = new ReadableStream({
      async start(controller) {
        for await (const chunk of result.stream) {
          const text = chunk.text();
          if (text) controller.enqueue(new TextEncoder().encode(text));
        }
        controller.close();
      },
    });

    // Return citations as a header so the client gets them before the stream starts
    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "X-Cited-Highlights": JSON.stringify(citedMeta),
        "Access-Control-Expose-Headers": "X-Cited-Highlights",
      },
    });
  } catch (err: unknown) {
    console.error("Chat API error:", err);

    const fallbackResponse =
      highlightsToUse.length > 0
        ? `Here are the most relevant highlights from **${bookTitle}**:\n\n${
            highlightsToUse
              .slice(0, 5)
              .map((h) => `> "${h}"`)
              .join("\n\n")
          }\n\n*(AI temporarily unavailable — showing matched highlights instead.)*`
        : `I couldn't find highlights relevant to your question in **${bookTitle}**. Try rephrasing!`;

    return new Response(fallbackResponse, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
}
