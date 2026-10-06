"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, ShieldCheck, ShieldAlert, Mail } from "lucide-react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [userType, setUserType] = useState<"email" | "google" | null>(null);
  
  // Timer States
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const validateEmail = (e: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setUserType(null);

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) {
      setError("Email address is required.");
      return;
    }

    if (!validateEmail(trimmedEmail)) {
      setError("Please enter a valid email address (e.g. name@domain.com).");
      return;
    }

    setLoading(true);

    try {
      // Check if user exists and their auth type
      const userList = JSON.parse(localStorage.getItem("ib_users") || "[]");
      const user = userList.find((u: any) => u.email.toLowerCase() === trimmedEmail);

      if (!user) {
        setError("No account found with this email address.");
        setLoading(false);
        return;
      }

      // Determine if user is Google-only or Email user
      const isGoogleUser = !user.passwordHash || user.passwordHash.length === 0;
      setUserType(isGoogleUser ? "google" : "email");

      if (isGoogleUser) {
        setSuccess("This account uses Google Sign-In. To reset your password, manage your Google account at account.google.com");
        setCountdown(0);
        setLoading(false);
        return;
      }

      // For email users, proceed with password reset
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmedEmail })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to process request.");
      }

      setSuccess(data.message || "A secure password reset link has been sent to your email.");
      setCountdown(30); // Start 30s countdown
    } catch (err: any) {
      setError(err.message || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
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
        <h2 className="text-2xl font-extrabold text-[#0B1F3A]">Reset Your Password</h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-2xl sm:px-10 border border-gray-100">
          
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-xs text-red-600 flex items-start gap-2">
              <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className={`mb-4 rounded-lg p-3 text-xs flex items-start gap-2 ${
              userType === "google" 
                ? "bg-blue-50 border border-blue-200 text-blue-700" 
                : "bg-emerald-50 border border-emerald-200 text-emerald-700"
            }`}>
              <ShieldCheck className="h-4 w-4 shrink-0 mt-0.5" />
              <div>
                {userType === "google" ? (
                  <>
                    <p className="font-bold">Google Account Sign-In</p>
                    <p className="mt-0.5">{success}</p>
                    <a 
                      href="https://accounts.google.com/account/about" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-[10px] underline font-bold mt-1 inline-block hover:opacity-80"
                    >
                      Manage Google Account →
                    </a>
                  </>
                ) : (
                  <>
                    <p className="font-bold">Reset Link Sent</p>
                    <p className="mt-0.5">{success}</p>
                  </>
                )}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <p className="text-[11px] text-gray-500 mb-3 leading-normal">
                Enter the email address associated with your account. We will send a secure password reset link.
              </p>
              <label className="block text-xs font-bold text-[#0B1F3A] mb-1">Email Address</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="admin@investorbridge.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError("");
                  }}
                  className="w-full rounded-lg border border-gray-200 bg-white pl-9 pr-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#00B386]"
                />
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading || countdown > 0}
                className="w-full rounded-full bg-[#0b1f3a] hover:bg-[#00B386] text-white py-2.5 text-xs font-bold transition-all flex items-center justify-center gap-1 disabled:opacity-50"
              >
                {loading ? (
                  "Sending..."
                ) : countdown > 0 ? (
                  `Resend link in ${countdown}s`
                ) : (
                  <>
                    Send Secure Reset Link <ArrowRight className="h-3.5 w-3.5" />
                  </>
                )}
              </button>
            </div>
          </form>

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
