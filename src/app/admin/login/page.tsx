"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { ShieldCheck, Eye, EyeOff, ShieldAlert, ArrowRight, Lock, KeyRound } from "lucide-react";

export default function AdminLogin() {
  const router = useRouter();
  const { login, currentUser } = useApp();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // OTP flow states
  const [step, setStep] = useState<"credentials" | "otp">("credentials");
  const [otpCode, setOtpCode] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [authenticatedUser, setAuthenticatedUser] = useState<any>(null);

  // Resend Timer & States
  const [countdown, setCountdown] = useState(0);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState("");

  // Countdown timer logic
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  // If already logged in as ADMIN, redirect to admin dashboard
  useEffect(() => {
    if (currentUser && currentUser.role === "ADMIN") {
      router.push("/admin");
    }
  }, [currentUser, router]);


  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (email.toLowerCase() !== "admin@investorbridge.com") {
      setError("Access Denied. Only admin@investorbridge.com can access the admin login portal.");
      setLoading(false);
      return;
    }

    try {
      // Validate credentials using context login
      const user = await login(email, password);
      
      if (user.role !== "ADMIN" && !(user as any).mfaRequired) {
        setError("Unauthorized. Admin access only.");
        setLoading(false);
        return;
      }

      setAuthenticatedUser(user);

      // resend notification simulation
      const logEntry = {
        time: new Date().toISOString(),
        event: "Admin Login OTP Generated",
        email,
        ip: "127.0.0.1",
        browser: "Chrome/125.0.0",
        device: "Desktop (Windows 11)"
      };
      
      const logs = JSON.parse(localStorage.getItem("ib_security_logs") || "[]");
      logs.unshift(logEntry);
      localStorage.setItem("ib_security_logs", JSON.stringify(logs));

      setStep("otp");
      setCountdown(30);
    } catch (err: any) {
      setError(err.message || "Invalid credentials. Please verify details.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0 || resendLoading || !authenticatedUser) return;

    setResendLoading(true);
    setResendSuccess("");
    setError("");

    try {
      const res = await fetch("/api/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: authenticatedUser.id,
          type: "mfa",
          mfaType: "email"
        })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Unable to send verification code. Please try again.");
      }

      setResendSuccess(data.message || "New verification code sent to your admin email.");
      setCountdown(30);
    } catch (err: any) {
      setError(err.message || "Unable to send verification code. Please try again.");
    } finally {
      setResendLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setVerifying(true);

    try {
      const res = await fetch("/api/auth/verify-mfa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: authenticatedUser.id,
          mfaCode: otpCode
        })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "MFA verification failed.");
      }

      // Store in session
      sessionStorage.setItem("ib_session_user", JSON.stringify(data.user));
      
      const logEntry = {
        time: new Date().toISOString(),
        event: "Admin Access Granted",
        email: data.user.email,
        ip: "127.0.0.1",
        browser: "Chrome/125.0.0",
        device: "Desktop (Windows 11)"
      };
      
      const logs = JSON.parse(localStorage.getItem("ib_security_logs") || "[]");
      logs.unshift(logEntry);
      localStorage.setItem("ib_security_logs", JSON.stringify(logs));

      setVerifying(false);
      // Force page reload / redirect to admin dashboard
      window.location.href = "/admin";
    } catch (err: any) {
      setError(err.message || "Invalid OTP code.");
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
        <span className="inline-block bg-red-100 text-red-700 text-[9px] font-bold px-2 py-0.5 rounded mb-2 uppercase tracking-wider">
          Admin Portal Gate
        </span>
        <h2 className="text-2xl font-extrabold text-[#0B1F3A]">
          {step === "credentials" ? "Admin Security Login" : "Email 2FA Verification"}
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-2xl sm:px-10 border border-gray-100">
          
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-xs text-red-600 flex items-start gap-2">
              <ShieldAlert className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {step === "credentials" ? (
            <form onSubmit={handleCredentialsSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-[#0B1F3A] mb-1">Admin Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="admin@investorbridge.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#00B386]"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-bold text-[#0B1F3A]">Password</label>
                  <Link href="/forgot-password" className="text-[10px] text-gray-400 hover:text-[#00B386]">Forgot password?</Link>
                </div>
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
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-full bg-[#0B1F3A] hover:bg-[#00B386] text-white py-2.5 text-xs font-bold transition-all flex items-center justify-center gap-1"
                >
                  {loading ? "Verifying..." : "Validate Credentials"} <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-400 font-medium">OR</span>
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
            <form onSubmit={handleOtpSubmit} className="space-y-6">
              {resendSuccess && (
                <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-2.5 text-[10px] text-emerald-800 leading-tight">
                  {resendSuccess}
                </div>
              )}

              <div className="rounded-lg bg-blue-50 border border-blue-200 p-3 text-[10px] text-blue-700 leading-normal flex items-start gap-2">
                <Lock className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <div>
                  A security verification OTP code has been dispatched to <strong>{email}</strong>. Please retrieve it from your Resend email logs or your developer logs.
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0B1F3A] mb-1">Enter 6-Digit Email OTP</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="e.g. 583921"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                    className="w-full rounded-lg border border-gray-200 bg-white pl-9 pr-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#00B386]"
                  />
                  <KeyRound className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                </div>
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

              <div>
                <button
                  type="submit"
                  disabled={verifying}
                  className="w-full rounded-full bg-[#00B386] hover:bg-[#0B1F3A] text-white py-2.5 text-xs font-bold transition-all flex items-center justify-center gap-1"
                >
                  {verifying ? "Processing..." : "Verify Two-Factor OTP"} <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </form>
          )}

          <div className="mt-6 border-t border-gray-100 pt-4 text-center">
            <Link href="/login" className="text-[10px] text-gray-500 hover:text-[#00B386] font-semibold">
              Return to standard client login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
