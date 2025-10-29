// app/api/auth/forgot-password/route.js
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import crypto from "crypto";
import { sendPasswordResetEmail } from "@/lib/email";
import { logEvent } from "@/lib/log";

export async function POST(req) {
  try {
    const { email } = await req.json();
    if (!email)
      return NextResponse.json({ error: "Email is required" }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      await logEvent({ event: "password_reset_email_not_found", ip: req.headers.get("x-forwarded-for"), ua: req.headers.get("user-agent") });
      return NextResponse.json(
        { message: "If this email exists, a reset link has been sent" },
        { status: 200 }
      );
    }

    // Delete old tokens for this user
    await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });

    // Create new secure token
    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 min

    await prisma.passwordResetToken.create({
      data: {
        token: hashedToken,
        userId: user.id,
        expiresAt,
      },
    });

    // Send email with reset link
    const { previewUrl } = await sendPasswordResetEmail(email, rawToken);

    await logEvent({ userId: user.id, event: "password_reset_email_sent" });

    return NextResponse.json({
      message: "If the email exists, a password reset link has been sent.",
      previewUrl, // only for testing in dev
    });
  } catch (err) {
    console.error("FORGOT PASSWORD ERROR", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
