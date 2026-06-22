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
    } else {
      // Update in mockDb
      const user = mockDb.users.find((u: any) => u.id === userId);
      if (!user) {
        return NextResponse.json({ error: "User associated with this token not found." }, { status: 404 });
      }
      user.passwordHash = passwordHash;

      // Invalidate all tokens for this user
      mockDb.passwordResetTokens.forEach((t: any) => {
        if (t.userId === userId) t.used = true;
      });
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
