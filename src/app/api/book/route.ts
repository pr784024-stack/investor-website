import { NextRequest, NextResponse } from "next/server";
import { mockDb } from "@/lib/db";

function sanitize(val: string) {
  return val.replace(/<[^>]*>?/gm, "").replace(/['";<>]/g, "").trim();
}
function validateEmail(e: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
}
function validatePhone(p: string) {
  return /^(\+91|0)?[6-9]\d{9}$/.test(p.replace(/\s/g, ""));
}

// Simple rate limiter for booking
const bookingAttempts = new Map<string, { count: number; lastAttempt: number }>();

const SERVICES = [
  "Financial Consulting",
  "Business Consulting",
  "Investor Awareness Session",
  "Advisor Consultation",
  "Marketing Consultation",
  // Legacy values kept for backwards compatibility
  "Investor Lead Generation",
  "Investor Education",
  "Advisor Networking",
  "Startup Support",
  "Wealth Management",
  "Other",
];

const MEETING_MODES = [
  "Video Call", "Phone Call", "In-Person",
  // Values sent from booking page
  "Online", "Offline"
];

const VALID_TIMES = [
  "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
  "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM",
  "05:00 PM", "06:00 PM",
  // Time slots from booking page
  "11:00 AM", "02:00 PM", "04:00 PM", "06:00 PM",
  "09:00 AM",
];

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || "unknown";
  const now = Date.now();

  // Rate limiting — max 3 bookings per hour per IP
  const attempts = bookingAttempts.get(ip) || { count: 0, lastAttempt: 0 };
  if (now - attempts.lastAttempt < 3600000 && attempts.count >= 3) {
    return NextResponse.json(
      { error: "Too many booking requests. Please try again later." },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();

    const name = sanitize(body.name || "");
    const email = (body.email || "").trim().toLowerCase();
    const phone = (body.phone || "").trim();
    const serviceName = sanitize(body.serviceName || "");
    const date = sanitize(body.date || "");
    const time = sanitize(body.time || "");
    const meetingMode = sanitize(body.meetingMode || "");
    const message = sanitize(body.message || "");

    // Validation
    if (!name || name.length < 2 || name.length > 100) {
      return NextResponse.json({ error: "Invalid name." }, { status: 400 });
    }
    if (!validateEmail(email)) {
      return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
    }
    if (!validatePhone(phone)) {
      return NextResponse.json({ error: "Invalid mobile number." }, { status: 400 });
    }
    if (!SERVICES.includes(serviceName)) {
      return NextResponse.json({ error: "Invalid service selected." }, { status: 400 });
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Compare only dates, ignore time
    const selectedDate = new Date(date);
    if (!date || isNaN(selectedDate.getTime()) || selectedDate < today) {
      return NextResponse.json({ error: "Please select a valid future date." }, { status: 400 });
    }
    if (!VALID_TIMES.includes(time)) {
      return NextResponse.json({ error: "Invalid time slot selected." }, { status: 400 });
    }
    if (!MEETING_MODES.includes(meetingMode)) {
      return NextResponse.json({ error: "Invalid meeting mode." }, { status: 400 });
    }

    // Try real DB
    try {
      const { prisma } = await import("@/lib/db");
      const booking = await prisma.booking.create({
        data: {
          name,
          email,
          phone,
          serviceName,
          date,
          time,
          meetingMode,
          message,
          status: "PENDING",
        },
      });
      bookingAttempts.set(ip, { count: (attempts.count || 0) + 1, lastAttempt: now });
      return NextResponse.json({
        success: true,
        message: "Booking confirmed! You will receive a confirmation email shortly.",
        bookingId: booking.id,
      }, { status: 201 });
    } catch {
      // Mock fallback
      const booking = {
        id: crypto.randomUUID(),
        name, email, phone, serviceName, date, time, meetingMode, message,
        status: "PENDING",
        createdAt: new Date().toISOString(),
      };
      mockDb.bookings.push(booking);
      bookingAttempts.set(ip, { count: (attempts.count || 0) + 1, lastAttempt: now });
      return NextResponse.json({
        success: true,
        message: "Booking confirmed! (Demo mode) You will receive a confirmation shortly.",
        bookingId: booking.id,
      }, { status: 201 });
    }
  } catch {
    return NextResponse.json({ error: "Booking failed. Please try again." }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  // Return available time slots (simple implementation)
  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");

  if (!date) {
    return NextResponse.json({ error: "Date parameter required." }, { status: 400 });
  }

  // In production: query DB for already booked slots and filter them out
  return NextResponse.json({ 
    availableSlots: VALID_TIMES,
    date 
  });
}
