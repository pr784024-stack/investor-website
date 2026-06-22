"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useApp, Booking, Payment, Notification } from "@/context/AppContext";
import { 
  User as UserIcon, Calendar, CreditCard, Bookmark, Landmark,
  Bell, Settings, LogOut, ArrowRight, ShieldCheck, 
  CheckCircle2, AlertCircle, FileText, Lock, ShieldAlert 
} from "lucide-react";

export default function UserDashboard() {
  const router = useRouter();
  const { 
    currentUser, bookings, payments, notifications, 
    savedArticleIds, articles, setNotifications, logout,
    addNotification, setUsers, users, setCurrentUser
  } = useApp();

  const [activeTab, setActiveTab] = useState<"summary" | "bookings" | "payments" | "saved" | "notifications" | "profile">("summary");
  
  // Profile Form States
  const [profileName, setProfileName] = useState("");
  const [profileEmail, setProfileEmail] = useState("");
  const [profilePhone, setProfilePhone] = useState("");
  const [profilePassword, setProfilePassword] = useState("");
  const [profileConfirmPass, setProfileConfirmPass] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");

  // OTP Verification for Profile Updates (Security requirements)
  const [showProfileOtp, setShowProfileOtp] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<any>(null);
  const [profileOtpCode, setProfileOtpCode] = useState("");
  
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Redirect if not logged in
  useEffect(() => {
    if (!currentUser) {
      router.push("/login");
    } else {
      setProfileName(currentUser.name);
      setProfileEmail(currentUser.email);
      setProfilePhone(currentUser.phone);
    }
  }, [currentUser, router]);

  if (!currentUser) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50 items-center justify-center p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#00B386]"></div>
        <span className="text-xs text-gray-500 mt-2">Authorizing session...</span>
      </div>
    );
  }

  // Filter lists for current user
  const userBookings = bookings.filter((b) => b.email === currentUser.email);
  const userBookingIds = userBookings.map((b) => b.id);
  const userPayments = payments.filter((p) => p.bookingId && userBookingIds.includes(p.bookingId));
  const userSavedArticles = articles.filter((a) => savedArticleIds.includes(a.id));

  const handleMarkNotificationsRead = () => {
    setNotifications((prev) => {
      const next = prev.map((n) => ({ ...n, isRead: true }));
      localStorage.setItem("ib_notifications", JSON.stringify(next));
      return next;
    });
    addNotification("Dashboard", "Notifications marked as read.", "SYSTEM");
  };

  // Profile update submit
  const handleProfileUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!currentPassword) {
      setError("You must enter your current password to authorize changes.");
      return;
    }

    if (currentPassword.length < 8) {
      setError("Incorrect current password.");
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (profileEmail !== currentUser.email && !emailRegex.test(profileEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    // Phone format
    const phoneRegex = /^[0-9]{10,15}$/;
    if (profilePhone !== currentUser.phone && !phoneRegex.test(profilePhone)) {
      setError("Please enter a valid mobile number.");
      return;
    }

    if (profilePassword && profilePassword.length < 12) {
      setError("New password must be at least 12 characters under secure rules.");
      return;
    }

    if (profilePassword && profilePassword !== profileConfirmPass) {
      setError("Passwords do not match.");
      return;
    }

    try {
      const res = await fetch("/api/auth/profile-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUser.id })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to trigger OTP.");
      }

      setPendingChanges({
        name: profileName,
        email: profileEmail,
        phone: profilePhone,
        password: profilePassword
      });
      setShowProfileOtp(true);
    } catch (err: any) {
      setError(err.message || "Failed to trigger verification OTP.");
    }
  };

  const handleVerifyProfileOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("/api/auth/verify-mfa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser.id,
          mfaCode: profileOtpCode
        })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Verification failed.");
      }

      // Commit changes
      const updatedUser = {
        ...currentUser,
        name: pendingChanges.name,
        email: pendingChanges.email,
        phone: pendingChanges.phone
      };

      // Update global users list
      setUsers((prev) => {
        const next = prev.map((u) => u.id === currentUser.id ? updatedUser : u);
        localStorage.setItem("ib_users", JSON.stringify(next));
        return next;
      });

      setCurrentUser(updatedUser);
      sessionStorage.setItem("ib_session_user", JSON.stringify(updatedUser));
      
      setSuccess("Profile settings successfully updated.");
      setShowProfileOtp(false);
      setProfileOtpCode("");
      setCurrentPassword("");
      setProfilePassword("");
      setProfileConfirmPass("");
      addNotification("Security Alert", "Profile credentials updated. Re-authenticated with OTP.", "SECURITY");
    } catch (err: any) {
      setError(err.message || "Invalid OTP code.");
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-grow bg-[#F7F9FC] py-10">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
            
            {/* Sidebar Column (3 cols) */}
            <aside className="lg:col-span-3 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm space-y-2">
              <div className="flex items-center gap-3 border-b border-gray-50 pb-4 mb-4">
                <div className="h-10 w-10 rounded-full bg-[#0B1F3A] text-[#00B386] flex items-center justify-center">
                  <UserIcon className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-[#0B1F3A] block">{currentUser.name}</span>
                  <span className="text-[9px] text-[#00B386] font-bold uppercase tracking-wider block">{currentUser.role} Account</span>
                </div>
              </div>

              {[
                { id: "summary", name: "Overview", icon: Landmark },
                { id: "bookings", name: "My Bookings", icon: Calendar, badge: userBookings.length },
                { id: "payments", name: "Payments", icon: CreditCard, badge: userPayments.length },
                { id: "saved", name: "Saved Articles", icon: Bookmark, badge: userSavedArticles.length },
                { id: "notifications", name: "Notifications", icon: Bell, badge: notifications.filter(n => !n.isRead).length },
                { id: "profile", name: "Profile Settings", icon: Settings },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as any);
                    setError("");
                    setSuccess("");
                    setShowProfileOtp(false);
                  }}
                  className={`w-full flex items-center justify-between rounded-lg px-3 py-2.5 text-xs font-semibold transition-all ${
                    activeTab === tab.id
                      ? "bg-[#0B1F3A] text-white"
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <tab.icon className="h-4 w-4" />
                    <span>{tab.name}</span>
                  </div>
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <span className={`rounded-full px-1.5 py-0.5 text-[8px] font-bold ${
                      activeTab === tab.id ? "bg-[#00B386] text-white" : "bg-[#F7F9FC] text-gray-500"
                    }`}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              ))}

              <button
                onClick={logout}
                className="w-full flex items-center gap-2 rounded-lg px-3 py-2.5 text-xs font-semibold text-red-500 hover:bg-red-50 transition-colors pt-4 border-t border-gray-50"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </aside>

            {/* Content Column (9 cols) */}
            <section className="lg:col-span-9 space-y-6">
              
              {/* Errors/Success blocks */}
              {error && (
                <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-xs text-red-600 flex items-start gap-2">
                  <ShieldAlert className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}
              {success && (
                <div className="rounded-lg bg-green-50 border border-green-200 p-3 text-xs text-green-600 flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <span>{success}</span>
                </div>
              )}

              {/* TAB 1: SUMMARY / OVERVIEW */}
              {activeTab === "summary" && (
                <div className="space-y-6">
                  {/* Info stats */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                      <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Upcoming Consultations</span>
                      <span className="text-xl font-bold text-[#0B1F3A] mt-1 block">
                        {userBookings.filter(b => b.status === "APPROVED" || b.status === "PENDING").length}
                      </span>
                    </div>
                    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                      <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Consultation Payments</span>
                      <span className="text-xl font-bold text-[#00B386] mt-1 block">
                        ₹{userPayments.reduce((acc, curr) => acc + curr.total, 0).toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                      <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Saved Guides</span>
                      <span className="text-xl font-bold text-[#D4AF37] mt-1 block">{userSavedArticles.length}</span>
                    </div>
                  </div>

                  {/* Upcoming Consultations Widget */}
                  <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                    <h3 className="text-sm font-bold text-[#0B1F3A] mb-4">Upcoming consultations</h3>
                    {userBookings.filter(b => b.status === "PENDING" || b.status === "APPROVED").length === 0 ? (
                      <p className="text-xs text-gray-400 italic">No upcoming consultations found. Schedule one to start.</p>
                    ) : (
                      <div className="space-y-3">
                        {userBookings.filter(b => b.status === "PENDING" || b.status === "APPROVED").map((bk) => (
                          <div key={bk.id} className="rounded-xl bg-[#F7F9FC] p-4 flex items-center justify-between gap-4">
                            <div>
                              <span className="text-xs font-bold text-[#0B1F3A]">{bk.serviceName}</span>
                              <span className="text-[10px] text-gray-400 block mt-1">
                                {bk.date} at {bk.time} ({bk.meetingMode} slot)
                              </span>
                            </div>
                            <span className={`rounded-full px-2.5 py-0.5 text-[8px] font-bold uppercase tracking-wider ${
                              bk.status === "APPROVED" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                            }`}>
                              {bk.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: MY BOOKINGS LIST */}
              {activeTab === "bookings" && (
                <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-sm font-bold text-[#0B1F3A]">My Booking History</h3>
                    <Link href="/book" className="rounded-full bg-[#0B1F3A] hover:bg-[#00B386] px-4 py-1.5 text-[10px] font-bold text-white">
                      New Booking
                    </Link>
                  </div>

                  {userBookings.length === 0 ? (
                    <p className="text-xs text-gray-400 italic text-center py-8">No booking logs found in your account.</p>
                  ) : (
                    <div className="space-y-4">
                      {userBookings.map((bk) => (
                        <div key={bk.id} className="rounded-xl border border-gray-100 bg-[#F7F9FC] p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                          <div>
                            <span className="text-xs font-bold text-[#0B1F3A]">{bk.serviceName}</span>
                            <span className="text-[10px] text-gray-400 block mt-1">
                              Scheduled for {bk.date} at {bk.time} • Mode: {bk.meetingMode}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`rounded-full px-2.5 py-0.5 text-[8px] font-bold uppercase tracking-wider ${
                              bk.status === "APPROVED" ? "bg-green-100 text-green-800" : 
                              bk.status === "PENDING" ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"
                            }`}>
                              {bk.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: PAYMENTS HISTORY */}
              {activeTab === "payments" && (
                <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                  <h3 className="text-sm font-bold text-[#0B1F3A] mb-6">Payments & Transactions</h3>
                  
                  {userPayments.length === 0 ? (
                    <p className="text-xs text-gray-400 italic text-center py-8">No transaction logs found.</p>
                  ) : (
                    <div className="space-y-4">
                      {userPayments.map((pay) => (
                        <div key={pay.id} className="rounded-xl border border-gray-100 bg-white p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-sm">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-[#0B1F3A]">{pay.service}</span>
                              <span className="text-[8px] bg-gray-100 text-gray-500 font-bold px-1.5 py-0.5 rounded">{pay.invoiceNumber}</span>
                            </div>
                            <span className="text-[10px] text-gray-400 block mt-1">
                              Date: {new Date(pay.createdAt).toLocaleDateString()} • Txn ID: {pay.razorpayOrderId}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 justify-between sm:justify-start">
                            <div className="text-right">
                              <span className="text-sm font-bold text-[#0B1F3A]">₹{pay.total.toLocaleString("en-IN")}</span>
                              <span className="text-[8px] text-[#00B386] font-bold uppercase tracking-wider block mt-0.5">{pay.status}</span>
                            </div>
                            <button
                              onClick={() => {
                                addNotification("Receipt Print", `Simulated invoice printed for ${pay.invoiceNumber}.`, "SYSTEM");
                                window.print();
                              }}
                              className="rounded bg-[#F7F9FC] border border-gray-200 p-2 hover:bg-gray-50 text-gray-500"
                            >
                              <FileText className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: SAVED ARTICLES */}
              {activeTab === "saved" && (
                <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                  <h3 className="text-sm font-bold text-[#0B1F3A] mb-6">Bookmarked Guides</h3>
                  
                  {userSavedArticles.length === 0 ? (
                    <p className="text-xs text-gray-400 italic text-center py-8">You haven't bookmarked any guides yet.</p>
                  ) : (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      {userSavedArticles.map((art) => (
                        <div key={art.id} className="rounded-xl border border-gray-100 p-4 flex flex-col justify-between h-36">
                          <div>
                            <span className="text-[8px] font-bold text-[#00B386] uppercase tracking-wider block">{art.categoryName}</span>
                            <h4 className="text-xs font-bold text-[#0B1F3A] mt-1 line-clamp-2">{art.title}</h4>
                          </div>
                          <Link
                            href={`/education/${art.slug}`}
                            className="text-[10px] font-bold text-[#00B386] hover:underline flex items-center gap-0.5 mt-2"
                          >
                            Read Guide <ArrowRight className="h-3 w-3" />
                          </Link>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 5: NOTIFICATIONS */}
              {activeTab === "notifications" && (
                <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-sm font-bold text-[#0B1F3A]">Notifications Alert Logs</h3>
                    <button
                      onClick={handleMarkNotificationsRead}
                      className="text-xs font-bold text-[#00B386] hover:underline"
                    >
                      Mark All as Read
                    </button>
                  </div>

                  {notifications.length === 0 ? (
                    <p className="text-xs text-gray-400 italic text-center py-8">No notifications found.</p>
                  ) : (
                    <div className="space-y-3">
                      {notifications.map((notif) => (
                        <div 
                          key={notif.id} 
                          className={`rounded-xl border p-4 flex items-start gap-3 ${
                            notif.isRead ? "bg-white border-gray-100" : "bg-blue-50/50 border-blue-100"
                          }`}
                        >
                          <div className={`mt-0.5 rounded-full p-1 ${
                            notif.type === "SECURITY" ? "bg-red-100 text-red-600" : 
                            notif.type === "PAYMENT" ? "bg-green-100 text-green-600" : "bg-blue-100 text-blue-600"
                          }`}>
                            {notif.type === "SECURITY" ? <ShieldAlert className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                          </div>
                          <div>
                            <span className="text-xs font-bold text-[#0B1F3A] flex items-center gap-1.5">
                              {notif.title}
                              {!notif.isRead && (
                                <span className="h-1.5 w-1.5 rounded-full bg-blue-500 inline-block"></span>
                              )}
                            </span>
                            <span className="text-[10px] text-gray-400 block mt-1 leading-normal">{notif.message}</span>
                            <span className="text-[8px] text-gray-400 block mt-1.5">{new Date(notif.createdAt).toLocaleTimeString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 6: PROFILE SETTINGS */}
              {activeTab === "profile" && (
                <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                  <h3 className="text-sm font-bold text-[#0B1F3A] mb-6">Update Profile Credentials</h3>
                  
                  {!showProfileOtp ? (
                    <form onSubmit={handleProfileUpdateSubmit} className="space-y-4 max-w-lg">
                      <div className="rounded-lg bg-gray-50 border border-gray-200 p-4 text-[10px] text-gray-600 leading-normal flex items-start gap-2">
                        <Lock className="h-4.5 w-4.5 text-[#00B386] flex-shrink-0 mt-0.5" />
                        <div>
                          <strong>Verification Shield:</strong> To change critical account coordinates (Email, Mobile, or Password), you must enter your current password. Changing values requires OTP verification.
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#0B1F3A] mb-1">Full Name</label>
                        <input
                          type="text"
                          required
                          value={profileName}
                          onChange={(e) => setProfileName(e.target.value)}
                          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#00B386]"
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                          <label className="block text-xs font-bold text-[#0B1F3A] mb-1">Email Address</label>
                          <input
                            type="email"
                            required
                            value={profileEmail}
                            onChange={(e) => setProfileEmail(e.target.value)}
                            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#00B386]"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-[#0B1F3A] mb-1">Mobile Number</label>
                          <input
                            type="tel"
                            required
                            value={profilePhone}
                            onChange={(e) => setProfilePhone(e.target.value)}
                            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#00B386]"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 pt-2 border-t border-gray-50">
                        <div>
                          <label className="block text-xs font-bold text-[#0B1F3A] mb-1">New Password (Optional)</label>
                          <input
                            type="password"
                            placeholder="Min 12 characters"
                            value={profilePassword}
                            onChange={(e) => setProfilePassword(e.target.value)}
                            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#00B386]"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-[#0B1F3A] mb-1">Confirm New Password</label>
                          <input
                            type="password"
                            placeholder="Min 12 characters"
                            value={profileConfirmPass}
                            onChange={(e) => setProfileConfirmPass(e.target.value)}
                            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#00B386]"
                          />
                        </div>
                      </div>

                      <div className="pt-4 border-t border-gray-50">
                        <label className="block text-xs font-bold text-red-600 mb-1">Confirm Current Password (Required)</label>
                        <input
                          type="password"
                          required
                          placeholder="Enter your current password"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className="w-full rounded-lg border border-red-200 bg-white px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-red-500"
                        />
                      </div>

                      <button
                        type="submit"
                        className="rounded-full bg-[#0B1F3A] hover:bg-[#00B386] text-white px-6 py-2.5 text-xs font-bold transition-colors"
                      >
                        Request Settings Update
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={handleVerifyProfileOtp} className="space-y-4 max-w-md">
                      <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-4 text-[10px] text-yellow-800 leading-normal flex items-start gap-2">
                        <ShieldAlert className="h-4.5 w-4.5 text-[#D4AF37] flex-shrink-0 mt-0.5" />
                        <div>
                          <strong>2FA Verification Challenge:</strong> An OTP has been dispatched to authorize your profile settings update. Please retrieve it from your email logs, developer terminal, or check your phone if configured.
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#0B1F3A] mb-1">Enter Verification OTP</label>
                        <input
                          type="text"
                          required
                          maxLength={6}
                          placeholder="e.g. 583921"
                          value={profileOtpCode}
                          onChange={(e) => setProfileOtpCode(e.target.value)}
                          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-center tracking-widest focus:outline-none focus:ring-1 focus:ring-[#00B386]"
                        />
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setShowProfileOtp(false)}
                          className="flex-grow rounded-full border border-gray-200 py-2.5 text-xs font-bold text-gray-500 hover:bg-gray-50 text-center"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="flex-grow rounded-full bg-[#00B386] hover:bg-[#0B1F3A] text-white py-2.5 text-xs font-bold transition-colors text-center"
                        >
                          Confirm Changes
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}

            </section>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
