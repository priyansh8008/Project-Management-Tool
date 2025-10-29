// lib/log.js
import prisma from "./prisma";

export async function logEvent({ userId, event, ip, ua }) {
  try {
    const entry = await prisma.auditLog.create({
      data: {
        userId: userId || null,
        event,
        ip,
        userAgent: ua,
      },
    });
    console.log(`🧾 Logged event: '${event}' for user ${userId || "unknown"}`);
    return entry;
  } catch (err) {
    console.error("❌ Error logging event:", err.message);
  }
}
