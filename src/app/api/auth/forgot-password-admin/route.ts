import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { mockDb, isDatabaseConfigured } from "@/lib/db";
import { isEmailConfigured, sendEmail, isSmsConfigured, sendSms } from "@/lib/notifications";

// Type definitions
interface User {
  id: string;
  email: string;
  name: string;
  phone?: string | null;
  role: "ADMIN" | "USER";
  passwordHash: string | null;
}

interface RateLimitLog {
  id: string;
  key: string;
  createdAt: Date;
}

interface MfaOtp {
  id: string;
  userId: string;
  otpHash: string;
  expiresAt: Date;
  used: boolean;
  createdAt: Date;
}

interface PasswordResetToken {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  used: boolean;
  createdAt: Date;
}

interface AdminLog {
  id: string;
  adminId: string;
  action: string;
  details: string;
  ipAddress: string;
  createdAt: Date;
}

function validateEmail(e: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
}

// Extract Prisma client initialization to avoid repeated imports
async function getPrismaClient() {
  return (await import("@/lib/db")).prisma;
}

export async function POST(req: NextRequest) {
  // Safe mockDb guard
  if (!Array.isArray(mockDb.rateLimitLogs)) mockDb.rateLimitLogs = [];
  if (!Array.isArray(mockDb.mfaOtps)) mockDb.mfaOtps = [];
  if (!Array.isArray(mockDb.passwordResetTokens)) mockDb.passwordResetTokens = [];
  if (!Array.isArray(mockDb.adminLogs)) mockDb.adminLogs = [];

  try {
    const body = await req.json();
    const email = (body.email || "").trim().toLowerCase();
    const mfaCode = body.mfaCode || "";
    const isVerificationStep = !!mfaCode;

    if (!email) {
      return NextResponse.json({ error: "Email address is required." }, { status: 400 });
    }

    if (!validateEmail(email)) {
      return NextResponse.json({ error: "Invalid email address format." }, { status: 400 });
    }

    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    const useDb = isDatabaseConfigured();
    const isEmailLive = isEmailConfigured();
    const isSmsLive = isSmsConfigured();
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    // Stricter rate limits for Admin: 3 requests per hour
    const emailKey = `admin-forgot-password:email:${email}`;
    const ipKey = `admin-forgot-password:ip:${ip}`;

    let emailLogsCount = 0;
    let ipLogsCount = 0;

    if (useDb) {
      const prisma = await getPrismaClient();
      await prisma.rateLimitLog.deleteMany({ where: { createdAt: { lt: oneHourAgo } } });
      emailLogsCount = await prisma.rateLimitLog.count({ where: { key: emailKey, createdAt: { gte: oneHourAgo } } });
      ipLogsCount = await prisma.rateLimitLog.count({ where: { key: ipKey, createdAt: { gte: oneHourAgo } } });
    } else {
      mockDb.rateLimitLogs = mockDb.rateLimitLogs.filter((log: RateLimitLog) => new Date(log.createdAt) >= oneHourAgo);
      emailLogsCount = mockDb.rateLimitLogs.filter((log: RateLimitLog) => log.key === emailKey).length;
      ipLogsCount = mockDb.rateLimitLogs.filter((log: RateLimitLog) => log.key === ipKey).length;
    }

    if (emailLogsCount >= 3 || ipLogsCount >= 3) {
      return NextResponse.json({ error: "Too many admin password reset requests. Please try again later." }, { status: 429 });
    }

    // Add rate limit log
    if (useDb) {
      const prisma = await getPrismaClient();
      await prisma.rateLimitLog.create({ data: { key: emailKey } });
      await prisma.rateLimitLog.create({ data: { key: ipKey } });
    } else {
      mockDb.rateLimitLogs.push(
        { id: crypto.randomUUID(), key: emailKey, createdAt: new Date() },
        { id: crypto.randomUUID(), key: ipKey, createdAt: new Date() }
      );
    }

    // Find User
    let user: User | null = null;
    if (useDb) {
      const prisma = await getPrismaClient();
      user = await prisma.user.findUnique({ where: { email } });
    } else {
      user = (mockDb.users as User[]).find((u: User) => u.email === email) || null;
    }

    // Secure generic message
    const genericSuccessMsg = "If an admin account is found, authentication steps have been initiated.";

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ success: true, message: genericSuccessMsg });
    }

    // STEP 1: Generate Admin MFA OTP Challenge (MFA Before Reset Link)
    if (!isVerificationStep) {
      const otpValue = Math.floor(100000 + Math.random() * 900000).toString();
      const otpHash = await bcrypt.hash(otpValue, 10);
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 mins

      if (useDb) {
        const prisma = await getPrismaClient();
        // Invalidate old admin reset MFAs
        await prisma.mfaOtp.updateMany({
          where: { userId: user.id, used: false },
          data: { used: true }
        });
        await prisma.mfaOtp.create({
          data: { userId: user.id, otpHash, expiresAt }
        });
        // Log action
        await prisma.adminLog.create({
          data: { adminId: user.id, action: "PASSWORD_RESET_MFA_REQUESTED", details: "MFA challenge sent for password reset initiation", ipAddress: ip }
        });
      } else {
        (mockDb.mfaOtps as MfaOtp[]).forEach((o: MfaOtp) => {
          if (o.userId === user!.id && !o.used) o.used = true;
        });
        mockDb.mfaOtps.push({
          id: crypto.randomUUID(),
          userId: user.id,
          otpHash,
          expiresAt,
          used: false,
          createdAt: new Date()
        });
        mockDb.adminLogs.push({
          id: crypto.randomUUID(),
          adminId: user.id,
          action: "PASSWORD_RESET_MFA_REQUESTED",
          details: "MFA challenge sent for password reset initiation",
          ipAddress: ip,
          createdAt: new Date()
        });
      }

      // Log delivery in production (sanitized) / demo (revealed)
      if (isEmailLive || isSmsLive) {
        console.log(`\n===========================================\n[ADMIN RESET MFA (PRODUCTION MODE)]\nUser: ${user.name} (${user.email})\nMFA Code: [SENT VIA ${isEmailLive ? 'EMAIL' : 'SMS'}]\n===========================================\n`);
      } else {
        console.log(`\n===========================================\n[ADMIN RESET MFA (DEMO MODE)]\nUser: ${user.name} (${user.email})\nMFA Code: ${otpValue}\n===========================================\n`);
      }

      if (isEmailLive) {
        await sendEmail({
          to: user.email,
          subject: "InvestorBridge Admin Password Reset Authorization",
          html: `<p>A password reset has been requested for your admin account.</p><p>Please enter the following MFA verification code: <strong>${otpValue}</strong></p>`
        });
      } else if (isSmsLive) {
        await sendSms({
          phone: user.phone!,
          message: `InvestorBridge Admin reset code: ${otpValue}. Expiry 5 mins.`
        });
      }

      return NextResponse.json({
        success: true,
        mfaRequired: true,
        message: "MFA code sent to register details. Verify code to receive password reset link."
      });
    }

    // STEP 2: Verify MFA and Then Generate Password Reset Link
    let latestMfa: MfaOtp | null = null;
    if (useDb) {
      const prisma = await getPrismaClient();
      latestMfa = await prisma.mfaOtp.findFirst({
        where: { userId: user.id, used: false },
        orderBy: { createdAt: "desc" }
      });
    } else {
      const mfas = (mockDb.mfaOtps as MfaOtp[])
        .filter((o: MfaOtp) => o.userId === user.id && !o.used)
        .sort((a: MfaOtp, b: MfaOtp) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      latestMfa = mfas[0] || null;
    }

    if (!latestMfa || new Date() > new Date(latestMfa.expiresAt)) {
      return NextResponse.json({ error: "MFA challenge expired or not found. Please try again." }, { status: 400 });
    }

    const matches = await bcrypt.compare(mfaCode, latestMfa.otpHash);
    if (!matches) {
      if (useDb) {
        const prisma = await getPrismaClient();
        await prisma.adminLog.create({
          data: { adminId: user.id, action: "PASSWORD_RESET_MFA_FAILED", details: "Failed MFA attempt during password reset request", ipAddress: ip }
        });
      } else {
        mockDb.adminLogs.push({
          id: crypto.randomUUID(),
          adminId: user.id,
          action: "PASSWORD_RESET_MFA_FAILED",
          details: "Failed MFA attempt during password reset request",
          ipAddress: ip,
          createdAt: new Date()
        });
      }
      return NextResponse.json({ error: "Invalid verification code." }, { status: 400 });
    }

    // Invalidate used MFA OTP
    if (useDb) {
      const prisma = await getPrismaClient();
      await prisma.mfaOtp.update({ where: { id: latestMfa.id }, data: { used: true } });
    } else {
      latestMfa.used = true;
    }

    // Generate Reset Token
    const rawToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");

    if (useDb) {
      const prisma = await getPrismaClient();
      await prisma.passwordResetToken.updateMany({
        where: { userId: user.id, used: false },
        data: { used: true }
      });
      await prisma.passwordResetToken.create({
        data: { userId: user.id, tokenHash, expiresAt }
      });
      await prisma.adminLog.create({
        data: { adminId: user.id, action: "PASSWORD_RESET_LINK_SENT", details: "MFA passed. Reset link sent via email", ipAddress: ip }
      });
    } else {
      (mockDb.passwordResetTokens as PasswordResetToken[]).forEach((t: PasswordResetToken) => {
        if (t.userId === user.id) t.used = true;
      });
      mockDb.passwordResetTokens.push({
        id: crypto.randomUUID(),
        userId: user.id,
        tokenHash,
        expiresAt,
        used: false,
        createdAt: new Date()
      });
      mockDb.adminLogs.push({
        id: crypto.randomUUID(),
        adminId: user.id,
        action: "PASSWORD_RESET_LINK_SENT",
        details: "MFA passed. Reset link sent via email",
        ipAddress: ip,
        createdAt: new Date()
      });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    // Redirect admin to specialized admin reset page which does MFA before change
    const resetUrl = `${appUrl}/reset-password?token=${rawToken}&isAdmin=true`;

    if (isEmailLive) {
      console.log(`\n===========================================\n[ADMIN FORGOT PASSWORD (PRODUCTION MODE)]\nUser: ${user.name} (${user.email})\nReset Link: [SENT VIA EMAIL]\n===========================================\n`);
      await sendEmail({
        to: email,
        subject: "InvestorBridge Admin Password Reset Secure Link",
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #f0f0f0; border-radius: 8px;">
            <h2 style="color: #0b1f3a;">Admin Password Reset</h2>
            <p>We verified your identity through MFA. Click the link below to complete the reset:</p>
            <p style="margin: 25px 0;">
              <a href="${resetUrl}" style="background-color: #D31538; color: white; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 25px; display: inline-block;">Reset Admin Password</a>
            </p>
            <p style="color: #ef4444; font-size: 12px;"><strong>This link expires in 15 minutes and requires final MFA challenge validation.</strong></p>
          </div>
        `
      });
    } else {
      console.log(`\n===========================================\n[ADMIN DEMO MODE]\nPassword reset link generated:\n${resetUrl}\nExpires in: 15 minutes\n===========================================\n`);
    }

    return NextResponse.json({
      success: true,
      message: isEmailLive
        ? "MFA successfully verified. A secure password reset link has been sent to your registered email address."
        : "MFA successfully verified. Secure password reset link has been generated. Check console log."
    });

  } catch (error) {
    console.error("[ADMIN FORGOT PASSWORD ERROR]:", error);
    return NextResponse.json({ error: "Unable to process password reset request. Please try again." }, { status: 500 });
  }
}
