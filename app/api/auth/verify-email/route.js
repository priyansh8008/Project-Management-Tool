// app/api/auth/verify-email/route.js
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { logEvent } from "@/lib/log"; // ✅ added for audit logging

export async function GET(req) {
  // 🔹 Extract client info for logging
  const ip = req.headers.get("x-forwarded-for") || null;
  const ua = req.headers.get("user-agent") || null;

  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
      await logEvent({ event: "email_verify_failed_no_token", ip, ua });
      return NextResponse.json(
        { error: "Missing verification token" },
        { status: 400 }
      );
    }

    // 🔹 Find token in database
    const record = await prisma.emailVerificationToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!record) {
      await logEvent({ event: "email_verify_failed_invalid_token", ip, ua });
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 400 }
      );
    }

    // 🔹 Check if token expired
    if (record.expiresAt < new Date()) {
      await logEvent({
        userId: record.userId,
        event: "email_verify_failed_expired_token",
        ip,
        ua,
      });
      return NextResponse.json(
        { error: "Verification token expired" },
        { status: 400 }
      );
    }

    // 🔹 Mark user as verified
    await prisma.user.update({
      where: { id: record.userId },
      data: { verified: true },
    });

    // 🔹 Delete used token
    await prisma.emailVerificationToken.delete({
      where: { id: record.id },
    });

    // ✅ Log success
    await logEvent({
      userId: record.userId,
      event: "email_verify_success",
      ip,
      ua,
    });

    // 🔹 Redirect to success page
    return NextResponse.redirect("http://localhost:3000/verified-success");
  } catch (error) {
    console.error("Error verifying email:", error);
    await logEvent({
      event: "email_verify_server_error",
      ip,
      ua,
    });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
