// app/api/auth/register/route.js
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import argon2 from "argon2";
import prisma from "@/lib/prisma";
import { sendVerificationEmail } from "@/lib/email";
import { logEvent } from "@/lib/log"; // ✅ added for audit logging

export async function POST(req) {
  // 🔹 Step 1: Validate CSRF token
  const csrfHeader = req.headers.get("x-csrf-token");
  const csrfCookie = req.cookies.get("csrf_token")?.value;

  if (!csrfHeader || csrfHeader !== csrfCookie) {
    return NextResponse.json({ error: "CSRF validation failed" }, { status: 403 });
  }

  // 🔹 Extract client info for logs
  const ip = req.headers.get("x-forwarded-for") || null;
  const ua = req.headers.get("user-agent") || null;

  try {
    // 🔹 Step 2: Parse and validate input
    const { username, email, password } = await req.json();

    if (!username?.trim() || !email?.trim() || !password?.trim()) {
      await logEvent({ event: "register_failed_missing_fields", ip, ua });
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    if (password.length < 8) {
      await logEvent({ event: "register_failed_short_password", ip, ua });
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }

    // 🔹 Step 3: Check for existing user
    const exists = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
    });

    if (exists) {
      await logEvent({ event: "register_failed_user_exists", ip, ua });
      return NextResponse.json({ error: "User already exists" }, { status: 409 });
    }

    // 🔹 Step 4: Hash password with Argon2
    const hashed = await argon2.hash(password, {
      type: argon2.argon2id, // most secure variant
      memoryCost: 2 ** 16,
      timeCost: 3,
      parallelism: 1,
    });

    // 🔹 Step 5: Create user record
    const user = await prisma.user.create({
      data: { username, email, password: hashed },
    });

    // 🔹 Step 6: Create and store verification token
    const token = randomUUID();
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    await prisma.emailVerificationToken.create({
      data: { token, userId: user.id, expiresAt: expires },
    });

    // 🔹 Step 7: Send verification email
    const { previewUrl } = await sendVerificationEmail(email, token);

    // ✅ Log successful registration
    await logEvent({ userId: user.id, event: "register_success", ip, ua });

    // 🔹 Step 8: Return safe response
    return NextResponse.json({
      message: "Registration successful. Please check your email to verify your account.",
      previewUrl, // dev/test only
    });
  } catch (err) {
    console.error("REGISTER ERROR:", err);
    await logEvent({ event: "register_server_error", ip, ua }); // ✅ log server error
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
