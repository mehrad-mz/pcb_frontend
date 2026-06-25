import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { getAccessTokenFromCookieHeader } from "@/lib/api/tokens";

const PROTECTED_PATHS = ["/order", "/set-password"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );

  if (!isProtected) {
    return NextResponse.next();
  }

  const accessToken = getAccessTokenFromCookieHeader(
    request.headers.get("cookie")
  );

  if (!accessToken) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/order/:path*", "/set-password/:path*"],
};
