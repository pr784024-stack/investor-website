import { PrismaClient } from "@prisma/client";

// Global cache for PrismaClient in development to prevent hot reloading from opening too many connections
const globalForPrisma = globalThis as unknown as {
  prisma: any;
};

// Check if we should use mock database
export const isDatabaseConfigured = () => {
  const url = process.env.DATABASE_URL;
  if (!url) return false;
  return true;
};

// Lazy initialization wrapper using Proxy to avoid build-time errors
let prismaInstance: any = null;

export const prisma = new Proxy({} as PrismaClient, {
  get(target, prop, receiver) {
    if (prismaInstance) {
      return Reflect.get(prismaInstance, prop, receiver);
    }

    if (globalForPrisma.prisma) {
      prismaInstance = globalForPrisma.prisma;
      return Reflect.get(prismaInstance, prop, receiver);
    }

    if (!isDatabaseConfigured()) {
      throw new Error("DATABASE_URL is not configured.");
    }

    try {
      const { Pool } = require("pg");
      const { PrismaPg } = require("@prisma/adapter-pg");
      
      const pool = new Pool({ connectionString: process.env.DATABASE_URL });
      const adapter = new PrismaPg(pool);
      
      prismaInstance = new PrismaClient({ adapter });
      
      if (process.env.NODE_ENV !== "production") {
        globalForPrisma.prisma = prismaInstance;
      }
    } catch (e) {
      console.error("Failed to initialize PrismaClient in proxy:", e);
      throw e;
    }

    return Reflect.get(prismaInstance, prop, receiver);
  }
});

// Global cache for mockDb in development to prevent hot reloading from resetting state
const globalForMockDb = globalThis as unknown as {
  mockDb: any;
};

// In-Memory Database for Mock Fallback (so the app works out-of-the-box!)
// Persistent JSON-based state isn't strictly necessary for a demo, but in-memory provides a super smooth UX.
const initialMockDb = {
  users: [
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
  ] as any[],
  leads: [] as any[],
  bookings: [] as any[],
  payments: [] as any[],
  articles: [
    {
      id: "compounding",
      slug: "compounding",
      title: "The Power of Compounding: How to Build Long-Term Wealth",
      content: `<p>Compounding is often referred to as the eighth wonder of the world. It is the process where your investment's earnings, either from capital gains or interest, are reinvested to generate additional earnings over time. This cycle continues, allowing your initial investment to grow exponentially.</p>
      <h3>How Compounding Works</h3>
      <p>Imagine you invest ₹10,000 at a 10% annual interest rate. After the first year, you earn ₹1,000, bringing your total to ₹11,000. In the second year, you earn 10% on ₹11,000, which is ₹1,100, bringing your total to ₹12,100. Over 30 years, that ₹10,000 grows to over ₹174,494! That is the magic of compounding.</p>
      <h3>Key Factors in Compounding</h3>
      <ul>
        <li><strong>Time:</strong> The longer you leave your money invested, the more powerful compounding becomes. Starting early is the single most important factor.</li>
        <li><strong>Consistency:</strong> Making regular contributions, even small ones, significantly accelerates wealth building.</li>
        <li><strong>Rate of Return:</strong> A higher rate of return increases the compounding effect, though it usually comes with higher risk.</li>
      </ul>`,
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
      content: `<p>Most investors suffer from 'home country bias'—investing all their wealth in their local currency and markets. However, currency fluctuations can significantly impact your real purchasing power over the long run.</p>
      <h3>What is Currency Diversification?</h3>
      <p>Currency diversification involves holding assets denominated in different global currencies, such as the US Dollar (USD), Euro (EUR), or British Pound (GBP). By holding global assets, you reduce the risk of a single currency depreciating and eroding your wealth.</p>
      <h3>The Impact of Depreciating Currencies</h3>
      <p>Historically, emerging market currencies have depreciated against the USD. If your local currency depreciates by 3% to 5% annually against the USD, any local return is discounted by that inflation factor in global terms. Investing in USD-denominated assets provides a natural hedge.</p>`,
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
      content: `<p>GDP per capita is a key metric indicating the economic output per person. When evaluating international investments, understanding the GDP growth rate and purchasing power parity is crucial.</p>
      <h3>Why GDP Per Capita Matters</h3>
      <p>Countries with rising GDP per capita usually experience growing middle classes, higher consumer spending and stronger domestic corporate earnings. By investing in global markets with high GDP per capita or high growth rates, you capture international growth drivers.</p>`,
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
      content: `<p>Human psychology often gets in the way of investment success. Let's look at the five most common cognitive traps that investors fall into and strategies to navigate them.</p>
      <h3>1. Panic Selling During Market Downturns</h3>
      <p>Markets move in cycles. Selling your long-term investments during a temporary market correction locks in losses. Instead, rebalance your portfolio or maintain a long-term view.</p>
      <h3>2. Lack of Diversification</h3>
      <p>Putting all your eggs in one basket is highly risky. Diversification across asset classes, sectors and geographies is the only free lunch in finance.</p>`,
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
  ] as any[],
  categories: [
    { id: "1", name: "Global Investing", slug: "global-investing" },
    { id: "2", name: "Compounding", slug: "compounding" },
    { id: "3", name: "Diversification", slug: "diversification" },
    { id: "4", name: "Currency Awareness", slug: "currency-awareness" },
    { id: "5", name: "Investor Psychology", slug: "investor-psychology" },
    { id: "6", name: "Risk Management", slug: "risk-management" },
    { id: "7", name: "Wealth Creation", slug: "wealth-creation" },
  ] as any[],
  partners: [] as any[],
  contactRequests: [] as any[],
  subscribers: [] as any[],
  notifications: [] as any[],
  adminLogs: [] as any[],
  analytics: [] as any[],
  emailOtps: [] as any[],
  smsOtps: [] as any[],
  mfaOtps: [] as any[],
  passwordResetTokens: [] as any[],
  rateLimitLogs: [] as any[],
};

import fs from "fs";
import path from "path";

// Persistence configuration for Demo Mode (Option B: JSON File Persistence)
const STATE_FILE_PATH = path.join(process.cwd(), "demo-state.json");

// Helper to save mockDb state to disk
export function saveMockDbState() {
  try {
    fs.writeFileSync(STATE_FILE_PATH, JSON.stringify(mockDb, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to write mockDb state to file:", err);
  }
}

// Helper to load mockDb state from disk
function loadMockDbState() {
  try {
    if (fs.existsSync(STATE_FILE_PATH)) {
      const data = fs.readFileSync(STATE_FILE_PATH, "utf-8");
      return JSON.parse(data);
    }
  } catch (err) {
    console.error("Failed to read mockDb state from file:", err);
  }
  return null;
}

const loadedState = loadMockDbState();
let rawMockDb = globalForMockDb.mockDb || loadedState || initialMockDb;

// Ensure all required arrays exist (guards against stale global cache from HMR)
if (!Array.isArray(rawMockDb.users)) rawMockDb.users = [];
if (!Array.isArray(rawMockDb.leads)) rawMockDb.leads = [];
if (!Array.isArray(rawMockDb.bookings)) rawMockDb.bookings = [];
if (!Array.isArray(rawMockDb.payments)) rawMockDb.payments = [];
if (!Array.isArray(rawMockDb.articles)) rawMockDb.articles = [];
if (!Array.isArray(rawMockDb.categories)) rawMockDb.categories = [];
if (!Array.isArray(rawMockDb.partners)) rawMockDb.partners = [];
if (!Array.isArray(rawMockDb.contactRequests)) rawMockDb.contactRequests = [];
if (!Array.isArray(rawMockDb.subscribers)) rawMockDb.subscribers = [];
if (!Array.isArray(rawMockDb.notifications)) rawMockDb.notifications = [];
if (!Array.isArray(rawMockDb.adminLogs)) rawMockDb.adminLogs = [];
if (!Array.isArray(rawMockDb.analytics)) rawMockDb.analytics = [];
if (!Array.isArray(rawMockDb.emailOtps)) rawMockDb.emailOtps = [];
if (!Array.isArray(rawMockDb.smsOtps)) rawMockDb.smsOtps = [];
if (!Array.isArray(rawMockDb.mfaOtps)) rawMockDb.mfaOtps = [];
if (!Array.isArray(rawMockDb.passwordResetTokens)) rawMockDb.passwordResetTokens = [];
if (!Array.isArray(rawMockDb.rateLimitLogs)) rawMockDb.rateLimitLogs = [];

if (process.env.NODE_ENV !== "production") {
  globalForMockDb.mockDb = rawMockDb;
}

// Automatically save mockDb to disk when mutations occur by wrapping the object in a Proxy
export const mockDbProxyHandler = {
  get(target: any, prop: string | symbol): any {
    const val = Reflect.get(target, prop);
    if (val && typeof val === "object") {
      // Return a recursive proxy to capture nested updates
      return new Proxy(val, {
        set(t: any, p: string | symbol, value: any, receiver: any) {
          const res = Reflect.set(t, p, value, receiver);
          saveMockDbState();
          return res;
        },
        deleteProperty(t: any, p: string | symbol) {
          const res = Reflect.deleteProperty(t, p);
          saveMockDbState();
          return res;
        }
      });
    }
    return val;
  },
  set(target: any, prop: string | symbol, value: any, receiver: any) {
    const res = Reflect.set(target, prop, value, receiver);
    saveMockDbState();
    return res;
  },
  deleteProperty(target: any, prop: string | symbol) {
    const res = Reflect.deleteProperty(target, prop);
    saveMockDbState();
    return res;
  }
};

// Export the Proxy under the name mockDb so callers import it seamlessly
export const mockDb = new Proxy(rawMockDb, mockDbProxyHandler);

// Safe executor that runs prisma query
export async function dbQuery<T>(prismaAction: () => Promise<T>, mockAction: () => T): Promise<T> {
  if (isDatabaseConfigured()) {
    try {
      return await prismaAction();
    } catch (e) {
      console.error("DATABASE CONNECTION OR QUERY FAILED:", e);
      throw new Error("Database connection or query failure. Please try again later or contact administrator.");
    }
  }
  return mockAction();
}
