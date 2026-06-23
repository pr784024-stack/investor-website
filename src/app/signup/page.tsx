"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { ShieldCheck, Eye, EyeOff, CheckCircle2, XCircle, ArrowRight, Lock } from "lucide-react";

export default function SignUp() {
  const router = useRouter();
  const { register, setCurrentUser } = useApp();

  // Form states
  const [userId, setUserId] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);

  // UI States
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState<"form" | "otp">("form"); // "form" -> "otp"
  const [emailOtp, setEmailOtp] = useState("");
  const [smsOtp, setSmsOtp] = useState("");
  const [verifying, setVerifying] = useState(false);

  // Resend Timer & States
  const [countdown, setCountdown] = useState(0);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState("");

  // Restore session state on mount
  useEffect(() => {
    try {
      const pending = sessionStorage.getItem("ib_pending_reg");
      if (pending) {
        const parsed = JSON.parse(pending);
        if (parsed.userId) {
          setUserId(parsed.userId);
          setName(parsed.name || "");
          setEmail(parsed.email || "");
          setPhone(parsed.phone || "");
          setStep("otp");
          setCountdown(30);
        }
      }
    } catch (_) {}
  }, []);

  // Countdown timer logic
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  // Password requirements checklist
  const hasMinLength = password.length >= 12;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  
  const passwordScore = [
    hasMinLength,
    hasUppercase,
    hasLowercase,
    hasNumber,
    hasSpecial
  ].filter(Boolean).length;

  const getStrengthText = () => {
    if (password.length === 0) return "";
    if (passwordScore <= 2) return "Weak (Security Alert)";
    if (passwordScore <= 4) return "Medium (Good)";
    return "Strong (Fintech Grade)";
  };

  const getStrengthColor = () => {
    if (passwordScore <= 2) return "bg-red-500";
    if (passwordScore <= 4) return "bg-yellow-500";
    return "bg-[#00B386]";
  };

  // Form submit handler
  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // 1. Inputs validation
    if (!name || !email || !phone || !password || !confirmPassword) {
      setError("Please fill out all required fields.");
      return;
    }

    // Name security: letters, spaces, hyphens only, 2-100 characters
    const nameRegex = /^[a-zA-Z\s\-]{2,100}$/;
    if (!nameRegex.test(name)) {
      setError("Name must be 2-100 characters and contain letters, spaces, or hyphens only.");
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    // Phone format: 10-15 digits
    const phoneRegex = /^[0-9]{10,15}$/;
    if (!phoneRegex.test(phone)) {
      setError("Please enter a valid mobile number (10-15 digits, no symbols).");
      return;
    }

    // Password strength verification
    if (passwordScore < 5) {
      setError("Password does not meet the 12-character high security standards.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!agreeTerms) {
      setError("You must agree to the Terms of Service & Privacy Policy.");
      return;
    }

    // OLD REGISTER TRIGGER COMMENTED
    /*
    setStep("otp");
    */

    // NEW REGISTER TRIGGER USING BACKEND API
    setError("");
    setVerifying(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone,
          password,
          confirmPassword
        })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Registration failed.");
      }
      setUserId(data.userId);
      // Store registration details in sessionStorage so OTP step survives server hot-reloads
      sessionStorage.setItem("ib_pending_reg", JSON.stringify({
        userId: data.userId,
        name,
        email,
        phone
      }));
      setStep("otp");
      setCountdown(30);

    } catch (err: any) {
      setError(err.message || "Registration failed. Try again.");
    } finally {
      setVerifying(false);
    }
  };

  // OTP resend handler
  const handleResendOtp = async () => {
    if (countdown > 0 || resendLoading) return;
    
    setResendLoading(true);
    setResendSuccess("");
    setError("");

    try {
      const res = await fetch("/api/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          type: "registration"
        })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Unable to send verification codes. Please try again.");
      }

      setResendSuccess(data.message || "New verification codes have been sent to your registered email address and mobile number.");
      setCountdown(30); // Restart 30s countdown
    } catch (err: any) {
      setError(err.message || "Unable to send verification codes. Please try again.");
    } finally {
      setResendLoading(false);
    }
  };

  // OTP verify handler
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setVerifying(true);



    // NEW OTP VERIFICATION HITTING BACKEND API
    try {
      // Recover pending registration details from sessionStorage (in case server restarted)
      let verifyUserId = userId;
      let pendingName = name;
      let pendingEmail = email;
      let pendingPhone = phone;
      try {
        const pending = sessionStorage.getItem("ib_pending_reg");
        if (pending) {
          const parsed = JSON.parse(pending);
          verifyUserId = parsed.userId || userId;
          pendingName = parsed.name || name;
          pendingEmail = parsed.email || email;
          pendingPhone = parsed.phone || phone;
        }
      } catch (_) {}

      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: verifyUserId,
          emailOtp,
          smsOtp,
          // Pass user details so server can recover even after restart
          name: pendingName,
          email: pendingEmail,
          phone: pendingPhone
        })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "OTP verification failed.");
      }

      const matchedUser = data.user;
      try {
        await register(matchedUser.name, matchedUser.email, matchedUser.phone, password);
      } catch (err: any) {
        if (err.message && (err.message.includes("already") || err.message.includes("registered"))) {
          const userList = JSON.parse(localStorage.getItem("ib_users") || "[]");
          const localUser = userList.find((u: any) => u.email.toLowerCase() === matchedUser.email.toLowerCase());
          if (localUser) {
            setCurrentUser(localUser);
            sessionStorage.setItem("ib_session_user", JSON.stringify(localUser));
          } else {
            setCurrentUser(matchedUser);
            sessionStorage.setItem("ib_session_user", JSON.stringify(matchedUser));
          }
        } else {
          throw err;
        }
      }
      try {
        sessionStorage.removeItem("ib_pending_reg");
      } catch (_) {}
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Invalid OTP or verification expired.");
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F9FC] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-2 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0B1F3A] text-[#00B386]">
            <img src="/logo-mark.png" alt="Logo" className="h-7 w-7 object-contain" />
          </div>
          <span className="text-xl font-bold tracking-tight text-[#0B1F3A]">InvestorBridge</span>
        </Link>
        <h2 className="text-2xl font-extrabold text-[#0B1F3A]">
          {step === "form" ? "Create secure account" : "Mandatory OTP Verification"}
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-2xl sm:px-10 border border-gray-100">
          
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-xs text-red-600">
              {error}
            </div>
          )}

          {step === "form" ? (
            <form onSubmit={handleSignUpSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#0B1F3A] mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#00B386]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0B1F3A] mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="john@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#00B386]"
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
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#00B386]"
                />
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-xs font-bold text-[#0B1F3A] mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 bg-white pl-3 pr-10 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#00B386]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>

                {/* Password strength meter */}
                {password.length > 0 && (
                  <div className="mt-2 space-y-1">
                    <div className="flex justify-between text-[9px] font-bold text-gray-400">
                      <span>Strength: {getStrengthText()}</span>
                      <span>{passwordScore}/5 factors</span>
                    </div>
                    <div className="h-1 w-full bg-gray-200 rounded">
                      <div 
                        className={`h-1 rounded transition-all duration-300 ${getStrengthColor()}`}
                        style={{ width: `${(passwordScore / 5) * 100}%` }}
                      ></div>
                    </div>
                    {/* Password criteria list */}
                    <div className="grid grid-cols-2 gap-1 pt-1.5 text-[8px] text-gray-400 font-medium">
                      <span className={hasMinLength ? "text-green-500" : "text-red-500"}>✓ Min 12 chars</span>
                      <span className={hasUppercase ? "text-green-500" : "text-red-500"}>✓ 1 Uppercase</span>
                      <span className={hasLowercase ? "text-green-500" : "text-red-500"}>✓ 1 Lowercase</span>
                      <span className={hasNumber ? "text-green-500" : "text-red-500"}>✓ 1 Number</span>
                      <span className={hasSpecial ? "text-green-500" : "text-red-500"}>✓ 1 Special char</span>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0B1F3A] mb-1">Confirm Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#00B386]"
                />
              </div>

              {/* Agreement checkbox */}
              <div className="flex items-start gap-2 pt-2">
                <input
                  id="agree-terms"
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-gray-300 text-[#00B386] focus:ring-[#00B386]"
                />
                <label htmlFor="agree-terms" className="text-[10px] text-gray-500 leading-tight">
                  I agree to InvestorBridge Solutions' <Link href="/terms-and-conditions" className="text-[#00B386] hover:underline font-bold">Terms & Conditions</Link> & <Link href="/privacy-policy" className="text-[#00B386] hover:underline font-bold">Privacy Policy</Link>.
                </label>
              </div>

              <button
                type="submit"
                className="w-full rounded-full bg-[#00B386] hover:bg-[#0B1F3A] text-white py-2.5 text-xs font-bold transition-colors mt-4 flex items-center justify-center gap-1"
              >
                Proceed to Verification <ArrowRight className="h-3.5 w-3.5" />
              </button>

              <div className="relative mt-6">
                <div className="flex items-center justify-center">
                  <span className="bg-white px-2 text-gray-400 font-medium text-xs">OR</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  window.location.href = "/api/auth/google";
                }}
                className="w-full flex items-center justify-center gap-2 rounded-full border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 py-2.5 text-xs font-bold transition-colors cursor-pointer"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                  <g transform="matrix(1, 0, 0, 1, 0, 0)">
                    <path d="M21.35,11.1H12v2.7h5.38c-0.24,1.28 -0.96,2.37 -2.04,3.1v2.6h3.29c1.92,-1.78 3.02,-4.4 3.02,-7.4C21.65,11.83 21.54,11.41 21.35,11.1z" fill="#4285F4" />
                    <path d="M12,20.5c2.57,0 4.71,-0.85 6.29,-2.3l-3.29,-2.6c-0.91,0.61 -2.08,0.98 -3.0,0.98 -2.31,0 -4.26,-1.56 -4.96,-3.66H3.63v2.7C5.2,18.77 8.38,20.5 12,20.5z" fill="#34A853" />
                    <path d="M7.04,12.92C6.86,12.38 6.77,11.8 6.77,11.2c0,-0.6 0.09,-1.18 0.27,-1.72V6.78H3.63C3.01,8.02 2.66,9.57 2.66,11.2c0,1.63 0.35,3.18 0.97,4.42L7.04,12.92z" fill="#FBBC05" />
                    <path d="M12,5.92c1.39,0 2.65,0.48 3.63,1.42L17.7,5.3C16.29,3.99 14.28,3.2 12,3.2 8.38,3.2 5.2,4.93 3.63,8.08L7.04,10.8C7.74,8.7 9.69,7.14 12,7.14c0,0 0,0 0,0C12,5.92 12,5.92 12,5.92z" fill="#EA4335" />
                  </g>
                </svg>
                Continue with Google
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              {resendSuccess && (
                <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-2.5 text-[10px] text-emerald-800 leading-tight">
                  {resendSuccess}
                </div>
              )}

              <div className="rounded-lg bg-blue-50 border border-blue-200 p-3.5 text-[10px] text-blue-700 leading-normal space-y-1.5">
                <div className="font-bold flex items-center gap-1">
                  🔒 Verify Your Identity
                </div>
                <div>
                  To protect your account, we've sent one-time verification codes to your registered email address and mobile number.
                </div>
                <div>
                  Please enter both OTPs below to activate your InvestorBridge account.
                </div>
                <div className="pt-1.5 border-t border-blue-100 flex items-center gap-1 font-bold">
                  ⏱️ Security Notice:
                </div>
                <div>
                  The verification codes will expire in 5 minutes.
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0B1F3A] mb-1">Email Verification OTP</label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  placeholder="e.g. 518829"
                  value={emailOtp}
                  onChange={(e) => setEmailOtp(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-center tracking-widest focus:outline-none focus:ring-1 focus:ring-[#00B386]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0B1F3A] mb-1">Mobile SMS OTP</label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  placeholder="e.g. 317721"
                  value={smsOtp}
                  onChange={(e) => setSmsOtp(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-center tracking-widest focus:outline-none focus:ring-1 focus:ring-[#00B386]"
                />
              </div>

              <div className="text-center pt-1 pb-2">
                <button
                  type="button"
                  disabled={countdown > 0 || resendLoading}
                  onClick={handleResendOtp}
                  className="text-xs font-bold text-[#00B386] hover:text-[#0B1F3A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {resendLoading ? (
                    "Sending..."
                  ) : countdown > 0 ? (
                    `Resend OTP in ${countdown}s`
                  ) : (
                    "Resend OTP"
                  )}
                </button>
              </div>


              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setStep("form")}
                  className="flex-1 rounded-full border border-gray-200 py-2.5 text-xs font-bold text-gray-500 hover:bg-gray-50 text-center"
                >
                  Edit Details
                </button>
                <button
                  type="submit"
                  disabled={verifying}
                  className="flex-1 rounded-full bg-[#0B1F3A] hover:bg-[#00B386] text-white py-2.5 text-xs font-bold transition-colors text-center disabled:opacity-50"
                >
                  {verifying ? "Verifying..." : "Verify & Sign In"}
                </button>
              </div>
            </form>
          )}

          <div className="mt-6 border-t border-gray-100 pt-6 text-center">
            <span className="text-[11px] text-gray-400">Already registered? </span>
            <Link href="/login" className="text-[11px] font-bold text-[#00B386] hover:underline">
              Sign In Instead
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
