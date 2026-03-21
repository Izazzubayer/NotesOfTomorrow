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
