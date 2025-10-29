// app/api/auth/csrf/route.js
import { NextResponse } from "next/server";
import crypto from "crypto";

export const runtime = "nodejs";

export async function GET() {
  // 🔹 Step 1: Generate a strong CSRF token (48 chars = 192 bits)
  const csrfToken = crypto.randomBytes(24).toString("hex");

  // 🔹 Step 2: Create response with JSON for debugging/frontend use
  const res = NextResponse.json({ csrfToken });

  // 🔹 Step 3: Store CSRF token in cookie (client-readable)
  res.cookies.set({
    name: "csrf_token",
    value: csrfToken,
    httpOnly: false, // ✅ must be readable by frontend JS
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60, // 1 hour validity
  });

  return res;
}
