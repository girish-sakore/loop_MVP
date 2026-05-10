import { auth } from "@/lib/auth";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // 1. Get the session (fast optimistic check)
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  const { pathname } = request.nextUrl;

  // 2. Define Route Categories
  // These are the URL paths, not the folder names in parentheses
  const isPublicRoute = ["/", "/login", "/pricing"].includes(pathname);
  const isAuthPage = pathname === "/login";
  const isGameplayRoute = pathname.startsWith("/edition");

  // Logic A: If user is logged in, don't let them go back to /login
  if (isAuthPage && session) {
    return NextResponse.redirect(new URL("/edition/current", request.url));
  }

  // Logic B: If user is NOT logged in and tries to access gameplay
  if (isGameplayRoute && !session) {
    const callbackUrl = encodeURIComponent(pathname);
    return NextResponse.redirect(
      new URL(`/login?callbackUrl=${callbackUrl}`, request.url)
    );
  }

  // Logic C: Marketing pages (/, /pricing) are accessible to everyone
  return NextResponse.next();
}

export const config = {
  // Matcher ignores internal Next.js files and static assets for speed
  matcher: ["/((?!_next|api|static|.*\\..*).*)"],
};