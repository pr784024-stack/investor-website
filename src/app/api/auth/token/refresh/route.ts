import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma, mockDb, isDatabaseConfigured } from "@/lib/db";

const JWT_SECRET = process.env.JWT_SECRET || "super-secure-jwt-secret-key-change-in-production";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "super-secure-jwt-refresh-secret-key-change-in-production";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || "unknown";
  const userAgent = req.headers.get("user-agent") || "unknown";
  const useDb = isDatabaseConfigured();

  try {
    // Get refresh token from cookies or body
    const refreshToken = req.cookies.get("refresh-token")?.value || 
                        (await req.json()).refreshToken;

    if (!refreshToken) {
      return NextResponse.json(
        { error: "Refresh token is required" },
        { status: 401 }
      );
    }

    // Find session by refresh token hash
    let session: any = null;
    let user: any = null;

    if (useDb) {
      // Find all sessions and check which one matches the refresh token
      const sessions = await prisma.session.findMany({
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
        return NextResponse.json(
          { error: "Invalid or expired refresh token" },
          { status: 401 }
        );
      }

      // Check if session is expired
      if (new Date() > session.expiresAt) {
        await prisma.session.update({
          where: { id: session.id },
          data: { isActive: false }
        });
        return NextResponse.json(
          { error: "Refresh token has expired" },
          { status: 401 }
        );
      }

      // Invalidate old refresh token and create new one (token rotation)
      const newRawRefreshToken = crypto.randomBytes(40).toString("hex");
      const newRefreshTokenHash = await bcrypt.hash(newRawRefreshToken, 10);
      const newExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

      // Update session with new refresh token
      await prisma.session.update({
        where: { id: session.id },
        data: {
          refreshTokenHash: newRefreshTokenHash,
          expiresAt: newExpiresAt,
          lastUsedAt: new Date()
        }
      });

      // Generate new access token
      const accessToken = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: "15m" }
      );

      const response = NextResponse.json({
        success: true,
        accessToken,
        expiresIn: "15m"
      });

      // Set new tokens in cookies
      response.cookies.set("auth-token", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 15 * 60,
        path: "/"
      });

      response.cookies.set("refresh-token", newRawRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 30 * 24 * 60 * 60,
        path: "/"
      });

      return response;
    } else {
      // Mock database fallback
      const sessions = mockDb.sessions || [];
      for (const sess of sessions) {
        const isValid = await bcrypt.compare(refreshToken, sess.refreshTokenHash);
        if (isValid) {
          session = sess;
          user = mockDb.users.find((u: any) => u.id === sess.userId);
          break;
        }
      }

      if (!session) {
        return NextResponse.json(
          { error: "Invalid or expired refresh token" },
          { status: 401 }
        );
      }

      // Token rotation in mock DB
      const newRawRefreshToken = crypto.randomBytes(40).toString("hex");
      const newRefreshTokenHash = await bcrypt.hash(newRawRefreshToken, 10);
      session.refreshTokenHash = newRefreshTokenHash;
      session.lastUsedAt = new Date();

      const accessToken = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: "15m" }
      );

      const response = NextResponse.json({
        success: true,
        accessToken,
        expiresIn: "15m"
      });

      response.cookies.set("auth-token", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 15 * 60,
        path: "/"
      });

      response.cookies.set("refresh-token", newRawRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 30 * 24 * 60 * 60,
        path: "/"
      });

      console.log(`[TOKEN REFRESH] New access token issued for user ${user.email}`);
      return response;
    }
  } catch (err: any) {
    console.error("Token refresh error:", err);
    return NextResponse.json(
      { error: "Token refresh failed" },
      { status: 500 }
    );
  }
}
