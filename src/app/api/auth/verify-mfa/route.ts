import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { mockDb, isDatabaseConfigured } from "@/lib/db";
import { isEmailConfigured, isSmsConfigured, sendEmail, sendSms } from "@/lib/notifications";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const userId = body.userId || "";
    const mfaCode = body.mfaCode || "";

    if (!userId || !mfaCode) {
      return NextResponse.json({ error: "Missing required MFA verification details." }, { status: 400 });
    }

    const useDb = isDatabaseConfigured();
    let user: any = null;

    if (useDb) {
      try {
        const { prisma } = await import("@/lib/db");
        user = await prisma.user.findUnique({ where: { id: userId } });
      } catch (dbErr) {
        console.error("Database query failed in verify-mfa:", dbErr);
        return NextResponse.json({ error: "Database query failed. Please verify your PostgreSQL connection." }, { status: 500 });
      }
    } else {
      user = mockDb.users.find((u: any) => u.id === userId);
    }

    if (!user) {
      return NextResponse.json({ error: "User not found. Please try logging in again." }, { status: 404 });
    }

    let latestMfaOtp: any = null;

    if (useDb) {
      const { prisma } = await import("@/lib/db");
      latestMfaOtp = await prisma.mfaOtp.findFirst({
        where: { userId, used: false },
        orderBy: { createdAt: "desc" }
      });
    } else {
      const mfaOtps = mockDb.mfaOtps
        .filter((o: any) => o.userId === userId && !o.used)
        .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      latestMfaOtp = mfaOtps[0];
    }

    // MFA Server Restart Recovery (Option B)
    if (!latestMfaOtp) {
      const newMfaOtpValue = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 mins
      const mfaOtpHash = await bcrypt.hash(newMfaOtpValue, 10);

      if (useDb) {
        const { prisma } = await import("@/lib/db");
        await prisma.mfaOtp.create({
          data: {
            userId,
            otpHash: mfaOtpHash,
            expiresAt,
          }
        });
      } else {
        mockDb.mfaOtps.push({
          id: crypto.randomUUID(),
          userId: user.id,
          otpHash: mfaOtpHash,
          expiresAt,
          used: false,
          createdAt: new Date()
        });
      }

      const isEmailLive = isEmailConfigured();
      const isSmsLive = isSmsConfigured();

      console.log(`\n===========================================\n[MFA SYSTEM (SERVER RESTART RECOVERY)]\nUser: ${user.name} (${user.email})\nMFA OTP Code: ${newMfaOtpValue}\n===========================================\n`);

      if (isEmailLive) {
        await sendEmail({
          to: user.email,
          subject: "Your InvestorBridge MFA Verification Code",
          html: `<p>Your MFA verification code is: <strong>${newMfaOtpValue}</strong></p><p>This OTP expires in 5 minutes.</p>`
        });
      } else if (isSmsLive) {
        await sendSms({
          phone: user.phone,
          message: `Your InvestorBridge MFA verification code is: ${newMfaOtpValue}. Expiry 5 mins.`
        });
      }

      const msg = isEmailLive || isSmsLive
        ? "Server restarted. A new MFA code has been sent. Please enter the new code."
        : "Server restarted. A new MFA code has been generated. Please enter the new code shown in terminal.";

      return NextResponse.json({ error: msg }, { status: 400 });
    }

    // Check expiry
    if (new Date() > new Date(latestMfaOtp.expiresAt)) {
      return NextResponse.json({ error: "MFA code has expired. Please log in again." }, { status: 400 });
    }

    // Verify MFA OTP code
    const isMfaMatches = await bcrypt.compare(mfaCode, latestMfaOtp.otpHash);
    if (!isMfaMatches) {
      return NextResponse.json({ error: "Invalid verification code." }, { status: 400 });
    }

    // Mark MFA OTP as used
    if (useDb) {
      const { prisma } = await import("@/lib/db");
      await prisma.mfaOtp.update({
        where: { id: latestMfaOtp.id },
        data: { used: true }
      });
    } else {
      latestMfaOtp.used = true;
    }

    // Generate JWT
    const secret = process.env.JWT_SECRET || "super-secure-jwt-secret";
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role || "USER" },
      secret,
      { expiresIn: "7d" }
    );

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role || "USER",
        mfaEnabled: true,
        isVerifiedEmail: true,
        isVerifiedPhone: true,
      },
    });

    // Set secure cookie
    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    console.log(`[MFA SUCCESS] User ${user.email} successfully logged in via MFA.`);

    return response;

  } catch (error) {
    console.error("MFA verification exception:", error);
    return NextResponse.json({ error: "MFA verification failed. Please try again." }, { status: 500 });
  }
}
