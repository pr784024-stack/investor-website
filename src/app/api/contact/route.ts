import { NextRequest, NextResponse } from "next/server";
import { mockDb } from "@/lib/db";

// Input sanitization
function sanitize(value: string): string {
  return value.replace(/<[^>]*>?/gm, "").replace(/['";<>]/g, "").trim();
}

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const name = sanitize(body.name || "");
    const email = (body.email || "").trim().toLowerCase();
    const phone = (body.phone || "").trim();
    const subject = sanitize(body.subject || "");
    const message = sanitize(body.message || "");

    // Server-side validation (security rule)
    if (!name || name.length < 2 || name.length > 100) {
      return NextResponse.json({ error: "Invalid name (2–100 characters required)." }, { status: 400 });
    }
    if (!/^[a-zA-Z\s\-'.]+$/.test(name)) {
      return NextResponse.json({ error: "Name contains invalid characters." }, { status: 400 });
    }
    if (!validateEmail(email)) {
      return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
    }
    if (!subject || subject.length < 3) {
      return NextResponse.json({ error: "Subject is required." }, { status: 400 });
    }
    if (!message || message.length < 20 || message.length > 2000) {
      return NextResponse.json({ error: "Message must be 20–2000 characters." }, { status: 400 });
    }

    // Store in mock DB (in production, use Prisma to persist to PostgreSQL)
    const contactEntry = {
      id: crypto.randomUUID(),
      name,
      email,
      phone,
      subject,
      message,
      status: "NEW",
      createdAt: new Date().toISOString(),
    };

    // Try to save to real DB (safe fallback to mock if DB not connected)
    try {
      const { prisma } = await import("@/lib/db");
      await prisma.contactRequest.create({
        data: {
          name,
          email,
          phone,
          message: `[${subject}] ${message}`,
          status: "NEW",
        },
      });
    } catch {
      // DB not connected — use in-memory mock
      (mockDb as any).contacts = (mockDb as any).contacts || [];
      (mockDb as any).contacts.push(contactEntry);
    }

    return NextResponse.json({ success: true, message: "Contact request submitted successfully." });
  } catch {
    return NextResponse.json({ error: "Internal server error. Please try again." }, { status: 500 });
  }
}
