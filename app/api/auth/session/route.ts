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
  } catch (error) {
    console.error("Session creation error:", error);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

// Called on sign-out to clear the cookie
export async function DELETE() {
  const response = NextResponse.json({ status: "success" });
  response.cookies.delete("session");
  return response;
}
