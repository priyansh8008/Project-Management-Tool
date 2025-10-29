// lib/auth.js
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { v4 as uuidv4 } from "uuid";
import prisma from "./prisma";

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const ACCESS_EXP = process.env.JWT_ACCESS_EXP || "15m";
const REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET;
const REFRESH_DAYS = parseInt(process.env.REFRESH_TOKEN_EXPIRES_DAYS || "30", 10);

// 🟢 Sign / Verify Access Tokens
export function signAccessToken(payload) {
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: ACCESS_EXP });
}

export function verifyAccessToken(token) {
  return jwt.verify(token, ACCESS_SECRET);
}

// ✅ Verify a refresh token from database
// ✅ FIXED verifyRefreshToken
export async function verifyRefreshToken(raw) {
  const tokenHash = crypto
    .createHmac("sha256", REFRESH_SECRET)
    .update(raw)
    .digest("hex");

  const record = await prisma.refreshToken.findUnique({
    where: { tokenHash },
  });

  if (!record || record.revoked || new Date(record.expiresAt) < new Date()) {
    throw new Error("Invalid or expired refresh token");
  }

  return { userId: record.userId };
}



// 🟢 Create a refresh token and store a hash in DB
export async function createRefreshToken(userId, { ip = null, ua = null } = {}) {
  // 🧹 Step 1: Revoke any previous active refresh token for this user/device
  await prisma.refreshToken.updateMany({
    where: {
      userId,
      ip,
      ua,
      revoked: false,
    },
    data: { revoked: true },
  });

  // 🆕 Step 2: Create new refresh token
  const raw = uuidv4() + "-" + crypto.randomBytes(16).toString("hex");
  const tokenHash = crypto.createHmac("sha256", REFRESH_SECRET).update(raw).digest("hex");
  const expiresAt = new Date(Date.now() + REFRESH_DAYS * 24 * 60 * 60 * 1000);

  await prisma.refreshToken.create({
    data: { tokenHash, userId, expiresAt, ip, ua },
  });

  return { raw, expiresAt };
}


// 🟢 Find a token record by raw token
export async function findRefreshTokenRecord(raw) {
  const tokenHash = crypto.createHmac("sha256", REFRESH_SECRET).update(raw).digest("hex");
  return prisma.refreshToken.findUnique({ where: { tokenHash } });
}

// 🟢 Rotate refresh token (used during token renewal)
export async function rotateRefreshToken(oldRaw, userId, { ip = null, ua = null } = {}) {
  const oldHash = crypto.createHmac("sha256", REFRESH_SECRET).update(oldRaw).digest("hex");
  const oldRec = await prisma.refreshToken.findUnique({ where: { tokenHash: oldHash } });

  // Missing => possible replay or reuse attack
  if (!oldRec) {
    await prisma.refreshToken.deleteMany({ where: { userId } });
    throw new Error("Refresh token not found (possible reuse)");
  }

  if (oldRec.revoked || new Date(oldRec.expiresAt) < new Date()) {
    await prisma.refreshToken.deleteMany({ where: { userId } });
    throw new Error("Refresh token revoked or expired");
  }

  // Create new token & delete old one
  const { raw: newRaw, expiresAt } = await createRefreshToken(userId, { ip, ua });
  await prisma.refreshToken.delete({ where: { id: oldRec.id } });

  return { newRaw, expiresAt };
}
// 🧹 Delete old or revoked refresh tokens (housekeeping)
export async function cleanupOldTokens() {
  const now = new Date();

  const result = await prisma.refreshToken.deleteMany({
    where: {
      OR: [
        { revoked: true },
        { expiresAt: { lt: now } },
      ],
    },
  });

  console.log(`🧽 Cleanup complete — deleted ${result.count} old/revoked tokens`);
  return result.count;
}


// 🟢 Revoke (delete) a single refresh token
export async function revokeRefreshToken(rawToken) {
  try {
    const tokenHash = crypto
      .createHmac("sha256", REFRESH_SECRET)
      .update(rawToken)
      .digest("hex");

    const deleted = await prisma.refreshToken.deleteMany({
      where: { tokenHash },
    });

    console.log(`🗑️ Refresh token deleted: ${deleted.count}`);
    return deleted;
  } catch (err) {
    console.error("❌ Error revoking token:", err);
  }
}


// 🟢 Revoke (delete) all refresh tokens for a user
export async function revokeAllRefreshTokensForUser(userId) {
  const deleted = await prisma.refreshToken.deleteMany({ where: { userId } });
  console.log(`🗑️ All refresh tokens deleted for user ${userId} (${deleted.count})`);
  return deleted.count;
}
