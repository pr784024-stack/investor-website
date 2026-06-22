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
function validatePhone(p: string) {
  return /^(\+91|0)?[6-9]\d{9}$/.test(p.replace(/\s/g, ""));
}
function validatePassword(p: string) {
  // Min 12 chars, uppercase, lowercase, digit, special char
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{12,}$/.test(p);
}

const COMMON_PASSWORDS = [
  "Password123!", "Qwerty123456!", "Admin@12345!", "Pass@word12!",
  "Welcome123!", "Abcd1234!", "1234567890Ab!"
];

// In-memory rate limiter (production should use Redis)
const registrationAttempts = new Map<string, { count: number; lastAttempt: number }>();

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || "unknown";

  // Rate limiting (security rule)
  const now = Date.now();
  const attempts = registrationAttempts.get(ip) || { count: 0, lastAttempt: 0 };
  if (now - attempts.lastAttempt < 3600000 && attempts.count >= 5) {
    return NextResponse.json(
      { error: "Too many registration attempts. Please try again later." },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const name = sanitize(body.name || "");
    const email = (body.email || "").trim().toLowerCase();
    const phone = (body.phone || "").trim();
    const password = body.password || "";
    const confirmPassword = body.confirmPassword || "";

    // Server-side validation
    if (!name || name.length < 2 || name.length > 100 || !/^[a-zA-Z\s\-'.]+$/.test(name)) {
      return NextResponse.json({ error: "Full name is invalid (2–100 chars, letters only)." }, { status: 400 });
    }
    if (!validateEmail(email)) {
      return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
    }
    if (!validatePhone(phone)) {
      return NextResponse.json({ error: "Invalid Indian mobile number." }, { status: 400 });
    }
    if (!validatePassword(password)) {
      return NextResponse.json({
        error: "Password must be at least 12 characters and include uppercase, lowercase, number and special character."
      }, { status: 400 });
    }
    if (COMMON_PASSWORDS.includes(password)) {
      return NextResponse.json({ error: "This password is too common. Please choose a stronger one." }, { status: 400 });
    }
    if (password !== confirmPassword) {
      return NextResponse.json({ error: "Passwords do not match." }, { status: 400 });
    }

    // Check duplicates in mock DB - but only for VERIFIED users
    // Unverified users from past failed attempts can be replaced
    const existingEmail = mockDb.users.find((u: any) => u.email === email && u.isVerifiedEmail === true);
    if (existingEmail) {
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
    }
    const existingPhone = mockDb.users.find((u: any) => u.phone === phone && u.isVerifiedPhone === true);
    if (existingPhone) {
      return NextResponse.json({ error: "An account with this mobile number already exists." }, { status: 409 });
    }

    // Remove any stale unverified entries for this email/phone from previous failed attempts
    const staleIdx = mockDb.users.findIndex((u: any) => (u.email === email || u.phone === phone) && !u.isVerifiedEmail);
    if (staleIdx !== -1) {
      mockDb.users.splice(staleIdx, 1);
    }

    const cleanPhone = phone.replace(/\s/g, "");
    const emailOtpValue = Math.floor(100000 + Math.random() * 900000).toString();
    const smsOtpValue = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 mins
    const emailOtpHash = await bcrypt.hash(emailOtpValue, 10);
    const smsOtpHash = await bcrypt.hash(smsOtpValue, 10);
    const passwordHash = await bcrypt.hash(password, 12);

    const useDb = isDatabaseConfigured();
    const isEmailLive = isEmailConfigured();
    const isSmsLive = isSmsConfigured();

    if (useDb) {
      try {
        const { prisma } = await import("@/lib/db");
        
        const existingUser = await prisma.user.findFirst({
          where: {
            OR: [
              { email },
              { phone: cleanPhone }
            ]
          }
        });
        if (existingUser) {
          if (existingUser.email === email) {
            return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
          }
          return NextResponse.json({ error: "An account with this mobile number already exists." }, { status: 409 });
        }

        if (isEmailLive || isSmsLive) {
          console.log(`\n===========================================\n[OTP VERIFICATION SYSTEM (PRODUCTION MODE)]\nUser: ${name} (${email})\nEmail OTP: ${emailOtpValue} (Sent: ${isEmailLive})\nSMS OTP: ${smsOtpValue} (Sent: ${isSmsLive})\n===========================================\n`);
        } else {
          console.log(`\n===========================================\n[OTP VERIFICATION SYSTEM (DEMO MODE - DB)]\nUser: ${name} (${email})\nEmail OTP: ${emailOtpValue}\nSMS OTP: ${smsOtpValue}\n===========================================\n`);
        }

        const user = await prisma.user.create({
          data: {
            name,
            email,
            phone: cleanPhone,
            passwordHash,
            role: "USER",
            isVerifiedEmail: false,
            isVerifiedPhone: false,
          },
        });

        // Save OTPs
        await prisma.emailOtp.create({
          data: {
            userId: user.id,
            otpHash: emailOtpHash,
            expiresAt,
          }
        });

        await prisma.smsOtp.create({
          data: {
            userId: user.id,
            otpHash: smsOtpHash,
            expiresAt,
          }
        });

        // Send OTPs via Resend/Brevo/SMTP & MSG91/Twilio
        await sendEmail({
          to: email,
          subject: "Verify Your InvestorBridge Account",
          html: `<p>Your email verification code is: <strong>${emailOtpValue}</strong></p><p>This OTP expires in 5 minutes.</p>`
        });
        await sendSms({
          phone: cleanPhone,
          message: `Your InvestorBridge verification OTP is: ${smsOtpValue}. Expiry 5 mins.`
        });

        registrationAttempts.set(ip, { count: 0, lastAttempt: now });
        return NextResponse.json({
          success: true,
          message: "Account created! OTP verification sent.",
          userId: user.id,
        }, { status: 201 });

      } catch (dbError) {
        console.error("Real database creation failed:", dbError);
        return NextResponse.json({ error: "Database transaction failed. Please check your PostgreSQL server connection." }, { status: 500 });
      }
    }

    // Demo Mode Flow
    if (isEmailLive || isSmsLive) {
      console.log(`\n===========================================\n[OTP VERIFICATION SYSTEM (PRODUCTION MODE)]\nUser: ${name} (${email})\nEmail OTP: ${emailOtpValue} (Sent: ${isEmailLive})\nSMS OTP: ${smsOtpValue} (Sent: ${isSmsLive})\n===========================================\n`);
    } else {
      console.log(`\n===========================================\n[OTP VERIFICATION SYSTEM (DEMO MODE)]\nUser: ${name} (${email})\nEmail OTP: ${emailOtpValue}\nSMS OTP: ${smsOtpValue}\n===========================================\n`);
    }

    const newUser = {
      id: crypto.randomUUID(),
      name,
      email,
      phone: cleanPhone,
      passwordHash,
      role: email.endsWith("@investorbridge.com") ? "ADMIN" : "USER",
      isVerifiedEmail: false,
      isVerifiedPhone: false,
      createdAt: new Date().toISOString(),
    };
    mockDb.users.push(newUser);

    // Save OTPs in mock DB
    mockDb.emailOtps.push({
      id: crypto.randomUUID(),
      userId: newUser.id,
      otpHash: emailOtpHash,
      expiresAt,
      used: false,
      createdAt: new Date()
    });

    mockDb.smsOtps.push({
      id: crypto.randomUUID(),
      userId: newUser.id,
      otpHash: smsOtpHash,
      expiresAt,
      used: false,
      createdAt: new Date()
    });

    // Send simulated OTP notifications (which print to console log via sendEmail/sendSms in demo mode)
    await sendEmail({
      to: email,
      subject: "Verify Your InvestorBridge Account (Demo)",
      html: `<p>Your email verification code is: <strong>${emailOtpValue}</strong></p><p>This OTP expires in 5 minutes.</p>`
    });
    await sendSms({
      phone: cleanPhone,
      message: `Your InvestorBridge verification OTP is: ${smsOtpValue}. Expiry 5 mins.`
    });

    registrationAttempts.set(ip, { count: 0, lastAttempt: now });

    return NextResponse.json({
      success: true,
      message: "Account created successfully! (Demo mode — OTP verification required)",
      userId: newUser.id,
    }, { status: 201 });

  } catch (error) {
    // Track failed attempt
    registrationAttempts.set(ip, {
      count: (attempts.count || 0) + 1,
      lastAttempt: now,
    });
    return NextResponse.json({ error: "Registration failed. Please try again." }, { status: 500 });
  }
}
