import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { mockDb, isDatabaseConfigured } from "@/lib/db";
import { isEmailConfigured, isSmsConfigured, sendEmail, sendSms } from "@/lib/notifications";

// Recovery phone for OTP fallback — set via RECOVERY_PHONE env variable
const RECOVERY_PHONE = process.env.RECOVERY_PHONE || "";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const userId = body.userId || "";
    const emailOtp = body.emailOtp || "";
    const smsOtp = body.smsOtp || "";

    if (!userId || !emailOtp || !smsOtp) {
      return NextResponse.json({ error: "Missing required verification details." }, { status: 400 });
    }

    const useDb = isDatabaseConfigured();

    if (!useDb) {
      // ============================================================
      // DEMO MODE: Verify using mockDb
      // ============================================================
      let mockUser = mockDb.users.find((u: any) => u.id === userId);

      // Reconstruct the user in mockDb if not found but details are provided (e.g. server restarted)
      const name = body.name || "";
      const email = body.email || "";
      const phone = body.phone || "";
      if (!mockUser && name && email && phone) {
        mockUser = {
          id: userId,
          name,
          email,
          phone,
          passwordHash: "", // Not needed for verification phase
          role: email.endsWith("@investorbridge.com") ? "ADMIN" : "USER",
          mfaEnabled: false,
          isVerifiedEmail: false,
          isVerifiedPhone: false,
          createdAt: new Date().toISOString()
        };
        mockDb.users.push(mockUser);
        console.log(`[VERIFY RECOVERY] Re-created user ${email} in mockDb after server restart.`);
      }

      if (!mockUser) {
        return NextResponse.json({ error: "User not found. Please register again." }, { status: 404 });
      }

      // Find email OTP in mockDb
      const emailOtps = mockDb.emailOtps
        .filter((o: any) => o.userId === userId && !o.used)
        .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      const latestEmailOtp = emailOtps[0];

      // Find SMS OTP in mockDb
      const smsOtps = mockDb.smsOtps
        .filter((o: any) => o.userId === userId && !o.used)
        .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      const latestSmsOtp = smsOtps[0];

      // OTP Restart Recovery Fallback (Option B)
      if (!latestEmailOtp || !latestSmsOtp) {
        const emailOtpValue = Math.floor(100000 + Math.random() * 900000).toString();
        const smsOtpValue = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 mins
        const emailOtpHash = await bcrypt.hash(emailOtpValue, 10);
        const smsOtpHash = await bcrypt.hash(smsOtpValue, 10);

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

        const isEmailLive = isEmailConfigured();
        const isSmsLive = isSmsConfigured();

        console.log(`\n===========================================\n[OTP VERIFICATION SYSTEM (SERVER RESTART RECOVERY)]\nUser: ${mockUser.name} (${mockUser.email})\nEmail OTP: ${emailOtpValue}\nSMS OTP: ${smsOtpValue}\n===========================================\n`);

        if (isEmailLive) {
          await sendEmail({
            to: mockUser.email,
            subject: "Verify Your InvestorBridge Account (New Code)",
            html: `<p>Your email verification code is: <strong>${emailOtpValue}</strong></p><p>This OTP expires in 5 minutes.</p>`
          });
        }
        if (isSmsLive) {
          await sendSms({
            phone: mockUser.phone,
            message: `Your InvestorBridge verification OTP is: ${smsOtpValue}. Expiry 5 mins.`
          });
        }

        const msg = isEmailLive || isSmsLive
          ? "Server restarted. A new OTP has been sent. Please enter the new OTP."
          : "Server restarted. A new OTP has been generated. Please enter the new OTP shown in terminal.";

        return NextResponse.json({ error: msg }, { status: 400 });
      }

      // Verify Email OTP
      if (new Date() > new Date(latestEmailOtp.expiresAt)) {
        return NextResponse.json({ error: "Email OTP has expired. Please restart registration." }, { status: 400 });
      }
      const emailMatches = await bcrypt.compare(emailOtp, latestEmailOtp.otpHash);
      if (!emailMatches) {
        return NextResponse.json({ error: "Invalid Email OTP." }, { status: 400 });
      }

      // Verify SMS OTP
      if (new Date() > new Date(latestSmsOtp.expiresAt)) {
        return NextResponse.json({ error: "SMS OTP has expired. Please restart registration." }, { status: 400 });
      }
      const smsMatches = await bcrypt.compare(smsOtp, latestSmsOtp.otpHash);
      if (!smsMatches) {
        return NextResponse.json({ error: "Invalid SMS OTP." }, { status: 400 });
      }

      // Mark OTPs as used and verify user
      latestEmailOtp.used = true;
      latestSmsOtp.used = true;
      mockUser.isVerifiedEmail = true;
      mockUser.isVerifiedPhone = true;

      console.log(`[VERIFY SUCCESS] User ${mockUser.email} verified via mockDb.`);

      return NextResponse.json({
        success: true,
        message: "Account verified successfully! (Demo mode)",
        user: {
          id: mockUser.id,
          name: mockUser.name,
          email: mockUser.email,
          phone: mockUser.phone,
          role: mockUser.role,
          isVerifiedEmail: true,
          isVerifiedPhone: true
        }
      });
    }

    // ============================================================
    // PRODUCTION MODE: Verify using Prisma (PostgreSQL)
    // ============================================================
    try {
      const { prisma } = await import("@/lib/db");

      // Find user
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        return NextResponse.json({ error: "User not found. Please register again." }, { status: 404 });
      }

      // Verify email OTP
      let latestEmailOtp = await prisma.emailOtp.findFirst({
        where: { userId, used: false },
        orderBy: { createdAt: "desc" }
      });

      // Verify SMS OTP
      let latestSmsOtp = await prisma.smsOtp.findFirst({
        where: { userId, used: false },
        orderBy: { createdAt: "desc" }
      });

      // OTP Restart Recovery Fallback (Option B)
      if (!latestEmailOtp || !latestSmsOtp) {
        const emailOtpValue = Math.floor(100000 + Math.random() * 900000).toString();
        const smsOtpValue = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 mins
        const emailOtpHash = await bcrypt.hash(emailOtpValue, 10);
        const smsOtpHash = await bcrypt.hash(smsOtpValue, 10);

        await prisma.emailOtp.create({
          data: {
            userId,
            otpHash: emailOtpHash,
            expiresAt,
          }
        });

        await prisma.smsOtp.create({
          data: {
            userId,
            otpHash: smsOtpHash,
            expiresAt,
          }
        });

        const isEmailLive = isEmailConfigured();
        const isSmsLive = isSmsConfigured();

        console.log(`\n===========================================\n[OTP VERIFICATION SYSTEM (SERVER RESTART RECOVERY - DB)]\nUser: ${user.name} (${user.email})\nEmail OTP: ${emailOtpValue}\nSMS OTP: ${smsOtpValue}\n===========================================\n`);

        if (isEmailLive) {
          await sendEmail({
            to: user.email,
            subject: "Verify Your InvestorBridge Account (New Code)",
            html: `<p>Your email verification code is: <strong>${emailOtpValue}</strong></p><p>This OTP expires in 5 minutes.</p>`
          });
        }
        if (isSmsLive) {
          await sendSms({
            phone: user.phone,
            message: `Your InvestorBridge verification OTP is: ${smsOtpValue}. Expiry 5 mins.`
          });
        }

        const msg = isEmailLive || isSmsLive
          ? "Server restarted. A new OTP has been sent. Please enter the new OTP."
          : "Server restarted. A new OTP has been generated. Please enter the new OTP shown in terminal.";

        return NextResponse.json({ error: msg }, { status: 400 });
      }

      // Check expiry & compare Email OTP
      if (new Date() > latestEmailOtp.expiresAt) {
        return NextResponse.json({ error: "Email verification code has expired or is invalid." }, { status: 400 });
      }
      const emailMatches = await bcrypt.compare(emailOtp, latestEmailOtp.otpHash);
      if (!emailMatches) {
        return NextResponse.json({ error: "Invalid Email OTP." }, { status: 400 });
      }

      // Check expiry & compare SMS OTP
      if (new Date() > latestSmsOtp.expiresAt) {
        return NextResponse.json({ error: "SMS verification code has expired or is invalid." }, { status: 400 });
      }
      const smsMatches = await bcrypt.compare(smsOtp, latestSmsOtp.otpHash);
      if (!smsMatches) {
        return NextResponse.json({ error: "Invalid SMS OTP." }, { status: 400 });
      }

      // Mark OTPs as used
      await prisma.emailOtp.update({ where: { id: latestEmailOtp.id }, data: { used: true } });
      await prisma.smsOtp.update({ where: { id: latestSmsOtp.id }, data: { used: true } });

      // Mark user as verified
      await prisma.user.update({
        where: { id: userId },
        data: { isVerifiedEmail: true, isVerifiedPhone: true }
      });

      return NextResponse.json({
        success: true,
        message: "Account verified successfully!",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          isVerifiedEmail: true,
          isVerifiedPhone: true
        }
      });

    } catch (dbError) {
      console.error("Prisma verification failed:", dbError);
      return NextResponse.json({ error: "Verification system error. Please register again." }, { status: 500 });
    }

  } catch (error) {
    return NextResponse.json({ error: "Verification failed. Please try again." }, { status: 500 });
  }
}
