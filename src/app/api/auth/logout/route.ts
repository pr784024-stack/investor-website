import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { prisma, mockDb, isDatabaseConfigured } from "@/lib/db";

const JWT_SECRET = process.env.JWT_SECRET || "super-secure-jwt-secret-key-change-in-production";

async function createAuditLog(userId: string | null, action: string, ip: string, userAgent: string) {
  const useDb = isDatabaseConfigured();
  if (useDb) {
    try {
      await (prisma as any).auditLog.create({
        data: { userId, action, ipAddress: ip, userAgent }
      });
    } catch (e) {
      console.error(e);
    }
  } else {
    mockDb.auditLogs.unshift({
      id: crypto.randomUUID(),
      userId, action, ipAddress: ip, userAgent,
      createdAt: new Date().toISOString()
    });
  }
}

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

    // Get current device fingerprint from userAgent + IP
    const deviceFingerprint = crypto.createHash("sha256")
      .update(ip + userAgent)
      .digest("hex");

    if (useDb) {
      // Find and invalidate only this device's session
      const session = await (prisma as any).session.findFirst({
        where: {
          userId,
          deviceId: deviceFingerprint,
          isActive: true
        }
      });

      if (session) {
        await (prisma as any).session.update({
          where: { id: session.id },
          data: { isActive: false }
        });
      }

      await (prisma as any).auditLog.create({
        data: { userId, action: "Google Logout", ipAddress: ip, userAgent }
      });
    } else {
      // Find and deactivate current device session in mock DB
      const sessionIndex = mockDb.sessions.findIndex((s: any) =>
        s.userId === userId && s.deviceId === deviceFingerprint && s.isActive
      );

      if (sessionIndex !== -1) {
        mockDb.sessions[sessionIndex].isActive = false;
      }

      mockDb.auditLogs.unshift({
        id: crypto.randomUUID(),
        userId,
        action: "Google Logout",
        ipAddress: ip,
        userAgent,
        createdAt: new Date().toISOString()
      });
    }

    const response = NextResponse.json({ success: true, message: "Logged out from current device" });

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
    console.error("Logout error:", err);
    return NextResponse.json({ error: "Logout failed" }, { status: 500 });
  }
}
