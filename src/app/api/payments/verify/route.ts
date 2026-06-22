import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { mockDb } from "@/lib/db";
import { sendEmail, sendSms } from "@/lib/notifications";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const razorpayOrderId = body.razorpayOrderId || "";
    const razorpayPaymentId = body.razorpayPaymentId || "";
    const razorpaySignature = body.razorpaySignature || "";
    const bookingId = body.bookingId || "";
    const userId = body.userId || "";
    const serviceName = body.serviceName || "";

    if (!razorpayOrderId || !razorpayPaymentId) {
      return NextResponse.json({ error: "Missing transaction parameters." }, { status: 400 });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    let isSignatureVerified = false;

    // Check if it's a simulated order or real one
    if (razorpayOrderId.startsWith("order_mock_") || !keySecret || keySecret === "xxxx") {
      // Sandbox simulated checkout
      isSignatureVerified = true;
    } else {
      // Real Razorpay signature check
      const expectedSignature = crypto
        .createHmac("sha256", keySecret)
        .update(`${razorpayOrderId}|${razorpayPaymentId}`)
        .digest("hex");

      isSignatureVerified = (expectedSignature === razorpaySignature);
    }

    if (!isSignatureVerified) {
      // Try to mark payment as failed
      await markPaymentFailed(razorpayOrderId);
      return NextResponse.json({ error: "Signature verification failed." }, { status: 400 });
    }

    // Mark payment as successful, create booking if needed and trigger notifications
    const invoice = await finalizeTransaction(userId, bookingId, razorpayOrderId, razorpayPaymentId, razorpaySignature);

    return NextResponse.json({
      success: true,
      message: "Payment verified and booking confirmed!",
      invoice
    });

  } catch (error) {
    return NextResponse.json({ error: "Verification failed." }, { status: 500 });
  }
}

async function markPaymentFailed(orderId: string) {
  try {
    const { prisma } = await import("@/lib/db");
    await prisma.payment.updateMany({
      where: { razorpayOrderId: orderId },
      data: { status: "FAILED" }
    });
  } catch {
    const match = mockDb.payments.find((p: any) => p.razorpayOrderId === orderId);
    if (match) match.status = "FAILED";
  }
}

async function finalizeTransaction(userId: string, bookingId: string, orderId: string, paymentId: string, signature: string) {
  let matchedUser: any = null;
  let serviceName = "Consulting Session";
  let totalAmount = 0;
  let invoiceNumber = "";
  let bookingEmail = "";
  let bookingPhone = "";

  // Try real DB first
  try {
    const { prisma } = await import("@/lib/db");
    
    // Find payment record
    const payment = await prisma.payment.findFirst({
      where: { razorpayOrderId: orderId }
    });

    if (payment) {
      serviceName = payment.service;
      totalAmount = payment.total;

      // Update payment
      const updatedPayment = await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: "SUCCESS",
          razorpayPaymentId: paymentId,
          razorpaySignature: signature
        }
      });
      invoiceNumber = updatedPayment.invoiceNumber;
    }

    // Link booking to payment
    if (bookingId) {
      const updatedBooking = await prisma.booking.update({
        where: { id: bookingId },
        data: { status: "APPROVED" }
      });
      bookingEmail = updatedBooking.email;
      bookingPhone = updatedBooking.phone;
    }

    if (userId) {
      matchedUser = await prisma.user.findUnique({
        where: { id: userId }
      });
      
      // Save notification
      await prisma.notification.create({
        data: {
          userId,
          title: "Payment Verified",
          message: `Your payment of ₹${totalAmount} for ${serviceName} was verified successfully.`,
          type: "PAYMENT"
        }
      });
    }
  } catch (dbError) {
    console.warn("Prisma finalize failed, falling back to mockDb:", dbError);

    // Fallback: mockDb
    const payment = mockDb.payments.find((p: any) => p.razorpayOrderId === orderId);
    if (payment) {
      payment.status = "SUCCESS";
      payment.razorpayPaymentId = paymentId;
      payment.razorpaySignature = signature;
      serviceName = payment.service;
      totalAmount = payment.total;
      invoiceNumber = payment.invoiceNumber;
    }

    if (bookingId) {
      const bk = mockDb.bookings.find((b: any) => b.id === bookingId);
      if (bk) {
        bk.status = "APPROVED";
        bookingEmail = bk.email;
        bookingPhone = bk.phone;
      }
    }

    matchedUser = mockDb.users.find((u: any) => u.id === userId);
    
    if (userId) {
      mockDb.notifications.push({
        id: `n-${Date.now()}`,
        userId,
        title: "Payment Verified",
        message: `Your payment of ₹${totalAmount} for ${serviceName} was verified successfully.`,
        type: "PAYMENT",
        isRead: false,
        createdAt: new Date().toISOString()
      });
    }
  }

  // Send email and SMS receipts if user info is available
  if (matchedUser) {
    await triggerReceiptNotifications(matchedUser.email, matchedUser.phone, serviceName, totalAmount, invoiceNumber);
  } else if (bookingEmail) {
    await triggerReceiptNotifications(bookingEmail, bookingPhone, serviceName, totalAmount, invoiceNumber);
  }

  return {
    razorpayOrderId: orderId,
    razorpayPaymentId: paymentId,
    total: totalAmount,
    service: serviceName,
    invoiceNumber
  };
}

async function triggerReceiptNotifications(email: string, phone: string, serviceName: string, amount: number, invoice: string) {
  const emailBody = `
    <h3>Payment Confirmed - Invoice ${invoice}</h3>
    <p>Thank you for booking with InvestorBridge Solutions!</p>
    <p>We have successfully verified your payment of <strong>₹${amount.toLocaleString("en-IN")}</strong> for <strong>${serviceName}</strong>.</p>
    <p>You can print or download your invoice from your User Dashboard.</p>
  `;
  const smsBody = `Payment confirmed! ₹${amount} received for your booking: ${serviceName}. Invoice ID: ${invoice}.`;

  await sendEmail({
    to: email,
    subject: "Payment Confirmed - InvestorBridge Solutions",
    html: emailBody
  });

  await sendSms({
    phone,
    message: smsBody
  });
}
