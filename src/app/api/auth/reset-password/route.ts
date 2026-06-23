import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { mockDb, isDatabaseConfigured } from "@/lib/db";

function validatePassword(p: string) {
  // Min 12 chars, uppercase, lowercase, digit, special char
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{12,}$/.test(p);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const token = body.token || "";
    const password = body.password || "";
    const confirmPassword = body.confirmPassword || "";

    if (!token) {
      return NextResponse.json({ error: "Reset token is required." }, { status: 400 });
    }

    if (!password) {
      return NextResponse.json({ error: "Password is required." }, { status: 400 });
    }

    if (!validatePassword(password)) {
      return NextResponse.json({
        error: "Password must be at least 12 characters and include uppercase, lowercase, number and special character."
      }, { status: 400 });
    }

    if (password !== confirmPassword) {
      return NextResponse.json({ error: "Passwords do not match." }, { status: 400 });
    }

    // Hash of token to look up
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const useDb = isDatabaseConfigured();
    let tokenRecord: any = null;

    if (useDb) {
      const { prisma } = await import("@/lib/db");
      tokenRecord = await prisma.passwordResetToken.findFirst({
        where: { tokenHash, used: false }
      });
    } else {
      tokenRecord = mockDb.passwordResetTokens.find(
        (t: any) => t.tokenHash === tokenHash && !t.used
      );
    }

    if (!tokenRecord || new Date() > new Date(tokenRecord.expiresAt)) {
      return NextResponse.json({ error: "This password reset link is invalid or expired." }, { status: 400 });
    }

    const userId = tokenRecord.userId;
    let user: any = null;

    if (useDb) {
      const { prisma } = await import("@/lib/db");
      user = await prisma.user.findUnique({ where: { id: userId } });
    } else {
      user = mockDb.users.find((u: any) => u.id === userId);
    }

    if (!user) {
      return NextResponse.json({ error: "User associated with this token not found." }, { status: 404 });
    }

    // Require and verify MFA for ADMIN user at password change time
    if (user.role === "ADMIN") {
      const mfaCode = body.mfaCode || "";
      if (!mfaCode) {
        return NextResponse.json({
          error: "Admin authentication required.",
          mfaRequired: true
        }, { status: 200 }); // Status 200 to allow the client to prompt for MFA code
      }

      let latestMfa: any = null;
      if (useDb) {
        const { prisma } = await import("@/lib/db");
        latestMfa = await prisma.mfaOtp.findFirst({
          where: { userId, used: false },
          orderBy: { createdAt: "desc" }
        });
      } else {
        const mfas = mockDb.mfaOtps
          .filter((o: any) => o.userId === userId && !o.used)
          .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        latestMfa = mfas[0];
      }

      if (!latestMfa || new Date() > new Date(latestMfa.expiresAt)) {
        return NextResponse.json({ error: "Admin MFA code expired or not found. Please request a new code." }, { status: 400 });
      }

      const mfaMatches = await bcrypt.compare(mfaCode, latestMfa.otpHash);
      if (!mfaMatches) {
        return NextResponse.json({ error: "Invalid Admin MFA verification code." }, { status: 400 });
      }

      // Mark MFA OTP as used
      if (useDb) {
        const { prisma } = await import("@/lib/db");
        await prisma.mfaOtp.update({ where: { id: latestMfa.id }, data: { used: true } });
      } else {
        latestMfa.used = true;
      }
    }

    const passwordHash = await bcrypt.hash(password, 12);

    if (useDb) {
      const { prisma } = await import("@/lib/db");
      
      // Update user password
      await prisma.user.update({
        where: { id: userId },
        data: { passwordHash }
      });

      // Invalidate all tokens for this user
      await prisma.passwordResetToken.updateMany({
        where: { userId },
        data: { used: true }
      });

      // Add audit log for Admin password change success
      if (user.role === "ADMIN") {
        await prisma.adminLog.create({
          data: {
            adminId: userId,
            action: "PASSWORD_CHANGED_SUCCESS",
            details: "Admin password changed successfully after double MFA check",
            ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1"
          }
        });
      }
    } else {
      // Update in mockDb
      user.passwordHash = passwordHash;

      // Invalidate all tokens for this user
      mockDb.passwordResetTokens.forEach((t: any) => {
        if (t.userId === userId) t.used = true;
      });

      // Add audit log in mockDb
      if (user.role === "ADMIN") {
        mockDb.adminLogs.push({
          id: crypto.randomUUID(),
          adminId: userId,
          action: "PASSWORD_CHANGED_SUCCESS",
          details: "Admin password changed successfully after double MFA check",
          ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1",
          createdAt: new Date()
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: "Your password has been successfully updated. Please login with your new password."
    });

  } catch (error) {
    console.error("[RESET PASSWORD ERROR]:", error);
    return NextResponse.json({ error: "Failed to reset password. Please try again." }, { status: 500 });
  }
}
