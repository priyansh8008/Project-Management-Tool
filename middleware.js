// middleware.js
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { verifyAccessToken } from "./lib/auth";

export async function middleware(req) {
  const url = req.nextUrl.clone();
  const pathname = url.pathname;

  // protect dashboard and API protected routes
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/api/protected")) {
    const token = req.cookies.get("a_tok")?.value;
    if (!token) {
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
    try {
      verifyAccessToken(token);
      return NextResponse.next();
    } catch (err) {
      // if expired/invalid, redirect to login (client can call refresh endpoint)
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/protected/:path*"],
};
