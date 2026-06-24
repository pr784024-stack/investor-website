import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma, mockDb, isDatabaseConfigured } from "@/lib/db";
import { checkRateLimit } from "@/lib/rate-limit";
import { OAuth2Client } from "google-auth-library";
import { createAuditLog } from "../route";

const JWT_SECRET = process.env.JWT_SECRET || "super-secure-jwt-secret-key-change-in-production";

export async function GET(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || "unknown";
  const userAgent = req.headers.get("user-agent") || "unknown";
  const useDb = isDatabaseConfigured();
  const isProd = process.env.NODE_ENV === "production";

  const rateLimitKey = `google-oauth-callback-${ip}`;
  const rateLimitResult = checkRateLimit(rateLimitKey, {
    maxRequests: 10,
    windowMs: 60 * 1000
  });

  if (!rateLimitResult.allowed) {
    return NextResponse.redirect(`${process.env.APP_URL || "http://localhost:3000"}/login?error=too_many_requests`);
  }

  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");

    if (error) {
      await createAuditLog(null, "Google Login Failure", ip, userAgent);
      return NextResponse.redirect(`${process.env.APP_URL || "http://localhost:3000"}/login?error=google_${error}`);
    }

    if (!code) {
      return NextResponse.redirect(`${process.env.APP_URL || "http://localhost:3000"}/login?error=no_auth_code`);
    }

    // CSRF State Validation
    const storedState = req.cookies.get("google_oauth_state")?.value;
    if (!state || state !== storedState) {
      await createAuditLog(null, "Invalid State", ip, userAgent);
      return NextResponse.redirect(`${process.env.APP_URL || "http://localhost:3000"}/login?error=invalid_state`);
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = process.env.GOOGLE_CALLBACK_URL;

    if (isProd && (!clientId || !clientSecret || !redirectUri)) {
      throw new Error("Missing required Google OAuth credentials");
    }

    const client = new OAuth2Client(clientId, clientSecret, redirectUri);
    const { tokens } = await client.getToken(code);
    const idToken = tokens.id_token;

    if (!idToken) {
      await createAuditLog(null, "Google Login Failure", ip, userAgent);
      return NextResponse.redirect(`${process.env.APP_URL || "http://localhost:3000"}/login?error=no_id_token`);
    }

    const ticket = await client.verifyIdToken({
      idToken,
      audience: clientId
    });

    const payload = ticket.getPayload();
    if (!payload) {
      await createAuditLog(null, "Invalid Token", ip, userAgent);
      return NextResponse.redirect(`${process.env.APP_URL || "http://localhost:3000"}/login?error=invalid_token`);
    }

    if (payload.email_verified !== true) {
      await createAuditLog(null, "Google Login Failure", ip, userAgent);
      return NextResponse.redirect(`${process.env.APP_URL || "http://localhost:3000"}/login?error=unverified_email`);
    }

    // Claim validation
    if (!["accounts.google.com", "https://accounts.google.com"].includes(payload.iss)) {
      await createAuditLog(null, "Invalid Token", ip, userAgent);
      return NextResponse.redirect(`${process.env.APP_URL || "http://localhost:3000"}/login?error=invalid_issuer`);
    }

    if (payload.exp < Date.now() / 1000) {
      await createAuditLog(null, "Invalid Token", ip, userAgent);
      return NextResponse.redirect(`${process.env.APP_URL || "http://localhost:3000"}/login?error=token_expired`);
    }

    const providerId = payload.sub;
    const email = payload.email!;
    const name = payload.name || email.split("@")[0];
    const picture = payload.picture;

    let user: any = null;

    if (useDb) {
      const dbInstance = prisma as any;
      user = await dbInstance.user.findUnique({ where: { email } });

      if (!user) {
        user = await dbInstance.user.create({
          data: {
            name,
            email,
            image: picture,
            emailVerified: true,
            isVerifiedEmail: true,
            accountStatus: "ACTIVE",
            passwordHash: "",
            phone: "" as any
          }
        });
        await createAuditLog(user.id, "Google Account Created", ip, userAgent);
      } else {
        await dbInstance.user.update({
          where: { id: user.id },
          data: {
            name,
            image: picture,
            lastLoginAt: new Date(),
            lastLoginIP: ip,
            failedLoginAttempts: 0
          }
        });
      }

      if (user.accountStatus !== "ACTIVE") {
        await createAuditLog(user.id, "Google Account Blocked", ip, userAgent);
        return NextResponse.redirect(`${process.env.APP_URL || "http://localhost:3000"}/login?error=account_blocked`);
      }

      // Check if account lockout has expired
      if (user.accountLockedUntil && new Date(user.accountLockedUntil) <= new Date()) {
        // Lockout period has passed, unlock the account
        await dbInstance.user.update({
          where: { id: user.id },
          data: {
            accountLockedUntil: null,
            failedLoginAttempts: 0
          }
        });
        await createAuditLog(user.id, "Account Unlocked", ip, userAgent);
      } else if (user.accountLockedUntil && new Date(user.accountLockedUntil) > new Date()) {
        await createAuditLog(user.id, "Account Locked", ip, userAgent);
        return NextResponse.redirect(`${process.env.APP_URL || "http://localhost:3000"}/login?error=account_locked`);
      }

      const hasAccountLinked = await dbInstance.account.findFirst({
        where: { userId: user.id, provider: "google", providerId }
      });

      if (!hasAccountLinked) {
        await dbInstance.account.create({
          data: {
            userId: user.id,
            provider: "google",
            providerId,
            providerEmail: email
          }
        });
        await createAuditLog(user.id, "Google Account Linked", ip, userAgent);
      }

      await createAuditLog(user.id, "Google Login Success", ip, userAgent);
    } else {
      user = mockDb.users.find((u: any) => u.email === email);
      if (!user) {
        user = {
          id: crypto.randomUUID(),
          name,
          email,
          image: picture,
          phone: null,
          role: "USER",
          mfaEnabled: false,
          isVerifiedEmail: true,
          isVerifiedPhone: false,
          accountStatus: "ACTIVE",
          createdAt: new Date().toISOString()
        };
        mockDb.users.push(user);
        await createAuditLog(user.id, "Google Account Created", ip, userAgent);
      } else {
        user.name = name;
        user.image = picture;
        user.failedLoginAttempts = 0;
      }
      
      if (user.accountStatus !== "ACTIVE") {
        await createAuditLog(user.id, "Google Account Blocked", ip, userAgent);
        return NextResponse.redirect(`${process.env.APP_URL || "http://localhost:3000"}/login?error=account_blocked`);
      }
      
      // Check if account lockout has expired for mock DB
      if (user.accountLockedUntil && new Date(user.accountLockedUntil) <= new Date()) {
        // Lockout period has passed, unlock the account
        user.accountLockedUntil = null;
        user.failedLoginAttempts = 0;
        await createAuditLog(user.id, "Account Unlocked", ip, userAgent);
      } else if (user.accountLockedUntil && new Date(user.accountLockedUntil) > new Date()) {
        // Account is still locked
        await createAuditLog(user.id, "Account Locked", ip, userAgent);
        return NextResponse.redirect(`${process.env.APP_URL || "http://localhost:3000"}/login?error=account_locked`);
      }
      
      await createAuditLog(user.id, "Google Login Success", ip, userAgent);
    }

    const accessToken = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "15m" }
    );

    const rawRefreshToken = crypto.randomBytes(40).toString("hex");
    const refreshTokenHash = await bcrypt.hash(rawRefreshToken, 10);
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const deviceFingerprint = crypto.createHash("sha256").update(ip + userAgent).digest("hex");

    if (useDb) {
      await (prisma as any).session.create({
        data: {
          userId: user.id,
          deviceId: deviceFingerprint,
          ipAddress: ip,
          userAgent,
          refreshTokenHash,
          expiresAt
        }
      });
    } else {
      mockDb.sessions.push({
        id: crypto.randomUUID(),
        userId: user.id,
        deviceId: deviceFingerprint,
        ipAddress: ip,
        userAgent,
        refreshTokenHash,
        isActive: true,
        createdAt: new Date().toISOString(),
        lastUsedAt: new Date().toISOString(),
        expiresAt
      });
    }

    const redirectUrl = `${process.env.APP_URL || "http://localhost:3000"}/dashboard`;
    const response = NextResponse.redirect(redirectUrl);

    // Delete state cookie
    response.cookies.delete("google_oauth_state");

    const cookieOpts = {
      httpOnly: true,
      secure: isProd,
      sameSite: "strict" as const,
      path: "/",
      ...(isProd && { domain: ".investorbridgesolutions.in" })
    };

    response.cookies.set("auth-token", accessToken, { ...cookieOpts, maxAge: 15 * 60 });
    response.cookies.set("refresh-token", rawRefreshToken, { ...cookieOpts, maxAge: 30 * 24 * 60 * 60 });

    return response;
  } catch (err: any) {
    console.error("Google OAuth callback error:", err);
    await createAuditLog(null, "Google Login Failure", ip, userAgent);
    return NextResponse.redirect(`${process.env.APP_URL || "http://localhost:3000"}/login?error=callback_error`);
  }
}
