import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { collection, getDocs, orderBy, query } from "firebase/firestore";

export const maxDuration = 60;

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

  // 3. Fetch highlights from Firestore
  const hSnap = await adminDb
    .collection("users").doc(uid)
    .collection("books").doc(bookId)
    .collection("highlights")
    .orderBy("position")
    .limit(200)
    .get();

  const allHighlights = hSnap.docs.map((d) => d.data().content as string);

  // 4. Simple keyword relevance filter (no embeddings needed)
  const keywords = message.toLowerCase().split(/\s+/).filter((w: string) => w.length > 3);
  const relevant = allHighlights
    .filter((h) => keywords.some((kw: string) => h.toLowerCase().includes(kw)))
    .slice(0, 15);

  // Fall back to first 15 if nothing matched
  const highlightsToUse = relevant.length >= 3 ? relevant : allHighlights.slice(0, 15);

  // 5. Fetch book info
  const bookSnap = await adminDb
    .collection("users").doc(uid)
    .collection("books").doc(bookId)
    .get();

  const book = bookSnap.data();
  const bookTitle = book?.title ?? "this book";
  const bookAuthor = book?.author ?? "the author";

  // 6. Build Gemini prompt
  const systemPrompt = `You are a thoughtful book assistant for "Notes of Tomorrow". 
The user has uploaded their highlights from "${bookTitle}" by ${bookAuthor}.
Your job is to have a deep, personal conversation with them using ONLY their highlights as your source material.

Rules:
- Only reference ideas that appear in the highlights below
- Be conversational, warm, and insightful — not academic
- Use **bold** for key concepts
- Keep responses concise (2-4 paragraphs max)
- Do not make up quotes or page numbers

${context ? `User's personal context: ${context}\n` : ""}

HIGHLIGHTS FROM THE BOOK:
${highlightsToUse.map((h, i) => `${i + 1}. "${h}"`).join("\n")}`;

  const conversationHistory = (history ?? [])
    .map((m: { role: string; content: string }) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
    .join("\n");

  const fullPrompt = `${systemPrompt}

${conversationHistory ? `Previous conversation:\n${conversationHistory}\n` : ""}
User: ${message}
Assistant:`;

  // 7. Stream Gemini response
  try {
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || "");
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

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

    return new Response(stream, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (err: unknown) {
    console.error("Chat API error:", err);

    // Graceful fallback: return a keyword-search-based response without AI
    const fallbackResponse = highlightsToUse.length > 0
      ? `Here are the most relevant highlights from **${bookTitle}** based on your question:\n\n${
          highlightsToUse.slice(0, 5).map((h) => `• "${h}"`).join("\n\n")
        }\n\n*(Note: AI responses are temporarily unavailable. Showing matching highlights instead.)*`
      : `I couldn't find highlights matching your question in **${bookTitle}**. Try rephrasing or asking about a different topic from the book.`;

    return new Response(fallbackResponse, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
}
