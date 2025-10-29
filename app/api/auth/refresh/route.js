// app/api/auth/refresh/route.js
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { 
  findRefreshTokenRecord, 
  rotateRefreshToken, 
  signAccessToken 
} from "@/lib/auth";
import prisma from "@/lib/prisma";
import { logEvent } from "@/lib/log"; // 🆕 import log helper

export async function POST(req) {
  // 🔹 Step 1: Validate CSRF token
  const csrfHeader = req.headers.get("x-csrf-token");
  const csrfCookie = req.cookies.get("csrf_token")?.value;

  if (!csrfHeader || csrfHeader !== csrfCookie) {
    return NextResponse.json({ error: "CSRF validation failed" }, { status: 403 });
  }

  try {
    const isProd = process.env.NODE_ENV === "production";
    const sameSiteMode = isProd ? "strict" : "lax";

    // 🔹 Step 2: Extract IP & UA for logging
    const ip = req.headers.get("x-forwarded-for") || null;
    const ua = req.headers.get("user-agent") || null;

    // 🔹 Step 3: Extract refresh token from cookies
    const raw = req.cookies.get("r_tok")?.value;
    if (!raw) {
      await logEvent({ event: "refresh_missing_token", ip, ua });
      return NextResponse.json({ error: "No refresh token" }, { status: 401 });
    }

    // 🔹 Step 4: Validate token record
    const rec = await findRefreshTokenRecord(raw);
    if (!rec) {
      await logEvent({ event: "refresh_invalid_token", ip, ua });
      return NextResponse.json({ error: "Invalid refresh token" }, { status: 401 });
    }

    if (rec.revoked || new Date(rec.expiresAt) < new Date()) {
      await prisma.refreshToken.updateMany({
        where: { userId: rec.userId },
        data: { revoked: true },
      });
      await logEvent({ userId: rec.userId, event: "refresh_reuse_detected", ip, ua });
      return NextResponse.json({ error: "Refresh token revoked or expired" }, { status: 401 });
    }

    // 🔹 Step 5: Rotate token (issue a new one)
    const { newRaw, expiresAt } = await rotateRefreshToken(raw, rec.userId, { ip, ua });

    const access = signAccessToken({ userId: rec.userId });
    const res = NextResponse.json({ message: "Token refreshed" });

    // 🔹 Step 6: Set new cookies securely
    res.cookies.set({
      name: "a_tok",
      value: access,
      httpOnly: true,
      sameSite: sameSiteMode,
      secure: isProd,
      path: "/",
      maxAge: 60 * 15, // 15 minutes
    });

    const maxAgeSec = Math.floor((expiresAt.getTime() - Date.now()) / 1000);
    res.cookies.set({
      name: "r_tok",
      value: newRaw,
      httpOnly: true,
      sameSite: sameSiteMode,
      secure: isProd,
      path: "/",
      maxAge: maxAgeSec,
    });

    // 🔹 Step 7: Log successful refresh
    await logEvent({ userId: rec.userId, event: "refresh_success", ip, ua });

    return res;
  } catch (err) {
    console.error("REFRESH ERROR", err);
    await logEvent({ event: "refresh_server_error", ip: req.headers.get("x-forwarded-for") || null });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
