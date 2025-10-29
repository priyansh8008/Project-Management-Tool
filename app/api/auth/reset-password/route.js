// app/api/auth/reset-password/route.js
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import crypto from "crypto";
import argon2 from "argon2";
import { logEvent } from "@/lib/log";

export async function POST(req) {
  try {
    const { token, newPassword } = await req.json();

    if (!token || !newPassword)
      return NextResponse.json(
        { error: "Token and new password required" },
        { status: 400 }
      );

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const resetRecord = await prisma.passwordResetToken.findUnique({
      where: { token: hashedToken },
    });

    if (!resetRecord || resetRecord.expiresAt < new Date()) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 400 }
      );
    }

    // Hash the new password
    const hashedPassword = await argon2.hash(newPassword);

    await prisma.user.update({
      where: { id: resetRecord.userId },
      data: { password: hashedPassword },
    });

    // Delete the reset token
    await prisma.passwordResetToken.delete({
      where: { id: resetRecord.id },
    });

    await logEvent({ userId: resetRecord.userId, event: "password_reset_success" });

    return NextResponse.json({ message: "Password has been reset successfully" });
  } catch (err) {
    console.error("RESET PASSWORD ERROR", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
