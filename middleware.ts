import { NextRequest, NextResponse } from "next/server";

function isPublicFile(pathname: string): boolean {
  return pathname === "/favicon.ico" || pathname === "/robots.txt" || pathname === "/sitemap.xml";
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Never rewrite Next internals or API.
  if (pathname.startsWith("/api") || pathname.startsWith("/_next") || isPublicFile(pathname)) {
    return NextResponse.next();
  }

  const host = (request.headers.get("host") || "").toLowerCase();

  // Route www -> marketing site (served from /marketing/* internally).
  if (host.startsWith("www.")) {
    if (pathname.startsWith("/marketing")) {
      return NextResponse.next();
    }

    const url = request.nextUrl.clone();
    url.pathname = pathname === "/" ? "/marketing" : `/marketing${pathname}`;
    return NextResponse.rewrite(url);
  }

  // Keep ai.* on app. If someone hits /marketing on ai, send them to www.
  if (host.startsWith("ai.")) {
    if (pathname === "/marketing" || pathname.startsWith("/marketing/")) {
      const url = request.nextUrl.clone();
      url.hostname = "www.scalex.my";
      url.pathname = pathname.replace(/^\/marketing/, "") || "/";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/:path*"],
};
