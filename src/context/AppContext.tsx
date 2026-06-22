"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "USER" | "ADMIN";
  mfaEnabled: boolean;
  isVerifiedEmail: boolean;
  isVerifiedPhone: boolean;
  createdAt: string;
}

export interface Booking {
  id: string;
  serviceName: string;
  date: string;
  time: string;
  meetingMode: "Online" | "Offline";
  name: string;
  email: string;
  phone: string;
  message: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "RESCHEDULED" | "CANCELLED";
  createdAt: string;
  paymentId?: string;
  amount: number;
}

export interface Payment {
  id: string;
  bookingId?: string;
  amount: number;
  currency: string;
  status: "PENDING" | "SUCCESS" | "FAILED" | "REFUNDED";
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  service: string;
  tax: number;
  total: number;
  invoiceNumber: string;
  createdAt: string;
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  interest: string;
  message: string;
  status: "NEW" | "CONTACTED" | "QUALIFIED" | "CONVERTED" | "CLOSED";
  createdAt: string;
}

export interface Article {
  id: string;
  slug: string;
  title: string;
  content: string;
  author: string;
  readingTime: string;
  categoryName: string;
  featuredImage: string;
  seoTitle: string;
  seoDesc: string;
  seoKeywords: string;
  publishedAt: string;
  isPublished: boolean;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "SYSTEM" | "BOOKING" | "PAYMENT" | "SECURITY";
  isRead: boolean;
  createdAt: string;
}

interface AppContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  bookings: Booking[];
  setBookings: React.Dispatch<React.SetStateAction<Booking[]>>;
  payments: Payment[];
  setPayments: React.Dispatch<React.SetStateAction<Payment[]>>;
  leads: Lead[];
  setLeads: React.Dispatch<React.SetStateAction<Lead[]>>;
  articles: Article[];
  setArticles: React.Dispatch<React.SetStateAction<Article[]>>;
  notifications: Notification[];
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
  savedArticleIds: string[];
  toggleSaveArticle: (articleId: string) => void;
  addNotification: (title: string, message: string, type: Notification["type"]) => void;
  addLead: (lead: Omit<Lead, "id" | "createdAt" | "status">) => void;
  addBooking: (booking: Omit<Booking, "id" | "createdAt" | "status">) => Booking;
  addPayment: (payment: Omit<Payment, "id" | "createdAt" | "invoiceNumber">) => Payment;
  login: (email: string, passwordHash: string) => Promise<User>;
  register: (name: string, email: string, phone: string, passwordHash: string) => Promise<User>;
  logout: () => void;
  failedAttempts: { [email: string]: number };
  lockouts: { [email: string]: string }; // ISO timestamps
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [savedArticleIds, setSavedArticleIds] = useState<string[]>([]);
  const [failedAttempts, setFailedAttempts] = useState<{ [email: string]: number }>({});
  const [lockouts, setLockouts] = useState<{ [email: string]: string }>({});

  // Initialize from LocalStorage or mock data
  useEffect(() => {
    // 1. Initial mock articles
    const mockArticles = [
      {
        id: "compounding",
        slug: "compounding",
        title: "The Power of Compounding: How to Build Long-Term Wealth",
        content: `Compounding is the process where your investment's earnings generate additional earnings over time. This cycle continues, allowing your initial investment to grow exponentially.`,
        author: "InvestorBridge Research",
        readingTime: "5 mins",
        categoryName: "Compounding",
        featuredImage: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?q=80&w=600&auto=format&fit=crop",
        seoTitle: "The Power of Compounding - InvestorBridge",
        seoDesc: "Learn how compounding works and how to harness it to build long-term generational wealth.",
        seoKeywords: "Compounding, Wealth Creation, Investing",
        publishedAt: new Date().toISOString(),
        isPublished: true,
      },
      {
        id: "currency-diversification",
        slug: "currency-diversification",
        title: "Why Currency Diversification is Essential for Modern Portfolios",
        content: `Currency diversification involves holding assets denominated in different global currencies, such as the US Dollar (USD), Euro (EUR), or British Pound (GBP). By holding global assets, you reduce the risk of a single currency depreciating and eroding your wealth.`,
        author: "Global Markets Team",
        readingTime: "7 mins",
        categoryName: "Currency Awareness",
        featuredImage: "https://images.unsplash.com/photo-1502920514313-52581002a659?q=80&w=600&auto=format&fit=crop",
        seoTitle: "Currency Diversification Guide - InvestorBridge",
        seoDesc: "Discover the critical benefits of global currency diversification to hedge against local currency depreciation.",
        seoKeywords: "Currency, USD, Global Markets, Diversification",
        publishedAt: new Date().toISOString(),
        isPublished: true,
      },
      {
        id: "gdp-per-capita",
        slug: "gdp-per-capita",
        title: "GDP Per Capita and Global Investing: Connecting the Dots",
        content: `GDP per capita indicates the economic output per person. When evaluating international investments, understanding the GDP growth rate and purchasing power parity is crucial.`,
        author: "Macroeconomics Desk",
        readingTime: "6 mins",
        categoryName: "Global Investing",
        featuredImage: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=600&auto=format&fit=crop",
        seoTitle: "GDP Per Capita & Global Investing - InvestorBridge",
        seoDesc: "Understand how macro GDP per capita shifts affect equity returns and global investment opportunities.",
        seoKeywords: "GDP, Macroeconomics, International Investing",
        publishedAt: new Date().toISOString(),
        isPublished: true,
      },
      {
        id: "investor-mistakes",
        slug: "investor-mistakes",
        title: "Top 5 Investor Mistakes and How to Avoid Them",
        content: `Human psychology often gets in the way of investment success. Let's look at the five most common cognitive traps that investors fall into and strategies to navigate them.`,
        author: "Behavioral Finance Dept",
        readingTime: "8 mins",
        categoryName: "Investor Psychology",
        featuredImage: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?q=80&w=600&auto=format&fit=crop",
        seoTitle: "Common Investor Mistakes - InvestorBridge",
        seoDesc: "Avoid critical cognitive errors that destroy wealth. Learn the psychological pitfalls of investing.",
        seoKeywords: "Investor Psychology, Risk Management, Investing Mistakes",
        publishedAt: new Date().toISOString(),
        isPublished: true,
      }
    ];

    const getStored = (key: string, fallback: any) => {
      const val = localStorage.getItem(key);
      return val ? JSON.parse(val) : fallback;
    };

    setUsers(getStored("ib_users", [
      {
        id: "admin-uuid",
        name: "InvestorBridge Admin",
        email: "admin@investorbridge.com",
        phone: "7340806804",
        passwordHash: "$2b$10$Ez3WaZ5TGvrnQXYlSmtITOmWPsOJL5J45hcfJNbbpWkYJa4HHdNMS", // password: admin12345!
        role: "ADMIN",
        mfaEnabled: true,
        isVerifiedEmail: true,
        isVerifiedPhone: true,
        createdAt: new Date().toISOString()
      }
    ]));
    
    setBookings(getStored("ib_bookings", []));
    setPayments(getStored("ib_payments", []));
    setLeads(getStored("ib_leads", []));
    setArticles(getStored("ib_articles", mockArticles));
    setNotifications(getStored("ib_notifications", [
      {
        id: "n-welcome",
        title: "Welcome to InvestorBridge!",
        message: "Thank you for joining our Global Investment Awareness platform. Book a consultation or try our SIP Calculators.",
        type: "SYSTEM",
        isRead: false,
        createdAt: new Date().toISOString()
      }
    ]));
    setSavedArticleIds(getStored("ib_saved_article_ids", []));
    setFailedAttempts(getStored("ib_failed_attempts", {}));
    setLockouts(getStored("ib_lockouts", {}));

    const sessionUser = sessionStorage.getItem("ib_session_user");
    if (sessionUser) {
      setCurrentUser(JSON.parse(sessionUser));
    }
  }, []);

  // Persistors
  const saveState = (key: string, state: any) => {
    localStorage.setItem(key, JSON.stringify(state));
  };

  const toggleSaveArticle = (articleId: string) => {
    setSavedArticleIds((prev) => {
      const next = prev.includes(articleId)
        ? prev.filter((id) => id !== articleId)
        : [...prev, articleId];
      saveState("ib_saved_article_ids", next);
      return next;
    });
  };

  const addNotification = (title: string, message: string, type: Notification["type"]) => {
    const newNotif: Notification = {
      id: `n-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title,
      message,
      type,
      isRead: false,
      createdAt: new Date().toISOString()
    };
    setNotifications((prev) => {
      const next = [newNotif, ...prev];
      saveState("ib_notifications", next);
      return next;
    });
  };

  const addLead = (leadData: Omit<Lead, "id" | "createdAt" | "status">) => {
    const newLead: Lead = {
      ...leadData,
      id: `lead-${Date.now()}`,
      status: "NEW",
      createdAt: new Date().toISOString()
    };
    setLeads((prev) => {
      const next = [newLead, ...prev];
      saveState("ib_leads", next);
      return next;
    });
    addNotification("New Lead Generated", `${newLead.name} shows interest in ${newLead.interest}`, "SYSTEM");
  };

  const addBooking = (bookingData: Omit<Booking, "id" | "createdAt" | "status">) => {
    const newBooking: Booking = {
      ...bookingData,
      id: `bk-${Date.now()}`,
      status: "PENDING",
      createdAt: new Date().toISOString()
    };
    setBookings((prev) => {
      const next = [newBooking, ...prev];
      saveState("ib_bookings", next);
      return next;
    });
    addNotification("Consultation Booked", `${newBooking.serviceName} scheduled on ${newBooking.date} at ${newBooking.time}`, "BOOKING");
    return newBooking;
  };

  const addPayment = (paymentData: Omit<Payment, "id" | "createdAt" | "invoiceNumber">) => {
    const newPayment: Payment = {
      ...paymentData,
      id: `pay-${Date.now()}`,
      invoiceNumber: `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date().toISOString()
    };
    setPayments((prev) => {
      const next = [newPayment, ...prev];
      saveState("ib_payments", next);
      return next;
    });
    addNotification("Payment Successful", `Receipt generated for ${newPayment.service}. Amount: ₹${newPayment.total}`, "PAYMENT");
    return newPayment;
  };

  const login = async (email: string, passwordHash: string): Promise<User> => {
    // Lockout verification
    const now = new Date();
    const lockoutUntil = lockouts[email];
    if (lockoutUntil && new Date(lockoutUntil) > now) {
      const diffMins = Math.ceil((new Date(lockoutUntil).getTime() - now.getTime()) / 60000);
      throw new Error(`Account locked. Try again in ${diffMins} minutes.`);
    }

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: passwordHash })
      });
      const data = await res.json();
      if (!res.ok) {
        trackFailedAttempt(email);
        throw new Error(data.error || "Login failed.");
      }

      // Success credentials verification — clear attempts
      setFailedAttempts((prev) => {
        const next = { ...prev };
        delete next[email];
        saveState("ib_failed_attempts", next);
        return next;
      });

      setLockouts((prev) => {
        const next = { ...prev };
        delete next[email];
        saveState("ib_lockouts", next);
        return next;
      });

      if (data.mfaRequired) {
        return {
          id: data.userId,
          name: "",
          email: data.email,
          phone: data.phone,
          role: "USER",
          mfaEnabled: true,
          isVerifiedEmail: false,
          isVerifiedPhone: false,
          createdAt: "",
          mfaRequired: true
        } as any;
      }

      setCurrentUser(data.user);
      saveState("ib_session_user", data.user);
      return data.user;
    } catch (err: any) {
      throw new Error(err.message || "An unexpected error occurred during login.");
    }
  };

  const trackFailedAttempt = (email: string) => {
    const attempts = (failedAttempts[email] || 0) + 1;
    const nextAttempts = { ...failedAttempts, [email]: attempts };
    setFailedAttempts(nextAttempts);
    saveState("ib_failed_attempts", nextAttempts);

    if (attempts >= 5) {
      const lockoutTime = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 mins
      const nextLockouts = { ...lockouts, [email]: lockoutTime };
      setLockouts(nextLockouts);
      saveState("ib_lockouts", nextLockouts);
      addNotification("Security lockout", `Account locked for ${email} due to 5 consecutive failed login attempts.`, "SECURITY");
    }
  };

  const register = async (name: string, email: string, phone: string, passwordHash: string): Promise<User> => {
    // Unique check
    const dupEmail = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    const dupPhone = users.find((u) => u.phone === phone);
    if (dupEmail) throw new Error("Email address already registered.");
    if (dupPhone) throw new Error("Mobile number already registered.");

    const newUser: User = {
      id: `u-${Date.now()}`,
      name,
      email,
      phone,
      role: email.endsWith("@investorbridge.com") ? "ADMIN" : "USER",
      mfaEnabled: false,
      isVerifiedEmail: false,
      isVerifiedPhone: false,
      createdAt: new Date().toISOString()
    };

    setUsers((prev) => {
      const next = [...prev, newUser];
      saveState("ib_users", next);
      return next;
    });

    setCurrentUser(newUser);
    sessionStorage.setItem("ib_session_user", JSON.stringify(newUser));
    addNotification("Account Created", "Welcome to InvestorBridge. Your dashboard is ready.", "SYSTEM");

    return newUser;
  };

  const logout = () => {
    setCurrentUser(null);
    sessionStorage.removeItem("ib_session_user");
    addNotification("Logged Out", "You have been successfully signed out.", "SYSTEM");
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        users,
        setUsers,
        bookings,
        setBookings,
        payments,
        setPayments,
        leads,
        setLeads,
        articles,
        setArticles,
        notifications,
        setNotifications,
        savedArticleIds,
        toggleSaveArticle,
        addNotification,
        addLead,
        addBooking,
        addPayment,
        login,
        register,
        logout,
        failedAttempts,
        lockouts
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
