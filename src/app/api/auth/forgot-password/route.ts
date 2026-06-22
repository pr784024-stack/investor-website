import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { mockDb, isDatabaseConfigured } from "@/lib/db";
import { isEmailConfigured, sendEmail } from "@/lib/notifications";

function validateEmail(e: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rawEmail = body.email || "";
    const email = rawEmail.trim().toLowerCase();

    if (!email) {
      return NextResponse.json({ error: "Email address is required." }, { status: 400 });
    }

    if (!validateEmail(email)) {
      return NextResponse.json({ error: "Invalid email address format." }, { status: 400 });
    }

    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    const useDb = isDatabaseConfigured();
    const isEmailLive = isEmailConfigured();
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    // Keys for rate limiting
    const emailKey = `forgot-password:email:${email}`;
    const ipKey = `forgot-password:ip:${ip}`;

    // 1. Check Rate Limiting
    let emailLogsCount = 0;
    let ipLogsCount = 0;

    if (useDb) {
      const { prisma } = await import("@/lib/db");
      emailLogsCount = await prisma.rateLimitLog.count({
        where: { key: emailKey, createdAt: { gte: oneHourAgo } }
      });
      ipLogsCount = await prisma.rateLimitLog.count({
        where: { key: ipKey, createdAt: { gte: oneHourAgo } }
      });
    } else {
      emailLogsCount = mockDb.rateLimitLogs.filter(
        (log: any) => log.key === emailKey && new Date(log.createdAt) >= oneHourAgo
      ).length;
      ipLogsCount = mockDb.rateLimitLogs.filter(
        (log: any) => log.key === ipKey && new Date(log.createdAt) >= oneHourAgo
      ).length;
    }

    if (emailLogsCount >= 5 || ipLogsCount >= 5) {
      return NextResponse.json(
        { error: "Too many password reset requests. Please try again later." },
        { status: 429 }
      );
    }

    // 2. Write Rate Limit Logs
    if (useDb) {
      const { prisma } = await import("@/lib/db");
      await prisma.rateLimitLog.create({ data: { key: emailKey } });
      await prisma.rateLimitLog.create({ data: { key: ipKey } });
    } else {
      mockDb.rateLimitLogs.push(
        { id: crypto.randomUUID(), key: emailKey, createdAt: new Date() },
        { id: crypto.randomUUID(), key: ipKey, createdAt: new Date() }
      );
    }

    // 3. Find User
    let user: any = null;
    if (useDb) {
      const { prisma } = await import("@/lib/db");
      user = await prisma.user.findUnique({ where: { email } });
    } else {
      user = mockDb.users.find((u: any) => u.email === email);
    }

    const genericMessage = isEmailLive
      ? "If an account exists for this email address, a password reset link has been sent."
      : "If an account exists for this email address, a password reset link has been generated. Check terminal/console for the reset link.";

    // If user does not exist, return generic success to avoid enumeration
    if (!user) {
      return NextResponse.json({ success: true, message: genericMessage });
    }

    // 4. Generate Reset Token
    const rawToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins validity
    // Hash token using sha256 to allow direct fast DB lookups during verification, while storing it securely
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");

    if (useDb) {
      const { prisma } = await import("@/lib/db");
      // Invalidate existing tokens for this user
      await prisma.passwordResetToken.updateMany({
        where: { userId: user.id, used: false },
        data: { used: true }
      });

      // Save new token
      await prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          tokenHash,
          expiresAt
        }
      });
    } else {
      // Invalidate in mockDb
      mockDb.passwordResetTokens.forEach((t: any) => {
        if (t.userId === user.id) t.used = true;
      });

      // Save in mockDb
      mockDb.passwordResetTokens.push({
        id: crypto.randomUUID(),
        userId: user.id,
        tokenHash,
        expiresAt,
        used: false,
        createdAt: new Date()
      });
    }

    // 5. Generate Link
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const resetUrl = `${appUrl}/reset-password?token=${rawToken}`;

    // 6. Deliver Reset URL
    if (isEmailLive) {
      console.log(`\n===========================================\n[FORGOT PASSWORD SYSTEM (PRODUCTION MODE)]\nUser: ${user.name} (${user.email})\nReset Link: ${resetUrl}\n===========================================\n`);
      await sendEmail({
        to: email,
        subject: "Reset Your InvestorBridge Password",
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #f0f0f0; border-radius: 8px;">
            <h2 style="color: #0b1f3a;">Reset Password</h2>
            <p>We received a request to reset your password for your InvestorBridge account.</p>
            <p>Click the secure link below to proceed:</p>
            <p style="margin: 25px 0;">
              <a href="${resetUrl}" style="background-color: #00B386; color: white; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 25px; display: inline-block;">Reset Password</a>
            </p>
            <p style="color: #ef4444; font-size: 12px;"><strong>This link expires in 15 minutes.</strong></p>
            <hr style="border: 0; border-top: 1px solid #f0f0f0; margin: 20px 0;" />
            <p style="color: #888888; font-size: 11px;">If you did not request a password reset, please ignore this email.</p>
          </div>
        `
      });
    } else {
      console.log(`\n===========================================\n[DEMO MODE]\nPassword reset link generated:\n${resetUrl}\nExpires in: 15 minutes\n===========================================\n`);
    }

    return NextResponse.json({ success: true, message: genericMessage });

  } catch (error) {
    console.error("[FORGOT PASSWORD ERROR]:", error);
    return NextResponse.json({ error: "Unable to process password reset request. Please try again." }, { status: 500 });
  }
}
