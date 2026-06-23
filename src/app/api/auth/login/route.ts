import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { mockDb, isDatabaseConfigured } from "@/lib/db";
import { isEmailConfigured, isSmsConfigured, sendEmail, sendSms } from "@/lib/notifications";

function sanitize(val: string) {
  return val.replace(/<[^>]*>?/gm, "").replace(/['";<>]/g, "").trim();
}
function validateEmail(e: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
}

// In-memory failed login tracker (production: use Redis)
const loginAttempts = new Map<string, { count: number; lockedUntil: number }>();

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || "unknown";
  const now = Date.now();

  // Check lockout
  const attempt = loginAttempts.get(ip) || { count: 0, lockedUntil: 0 };
  if (attempt.lockedUntil > now) {
    const minutesLeft = Math.ceil((attempt.lockedUntil - now) / 60000);
    return NextResponse.json(
      { error: `Account temporarily locked. Try again in ${minutesLeft} minute(s).` },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const email = (body.email || "").trim().toLowerCase();
    const password = body.password || "";

    // Validation
    if (!validateEmail(email)) {
      return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
    }
    if (!password || password.length < 1) {
      return NextResponse.json({ error: "Password is required." }, { status: 400 });
    }

    // Check database vs mock DB storage
    const useDb = isDatabaseConfigured();
    let user: any = null;

    if (useDb) {
      try {
        const { prisma } = await import("@/lib/db");
        user = await prisma.user.findUnique({ where: { email } });
      } catch (dbErr) {
        console.error("Database query failed in login:", dbErr);
        return NextResponse.json({ error: "Database query failed. Please verify your PostgreSQL connection." }, { status: 500 });
      }
    } else {
      user = mockDb.users.find((u: any) => u.email === email);
    }

    // Generic error (don't reveal if email exists — security rule)
    if (!user) {
      loginAttempts.set(ip, { count: attempt.count + 1, lockedUntil: attempt.count >= 4 ? now + 900000 : 0 });
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      const newCount = attempt.count + 1;
      loginAttempts.set(ip, {
        count: newCount,
        lockedUntil: newCount >= 5 ? now + 900000 : 0, // 15 min lockout after 5 failed attempts
      });
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    // Successful login credentials — reset attempt counter
    loginAttempts.set(ip, { count: 0, lockedUntil: 0 });

    // Generate random 6-digit MFA OTP
    const mfaOtpValue = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 mins
    const mfaOtpHash = await bcrypt.hash(mfaOtpValue, 10);

    // Save MFA OTP in database or mockDb
    if (useDb) {
      try {
        const { prisma } = await import("@/lib/db");
        // Invalidate all previous unused MFA OTPs for this user
        await prisma.mfaOtp.updateMany({
          where: { userId: user.id, used: false },
          data: { used: true }
        });
        await prisma.mfaOtp.create({
          data: {
            userId: user.id,
            otpHash: mfaOtpHash,
            expiresAt,
          }
        });
      } catch (dbErr) {
        console.error("Failed to save MFA OTP in database:", dbErr);
        return NextResponse.json({ error: "Database transaction failed. Please check your connection." }, { status: 500 });
      }
    } else {
      // Invalidate all previous unused MFA OTPs in mockDb
      mockDb.mfaOtps.forEach((o: any) => {
        if (o.userId === user.id && !o.used) o.used = true;
      });
      mockDb.mfaOtps.push({
        id: crypto.randomUUID(),
        userId: user.id,
        otpHash: mfaOtpHash,
        expiresAt,
        used: false,
        createdAt: new Date()
      });
    }

    // Send/print MFA OTP
    const isEmailLive = isEmailConfigured();
    const isSmsLive = isSmsConfigured();

    if (isEmailLive || isSmsLive) {
      console.log(`\n===========================================\n[MFA SYSTEM (PRODUCTION MODE)]\nUser: ${user.name} (${user.email})\nMFA OTP Code: [SENT VIA ${isEmailLive ? 'EMAIL' : 'SMS'}]\n===========================================\n`);
    } else {
      console.log(`\n===========================================\n[MFA SYSTEM (DEMO MODE)]\nUser: ${user.name} (${user.email})\nMFA OTP Code: ${mfaOtpValue}\n===========================================\n`);
    }

    if (isEmailLive) {
      await sendEmail({
        to: user.email,
        subject: "Your InvestorBridge MFA Verification Code",
        html: `<p>Your MFA verification code is: <strong>${mfaOtpValue}</strong></p><p>This OTP expires in 5 minutes.</p>`
      });
    } else if (isSmsLive) {
      await sendSms({
        phone: user.phone,
        message: `Your InvestorBridge MFA verification code is: ${mfaOtpValue}. Expiry 5 mins.`
      });
    }

    return NextResponse.json({
      success: true,
      mfaRequired: true,
      userId: user.id,
      email: user.email,
      phone: user.phone
    });
  } catch {
    return NextResponse.json({ error: "Login failed. Please try again." }, { status: 500 });
  }
}

export async function DELETE() {
  // Logout endpoint — clear the auth cookie (session security rule)
  const response = NextResponse.json({ success: true, message: "Logged out successfully." });
  response.cookies.set("auth-token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 0,
    path: "/",
  });
  return response;
}
