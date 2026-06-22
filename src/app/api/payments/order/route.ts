import { NextRequest, NextResponse } from "next/server";
import { mockDb } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const userId = body.userId || null;
    const bookingId = body.bookingId || null;
    const serviceName = body.serviceName || "";
    const amount = Number(body.amount || 0);

    if (!serviceName || amount <= 0) {
      return NextResponse.json({ error: "Invalid order details." }, { status: 400 });
    }

    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    const receipt = `rcpt_${Date.now()}`;

    // Try real Razorpay Order Creation via API
    if (keyId && keySecret && keyId !== "xxxx" && keySecret !== "xxxx") {
      try {
        const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
        const res = await fetch("https://api.razorpay.com/v1/orders", {
          method: "POST",
          headers: {
            "Authorization": `Basic ${auth}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            amount: amount * 100, // Razorpay amount in paise
            currency: "INR",
            receipt,
            notes: { userId: userId || "", bookingId: bookingId || "", serviceName }
          })
        });

        if (res.ok) {
          const order = await res.json();

          // Try to save RazorpayOrder in Prisma
          try {
            const { prisma } = await import("@/lib/db");
            await prisma.payment.create({
              data: {
                userId,
                bookingId,
                amount,
                currency: "INR",
                status: "PENDING",
                razorpayOrderId: order.id,
                service: serviceName,
                tax: Math.round(amount * 0.18),
                total: Math.round(amount * 1.18),
                invoiceNumber: `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`
              }
            });
          } catch (dbErr) {
            console.warn("Prisma failed to save order, fallback to mockDb:", dbErr);
            mockDb.payments.push({
              id: `pay-${Date.now()}`,
              userId,
              bookingId,
              amount,
              currency: "INR",
              status: "PENDING",
              razorpayOrderId: order.id,
              service: serviceName,
              tax: Math.round(amount * 0.18),
              total: Math.round(amount * 1.18),
              invoiceNumber: `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
              createdAt: new Date().toISOString()
            });
          }

          return NextResponse.json({
            success: true,
            id: order.id,
            amount: order.amount,
            currency: order.currency,
            key: keyId
          });
        } else {
          const errText = await res.text();
          throw new Error(errText);
        }
      } catch (err) {
        console.warn("Razorpay API request failed. Falling back to sandbox simulation mode:", err);
      }
    }

    // SIMULATED MOCK ORDER (When key is missing or API failed)
    const mockOrderId = `order_mock_${Date.now()}`;
    
    // Save mock record in DB / mockDb
    try {
      const { prisma } = await import("@/lib/db");
      await prisma.payment.create({
        data: {
          userId,
          bookingId,
          amount,
          currency: "INR",
          status: "PENDING",
          razorpayOrderId: mockOrderId,
          service: serviceName,
          tax: Math.round(amount * 0.18),
          total: Math.round(amount * 1.18),
          invoiceNumber: `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`
        }
      });
    } catch {
      mockDb.payments.push({
        id: `pay-${Date.now()}`,
        userId,
        bookingId,
        amount,
        currency: "INR",
        status: "PENDING",
        razorpayOrderId: mockOrderId,
        service: serviceName,
        tax: Math.round(amount * 0.18),
        total: Math.round(amount * 1.18),
        invoiceNumber: `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        createdAt: new Date().toISOString()
      });
    }

    return NextResponse.json({
      success: true,
      id: mockOrderId,
      amount: amount * 100,
      currency: "INR",
      key: keyId || "rzp_test_mock"
    });

  } catch (error) {
    return NextResponse.json({ error: "Failed to initiate payment." }, { status: 500 });
  }
}
