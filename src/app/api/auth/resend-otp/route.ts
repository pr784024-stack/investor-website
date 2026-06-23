import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { mockDb, isDatabaseConfigured } from "@/lib/db";
import { isEmailConfigured, isSmsConfigured, sendEmail, sendSms } from "@/lib/notifications";

export async function POST(req: NextRequest) {
  // Safe mockDb guard
  if (!Array.isArray(mockDb.rateLimitLogs)) mockDb.rateLimitLogs = [];
  if (!Array.isArray(mockDb.emailOtps)) mockDb.emailOtps = [];
  if (!Array.isArray(mockDb.smsOtps)) mockDb.smsOtps = [];
  if (!Array.isArray(mockDb.mfaOtps)) mockDb.mfaOtps = [];

  try {
    const body = await req.json();
    const userId = body.userId || "";
    const type = body.type || "registration"; // "registration" | "mfa"
    const mfaType = body.mfaType || "email"; // "email" | "sms" | "app"

    if (!userId) {
      return NextResponse.json({ error: "User ID is required." }, { status: 400 });
    }

    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    const useDb = isDatabaseConfigured();
    let user: any = null;

    if (useDb) {
      const { prisma } = await import("@/lib/db");
      user = await prisma.user.findUnique({ where: { id: userId } });
    } else {
      user = mockDb.users.find((u: any) => u.id === userId);
    }

    if (!user) {
      return NextResponse.json({ error: "User session expired or not found. Please try again." }, { status: 404 });
    }

    const email = user.email.toLowerCase();
    const phone = user.phone;
    // 1. Rate Limiting Check & Auto-Cleanup
    let emailLogsCount = 0;
    let phoneLogsCount = 0;
    let ipLogsCount = 0;
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    const emailKey = `resend-otp:email:${email}`;
    const phoneKey = `resend-otp:phone:${phone}`;
    const ipKey = `resend-otp:ip:${ip}`;

    if (useDb) {
      const { prisma } = await import("@/lib/db");
      // Auto-cleanup old rate limit logs in database
      await prisma.rateLimitLog.deleteMany({
        where: { createdAt: { lt: oneHourAgo } }
      });
      emailLogsCount = await prisma.rateLimitLog.count({
        where: { key: emailKey, createdAt: { gte: oneHourAgo } }
      });
      phoneLogsCount = await prisma.rateLimitLog.count({
        where: { key: phoneKey, createdAt: { gte: oneHourAgo } }
      });
      ipLogsCount = await prisma.rateLimitLog.count({
        where: { key: ipKey, createdAt: { gte: oneHourAgo } }
      });
    } else {
      // Auto-cleanup old rate limit logs in mockDb
      mockDb.rateLimitLogs = mockDb.rateLimitLogs.filter(
        (log: any) => new Date(log.createdAt) >= oneHourAgo
      );
      emailLogsCount = mockDb.rateLimitLogs.filter(
        (log: any) => log.key === emailKey && new Date(log.createdAt) >= oneHourAgo
      ).length;
      phoneLogsCount = mockDb.rateLimitLogs.filter(
        (log: any) => log.key === phoneKey && new Date(log.createdAt) >= oneHourAgo
      ).length;
      ipLogsCount = mockDb.rateLimitLogs.filter(
        (log: any) => log.key === ipKey && new Date(log.createdAt) >= oneHourAgo
      ).length;
    }

    if (emailLogsCount >= 5 || phoneLogsCount >= 5 || ipLogsCount >= 5) {
      return NextResponse.json(
        { error: "Maximum OTP resend limit reached. Please try again later." },
        { status: 429 }
      );
    }

    // 2. Generate OTP Values
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 mins validity
    const isEmailLive = isEmailConfigured();
    const isSmsLive = isSmsConfigured();

    if (type === "registration") {
      const emailOtpValue = Math.floor(100000 + Math.random() * 900000).toString();
      const smsOtpValue = Math.floor(100000 + Math.random() * 900000).toString();
      const emailOtpHash = await bcrypt.hash(emailOtpValue, 10);
      const smsOtpHash = await bcrypt.hash(smsOtpValue, 10);

      if (useDb) {
        const { prisma } = await import("@/lib/db");
        // Invalidate old registration OTPs
        await prisma.emailOtp.updateMany({
          where: { userId, used: false },
          data: { used: true }
        });
        await prisma.smsOtp.updateMany({
          where: { userId, used: false },
          data: { used: true }
        });

        // Store new registration OTPs
        await prisma.emailOtp.create({
          data: { userId, otpHash: emailOtpHash, expiresAt }
        });
        await prisma.smsOtp.create({
          data: { userId, otpHash: smsOtpHash, expiresAt }
        });

        // Write rate limit logs
        await prisma.rateLimitLog.create({ data: { key: emailKey } });
        await prisma.rateLimitLog.create({ data: { key: phoneKey } });
        await prisma.rateLimitLog.create({ data: { key: ipKey } });
      } else {
        // Invalidate in mockDb
        mockDb.emailOtps.forEach((o: any) => {
          if (o.userId === userId) o.used = true;
        });
        mockDb.smsOtps.forEach((o: any) => {
          if (o.userId === userId) o.used = true;
        });

        // Store new in mockDb
        mockDb.emailOtps.push({
          id: crypto.randomUUID(),
          userId,
          otpHash: emailOtpHash,
          expiresAt,
          used: false,
          createdAt: new Date()
        });
        mockDb.smsOtps.push({
          id: crypto.randomUUID(),
          userId,
          otpHash: smsOtpHash,
          expiresAt,
          used: false,
          createdAt: new Date()
        });

        // Write rate limit logs in mockDb
        mockDb.rateLimitLogs.push(
          { id: crypto.randomUUID(), key: emailKey, createdAt: new Date() },
          { id: crypto.randomUUID(), key: phoneKey, createdAt: new Date() },
          { id: crypto.randomUUID(), key: ipKey, createdAt: new Date() }
        );
      }

      // Deliver new registration OTPs
      if (isEmailLive || isSmsLive) {
        console.log(`\n===========================================\n[OTP RESEND SYSTEM (PRODUCTION MODE)]\nUser: ${user.name} (${user.email})\nEmail OTP: [SENT VIA EMAIL]\nSMS OTP: [SENT VIA SMS]\n===========================================\n`);
      } else {
        console.log(`\n===========================================\n[OTP RESEND SYSTEM (DEMO MODE)]\nUser: ${user.name} (${user.email})\nEmail OTP: ${emailOtpValue}\nSMS OTP: ${smsOtpValue}\n===========================================\n`);
      }

      await sendEmail({
        to: email,
        subject: "Verify Your InvestorBridge Account (New Code)",
        html: `<p>Your new email verification code is: <strong>${emailOtpValue}</strong></p><p>This OTP expires in 5 minutes.</p>`
      });
      await sendSms({
        phone,
        message: `Your new InvestorBridge verification OTP is: ${smsOtpValue}. Expiry 5 mins.`
      });

    } else if (type === "mfa") {
      const mfaOtpValue = Math.floor(100000 + Math.random() * 900000).toString();
      const mfaOtpHash = await bcrypt.hash(mfaOtpValue, 10);

      if (useDb) {
        const { prisma } = await import("@/lib/db");
        // Invalidate old MFA OTPs
        await prisma.mfaOtp.updateMany({
          where: { userId, used: false },
          data: { used: true }
        });

        // Store new MFA OTP
        await prisma.mfaOtp.create({
          data: { userId, otpHash: mfaOtpHash, expiresAt }
        });

        // Write rate limit logs
        await prisma.rateLimitLog.create({ data: { key: emailKey } });
        await prisma.rateLimitLog.create({ data: { key: phoneKey } });
        await prisma.rateLimitLog.create({ data: { key: ipKey } });
      } else {
        // Invalidate in mockDb
        mockDb.mfaOtps.forEach((o: any) => {
          if (o.userId === userId) o.used = true;
        });

        // Store new in mockDb
        mockDb.mfaOtps.push({
          id: crypto.randomUUID(),
          userId,
          otpHash: mfaOtpHash,
          expiresAt,
          used: false,
          createdAt: new Date()
        });

        // Write rate limit logs in mockDb
        mockDb.rateLimitLogs.push(
          { id: crypto.randomUUID(), key: emailKey, createdAt: new Date() },
          { id: crypto.randomUUID(), key: phoneKey, createdAt: new Date() },
          { id: crypto.randomUUID(), key: ipKey, createdAt: new Date() }
        );
      }

      // Deliver new MFA OTP
      if (isEmailLive || isSmsLive) {
        console.log(`\n===========================================\n[MFA OTP RESEND SYSTEM (PRODUCTION MODE)]\nUser: ${user.name} (${user.email})\nMFA OTP: [SENT VIA ${isEmailLive ? 'EMAIL' : 'SMS'}]\n===========================================\n`);
      } else {
        console.log(`\n===========================================\n[MFA OTP RESEND SYSTEM (DEMO MODE)]\nUser: ${user.name} (${user.email})\nMFA OTP: ${mfaOtpValue}\n===========================================\n`);
      }

      if (mfaType === "email") {
        await sendEmail({
          to: email,
          subject: "Your New InvestorBridge MFA Verification Code",
          html: `<p>Your new MFA verification code is: <strong>${mfaOtpValue}</strong></p><p>This OTP expires in 5 minutes.</p>`
        });
      } else if (mfaType === "sms") {
        await sendSms({
          phone,
          message: `Your new InvestorBridge MFA verification code is: ${mfaOtpValue}. Expiry 5 mins.`
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: "New verification codes have been sent to your registered email address and mobile number."
    });

  } catch (error) {
    console.error("[RESEND OTP ERROR]:", error);
    return NextResponse.json({ error: "Unable to send verification codes. Please try again." }, { status: 500 });
  }
}
