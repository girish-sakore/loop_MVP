import { NextResponse, type NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Better Auth session cookie
  const sessionCookie =
    request.cookies.get("better-auth.session_token") ||
    request.cookies.get("__Secure-better-auth.session_token");

  const isLoggedIn = !!sessionCookie;

  const isAuthPage = pathname === "/login";
  const isGameplayRoute = pathname.startsWith("/edition");

  // Logged in users should not visit login page
  if (isAuthPage && isLoggedIn) {
    return NextResponse.redirect(
      new URL("/map", request.url)
    );
  }

  // Protect gameplay routes
  if (isGameplayRoute && !isLoggedIn) {
    const callbackUrl = encodeURIComponent(pathname);

    return NextResponse.redirect(
      new URL(`/login?callbackUrl=${callbackUrl}`, request.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|api|static|.*\\..*).*)"],
};