// app/api/me/route.js
import { NextResponse } from "next/server";
import { verifyAccessToken } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req) {
  try {
    const token = req.cookies.get ? req.cookies.get("a_tok")?.value : null;
    if (!token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    let payload;
    try {
      payload = verifyAccessToken(token);
    } catch (e) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { id: payload.userId }, select: { id: true, email: true, username: true } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    return NextResponse.json({ user });
  } catch (err) {
    console.error("ME ERROR", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
