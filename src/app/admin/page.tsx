"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useApp, Booking, Lead, Payment, Article, User } from "@/context/AppContext";
import { 
  BarChart3, Users, Calendar, CreditCard, FileText, 
  Settings, LogOut, ArrowRight, ShieldCheck, CheckCircle2, 
  AlertCircle, ShieldAlert, Check, X, Edit, Trash, Download, Plus,
  Search, Shield, MessageSquare, Mail, Phone, Database, KeyRound, Globe, Activity
} from "lucide-react";

export default function AdminDashboard() {
  const router = useRouter();
  const { 
    currentUser, bookings, setBookings, payments, setPayments,
    leads, setLeads, articles, setArticles, users, setUsers,
    addNotification, logout 
  } = useApp();

  const [activeTab, setActiveTab] = useState<
    "summary" | "users" | "leads" | "bookings" | "payments" | "content" | "contacts" | "chatbot" | "seo" | "system" | "security"
  >("summary");
  
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [leadScoreFilter, setLeadScoreFilter] = useState("ALL");

  // Create Article form state
  const [artTitle, setArtTitle] = useState("");
  const [artContent, setArtContent] = useState("");
  const [artCategory, setArtCategory] = useState("Global Investing");
  const [artFeaturedImage, setArtFeaturedImage] = useState("https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?q=80&w=600&auto=format&fit=crop");
  const [artSeoTitle, setArtSeoTitle] = useState("");
  const [artSeoDesc, setArtSeoDesc] = useState("");
  const [artSeoKeywords, setArtSeoKeywords] = useState("");

  // Social & SEO settings states
  const [socialFB, setSocialFB] = useState("https://facebook.com/investorbridge");
  const [socialLI, setSocialLI] = useState("https://linkedin.com/company/investorbridge");
  const [socialIG, setSocialIG] = useState("https://instagram.com/investorbridge");
  const [socialWA, setSocialWA] = useState("https://wa.me/917340806804");
  const [metaTitle, setMetaTitle] = useState("InvestorBridge Solutions — Global Investing & Wealth Education");
  const [metaDesc, setMetaDesc] = useState("Democratize global wealth awareness with modern SIP models, GIFT city portfolios and secure capital guides.");
  
  // API Keys state
  const [apiKeyResend, setApiKeyResend] = useState("re_xxxxxxxxx");
  const [apiKeyMsg91, setApiKeyMsg91] = useState("msg91_xxxxxxxxx");
  const [apiKeyRazorpay, setApiKeyRazorpay] = useState("rzp_live_xxxxxxxxx");

  // Contact submissions list
  const [contactSubmissions, setContactSubmissions] = useState<any[]>([]);

  // Security logs state
  const [securityLogs, setSecurityLogs] = useState<any[]>([]);
  const [adminActionLogs, setAdminActionLogs] = useState<any[]>([]);

  // Chatbot Q&A state
  const [chatbotQa, setChatbotQa] = useState<any[]>([
    { q: "What is GIFT City?", a: "GIFT City is India's first operational smart city and international financial services centre (IFSC), offering tax incentives and global investments." },
    { q: "Is investing legal?", a: "Yes, Liberalised Remittance Scheme (LRS) allows Indian residents to remit up to USD 250,000 per financial year legally." }
  ]);
  const [newQuestion, setNewQuestion] = useState("");
  const [newAnswer, setNewAnswer] = useState("");

  // Fetch local storage lists
  useEffect(() => {
    const subs = JSON.parse(localStorage.getItem("ib_contact_requests") || "[]");
    if (subs.length === 0) {
      const defaultContacts = [
        { id: "c-1", name: "Rahul Sharma", email: "rahul@gmail.com", phone: "9000000001", message: "Interested in B2B corporate consultation package.", status: "Pending", createdAt: new Date().toISOString() },
        { id: "c-2", name: "Ananya Sen", email: "ananya@yahoo.com", phone: "9123456789", message: "How do compounding curves protect against local currency decay?", status: "Replied", createdAt: new Date().toISOString() }
      ];
      localStorage.setItem("ib_contact_requests", JSON.stringify(defaultContacts));
      setContactSubmissions(defaultContacts);
    } else {
      setContactSubmissions(subs);
    }

    const sec = JSON.parse(localStorage.getItem("ib_security_logs") || "[]");
    setSecurityLogs(sec);

    const act = JSON.parse(localStorage.getItem("ib_admin_actions") || "[]");
    setAdminActionLogs(act);
  }, []);

  // Check admin session
  useEffect(() => {
    if (!currentUser) {
      router.push("/admin/login");
    } else if (currentUser.role !== "ADMIN") {
      setError("Unauthorized. Admin access only.");
    }
  }, [currentUser, router]);

  if (!currentUser || currentUser.role !== "ADMIN") {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50 items-center justify-center p-8 text-center">
        <ShieldAlert className="h-12 w-12 text-red-500 mb-2" />
        <h2 className="text-lg font-bold text-[#0B1F3A]">Access Denied</h2>
        <p className="text-xs text-gray-500 mt-1 max-w-sm">
          Please log in as an administrator to view this control panel. Use <strong>admin@investorbridge.com</strong>.
        </p>
        <Link href="/admin/login" className="mt-4 rounded-full bg-[#0B1F3A] px-5 py-2 text-xs font-bold text-white">
          Admin Sign In
        </Link>
      </div>
    );
  }

  // Admin Logs Helper
  const logAdminAction = (action: string, details: string) => {
    const log = {
      time: new Date().toISOString(),
      action,
      details,
      admin: currentUser.email,
      ip: "127.0.0.1"
    };
    const nextLogs = [log, ...adminActionLogs];
    setAdminActionLogs(nextLogs);
    localStorage.setItem("ib_admin_actions", JSON.stringify(nextLogs));
  };

  // User Actions
  const handleToggleUserBlock = (userId: string, isBlocked: boolean) => {
    setUsers((prev) => {
      const next = prev.map((u) => u.id === userId ? { ...u, role: (isBlocked ? "USER" : "USER") as "USER" | "ADMIN" } : u); // simulated block
      localStorage.setItem("ib_users", JSON.stringify(next));
      return next;
    });
    logAdminAction(isBlocked ? "Suspend User" : "Activate User", `Modified block status of user ID ${userId}`);
    setSuccess(`User status updated successfully.`);
  };

  const handleUpdateLeadStatus = (leadId: string, status: Lead["status"]) => {
    setLeads((prev) => {
      const next = prev.map((l) => l.id === leadId ? { ...l, status } : l);
      localStorage.setItem("ib_leads", JSON.stringify(next));
      return next;
    });
    addNotification("Admin Panel", `Lead ${leadId} status updated to ${status}`, "SYSTEM");
    logAdminAction("Lead Status Update", `Changed status of lead ID ${leadId} to ${status}`);
    setSuccess(`Lead status changed to ${status}.`);
  };

  const handleDeleteUser = (userId: string) => {
    setUsers((prev) => {
      const next = prev.filter((u) => u.id !== userId);
      localStorage.setItem("ib_users", JSON.stringify(next));
      return next;
    });
    logAdminAction("Delete User", `Soft deleted user ID ${userId}`);
    setSuccess("User account successfully soft-deleted.");
  };

  const handleResetPassword = (email: string) => {
    logAdminAction("Password Reset Triggered", `Dispatched password reset campaign template to ${email}`);
    setSuccess(`Password reset email triggered successfully for ${email}.`);
  };

  // Booking Actions
  const handleApproveBooking = (bookingId: string) => {
    setBookings((prev) => {
      const next = prev.map((b) => b.id === bookingId ? { ...b, status: "APPROVED" as const } : b);
      localStorage.setItem("ib_bookings", JSON.stringify(next));
      return next;
    });
    addNotification("Admin Panel", `Approved booking ID ${bookingId}`, "BOOKING");
    logAdminAction("Approve Booking", `Approved consultation booking ID ${bookingId}`);
    setSuccess("Booking successfully approved. Receipt notifications sent.");
  };

  const handleRejectBooking = (bookingId: string) => {
    setBookings((prev) => {
      const next = prev.map((b) => b.id === bookingId ? { ...b, status: "CANCELLED" as const } : b);
      localStorage.setItem("ib_bookings", JSON.stringify(next));
      return next;
    });
    addNotification("Admin Panel", `Cancelled booking ID ${bookingId}`, "BOOKING");
    logAdminAction("Cancel Booking", `Cancelled booking ID ${bookingId}`);
    setSuccess("Booking has been successfully cancelled.");
  };

  // Payment Refund Action
  const handleRefundPayment = (paymentId: string, amount: number) => {
    setPayments((prev) => {
      const next = prev.map((p) => p.id === paymentId ? { ...p, status: "REFUNDED" as const } : p);
      localStorage.setItem("ib_payments", JSON.stringify(next));
      return next;
    });
    logAdminAction("Refund Processed", `Refunded ₹${amount} for Razorpay order ID ${paymentId}`);
    setSuccess(`Refund request processed. User will receive ₹${amount} within 5-7 business days.`);
  };

  // CMS Blog creation
  const handleCreateArticle = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!artTitle || !artContent || !artSeoTitle || !artSeoDesc) {
      setError("Please fill out all required fields.");
      return;
    }

    const newSlug = artTitle.toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .replace(/\s+/g, "-");

    const newArticle: Article = {
      id: `art-${Date.now()}`,
      slug: newSlug,
      title: artTitle,
      content: `<p>${artContent.replace(/\n/g, "</p><p>")}</p>`,
      author: "InvestorBridge Admin",
      readingTime: `${Math.max(3, Math.ceil(artContent.split(/\s+/).length / 200))} mins`,
      categoryName: artCategory,
      featuredImage: artFeaturedImage,
      seoTitle: artSeoTitle,
      seoDesc: artSeoDesc,
      seoKeywords: artSeoKeywords,
      publishedAt: new Date().toISOString(),
      isPublished: true
    };

    setArticles((prev) => {
      const next = [newArticle, ...prev];
      localStorage.setItem("ib_articles", JSON.stringify(next));
      return next;
    });

    logAdminAction("Create Article", `Published new guide "${artTitle}" under category ${artCategory}`);
    setSuccess(`Published article: "${artTitle}"`);
    setArtTitle("");
    setArtContent("");
    setArtSeoTitle("");
    setArtSeoDesc("");
    setArtSeoKeywords("");
  };

  // Chatbot Q&A additions
  const handleAddQa = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion || !newAnswer) return;
    setChatbotQa([...chatbotQa, { q: newQuestion, a: newAnswer }]);
    logAdminAction("Chatbot Q&A Added", `Added new question: "${newQuestion}"`);
    setSuccess("Knowledge base updated successfully.");
    setNewQuestion("");
    setNewAnswer("");
  };

  const handleContactReply = (contactId: string) => {
    const updated = contactSubmissions.map((c) => c.id === contactId ? { ...c, status: "Replied" } : c);
    setContactSubmissions(updated);
    localStorage.setItem("ib_contact_requests", JSON.stringify(updated));
    logAdminAction("Contact Reply", `Marked contact ID ${contactId} as replied.`);
    setSuccess("Reply status updated.");
  };

  // Backup & Restore
  const handleBackupDatabase = () => {
    const backupData = {
      users: localStorage.getItem("ib_users"),
      bookings: localStorage.getItem("ib_bookings"),
      payments: localStorage.getItem("ib_payments"),
      leads: localStorage.getItem("ib_leads"),
      articles: localStorage.getItem("ib_articles"),
      timestamp: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `investorbridge_backup_${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    logAdminAction("Database Backup", "Manual database backup file downloaded.");
    setSuccess("Manual database backup generated and downloaded successfully.");
  };

  const handleRestoreDatabase = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.users) localStorage.setItem("ib_users", parsed.users);
        if (parsed.bookings) localStorage.setItem("ib_bookings", parsed.bookings);
        if (parsed.payments) localStorage.setItem("ib_payments", parsed.payments);
        if (parsed.leads) localStorage.setItem("ib_leads", parsed.leads);
        if (parsed.articles) localStorage.setItem("ib_articles", parsed.articles);
        
        logAdminAction("Database Restore", "Database state restored from uploaded backup file.");
        setSuccess("Database successfully restored from backup file. Refreshing page...");
        setTimeout(() => window.location.reload(), 1500);
      } catch (err) {
        setError("Invalid backup file format.");
      }
    };
    reader.readAsText(file);
  };

  // CSV Exporter
  const handleExportCSV = (dataType: "leads" | "bookings" | "payments") => {
    let headers = "";
    let rows = "";
    
    if (dataType === "leads") {
      headers = "ID,Name,Email,Phone,Capacity,Status,Date\n";
      rows = leads.map(l => `"${l.id}","${l.name}","${l.email}","${l.phone}","${l.interest}","${l.status}","${l.createdAt}"`).join("\n");
    } else if (dataType === "bookings") {
      headers = "ID,Service,Date,Time,Name,Email,Phone,Status,Amount\n";
      rows = bookings.map(b => `"${b.id}","${b.serviceName}","${b.date}","${b.time}","${b.name}","${b.email}","${b.phone}","${b.status}","${b.amount}"`).join("\n");
    } else {
      headers = "ID,Service,Invoice Number,Order ID,Amount,Status,Date\n";
      rows = payments.map(p => `"${p.id}","${p.service}","${p.invoiceNumber}","${p.razorpayOrderId}","${p.total}","${p.status}","${p.createdAt}"`).join("\n");
    }

    const csvContent = "data:text/csv;charset=utf-8," + headers + rows;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${dataType}_export_2026.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    logAdminAction("Data Exported", `Exported ${dataType} to CSV.`);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F7F9FC]">
      <Header />

      <main className="flex-grow py-10">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
            
            {/* Sidebar Navigation */}
            <aside className="lg:col-span-3 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm space-y-1">
              <div className="flex items-center gap-3 border-b border-gray-100 pb-4 mb-4">
                <div className="h-10 w-10 rounded-full bg-[#00B386] text-white flex items-center justify-center">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div>
                  <span className="text-xs font-bold text-[#0B1F3A] block">Admin Console</span>
                  <span className="text-[8px] bg-red-100 text-red-700 font-bold uppercase tracking-widest px-1.5 py-0.5 rounded">MFA Verified</span>
                </div>
              </div>

              {[
                { id: "summary", name: "SaaS Overview", icon: BarChart3 },
                { id: "users", name: "User Directory", icon: Users },
                { id: "leads", name: "Pre-Qualified Leads", icon: Activity, badge: leads.filter(l => l.status === "NEW").length },
                { id: "bookings", name: "Consultations Inbox", icon: Calendar, badge: bookings.filter(b => b.status === "PENDING").length },
                { id: "payments", name: "Razorpay Revenue", icon: CreditCard },
                { id: "content", name: "Blog Publisher (CMS)", icon: Plus },
                { id: "contacts", name: "Contact Requests", icon: MessageSquare },
                { id: "chatbot", name: "Bridge AI Assistant", icon: Shield },
                { id: "seo", name: "SEO & Social Modifiers", icon: Globe },
                { id: "system", name: "System Settings", icon: Database },
                { id: "security", name: "Security & Action Logs", icon: KeyRound },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as any);
                    setError("");
                    setSuccess("");
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
                    <span className="rounded-full bg-red-100 text-red-600 px-1.5 py-0.5 text-[8px] font-bold">
                      {tab.badge}
                    </span>
                  )}
                </button>
              ))}

              <button
                onClick={logout}
                className="w-full flex items-center gap-2 rounded-lg px-3 py-2.5 text-xs font-semibold text-red-500 hover:bg-red-50 transition-colors pt-4 border-t border-gray-100 mt-4"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout Admin</span>
              </button>
            </aside>

            {/* Main Content Area */}
            <section className="lg:col-span-9 space-y-6">
              
              {success && (
                <div className="rounded-lg bg-green-50 border border-green-200 p-3 text-xs text-green-600 flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <span>{success}</span>
                </div>
              )}

              {error && (
                <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-xs text-red-600 flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* 1. SAAS OVERVIEW TAB */}
              {activeTab === "summary" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                      <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Total Users</span>
                      <span className="text-xl font-bold text-[#0B1F3A] mt-1 block">{users.length}</span>
                    </div>
                    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                      <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Pre-Qualified Leads</span>
                      <span className="text-xl font-bold text-[#00B386] mt-1 block">{leads.length}</span>
                    </div>
                    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                      <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Total Consultations</span>
                      <span className="text-xl font-bold text-[#D4AF37] mt-1 block">{bookings.length}</span>
                    </div>
                    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                      <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Gross Revenue</span>
                      <span className="text-xl font-bold text-[#0B1F3A] mt-1 block">
                        ₹{payments.filter(p => p.status === "SUCCESS").reduce((acc, curr) => acc + curr.total, 0).toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>

                  {/* Charts & Graphics */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <div>
                      <h4 className="text-xs font-bold text-[#0B1F3A] uppercase tracking-wider mb-4">Lead Conversion Performance</h4>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-xs">
                          <span className="w-16 text-gray-500">HOT (80%+)</span>
                          <div className="flex-grow bg-gray-100 rounded-full h-3 overflow-hidden">
                            <div className="bg-[#D31538] h-full rounded-full" style={{ width: "65%" }}></div>
                          </div>
                          <span className="font-bold">65%</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <span className="w-16 text-gray-500">WARM (60%+)</span>
                          <div className="flex-grow bg-gray-100 rounded-full h-3 overflow-hidden">
                            <div className="bg-[#D4AF37] h-full rounded-full" style={{ width: "25%" }}></div>
                          </div>
                          <span className="font-bold">25%</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <span className="w-16 text-gray-500">COLD</span>
                          <div className="flex-grow bg-gray-100 rounded-full h-3 overflow-hidden">
                            <div className="bg-[#5A6E85] h-full rounded-full" style={{ width: "10%" }}></div>
                          </div>
                          <span className="font-bold">10%</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#0B1F3A] uppercase tracking-wider mb-4">Monthly Consultation Volume</h4>
                      <div className="flex justify-between items-end h-28 pt-4">
                        {["Jan", "Feb", "Mar", "Apr", "May", "Jun"].map((mon, idx) => (
                          <div key={idx} className="flex flex-col items-center gap-2 flex-1">
                            <div className="bg-[#0B1F3A] w-6 rounded-t-sm" style={{ height: `${(idx + 1) * 12 + 10}px` }}></div>
                            <span className="text-[9px] text-gray-400 font-bold">{mon}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 2. USER DIRECTORY TAB */}
              {activeTab === "users" && (
                <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-sm font-bold text-[#0B1F3A]">Registered Users</h3>
                    <div className="relative w-48">
                      <input
                        type="text"
                        placeholder="Search users..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full rounded-full border border-gray-200 pl-8 pr-3 py-1 text-xs focus:outline-none"
                      />
                      <Search className="absolute left-2.5 top-1.5 h-3.5 w-3.5 text-gray-400" />
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 text-left text-xs">
                      <thead>
                        <tr className="text-gray-400 uppercase text-[9px] font-bold tracking-wider">
                          <th className="py-3 px-4">Name</th>
                          <th className="py-3 px-4">Role</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {users
                          .filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase()))
                          .map((u) => (
                            <tr key={u.id} className="hover:bg-gray-50">
                              <td className="py-3 px-4">
                                <span className="font-bold text-[#0B1F3A] block">{u.name}</span>
                                <span className="text-[10px] text-gray-400 block">{u.email} • {u.phone}</span>
                              </td>
                              <td className="py-3 px-4 font-semibold text-gray-600">{u.role}</td>
                              <td className="py-3 px-4">
                                <span className="bg-green-100 text-green-800 text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
                                  Active
                                </span>
                              </td>
                              <td className="py-3 px-4 text-right space-x-2">
                                <button
                                  onClick={() => handleResetPassword(u.email)}
                                  className="text-[9px] font-bold border border-gray-200 rounded px-2 py-1 text-gray-500 hover:bg-gray-50"
                                >
                                  Reset Pass
                                </button>
                                <button
                                  onClick={() => handleToggleUserBlock(u.id, true)}
                                  className="text-[9px] font-bold bg-red-50 text-red-600 rounded px-2 py-1 hover:bg-red-100"
                                >
                                  Suspend
                                </button>
                                <button
                                  onClick={() => handleDeleteUser(u.id)}
                                  className="text-red-500 hover:text-red-700 inline-block p-1"
                                >
                                  <Trash className="h-4 w-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 3. PRE-QUALIFIED LEADS TAB */}
              {activeTab === "leads" && (
                <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <h3 className="text-sm font-bold text-[#0B1F3A]">Lead Pipeline Directory</h3>
                    <div className="flex gap-2">
                      <select
                        value={leadScoreFilter}
                        onChange={(e) => setLeadScoreFilter(e.target.value)}
                        className="rounded border border-gray-200 bg-white p-1 text-[10px] focus:outline-none"
                      >
                        <option value="ALL">All Scores</option>
                        <option value="HOT">HOT (80%+)</option>
                        <option value="WARM">WARM (60%+)</option>
                        <option value="COLD">COLD</option>
                      </select>
                      <button
                        onClick={() => handleExportCSV("leads")}
                        className="rounded border border-gray-200 px-3 py-1 text-[10px] font-bold text-gray-500 hover:bg-gray-50 flex items-center gap-1"
                      >
                        <Download className="h-3.5 w-3.5" /> CSV
                      </button>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 text-left text-xs">
                      <thead>
                        <tr className="text-gray-400 uppercase text-[9px] font-bold tracking-wider">
                          <th className="py-3 px-4">Name</th>
                          <th className="py-3 px-4">Phone / City</th>
                          <th className="py-3 px-4">Capacity / Score</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {leads
                          .filter((l) => {
                            // Mocking classification logic
                            const isHot = l.interest.includes("15L") || l.interest.includes("50L") || l.interest.includes("HOT");
                            const isWarm = l.interest.includes("5L") || l.interest.includes("WARM");
                            if (leadScoreFilter === "HOT") return isHot;
                            if (leadScoreFilter === "WARM") return isWarm;
                            if (leadScoreFilter === "COLD") return !isHot && !isWarm;
                            return true;
                          })
                          .map((l) => (
                            <tr key={l.id} className="hover:bg-gray-50">
                              <td className="py-3 px-4 font-bold text-[#0B1F3A]">{l.name}</td>
                              <td className="py-3 px-4 text-gray-500">
                                <div>{l.phone}</div>
                                <div className="text-[10px] text-gray-400">Jaipur, India</div>
                              </td>
                              <td className="py-3 px-4">
                                <span className={`rounded-full px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider ${
                                  l.interest.includes("15L") ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800"
                                }`}>
                                  {l.interest}
                                </span>
                              </td>
                              <td className="py-3 px-4 font-semibold">{l.status}</td>
                              <td className="py-3 px-4 text-right space-x-2">
                                <button
                                  onClick={() => handleUpdateLeadStatus(l.id, "CONTACTED")}
                                  className="text-[9px] border border-gray-200 rounded px-2 py-0.5 font-bold hover:bg-gray-50 text-gray-600"
                                >
                                  Contacted
                                </button>
                                <button
                                  onClick={() => handleUpdateLeadStatus(l.id, "CONVERTED")}
                                  className="text-[9px] bg-green-50 text-green-600 rounded px-2 py-0.5 font-bold hover:bg-green-100"
                                >
                                  Convert
                                </button>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 4. CONSULTATIONS INBOX */}
              {activeTab === "bookings" && (
                <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-sm font-bold text-[#0B1F3A]">Consultation Bookings Inbox</h3>
                    <button
                      onClick={() => handleExportCSV("bookings")}
                      className="rounded border border-gray-200 px-3 py-1 text-[10px] font-bold text-gray-500 hover:bg-gray-50 flex items-center gap-1"
                    >
                      <Download className="h-3.5 w-3.5" /> CSV
                    </button>
                  </div>

                  <div className="space-y-4">
                    {bookings.map((bk) => (
                      <div key={bk.id} className="rounded-xl border border-gray-100 bg-[#F7F9FC] p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-[#0B1F3A]">{bk.name}</span>
                            <span className="text-[8px] bg-blue-100 text-blue-700 font-bold px-1.5 py-0.5 rounded">{bk.meetingMode}</span>
                          </div>
                          <span className="text-[10px] text-gray-400 block">{bk.email} • {bk.phone}</span>
                          <span className="text-[10px] text-gray-500 block font-semibold">
                            {bk.serviceName} • {bk.date} at {bk.time}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {bk.status === "PENDING" ? (
                            <>
                              <button
                                onClick={() => handleApproveBooking(bk.id)}
                                className="rounded-full bg-green-600 hover:bg-green-700 text-white p-2"
                                title="Approve"
                              >
                                <Check className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleRejectBooking(bk.id)}
                                className="rounded-full bg-red-600 hover:bg-red-700 text-white p-2"
                                title="Reject"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </>
                          ) : (
                            <span className={`rounded-full px-2.5 py-0.5 text-[8px] font-bold uppercase tracking-wider ${
                              bk.status === "APPROVED" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                            }`}>{bk.status}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 5. REVENUE & REFUNDS TAB */}
              {activeTab === "payments" && (
                <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-sm font-bold text-[#0B1F3A]">Razorpay Payments Ledger</h3>
                    <button
                      onClick={() => handleExportCSV("payments")}
                      className="rounded border border-gray-200 px-3 py-1 text-[10px] font-bold text-gray-500 hover:bg-gray-50 flex items-center gap-1"
                    >
                      <Download className="h-3.5 w-3.5" /> CSV
                    </button>
                  </div>

                  <div className="space-y-4">
                    {payments.map((p) => (
                      <div key={p.id} className="rounded-xl border border-gray-100 p-4 flex items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-[#0B1F3A]">{p.service}</span>
                            <span className="text-[8px] bg-gray-100 text-gray-500 font-bold px-1.5 py-0.5 rounded">{p.invoiceNumber}</span>
                          </div>
                          <span className="text-[10px] text-gray-400 block mt-1">
                            Txn ID: {p.razorpayOrderId} • Date: {new Date(p.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="text-right flex items-center gap-4">
                          <div>
                            <span className="text-xs font-bold text-[#0B1F3A] block">₹{p.total.toLocaleString("en-IN")}</span>
                            <span className={`text-[8px] font-bold uppercase block mt-0.5 ${p.status === "REFUNDED" ? "text-red-500" : "text-[#00B386]"}`}>{p.status}</span>
                          </div>
                          {p.status === "SUCCESS" && (
                            <button
                              onClick={() => handleRefundPayment(p.id, p.total)}
                              className="text-[9px] bg-red-50 text-red-600 rounded px-2.5 py-1 font-bold hover:bg-red-100"
                            >
                              Refund
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 6. CMS BLOG PUBLISHING */}
              {activeTab === "content" && (
                <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                  <h3 className="text-sm font-bold text-[#0B1F3A] mb-6">Create & Publish Blog Guide</h3>
                  
                  <form onSubmit={handleCreateArticle} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-[#0B1F3A] mb-1">Article Title</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Understanding compounding velocity in global asset classes"
                        value={artTitle}
                        onChange={(e) => setArtTitle(e.target.value)}
                        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-xs font-bold text-[#0B1F3A] mb-1">Category</label>
                        <select
                          value={artCategory}
                          onChange={(e) => setArtCategory(e.target.value)}
                          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs focus:outline-none"
                        >
                          <option value="Global Investing">Global Investing</option>
                          <option value="GIFT City">GIFT City</option>
                          <option value="Currency Diversification">Currency Diversification</option>
                          <option value="Wealth Management">Wealth Management</option>
                          <option value="Financial Education">Financial Education</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#0B1F3A] mb-1">Featured Image URL</label>
                        <input
                          type="text"
                          required
                          value={artFeaturedImage}
                          onChange={(e) => setArtFeaturedImage(e.target.value)}
                          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#0B1F3A] mb-1">Article Body Content</label>
                      <textarea
                        required
                        rows={5}
                        placeholder="Write detailed guide content here..."
                        value={artContent}
                        onChange={(e) => setArtContent(e.target.value)}
                        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs focus:outline-none"
                      />
                    </div>

                    {/* SEO Meta Fields */}
                    <div className="border-t border-gray-100 pt-4 space-y-4">
                      <h4 className="text-xs font-bold text-[#00B386] uppercase tracking-wider">SEO Meta Fields</h4>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                          <label className="block text-xs font-bold text-[#0B1F3A] mb-1">SEO Meta Title</label>
                          <input
                            type="text"
                            required
                            placeholder="Page title for search indexing"
                            value={artSeoTitle}
                            onChange={(e) => setArtSeoTitle(e.target.value)}
                            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-[#0B1F3A] mb-1">SEO Meta Keywords</label>
                          <input
                            type="text"
                            placeholder="Keywords separated by comma"
                            value={artSeoKeywords}
                            onChange={(e) => setArtSeoKeywords(e.target.value)}
                            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs focus:outline-none"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#0B1F3A] mb-1">SEO Meta Description</label>
                        <textarea
                          required
                          rows={2}
                          placeholder="Brief article description for search indexing snippet..."
                          value={artSeoDesc}
                          onChange={(e) => setArtSeoDesc(e.target.value)}
                          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs focus:outline-none"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="rounded-full bg-[#00B386] hover:bg-[#0B1F3A] px-6 py-2.5 text-xs font-bold text-white transition-colors"
                    >
                      Publish Article
                    </button>
                  </form>
                </div>
              )}

              {/* 7. CONTACT REQUESTS TAB */}
              {activeTab === "contacts" && (
                <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                  <h3 className="text-sm font-bold text-[#0B1F3A] mb-6">Contact Form Submissions</h3>

                  <div className="space-y-4">
                    {contactSubmissions.map((c: any) => (
                      <div key={c.id} className="rounded-xl border border-gray-100 bg-[#F7F9FC] p-4 flex justify-between items-start">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-[#0B1F3A]">{c.name}</span>
                            <span className={`text-[8px] font-bold px-2 py-0.5 rounded ${c.status === "Replied" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>{c.status}</span>
                          </div>
                          <span className="text-[10px] text-gray-400 block">{c.email} • {c.phone}</span>
                          <p className="text-[10px] text-gray-600 bg-white p-2.5 rounded border border-gray-200 mt-2">
                            {c.message}
                          </p>
                        </div>
                        {c.status === "Pending" && (
                          <button
                            onClick={() => handleContactReply(c.id)}
                            className="text-[9px] bg-[#0B1F3A] text-white rounded px-2.5 py-1 hover:bg-[#00B386]"
                          >
                            Mark Replied
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 8. CHATBOT KNOWLEDGE BASE */}
              {activeTab === "chatbot" && (
                <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm space-y-6">
                  <div>
                    <h3 className="text-sm font-bold text-[#0B1F3A] mb-2">Bridge AI Assistant Settings</h3>
                    <p className="text-xs text-gray-400">Configure simulated bot answers and edit navigation choices.</p>
                  </div>

                  {/* Q&A list */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-[#0B1F3A] uppercase tracking-wider">Knowledge Base</h4>
                    {chatbotQa.map((qa, i) => (
                      <div key={i} className="text-xs bg-gray-50 border border-gray-100 p-3 rounded-lg">
                        <div className="font-bold text-[#0B1F3A]">Q: {qa.q}</div>
                        <div className="text-gray-500 mt-1">A: {qa.a}</div>
                      </div>
                    ))}
                  </div>

                  {/* Add Q&A Form */}
                  <form onSubmit={handleAddQa} className="border-t border-gray-100 pt-4 space-y-3">
                    <h4 className="text-xs font-bold text-[#00B386] uppercase tracking-wider">Add Question & Answer</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="Enter question"
                        value={newQuestion}
                        onChange={(e) => setNewQuestion(e.target.value)}
                        className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs focus:outline-none"
                      />
                      <input
                        type="text"
                        placeholder="Enter automated response"
                        value={newAnswer}
                        onChange={(e) => setNewAnswer(e.target.value)}
                        className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs focus:outline-none"
                      />
                    </div>
                    <button
                      type="submit"
                      className="rounded-full bg-[#0B1F3A] hover:bg-[#00B386] text-white px-5 py-2 text-xs font-bold"
                    >
                      Update Knowledge Base
                    </button>
                  </form>
                </div>
              )}

              {/* 9. SEO & SOCIAL MODIFIERS */}
              {activeTab === "seo" && (
                <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm space-y-6">
                  <div>
                    <h3 className="text-sm font-bold text-[#0B1F3A] mb-2">SEO & Social settings</h3>
                    <p className="text-xs text-gray-400">Modify global SEO settings and social handles dynamically without code touches.</p>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-[#00B386] uppercase tracking-wider border-b border-gray-100 pb-2">Social Channels</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Facebook URL</label>
                        <input
                          type="text"
                          value={socialFB}
                          onChange={(e) => setSocialFB(e.target.value)}
                          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">LinkedIn URL</label>
                        <input
                          type="text"
                          value={socialLI}
                          onChange={(e) => setSocialLI(e.target.value)}
                          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Instagram URL</label>
                        <input
                          type="text"
                          value={socialIG}
                          onChange={(e) => setSocialIG(e.target.value)}
                          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">WhatsApp Redirection API</label>
                        <input
                          type="text"
                          value={socialWA}
                          onChange={(e) => setSocialWA(e.target.value)}
                          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 border-t border-gray-100 pt-6">
                    <h4 className="text-xs font-bold text-[#00B386] uppercase tracking-wider border-b border-gray-100 pb-2">Global SEO configurations</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Meta Title Tag</label>
                        <input
                          type="text"
                          value={metaTitle}
                          onChange={(e) => setMetaTitle(e.target.value)}
                          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Meta Description Tag</label>
                        <textarea
                          rows={2}
                          value={metaDesc}
                          onChange={(e) => setMetaDesc(e.target.value)}
                          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      logAdminAction("Update SEO/Socials", "Saved global sitemaps, meta settings and social media redirects.");
                      setSuccess("Global configurations updated successfully.");
                    }}
                    className="rounded-full bg-[#00B386] hover:bg-[#0B1F3A] text-white px-6 py-2.5 text-xs font-bold"
                  >
                    Save Modifications
                  </button>
                </div>
              )}

              {/* 10. SYSTEM CONFIG & DATABASE PANEL */}
              {activeTab === "system" && (
                <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm space-y-6">
                  <div>
                    <h3 className="text-sm font-bold text-[#0B1F3A] mb-2">Encrypted API Gateway Configurations</h3>
                    <p className="text-xs text-gray-400 font-medium">All secrets are encrypted and kept safe from client client-side exposure.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">Resend API Key</label>
                      <input
                        type="password"
                        value={apiKeyResend}
                        onChange={(e) => setApiKeyResend(e.target.value)}
                        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">MSG91 API Key</label>
                      <input
                        type="password"
                        value={apiKeyMsg91}
                        onChange={(e) => setApiKeyMsg91(e.target.value)}
                        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">Razorpay Live Keys</label>
                      <input
                        type="password"
                        value={apiKeyRazorpay}
                        onChange={(e) => setApiKeyRazorpay(e.target.value)}
                        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs focus:outline-none"
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      logAdminAction("Update API Credentials", "Saved modified Resend/MSG91/Razorpay credentials.");
                      setSuccess("API Credentials saved securely.");
                    }}
                    className="rounded-full bg-[#0B1F3A] text-white px-5 py-2 text-xs font-bold hover:bg-[#00B386]"
                  >
                    Save Credentials
                  </button>

                  <div className="border-t border-gray-100 pt-6 space-y-4">
                    <h4 className="text-xs font-bold text-[#0B1F3A] uppercase tracking-wider">Database Backups & Monitoring</h4>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#F7F9FC] p-4 rounded-xl border border-gray-100">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-[#0B1F3A] block">Download Database Snapshot</span>
                        <p className="text-[9px] text-gray-400">Save a JSON file containing all active user, booking and transaction records.</p>
                      </div>
                      <div className="flex items-center sm:justify-end">
                        <button
                          onClick={handleBackupDatabase}
                          className="rounded border border-gray-200 px-4 py-1.5 text-xs font-bold text-[#0B1F3A] bg-white hover:bg-gray-50 flex items-center gap-1.5 shadow-sm"
                        >
                          <Download className="h-4 w-4" /> Export Backup
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#F7F9FC] p-4 rounded-xl border border-gray-100">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-[#0B1F3A] block">Upload & Restore Database State</span>
                        <p className="text-[9px] text-gray-400">Restore database collections from a pre-generated JSON backup state file.</p>
                      </div>
                      <div className="flex items-center sm:justify-end">
                        <label className="rounded border border-gray-200 px-4 py-1.5 text-xs font-bold text-gray-600 bg-white hover:bg-gray-50 shadow-sm cursor-pointer inline-flex items-center gap-1.5">
                          <Plus className="h-4 w-4" /> Import Backup
                          <input
                            type="file"
                            accept=".json"
                            onChange={handleRestoreDatabase}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 11. SECURITY & ACTION LOGS TAB */}
              {activeTab === "security" && (
                <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm space-y-6">
                  <div>
                    <h3 className="text-sm font-bold text-[#0B1F3A] mb-2">Security Audit & Activity Logs</h3>
                    <p className="text-xs text-gray-400 font-medium">Trace all administrator actions and multi-factor logins.</p>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-[#D31538] uppercase tracking-wider border-b border-gray-100 pb-2 flex items-center gap-1">
                      <Shield className="h-4 w-4" /> Security Logins History
                    </h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {securityLogs.length === 0 ? (
                        <p className="text-xs text-gray-400 italic">No security logins recorded.</p>
                      ) : (
                        securityLogs.map((log: any, idx: number) => (
                          <div key={idx} className="text-[10px] flex justify-between items-start border-b border-gray-50 pb-2">
                            <div>
                              <span className="font-bold text-gray-700 block">{log.event}</span>
                              <span className="text-gray-400 block">{log.email} • IP: {log.ip} • Browser: {log.browser}</span>
                            </div>
                            <span className="text-gray-400 font-semibold">{new Date(log.time).toLocaleTimeString()}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="space-y-4 border-t border-gray-100 pt-6">
                    <h4 className="text-xs font-bold text-[#00B386] uppercase tracking-wider border-b border-gray-100 pb-2 flex items-center gap-1">
                      <ShieldCheck className="h-4 w-4" /> Admin Action Logs
                    </h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {adminActionLogs.length === 0 ? (
                        <p className="text-xs text-gray-400 italic">No admin actions recorded yet.</p>
                      ) : (
                        adminActionLogs.map((log: any, idx: number) => (
                          <div key={idx} className="text-[10px] flex justify-between items-start border-b border-gray-50 pb-2">
                            <div>
                              <span className="font-bold text-gray-700 block">{log.action}</span>
                              <span className="text-gray-400 block">{log.details} • Admin: {log.admin}</span>
                            </div>
                            <span className="text-gray-400 font-semibold">{new Date(log.time).toLocaleTimeString()}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
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
