// app/api/auth/login/route.js
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import argon2 from "argon2";
import { generateCsrfToken } from "@/lib/csrf";
import { signAccessToken, createRefreshToken } from "@/lib/auth";
import { logEvent } from "@/lib/log";
import { loginLimiter } from "@/lib/rateLimiter"; // ✅ correct import

export async function POST(req) {
  // 🔹 Step 1: Validate CSRF token
  const csrfHeader = req.headers.get("x-csrf-token");
  const csrfCookie = req.cookies.get("csrf_token")?.value;

  if (!csrfHeader || csrfHeader !== csrfCookie) {
    return NextResponse.json({ error: "CSRF validation failed" }, { status: 403 });
  }

  // 🟢 Capture IP & User-Agent
  const ip = req.headers.get("x-forwarded-for") || "unknown";
  const ua = req.headers.get("user-agent") || "unknown";

  // 🔹 Step 2: Rate limiting (after CSRF)
  try {
    await loginLimiter.consume(ip);
  } catch {
    await logEvent({ event: "login_rate_limited", ip, ua });
    return NextResponse.json(
      { error: "Too many login attempts. Try again later." },
      { status: 429 }
    );
  }

  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      await logEvent({ event: "login_failed_missing_fields", ip, ua });
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // 🔹 Step 3: Find user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      await logEvent({ event: "login_failed_no_user", ip, ua });
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    if (!user.verified) {
      await logEvent({ userId: user.id, event: "login_blocked_unverified", ip, ua });
      return NextResponse.json({ error: "Please verify your email" }, { status: 403 });
    }

    // 🔹 Step 4: Verify password
    const isValid = await argon2.verify(user.password, password);
    if (!isValid) {
      await logEvent({ userId: user.id, event: "login_failed_bad_password", ip, ua });
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // 🧩 Login successful — reset rate limit counter
    await loginLimiter.delete(ip);
    await logEvent({ userId: user.id, event: "login_success", ip, ua });

    // 🔹 Step 5: Generate tokens
    const accessToken = signAccessToken({ userId: user.id });
    const { raw: refreshRaw, expiresAt } = await createRefreshToken(user.id, { ip, ua });

    const res = NextResponse.json({
      message: "Logged in",
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
      },
    });

    // 🔹 Step 6: Secure cookies
    const isProd = process.env.NODE_ENV === "production";
    const sameSiteMode = isProd ? "strict" : "lax";

    res.cookies.set({
      name: "a_tok",
      value: accessToken,
      httpOnly: true,
      sameSite: sameSiteMode,
      secure: isProd,
      path: "/",
      maxAge: 60 * 15,
    });

    const maxAgeSec = Math.floor((expiresAt.getTime() - Date.now()) / 1000);
    res.cookies.set({
      name: "r_tok",
      value: refreshRaw,
      httpOnly: true,
      sameSite: sameSiteMode,
      secure: isProd,
      path: "/",
      maxAge: maxAgeSec,
    });

    const csrfToken = generateCsrfToken();
    res.cookies.set({
      name: "csrf_token",
      value: csrfToken,
      httpOnly: false,
      sameSite: sameSiteMode,
      secure: isProd,
      path: "/",
    });

    return res;
  } catch (err) {
    console.error("LOGIN ERROR", err);
    await logEvent({ event: "login_server_error", ip, ua });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
