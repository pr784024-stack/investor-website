import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma, mockDb, isDatabaseConfigured } from "@/lib/db";
import { checkRateLimit } from "@/lib/rate-limit";

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

  const rateLimitKey = `token-refresh-${ip}`;
  const rateLimitResult = checkRateLimit(rateLimitKey, {
    maxRequests: 20,
    windowMs: 60 * 1000
  });

  if (!rateLimitResult.allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  try {
    const refreshToken = req.cookies.get("refresh-token")?.value || (await req.json().catch(() => ({}))).refreshToken;

    if (!refreshToken) {
      return NextResponse.json({ error: "Refresh token is required" }, { status: 401 });
    }

    let session: any = null;
    let user: any = null;

    if (useDb) {
      // Find all sessions containing the old token
      const sessions = await (prisma as any).session.findMany({
        where: { isActive: true },
        include: { user: true }
      });

      for (const sess of sessions) {
        const isValid = await bcrypt.compare(refreshToken, sess.refreshTokenHash);
        if (isValid) {
          session = sess;
          user = sess.user;
          break;
        }
      }

      if (!session) {
        // REUSE DETECTION LOGIC: Token not found in active sessions.
        // It might be an old/rotated token.
        // Let's check inactive sessions to see if it matches
        const inactiveSessions = await (prisma as any).session.findMany({
          where: { isActive: false },
          include: { user: true }
        });
        
        for (const sess of inactiveSessions) {
          const isOldValid = await bcrypt.compare(refreshToken, sess.refreshTokenHash);
          if (isOldValid) {
            // REUSE DETECTED!
            user = sess.user;
            await createAuditLog(user.id, "Refresh Token Reuse Detected", ip, userAgent);
            // Kill ALL active sessions for this user
            await (prisma as any).session.updateMany({
              where: { userId: user.id, isActive: true },
              data: { isActive: false }
            });
            break;
          }
        }

        const res = NextResponse.json({ error: "Invalid or expired refresh token" }, { status: 401 });
        res.cookies.delete("auth-token");
        res.cookies.delete("refresh-token");
        return res;
      }

      if (new Date() > session.expiresAt) {
        await (prisma as any).session.update({
          where: { id: session.id },
          data: { isActive: false }
        });
        const res = NextResponse.json({ error: "Refresh token has expired" }, { status: 401 });
        res.cookies.delete("auth-token");
        res.cookies.delete("refresh-token");
        return res;
      }

      const newRawRefreshToken = crypto.randomBytes(40).toString("hex");
      const newRefreshTokenHash = await bcrypt.hash(newRawRefreshToken, 10);
      const newExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

      // Rotate token atomically
      await (prisma as any).session.update({
        where: { id: session.id },
        data: {
          refreshTokenHash: newRefreshTokenHash,
          expiresAt: newExpiresAt,
          lastUsedAt: new Date()
        }
      });
      await createAuditLog(user.id, "Refresh Token Rotated", ip, userAgent);

      const accessToken = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: "15m" }
      );

      const response = NextResponse.json({ success: true, accessToken, expiresIn: "15m" });
      const cookieOpts = {
        httpOnly: true,
        secure: isProd,
        sameSite: "strict" as const,
        path: "/",
        ...(isProd && { domain: ".investorbridgesolutions.in" })
      };

      response.cookies.set("auth-token", accessToken, { ...cookieOpts, maxAge: 15 * 60 });
      response.cookies.set("refresh-token", newRawRefreshToken, { ...cookieOpts, maxAge: 30 * 24 * 60 * 60 });
      return response;
    } else {
      const activeSessions = mockDb.sessions.filter((s: any) => s.isActive);
      for (const sess of activeSessions) {
        const isValid = await bcrypt.compare(refreshToken, sess.refreshTokenHash);
        if (isValid) {
          session = sess;
          user = mockDb.users.find((u: any) => u.id === sess.userId);
          break;
        }
      }

      if (!session) {
        // Check inactive
        const inactiveSessions = mockDb.sessions.filter((s: any) => !s.isActive);
        for (const sess of inactiveSessions) {
          const isOldValid = await bcrypt.compare(refreshToken, sess.refreshTokenHash);
          if (isOldValid) {
            user = mockDb.users.find((u: any) => u.id === sess.userId);
            if (user) {
              await createAuditLog(user.id, "Refresh Token Reuse Detected", ip, userAgent);
              mockDb.sessions.forEach((s: any) => {
                if (s.userId === user.id) s.isActive = false;
              });
            }
            break;
          }
        }
        const res = NextResponse.json({ error: "Invalid or expired refresh token" }, { status: 401 });
        res.cookies.delete("auth-token");
        res.cookies.delete("refresh-token");
        return res;
      }

      if (new Date() > new Date(session.expiresAt)) {
        session.isActive = false;
        const res = NextResponse.json({ error: "Refresh token has expired" }, { status: 401 });
        res.cookies.delete("auth-token");
        res.cookies.delete("refresh-token");
        return res;
      }

      const newRawRefreshToken = crypto.randomBytes(40).toString("hex");
      const newRefreshTokenHash = await bcrypt.hash(newRawRefreshToken, 10);
      
      session.refreshTokenHash = newRefreshTokenHash;
      session.lastUsedAt = new Date().toISOString();
      session.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

      await createAuditLog(user.id, "Refresh Token Rotated", ip, userAgent);

      const accessToken = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: "15m" }
      );

      const response = NextResponse.json({ success: true, accessToken, expiresIn: "15m" });
      const cookieOpts = {
        httpOnly: true,
        secure: isProd,
        sameSite: "strict" as const,
        path: "/",
        ...(isProd && { domain: ".investorbridgesolutions.in" })
      };

      response.cookies.set("auth-token", accessToken, { ...cookieOpts, maxAge: 15 * 60 });
      response.cookies.set("refresh-token", newRawRefreshToken, { ...cookieOpts, maxAge: 30 * 24 * 60 * 60 });
      return response;
    }
  } catch (err: any) {
    console.error("Token refresh error:", err);
    return NextResponse.json({ error: "Token refresh failed" }, { status: 500 });
  }
}
