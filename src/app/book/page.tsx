"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useApp } from "@/context/AppContext";
import { 
  Calendar, Clock, User, Landmark, ShieldCheck, 
  CreditCard, CheckCircle2, ChevronRight, FileText 
} from "lucide-react";

function BookConsultationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currentUser, addBooking, addPayment, addNotification } = useApp();

  // Multi-step configuration: 1: Service ➔ 2: Date/Time ➔ 3: Personal Details ➔ 4: Checkout ➔ 5: Success
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  
  // Payment states
  const [paying, setPaying] = useState(false);
  const [paymentSuccessData, setPaymentSuccessData] = useState<any>(null);
  
  const [error, setError] = useState("");

  // OLD SERVICES CONFIGURATION COMMENTED
  /*
  const services = [
    { name: "Financial Consulting", price: 2999, desc: "Asset allocation modeling and global currency hedges." },
    { name: "Business Consulting", price: 4999, desc: "LRS framework scaling roadmap and business setup." },
    { name: "Investor Awareness Session", price: 0, desc: "Compounding curve and diversification overview (Free)." },
    { name: "Advisor Consultation", price: 3499, desc: "Custodians, family offices and trust networks review." },
    { name: "Marketing Consultation", price: 3999, desc: "Brand outreach and B2B email pipelines planning." },
  ];
  */

  // NEW SERVICES CONFIGURATION WITH DYNAMIC DISCOUNT
  const services = [
    { name: "Financial Consulting", originalPrice: 2999, discountPercent: 100, desc: "Asset allocation modeling and global currency hedges." },
    { name: "Business Consulting", originalPrice: 4999, discountPercent: 100, desc: "LRS framework scaling roadmap and business setup." },
    { name: "Investor Awareness Session", originalPrice: 0, discountPercent: 0, desc: "Compounding curve and diversification overview (Free)." },
    { name: "Advisor Consultation", originalPrice: 3499, discountPercent: 100, desc: "Custodians, family offices and trust networks review." },
    { name: "Marketing Consultation", originalPrice: 3999, discountPercent: 100, desc: "Brand outreach and B2B email pipelines planning." },
  ];

  const timeSlots = ["09:00 AM", "11:00 AM", "02:00 PM", "04:00 PM", "06:00 PM"];

  // Prefill service if passed in query params
  useEffect(() => {
    const serviceParam = searchParams.get("service");
    if (serviceParam && services.some((s) => s.name === serviceParam)) {
      setSelectedService(serviceParam);
      setStep(2);
    }
    
    if (currentUser) {
      setName(currentUser.name);
      setEmail(currentUser.email);
      setPhone(currentUser.phone);
    }
  }, [searchParams, currentUser]);

  const getServicePrice = () => {
    const s = services.find((sv) => sv.name === selectedService);
    if (!s) return 0;
    return Math.round(s.originalPrice * (1 - s.discountPercent / 100));
  };

  const handleStep1Submit = () => {
    if (!selectedService) {
      setError("Please choose a service to proceed.");
      return;
    }
    setError("");
    setStep(2);
  };

  const handleStep2Submit = () => {
    if (!selectedDate || !selectedTime) {
      setError("Please select a date and time slot.");
      return;
    }
    
    // Check if slot has booking in mock (Security: availability check)
    const duplicate = JSON.parse(localStorage.getItem("ib_bookings") || "[]")
      .some((b: any) => b.date === selectedDate && b.time === selectedTime && b.status !== "CANCELLED");
      
    if (duplicate) {
      setError("This specific slot is already reserved. Please select another slot or day.");
      return;
    }

    setError("");
    setStep(3);
  };

  const handleStep3Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Input sanitization
    const sanitizedName = name.replace(/[^a-zA-Z\s\-]/g, "").trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9]{10,15}$/;

    if (sanitizedName.length < 2) {
      setError("Please enter a valid name.");
      return;
    }
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!phoneRegex.test(phone)) {
      setError("Please enter a valid 10-15 digit mobile number.");
      return;
    }

    setStep(4);
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleRazorpayPayment = async () => {
    setError("");
    setPaying(true);

    const total = getServicePrice(); // Discounted final price is the actual payable total amount
    const baseAmount = Math.round(total / 1.18);
    const tax = total - baseAmount;
    const amount = total; // Let 'amount' represent the final payable amount for backend
    const meetingMode = total === 0 ? "Online" : "Offline";

    // OLD MOCK PAYMENT FLOW COMMENTED
    /*
    setTimeout(() => {
      const simulatedPaymentId = `pay_mock_${Date.now()}`;
      const simulatedOrderId = `order_mock_${Date.now()}`;
      
      const mockSuccessData = {
        razorpayPaymentId: simulatedPaymentId,
        razorpayOrderId: simulatedOrderId,
        amount,
        tax,
        total,
        service: selectedService
      };

      const newBooking = addBooking({
        serviceName: selectedService,
        date: selectedDate,
        time: selectedTime,
        meetingMode: amount === 0 ? "Online" : "Offline",
        name,
        email,
        phone,
        message,
        amount: total,
        paymentId: simulatedPaymentId
      });

      if (total > 0) {
        addPayment({
          bookingId: newBooking.id,
          amount,
          currency: "INR",
          status: "SUCCESS",
          razorpayOrderId: simulatedOrderId,
          razorpayPaymentId: simulatedPaymentId,
          service: selectedService,
          tax,
          total
        });
      }

      setPaymentSuccessData(mockSuccessData);
      setStep(5);
      setPaying(false);
      
      addNotification("Payment Verified", `Razorpay webhook signature verified for Order ID ${simulatedOrderId}.`, "SECURITY");
    }, 1500);
    */

    // NEW REAL BACKEND INTEGRATION FLOW
    try {
      // Step 1: Create the Booking record via API
      const bookingRes = await fetch("/api/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone,
          serviceName: selectedService,
          date: selectedDate,
          time: selectedTime,
          meetingMode,
          message
        })
      });
      
      const bookingData = await bookingRes.json();
      if (!bookingRes.ok) {
        throw new Error(bookingData.error || "Failed to create booking.");
      }

      const bookingId = bookingData.bookingId;

      // Handle Free Bookings directly
      if (total === 0) {
        // Log booking in client-side context for UI sync
        addBooking({
          serviceName: selectedService,
          date: selectedDate,
          time: selectedTime,
          meetingMode: "Online",
          name,
          email,
          phone,
          message,
          amount: 0,
          paymentId: "free_booking"
        });

        setPaymentSuccessData({
          razorpayPaymentId: "free_booking",
          razorpayOrderId: "free_booking",
          amount: 0,
          tax: 0,
          total: 0,
          service: selectedService
        });

        setStep(5);
        setPaying(false);
        return;
      }

      // Step 2: Create Razorpay Order via backend API
      const orderRes = await fetch("/api/payments/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser?.id || "",
          bookingId: bookingId || "",
          serviceName: selectedService,
          amount: total
        })
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok) {
        throw new Error(orderData.error || "Failed to initiate payment.");
      }

      // Step 3: Load Razorpay Checkout overlay
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        throw new Error("Razorpay SDK failed to load. Please check your internet connection.");
      }

      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "InvestorBridge Solutions",
        description: `Booking for ${selectedService}`,
        order_id: orderData.id,
        handler: async function (response: any) {
          try {
            setPaying(true);
            
            // Step 4: Verify signature on the backend
            const verifyRes = await fetch("/api/payments/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
                bookingId,
                userId: currentUser?.id || "",
                serviceName: selectedService
              })
            });

            const verifyData = await verifyRes.json();
            if (!verifyRes.ok) {
              throw new Error(verifyData.error || "Payment verification failed.");
            }

            // Sync client state context
            const newBooking = addBooking({
              serviceName: selectedService,
              date: selectedDate,
              time: selectedTime,
              meetingMode,
              name,
              email,
              phone,
              message,
              amount: total,
              paymentId: response.razorpay_payment_id
            });

            addPayment({
              bookingId: newBooking.id,
              amount: baseAmount,
              currency: "INR",
              status: "SUCCESS",
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              service: selectedService,
              tax,
              total
            });

            setPaymentSuccessData({
              razorpayPaymentId: response.razorpay_payment_id,
              razorpayOrderId: response.razorpay_order_id,
              amount: baseAmount,
              tax,
              total,
              service: selectedService
            });

            setStep(5);
            addNotification("Payment Verified", `Razorpay webhook signature verified for Order ID ${response.razorpay_order_id}.`, "SECURITY");
          } catch (err: any) {
            setError(err.message || "Payment verification failed. Please contact support.");
          } finally {
            setPaying(false);
          }
        },
        prefill: {
          name,
          email,
          contact: phone
        },
        theme: {
          color: "#0B1F3A"
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on("payment.failed", function (response: any) {
        setError(`Payment failed: ${response.error.description || "Checkout closed."}`);
        setPaying(false);
      });
      rzp.open();

    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during payment checkout.");
      setPaying(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-grow bg-[#F7F9FC] py-12">
        <div className="mx-auto max-w-3xl px-6 lg:px-8">
          
          {/* Booking Progress Tracker */}
          <div className="flex items-center justify-between max-w-md mx-auto mb-8 text-center text-[10px] font-bold text-gray-400">
            {["Service", "Schedule", "Details", "Checkout", "Confirmed"].map((label, idx) => (
              <div key={label} className="flex items-center gap-1">
                <span className={`h-5 w-5 rounded-full flex items-center justify-center border ${
                  step > idx + 1 ? "bg-[#00B386] border-[#00B386] text-white" :
                  step === idx + 1 ? "border-[#0B1F3A] text-[#0B1F3A] font-extrabold" : "border-gray-200"
                }`}>
                  {idx + 1}
                </span>
                <span className={step === idx + 1 ? "text-[#0B1F3A] font-extrabold" : ""}>{label}</span>
                {idx < 4 && <ChevronRight className="h-3 w-3 text-gray-300" />}
              </div>
            ))}
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-10 shadow-sm">
            {error && (
              <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-3 text-xs text-red-600">
                {error}
              </div>
            )}

            {/* STEP 1: CHOOSE SERVICE */}
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-base font-bold text-[#0B1F3A]">Choose Consulting Service</h2>
                  <p className="text-[10px] text-gray-400">Select one of our specialized educational or consulting slots.</p>
                </div>
                <div className="space-y-3">
                  {services.map((s) => (
                    <button
                      key={s.name}
                      onClick={() => setSelectedService(s.name)}
                      className={`w-full text-left p-4 rounded-xl border transition-all flex justify-between items-center ${
                        selectedService === s.name
                          ? "border-[#00B386] bg-[#00B386]/5"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      {/* OLD SERVICE TEXT DETAILS COMMENTED */}
                      {/*
                      <div className="max-w-[75%]">
                        <span className="text-xs font-bold text-[#0B1F3A] block">{s.name}</span>
                        <span className="text-[10px] text-gray-400 block mt-1 leading-normal">{s.desc}</span>
                      </div>
                      */}

                      {/* NEW SERVICE TEXT DETAILS WITH ADJUSTED WIDTH */}
                      <div className="max-w-[60%]">
                        <span className="text-xs font-bold text-[#0B1F3A] block">{s.name}</span>
                        <span className="text-[10px] text-gray-400 block mt-1 leading-normal">{s.desc}</span>
                      </div>

                      {/* OLD PRICE DISPLAY COMMENTED */}
                      {/* 
                      <span className="text-xs font-extrabold text-[#0B1F3A]">
                        {s.price === 0 ? "FREE" : `₹${s.price.toLocaleString("en-IN")}`}
                      </span>
                      */}

                      {/* NEW DISCOUNTED PRICE DISPLAY FOR ALL SERVICES */}
                      {s.discountPercent > 0 ? (
                        <div className="flex flex-col items-end text-right">
                          <span className="inline-block bg-[#D31538] text-white text-[9px] font-bold px-2 py-0.5 rounded mb-1 leading-none">
                            Limited time offer
                          </span>
                          <div className="flex items-baseline gap-0.5">
                            <span className="text-xs font-medium text-[#D31538] mr-0.5">-{s.discountPercent}%</span>
                            <span className="text-lg font-black text-black leading-none">
                              <sup className="text-[10px] font-bold">₹</sup>{Math.round(s.originalPrice * (1 - s.discountPercent / 100)).toLocaleString("en-IN")}
                            </span>
                          </div>
                          <span className="text-[10px] text-gray-400 line-through mt-0.5">
                            Fees: ₹{s.originalPrice.toLocaleString("en-IN")}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs font-extrabold text-[#0B1F3A]">
                          {s.originalPrice === 0 ? "FREE" : `₹${s.originalPrice.toLocaleString("en-IN")}`}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
                <div className="text-right">
                  <button
                    onClick={handleStep1Submit}
                    className="rounded-full bg-[#0B1F3A] hover:bg-[#00B386] px-6 py-2.5 text-xs font-bold text-white transition-colors"
                  >
                    Select & Continue
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: CHOOSE DATE & TIME */}
            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-base font-bold text-[#0B1F3A]">Choose Date & Time Slot</h2>
                  <p className="text-[10px] text-gray-400">Specify your availability to prevent duplicate overrides.</p>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold text-[#0B1F3A] mb-2">Select Date</label>
                    <input
                      type="date"
                      min={new Date().toISOString().split("T")[0]}
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#00B386]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#0B1F3A] mb-2">Select Time Slot</label>
                    <div className="grid grid-cols-2 gap-2">
                      {timeSlots.map((slot) => (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => setSelectedTime(slot)}
                          className={`rounded-lg border px-3 py-2 text-center text-xs font-semibold transition-all ${
                            selectedTime === slot
                              ? "bg-[#00B386] border-[#00B386] text-white"
                              : "border-gray-200 hover:border-gray-300 text-gray-600"
                          }`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => setStep(1)}
                    className="rounded-full border border-gray-200 px-6 py-2.5 text-xs font-bold text-gray-500 hover:bg-gray-50"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleStep2Submit}
                    className="rounded-full bg-[#0B1F3A] hover:bg-[#00B386] px-6 py-2.5 text-xs font-bold text-white transition-colors"
                  >
                    Continue
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: PERSONAL DETAILS */}
            {step === 3 && (
              <form onSubmit={handleStep3Submit} className="space-y-6">
                <div>
                  <h2 className="text-base font-bold text-[#0B1F3A]">Provide Information</h2>
                  <p className="text-[10px] text-gray-400">All submissions are sanitized for injection mitigation.</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-[#0B1F3A] mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-bold text-[#0B1F3A] mb-1">Email Address</label>
                      <input
                        type="email"
                        required
                        placeholder="john@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#0B1F3A] mb-1">Mobile Number</label>
                      <input
                        type="tel"
                        required
                        placeholder="7340806804"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#0B1F3A] mb-1">Message / Notes (Optional)</label>
                    <textarea
                      placeholder="Share details about your global assets planning..."
                      rows={3}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="rounded-full border border-gray-200 px-6 py-2.5 text-xs font-bold text-gray-500 hover:bg-gray-50"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="rounded-full bg-[#0B1F3A] hover:bg-[#00B386] px-6 py-2.5 text-xs font-bold text-white transition-colors"
                  >
                    Continue to Checkout
                  </button>
                </div>
              </form>
            )}

            {/* STEP 4: CHECKOUT SUMMARY & RAZORPAY */}
            {step === 4 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-base font-bold text-[#0B1F3A]">Checkout & Invoice Summary</h2>
                  <p className="text-[10px] text-gray-400">Groww checkout simplicity standard interface.</p>
                </div>

                <div className="rounded-xl border border-gray-200 bg-[#F7F9FC] p-6 space-y-4">
                  <div className="flex justify-between text-xs text-gray-500 pb-2 border-b border-gray-200">
                    <span>Selected Service</span>
                    <span className="font-bold text-[#0B1F3A]">{selectedService}</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 pb-2 border-b border-gray-200">
                    <span>Meeting Slot</span>
                    <span className="font-bold text-[#0B1F3A]">{selectedDate} at {selectedTime}</span>
                  </div>
                  
                  {getServicePrice() > 0 ? (
                    <>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Base Amount</span>
                        <span>₹{Math.round(getServicePrice() / 1.18).toLocaleString("en-IN")}</span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Goods & Service Tax (18% GST Inclusive)</span>
                        <span>₹{(getServicePrice() - Math.round(getServicePrice() / 1.18)).toLocaleString("en-IN")}</span>
                      </div>
                      <div className="flex justify-between text-xs font-extrabold text-[#0B1F3A] pt-4 border-t border-gray-200 text-sm">
                        <span>Total Due</span>
                        <span className="text-[#00B386]">₹{getServicePrice().toLocaleString("en-IN")}</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex justify-between text-xs font-extrabold text-[#00B386] pt-4 border-t border-gray-200">
                      <span>Total Due</span>
                      <span>FREE</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => setStep(3)}
                    className="rounded-full border border-gray-200 px-6 py-2.5 text-xs font-bold text-gray-500 hover:bg-gray-50"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleRazorpayPayment}
                    disabled={paying}
                    className="rounded-full bg-[#00B386] hover:bg-[#0B1F3A] text-white px-6 py-2.5 text-xs font-bold transition-all hover:scale-105 disabled:opacity-50 flex items-center justify-center gap-1.5"
                  >
                    <CreditCard className="h-4 w-4" />
                    {paying ? "Processing Secure Checkout..." : getServicePrice() > 0 ? "Pay With Razorpay" : "Confirm Slot"}
                  </button>
                </div>
              </div>
            )}

            {/* STEP 5: SUCCESS PAGE */}
            {step === 5 && paymentSuccessData && (
              <div className="text-center space-y-6">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-[#00B386]">
                  <CheckCircle2 className="h-10 w-10" />
                </div>

                <div>
                  <h2 className="text-xl font-bold text-[#0B1F3A]">Consultation Confirmed!</h2>
                  <p className="text-xs text-gray-400 mt-2">
                    Your meeting details have been locked. Confirmation email and invoice sent.
                  </p>
                </div>

                <div className="rounded-xl border border-gray-100 bg-[#F7F9FC] p-4 text-left text-xs max-w-md mx-auto space-y-2">
                  <div className="flex justify-between text-[10px] text-gray-400">
                    <span>Transaction ID:</span>
                    <span className="font-bold text-gray-700">{paymentSuccessData.razorpayPaymentId}</span>
                  </div>
                  <div className="flex justify-between text-[10px] text-gray-400">
                    <span>Order ID:</span>
                    <span className="font-bold text-gray-700">{paymentSuccessData.razorpayOrderId}</span>
                  </div>
                  <div className="flex justify-between text-[10px] text-gray-400">
                    <span>Receipt Code:</span>
                    <span className="font-bold text-gray-700">INV-2026-{Math.floor(1000 + Math.random() * 9000)}</span>
                  </div>
                  <div className="flex justify-between text-[10px] text-gray-400 border-t border-gray-200 pt-2 font-bold">
                    <span>Total Amount Charged:</span>
                    <span className="text-[#00B386]">
                      {paymentSuccessData.total === 0 ? "FREE" : `₹${paymentSuccessData.total.toLocaleString("en-IN")}`}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 justify-center pt-4">
                  <button
                    onClick={() => window.print()}
                    className="rounded-full border border-gray-200 px-5 py-2.5 text-xs font-bold text-gray-600 hover:bg-gray-50 flex items-center gap-1"
                  >
                    <FileText className="h-4 w-4" /> Download Invoice / Print
                  </button>
                  <Link
                    href={currentUser ? "/dashboard" : "/"}
                    className="rounded-full bg-[#0B1F3A] hover:bg-[#00B386] px-5 py-2.5 text-xs font-bold text-white transition-colors"
                  >
                    {currentUser ? "Go to Dashboard" : "Go to Home"}
                  </Link>
                </div>
              </div>
            )}

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function BookConsultation() {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center bg-[#0B1F3A]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#00B386]"></div>
      </div>
    }>
      <BookConsultationContent />
    </Suspense>
  );
}
