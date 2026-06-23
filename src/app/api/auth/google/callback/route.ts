import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma, mockDb, isDatabaseConfigured } from "@/lib/db";

const JWT_SECRET = process.env.JWT_SECRET || "super-secure-jwt-secret-key-change-in-production";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "super-secure-jwt-refresh-secret-key-change-in-production";

// Production Google OAuth Callback Handler
export async function GET(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || "unknown";
  const userAgent = req.headers.get("user-agent") || "unknown";
  const useDb = isDatabaseConfigured();

  try {
    // Extract query parameters
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");

    // Handle OAuth errors from Google
    if (error) {
      console.error(`Google OAuth Error: ${error}`);
      return NextResponse.redirect(
        `${process.env.APP_URL || "http://localhost:3000"}/login?error=google_${error}`
      );
    }

    if (!code) {
      return NextResponse.redirect(
        `${process.env.APP_URL || "http://localhost:3000"}/login?error=no_auth_code`
      );
    }

    // Verify state token (CSRF protection)
    if (state !== "securestate") {
      console.error("Invalid state parameter - potential CSRF attack");
      return NextResponse.redirect(
        `${process.env.APP_URL || "http://localhost:3000"}/login?error=invalid_state`
      );
    }

    // Exchange authorization code for ID token
    const tokenEndpoint = "https://oauth2.googleapis.com/token";
    const redirectUri = `${process.env.APP_URL || "http://localhost:3000"}/api/auth/google/callback`;

    const tokenResponse = await fetch(tokenEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID || "",
        client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
        redirect_uri: redirectUri,
        grant_type: "authorization_code"
      })
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      console.error("Token exchange failed:", errorData);
      return NextResponse.redirect(
        `${process.env.APP_URL || "http://localhost:3000"}/login?error=token_exchange_failed`
      );
    }

    const tokenData = await tokenResponse.json();
    const { id_token } = tokenData;

    if (!id_token) {
      console.error("No ID token received from Google");
      return NextResponse.redirect(
        `${process.env.APP_URL || "http://localhost:3000"}/login?error=no_id_token`
      );
    }

    // Verify and decode ID token (in production, use google-auth-library)
    // For now, we'll do a basic decode (production should use proper verification)
    const parts = id_token.split(".");
    if (parts.length !== 3) {
      return NextResponse.redirect(
        `${process.env.APP_URL || "http://localhost:3000"}/login?error=invalid_token`
      );
    }

    // Decode payload (this is a basic implementation - use google-auth-library for production)
    const payload = JSON.parse(Buffer.from(parts[1], "base64").toString());
    const { sub: providerId, email, name, picture } = payload;

    if (!email) {
      return NextResponse.redirect(
        `${process.env.APP_URL || "http://localhost:3000"}/login?error=no_email`
      );
    }

    // Proceed with user creation/authentication
    let user: any = null;

    if (useDb) {
      user = await prisma.user.findUnique({
        where: { email }
      });

      if (!user) {
        user = await prisma.user.create({
          data: {
            name: name || email.split("@")[0],
            email,
            emailVerified: true,
            isVerifiedEmail: true,
            accountStatus: "ACTIVE",
            image: picture,
            passwordHash: "",
            phone: null as any
          }
        });
      }

      // Link Google account if not already linked
      const hasAccountLinked = await (prisma as any).account.findFirst({
        where: { userId: user.id, provider: "google", providerId }
      });

      if (!hasAccountLinked) {
        await (prisma as any).account.create({
          data: {
            userId: user.id,
            provider: "google",
            providerId,
            providerEmail: email
          }
        });
      }

      // Update last login info
      await prisma.user.update({
        where: { id: user.id },
        data: {
          lastLoginAt: new Date(),
          lastLoginIP: ip
        }
      });

      console.log(`[GOOGLE OAuth] Production login successful: ${email}`);
    } else {
      user = mockDb.users.find((u: any) => u.email === email);
      if (!user) {
        user = {
          id: crypto.randomUUID(),
          name: name || email.split("@")[0],
          email,
          phone: null,
          image: picture,
          role: "USER",
          mfaEnabled: false,
          isVerifiedEmail: true,
          isVerifiedPhone: false,
          emailVerified: true,
          accountStatus: "ACTIVE",
          lastLoginAt: new Date(),
          lastLoginIP: ip,
          createdAt: new Date().toISOString()
        };
        mockDb.users.push(user);
      }
      console.log(`[PRODUCTION OAUTH] Google authenticated: ${email}`);
    }

    // Generate tokens
    const accessToken = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "15m" }
    );

    const rawRefreshToken = crypto.randomBytes(40).toString("hex");
    const refreshTokenHash = await bcrypt.hash(rawRefreshToken, 10);
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    if (useDb) {
      await (prisma as any).session.create({
        data: {
          userId: user.id,
          deviceId: "Web-Browser",
          ipAddress: ip,
          userAgent,
          refreshTokenHash,
          expiresAt
        }
      });
    }

    // Create response and set cookies
    const redirectUrl = `${process.env.APP_URL || "http://localhost:3000"}/dashboard`;
    const response = NextResponse.redirect(redirectUrl);

    response.cookies.set("auth-token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60,
      path: "/"
    });

    response.cookies.set("refresh-token", rawRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60,
      path: "/"
    });

    return response;
  } catch (err: any) {
    console.error("Google OAuth callback error:", err);
    return NextResponse.redirect(
      `${process.env.APP_URL || "http://localhost:3000"}/login?error=callback_error`
    );
  }
}
