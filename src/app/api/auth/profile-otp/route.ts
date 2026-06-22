import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { mockDb, isDatabaseConfigured } from "@/lib/db";
import { isEmailConfigured, sendEmail } from "@/lib/notifications";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const userId = body.userId || "";

    if (!userId) {
      return NextResponse.json({ error: "Missing user details." }, { status: 400 });
    }

    const useDb = isDatabaseConfigured();
    let user: any = null;

    if (useDb) {
      try {
        const { prisma } = await import("@/lib/db");
        user = await prisma.user.findUnique({ where: { id: userId } });
      } catch (dbErr) {
        console.error("Database query failed in profile-otp:", dbErr);
        return NextResponse.json({ error: "Database query failed. Please verify your PostgreSQL connection." }, { status: 500 });
      }
    } else {
      user = mockDb.users.find((u: any) => u.id === userId);
    }

    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    const otpValue = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 mins
    const otpHash = await bcrypt.hash(otpValue, 10);

    if (useDb) {
      const { prisma } = await import("@/lib/db");
      await prisma.mfaOtp.create({
        data: {
          userId,
          otpHash,
          expiresAt,
        }
      });
    } else {
      mockDb.mfaOtps.push({
        id: crypto.randomUUID(),
        userId: user.id,
        otpHash,
        expiresAt,
        used: false,
        createdAt: new Date()
      });
    }

    const isEmailLive = isEmailConfigured();

    if (isEmailLive) {
      console.log(`\n===========================================\n[PROFILE UPDATE OTP (PRODUCTION MODE)]\nUser: ${user.name} (${user.email})\nOTP Code: ${otpValue} (Sent)\n===========================================\n`);
      await sendEmail({
        to: user.email,
        subject: "InvestorBridge Profile Change OTP",
        html: `<p>Your profile update authorization code is: <strong>${otpValue}</strong></p><p>This OTP expires in 5 minutes.</p>`
      });
    } else {
      console.log(`\n===========================================\n[PROFILE UPDATE OTP (DEMO MODE)]\nUser: ${user.name} (${user.email})\nOTP Code: ${otpValue}\n===========================================\n`);
    }

    return NextResponse.json({ success: true, message: "Verification OTP generated." });

  } catch (error) {
    console.error("Profile OTP generation failed:", error);
    return NextResponse.json({ error: "Failed to generate OTP." }, { status: 500 });
  }
}
