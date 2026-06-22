"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, ShieldCheck, ShieldAlert, Eye, EyeOff } from "lucide-react";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // Password strength factors
  const hasMinLength = password.length >= 12;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

  const passwordScore = [
    hasMinLength,
    hasUppercase,
    hasLowercase,
    hasNumber,
    hasSpecial
  ].filter(Boolean).length;

  const getStrengthText = () => {
    if (password.length === 0) return "";
    if (passwordScore <= 2) return "Weak";
    if (passwordScore <= 4) return "Fair";
    return "Strong";
  };

  const getStrengthColor = () => {
    if (passwordScore <= 2) return "bg-red-500";
    if (passwordScore <= 4) return "bg-amber-500";
    return "bg-green-500";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!token) {
      setError("Reset token is missing from the URL.");
      return;
    }

    if (!hasMinLength || !hasUppercase || !hasLowercase || !hasNumber || !hasSpecial) {
      setError("Please ensure your password meets all strength requirements.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          password,
          confirmPassword
        })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to reset password.");
      }

      setSuccess(data.message || "Your password has been successfully updated.");
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push("/login");
      }, 3000);

    } catch (err: any) {
      setError(err.message || "An error occurred. Please request a new reset link.");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="bg-white py-8 px-4 shadow sm:rounded-2xl sm:px-10 border border-gray-100 text-center">
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-xs text-red-600 mb-6 flex flex-col items-center gap-2">
          <ShieldAlert className="h-6 w-6 text-red-500" />
          <span className="font-bold">Invalid Reset Request</span>
          <span>This password reset link is invalid or expired.</span>
        </div>
        <Link href="/forgot-password" className="inline-block rounded-full bg-[#0B1F3A] hover:bg-[#00B386] text-white px-6 py-2 text-xs font-bold transition-all">
          Request New Reset Link
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white py-8 px-4 shadow sm:rounded-2xl sm:px-10 border border-gray-100">
      
      {error && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-xs text-red-600 flex items-start gap-2">
          <ShieldAlert className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="mb-4 rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-700 flex items-start gap-2">
          <ShieldCheck className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Password Reset Successful</p>
            <p className="mt-0.5">{success}</p>
            <p className="mt-2 text-[10px] text-gray-500">Redirecting to sign-in page...</p>
          </div>
        </div>
      )}

      {!success && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#0B1F3A] mb-1">New Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError("");
                }}
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
            <label className="block text-xs font-bold text-[#0B1F3A] mb-1">Confirm New Password</label>
            <input
              type="password"
              required
              placeholder="••••••••••••"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (error) setError("");
              }}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#00B386]"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-[#0b1f3a] hover:bg-[#00B386] text-white py-2.5 text-xs font-bold transition-all flex items-center justify-center gap-1 disabled:opacity-50"
            >
              {loading ? "Resetting Password..." : "Update Password"} <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </form>
      )}

      <div className="mt-6 border-t border-gray-100 pt-4 text-center">
        <Link href="/login" className="text-[10px] text-gray-500 hover:text-[#00B386] font-semibold">
          Return to login
        </Link>
      </div>
    </div>
  );
}

export default function ResetPassword() {
  return (
    <div className="min-h-screen bg-[#F7F9FC] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-2 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0B1F3A] text-[#00B386]">
            <img src="/logo-mark.png" alt="Logo" className="h-7 w-7 object-contain" />
          </div>
          <span className="text-xl font-bold tracking-tight text-[#0B1F3A]">InvestorBridge</span>
        </Link>
        <h2 className="text-2xl font-extrabold text-[#0B1F3A]">Create New Password</h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Suspense fallback={
          <div className="bg-white py-8 px-4 shadow sm:rounded-2xl sm:px-10 border border-gray-100 text-center">
            <span className="text-xs text-gray-400 font-medium">Loading security token...</span>
          </div>
        }>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
