// app/api/auth/logout/route.js
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { revokeRefreshToken, verifyRefreshToken } from "@/lib/auth";
import { logEvent } from "@/lib/log";

export async function POST(req) {
  try {
    // 🔹 Step 1: Validate CSRF
    const cookieHeader = req.headers.get("cookie") || "";
    const csrfHeader = req.headers.get("x-csrf-token");

    // Extract csrf_token value manually from cookie header
    const csrfCookieMatch = cookieHeader.match(/csrf_token=([^;]+)/);
    const csrfCookie = csrfCookieMatch ? decodeURIComponent(csrfCookieMatch[1]) : null;

    if (!csrfHeader || !csrfCookie || csrfHeader !== csrfCookie) {
      console.warn("⚠️ CSRF validation failed", { csrfHeader, csrfCookie });
      return NextResponse.json({ error: "CSRF validation failed" }, { status: 403 });
    }

    const isProd = process.env.NODE_ENV === "production";
    const sameSiteMode = isProd ? "strict" : "lax";

    // 🔹 Step 2: Extract IP & User-Agent (for logging)
    const ip = req.headers.get("x-forwarded-for") || null;
    const ua = req.headers.get("user-agent") || null;

    // 🔹 Step 3: Extract refresh token (to identify user)
    const cookieMatch = cookieHeader.match(/r_tok=([^;]+)/);
    const raw = cookieMatch ? decodeURIComponent(cookieMatch[1]) : null;
    let userId = null;

    if (raw) {
      console.log("🚀 Revoking refresh token:", raw.slice(0, 8) + "...");
      try {
        const decoded = await verifyRefreshToken(raw);
        userId = decoded?.userId || null;
      } catch {
        console.warn("⚠️ Could not verify refresh token before revoking");
      }
      await revokeRefreshToken(raw);
    } else {
      console.warn("⚠️ No refresh token found during logout");
    }

    // 🔹 Step 4: Log the event
    await logEvent({ userId, event: "logout", ip, ua });

    // 🔹 Step 5: Prepare response & clear cookies
    const res = NextResponse.json({ message: "Logged out" });

    res.cookies.set({
      name: "a_tok",
      value: "",
      httpOnly: true,
      sameSite: sameSiteMode,
      secure: isProd,
      path: "/",
      maxAge: 0,
    });

    res.cookies.set({
      name: "r_tok",
      value: "",
      httpOnly: true,
      sameSite: sameSiteMode,
      secure: isProd,
      path: "/",
      maxAge: 0,
    });

    res.cookies.set({
      name: "csrf_token",
      value: "",
      httpOnly: false,
      sameSite: sameSiteMode,
      secure: isProd,
      path: "/",
      maxAge: 0,
    });

    return res;
  } catch (err) {
    console.error("❌ LOGOUT ERROR", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
