import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { prisma, mockDb, isDatabaseConfigured } from "@/lib/db";

const JWT_SECRET = process.env.JWT_SECRET || "super-secure-jwt-secret-key-change-in-production";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || "unknown";
  const userAgent = req.headers.get("user-agent") || "unknown";
  const useDb = isDatabaseConfigured();
  const isProd = process.env.NODE_ENV === "production";

  try {
    const token = req.cookies.get("auth-token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (e) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const userId = decoded.userId;

    if (useDb) {
      await (prisma as any).session.updateMany({
        where: { userId, isActive: true },
        data: { isActive: false }
      });
      await (prisma as any).auditLog.create({
        data: { userId, action: "Google Logout All Devices", ipAddress: ip, userAgent }
      });
    } else {
      mockDb.sessions.forEach((s: any) => {
        if (s.userId === userId) s.isActive = false;
      });
      mockDb.auditLogs.unshift({
        id: crypto.randomUUID(),
        userId,
        action: "Google Logout All Devices",
        ipAddress: ip,
        userAgent,
        createdAt: new Date().toISOString()
      });
    }

    const response = NextResponse.json({ success: true, message: "Logged out from all devices" });
    
    const cookieOpts = {
      httpOnly: true,
      secure: isProd,
      sameSite: "strict" as const,
      path: "/",
      ...(isProd && { domain: ".investorbridgesolutions.in" })
    };

    response.cookies.set("auth-token", "", { ...cookieOpts, maxAge: 0 });
    response.cookies.set("refresh-token", "", { ...cookieOpts, maxAge: 0 });

    return response;
  } catch (err: any) {
    console.error("Logout all devices error:", err);
    return NextResponse.json({ error: "Logout failed" }, { status: 500 });
  }
}
