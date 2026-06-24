import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma, mockDb, isDatabaseConfigured } from "@/lib/db";
import { checkRateLimit } from "@/lib/rate-limit";

const db = prisma as any;

const JWT_SECRET = process.env.JWT_SECRET || "super-secure-jwt-secret-key-change-in-production";

// Google demo accounts configuration
const DEMO_ACCOUNTS = [
  {
    provider: "google",
    providerId: "demo_google_001",
    email: "demo1@gmail.com",
    name: "Demo Account One",
    picture: "https://lh3.googleusercontent.com/a/default-user=s96-c"
  },
  {
    provider: "google",
    providerId: "demo_google_002",
    email: "demo2@gmail.com",
    name: "Demo Account Two",
    picture: "https://lh3.googleusercontent.com/a/default-user=s96-c"
  },
  {
    provider: "google",
    providerId: "demo_google_003",
    email: "demo3@gmail.com",
    name: "Demo Account Three",
    picture: "https://lh3.googleusercontent.com/a/default-user=s96-c"
  }
];

export async function createAuditLog(userId: string | null, action: string, ip: string, userAgent: string) {
  const useDb = isDatabaseConfigured();
  if (useDb) {
    try {
      await db.auditLog.create({
        data: {
          userId,
          action,
          ipAddress: ip,
          userAgent
        }
      });
    } catch (e) {
      console.error("Failed to write audit log in database:", e);
    }
  } else {
    mockDb.auditLogs.unshift({
      id: crypto.randomUUID(),
      userId,
      action,
      ipAddress: ip,
      userAgent,
      createdAt: new Date().toISOString()
    });
    console.log(`[AUDIT LOG] Action: ${action} | User: ${userId || "Guest"} | IP: ${ip}`);
  }
}

function getMode() {
  const hasClientId = !!process.env.GOOGLE_CLIENT_ID;
  const hasClientSecret = !!process.env.GOOGLE_CLIENT_SECRET;
  const hasCallbackUrl = !!process.env.GOOGLE_CALLBACK_URL;
  const isProd = process.env.NODE_ENV === "production";

  if (hasClientId && hasClientSecret && hasCallbackUrl) {
    return "PRODUCTION";
  }

  if (isProd) {
    throw new Error("Missing required production environment variables for Google OAuth.");
  }
  
  return "DEMO";
}

export async function GET(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || "unknown";
  
  const rateLimitKey = `google-oauth-get-${ip}`;
  const rateLimitResult = checkRateLimit(rateLimitKey, {
    maxRequests: 20,
    windowMs: 60 * 1000
  });

  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      { error: `Too many requests. Please try again in ${rateLimitResult.retryAfter} seconds.` },
      { status: 429 }
    );
  }

  let mode;
  try {
    mode = getMode();
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }

  if (mode === "PRODUCTION") {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const redirectUri = process.env.GOOGLE_CALLBACK_URL;
    
    // Generate real CSRF state
    const state = crypto.randomBytes(32).toString("hex");
    
    const googleConsentUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri!)}&response_type=code&scope=${encodeURIComponent("openid email profile")}&state=${state}`;
    
    const response = NextResponse.redirect(googleConsentUrl);
    
    const isProd = process.env.NODE_ENV === "production";
    response.cookies.set("google_oauth_state", state, {
      httpOnly: true,
      secure: isProd,
      sameSite: "strict",
      maxAge: 10 * 60, // 10 minutes
      path: "/",
      ...(isProd && { domain: ".investorbridgesolutions.in" })
    });
    
    return response;
  }

  // Demo Mode
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Google Authentication (Testing Mode)</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: sans-serif; background: #0B1F3A; min-height: 100vh; display: flex; align-items: center; justify-content: center; color: white; }
        .container { max-width: 28rem; width: 100%; margin: 0 1rem; background: #112240; border: 1px solid #374151; border-radius: 1rem; padding: 2rem; }
        .header { text-align: center; margin-bottom: 1.5rem; }
        .icon-box { display: inline-flex; height: 3rem; width: 3rem; align-items: center; justify-content: center; border-radius: 0.75rem; background: #00B386; margin-bottom: 0.75rem; }
        .icon-box svg { height: 1.5rem; width: 1.5rem; color: white; }
        h2 { font-size: 1.25rem; font-weight: 700; color: white; }
        .subtitle { font-size: 0.75rem; color: #9CA3AF; margin-top: 0.25rem; }
        .accounts-list { display: flex; flex-direction: column; gap: 0.75rem; }
        .account-btn { width: 100%; display: flex; align-items: center; gap: 0.75rem; background: rgba(11, 31, 58, 0.6); border: 1px solid #4B5563; border-radius: 0.75rem; padding: 0.75rem 1rem; cursor: pointer; color: white; text-align: left; }
        .account-btn:hover { border-color: #00B386; background: rgba(0, 179, 134, 0.1); }
        .avatar { height: 2rem; width: 2rem; border-radius: 9999px; background: #4B5563; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 700; font-family: monospace; }
        .account-info div:first-child { font-size: 0.75rem; font-weight: 700; }
        .account-info div:last-child { font-size: 0.625rem; color: #9CA3AF; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="icon-box"><svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg></div>
          <h2>Google OAuth testing screen</h2>
          <p class="subtitle">Select a verified Google Developer Test account</p>
        </div>
        <div class="accounts-list">
          ${DEMO_ACCOUNTS.map(acc => `
            <button class="account-btn" onclick="authenticate('${acc.email}', '${acc.providerId}', '${acc.name}', '${acc.picture}')">
              <div class="avatar">${acc.name[0]}</div>
              <div class="account-info">
                <div>${acc.name}</div>
                <div>${acc.email}</div>
              </div>
            </button>
          `).join("")}
        </div>
      </div>
      <script>
        async function authenticate(email, providerId, name, picture) {
          const res = await fetch("/api/auth/google", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, providerId, name, picture })
          });
          const data = await res.json();
          if (res.ok && data.success) {
            window.location.href = "/dashboard";
          } else {
            alert(data.error || "Authentication failed.");
          }
        }
      </script>
    </body>
    </html>
  `;

  return new NextResponse(html, {
    headers: { "Content-Type": "text/html" }
  });
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || "unknown";
  const userAgent = req.headers.get("user-agent") || "unknown";
  const useDb = isDatabaseConfigured();

  const rateLimitKey = `google-oauth-${ip}`;
  const rateLimitResult = checkRateLimit(rateLimitKey, {
    maxRequests: 5,
    windowMs: 60 * 1000 
  });

  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      { error: `Too many login attempts. Please try again in ${rateLimitResult.retryAfter} seconds.` },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const { email, providerId, name, picture } = body;

    if (!email || !providerId) {
      return NextResponse.json({ error: "Missing identity credentials" }, { status: 400 });
    }

    let user: any = null;

    if (useDb) {
      user = await db.user.findUnique({
        where: { email },
        include: { accounts: true } as any
      });

      if (!user) {
        user = await db.user.create({
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
        await db.user.update({
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
        return NextResponse.json({ error: "Account is blocked or suspended" }, { status: 403 });
      }
      
      // Check if account lockout has expired
      if (user.accountLockedUntil && new Date(user.accountLockedUntil) <= new Date()) {
        // Lockout period has passed, unlock the account
        await db.user.update({
          where: { id: user.id },
          data: {
            accountLockedUntil: null,
            failedLoginAttempts: 0
          }
        });
        await createAuditLog(user.id, "Account Unlocked", ip, userAgent);
      } else if (user.accountLockedUntil && new Date(user.accountLockedUntil) > new Date()) {
        // Account is still locked
        await createAuditLog(user.id, "Google Login Failure", ip, userAgent);
        return NextResponse.json({ error: "Account locked. Try again later." }, { status: 403 });
      }

      const hasAccountLinked = await db.account.findFirst({
        where: { userId: user.id, provider: "google", providerId }
      });

      if (!hasAccountLinked) {
        await db.account.create({
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
          accountStatus: "ACTIVE",          failedLoginAttempts: 0,
          accountLockedUntil: null,          createdAt: new Date().toISOString()
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
        return NextResponse.json({ error: "Account is blocked or suspended" }, { status: 403 });
      }
      
      // Check if account lockout has expired for mock DB
      if (user.accountLockedUntil && new Date(user.accountLockedUntil) <= new Date()) {
        // Lockout period has passed, unlock the account
        user.accountLockedUntil = null;
        user.failedLoginAttempts = 0;
        await createAuditLog(user.id, "Account Unlocked", ip, userAgent);
      } else if (user.accountLockedUntil && new Date(user.accountLockedUntil) > new Date()) {
        // Account is still locked
        await createAuditLog(user.id, "Google Login Failure", ip, userAgent);
        return NextResponse.json({ error: "Account locked. Try again later." }, { status: 403 });
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
      await db.session.create({
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

    const response = NextResponse.json({ success: true });
    const isProd = process.env.NODE_ENV === "production";
    const cookieOpts = {
      httpOnly: true,
      secure: isProd,
      sameSite: "strict" as const,
      path: "/",
      ...(isProd && { domain: ".investorbridgesolutions.in" })
    };

    response.cookies.set("auth-token", accessToken, {
      ...cookieOpts,
      maxAge: 15 * 60
    });

    response.cookies.set("refresh-token", rawRefreshToken, {
      ...cookieOpts,
      maxAge: 30 * 24 * 60 * 60
    });

    return response;
  } catch (err: any) {
    console.error("Error authenticating:", err);
    return NextResponse.json({ error: "Google authentication failed" }, { status: 500 });
  }
}
