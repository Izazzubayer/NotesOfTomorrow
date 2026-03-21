import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

// PATCH /api/books/[id] — update personal note
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

  const { id } = await params;
  const body = await request.json();

  const bookRef = adminDb.collection("users").doc(uid).collection("books").doc(id);
  const snap = await bookRef.get();
  if (!snap.exists) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updateData: Record<string, unknown> = {};
  if (body.personalNote !== undefined) updateData.personalNote = body.personalNote;
  if (body.rating !== undefined) updateData.rating = body.rating;

  await bookRef.update(updateData);
  return NextResponse.json({ status: "ok" });
}

// GET /api/books/[id] — fetch single book
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

  const { id } = await params;
  const snap = await adminDb.collection("users").doc(uid).collection("books").doc(id).get();

  if (!snap.exists) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ id: snap.id, ...snap.data() });
}
