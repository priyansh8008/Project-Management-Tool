// middleware.js
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { verifyAccessToken } from "./lib/auth";

const NON_AUTH_ROUTES = ["/login", "/register", "/forgot-password", "/reset-password","/"];

export async function middleware(req) {
  const url = req.nextUrl.clone();
  const pathname = url.pathname;

  const token = req.cookies.get("a_tok")?.value;

  // ✅ 1. If user is logged in, block access to login/register pages
  if (NON_AUTH_ROUTES.includes(pathname)) {
    if (token) {
      try {
        verifyAccessToken(token);
        url.pathname = "/dashboard"; // redirect to dashboard
        return NextResponse.redirect(url);
      } catch {
        // token is invalid → let user see login/register pages
      }
    }
    return NextResponse.next();
  }

  // ✅ 2. If user tries to access protected pages without token → redirect to login
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/api/protected")) {
    if (!token) {
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }

    try {
      verifyAccessToken(token);
      return NextResponse.next();
    } catch {
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/dashboard",
    "/api/protected/:path*",
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
    "/",
  ],
};
