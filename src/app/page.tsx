"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useApp } from "@/context/AppContext";
import { 
  ShieldCheck, BookOpen, BarChart3, TrendingUp, Users,
  Map, ArrowRight, DollarSign, Calculator, Globe, Compass,
  FileText, CheckCircle2, BadgePercent, Clock
} from "lucide-react";

export default function Home() {
  const { articles } = useApp();
  const [activeCalculator, setActiveCalculator] = useState<"sip" | "currency">("sip");
  
  // SIP Calculator Preview State
  const [sipAmount, setSipAmount] = useState(10000);
  const [sipReturn, setSipReturn] = useState(12);
  const [sipYears, setSipYears] = useState(15);
  const [sipResult, setSipResult] = useState({ totalVal: 0, totalInvested: 0, wealthGained: 0 });

  // Currency Calculator Preview State
  const [currencyAmount, setCurrencyAmount] = useState(10000);
  const [currencyRate, setCurrencyRate] = useState(83.5); // USD to INR conversion
  const [depreciation, setDepreciation] = useState(3.5); // average INR depreciation
  const [currencyResult, setCurrencyResult] = useState({ usdValue: 0, futureValueWithHedge: 0 });

  // NEW CHATBOT STATES START
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{
    sender: "bot" | "user";
    text: string;
    time: string;
    options?: string[] | null;
    showForm?: boolean;
  }>>([]);
  const [qCount, setQCount] = useState(0);
  const [formShown, setFormShown] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [uiInput, setUiInput] = useState("");

  const [leadName, setLeadName] = useState("");
  const [leadPhone, setLeadPhone] = useState("");
  const [leadCity, setLeadCity] = useState("");
  const [leadJob, setLeadJob] = useState("");
  const [leadIncome, setLeadIncome] = useState("");
  const [leadSubmitting, setLeadSubmitting] = useState(false);

  const handleSendMessage = (text: string) => {
    if (!text.trim() || isTyping) return;
    setUiInput("");

    // Add user message
    const userMsg = {
      sender: "user" as const,
      text: text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages((prev) => [...prev, userMsg]);
    const nextQCount = qCount + 1;
    setQCount(nextQCount);
    setIsTyping(true);

    // Simulated typing delay
    setTimeout(() => {
      setIsTyping(false);
      const matched = findResponse(text);
      let botMsg;
      if (matched) {
        botMsg = {
          sender: "bot" as const,
          text: matched.reply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          options: matched.opts || null,
          showForm: matched.showForm || false
        };
        if (matched.showForm) {
          setFormShown(true);
        }
      } else {
        const fallbacks = [
          `That's a great question! 😊 Our advisor would be best placed to answer this specifically for your situation.\n\nHere's what I can help you with right now:`,
          `Good one — let me connect you with our expert for a precise answer on this!\n\nMeanwhile, feel free to explore:`,
          `I want to make sure you get the most accurate advice. Let me connect you with our advisor to discuss this in detail.`
        ];
        const fb = fallbacks[Math.floor(Math.random() * fallbacks.length)];
        botMsg = {
          sender: "bot" as const,
          text: fb,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          options: ['What is GIFT City?', 'Tell me about returns', 'Is this legal?', 'How do I start?', 'Book a free consultation']
        };
      }

      setChatMessages((prev) => [...prev, botMsg]);

      // Auto show form after 4 questions
      if (!formShown && nextQCount >= 4) {
        setTimeout(() => {
          const autoFormMsg = {
            sender: "bot" as const,
            text: `You seem genuinely interested in global investing! 😊\n\nLet me connect you with our advisor for a **free 15-minute personalised consultation** — they'll show you exactly what your money looks like in global markets based on your income.`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            showForm: true
          };
          setChatMessages((prev) => [...prev, autoFormMsg]);
          setFormShown(true);
        }, 800);
      }
    }, 700 + Math.random() * 500);
  };

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadName.trim()) { alert('Please enter your name 🙏'); return; }
    if (!leadPhone.trim()) { alert('Please enter your WhatsApp number 🙏'); return; }

    setLeadSubmitting(true);

    let score = 60;
    let tag = 'WARM';
    if (leadIncome === '5L-15L') score = 78;
    if (leadIncome === '15L-50L') score = 90;
    if (leadIncome === '50L+') { score = 97; tag = 'HOT'; }
    if (score >= 80) tag = 'HOT';
    else if (score >= 60) tag = 'WARM';
    else tag = 'COLD';

    const payload = {
      name: leadName.trim(),
      phone: leadPhone.trim(),
      city: leadCity.trim() || 'Not specified',
      job: leadJob.trim() || 'Not specified',
      income: leadIncome || 'Not specified',
      score: score + '%',
      tag: tag,
      time: new Date().toLocaleString('en-IN')
    };

    const SHEET_URL = 'https://script.google.com/macros/s/AKfycbyY8SkeR4Uy2fXWtia998GXyTsYkTTpcOsZxFzAtrKEquiWyi7uoV8xaO0b41NvF7e-/exec';

    try {
      await fetch(SHEET_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      setChatMessages((prev) => {
        const updated = prev.map(m => m.showForm ? { ...m, showForm: false } : m);
        return [...updated, {
          sender: "bot" as const,
          text: `Thank you ${leadName}! 🎉 Your details have been saved and our advisor will reach out to you on WhatsApp shortly.\n\n${
            tag === 'HOT'
              ? `| 🔥 | **Hot Lead — Priority Call!** |\n| --- | --- |\n| Info | Thank you ${leadName}! You're a high-priority lead. Our advisor will call **${leadPhone}** within 2-4 hours! |\n| Status | ✅ Saved to Google Sheets |`
              : `| ✅ | **Details Submitted Successfully!** |\n| --- | --- |\n| Info | Thank you ${leadName}! Our advisor will call **${leadPhone}** within 24 hours. |\n| Status | ✅ Saved to Google Sheets |`
          }\n\nFeel free to ask me anything else in the meantime! 😊`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          options: ['Tell me about returns', 'What is GIFT City?', 'How do I start?']
        }];
      });

      setLeadName("");
      setLeadPhone("");
      setLeadCity("");
      setLeadJob("");
      setLeadIncome("");
    } catch (err) {
      setChatMessages((prev) => {
        const updated = prev.map(m => m.showForm ? { ...m, showForm: false } : m);
        return [...updated, {
          sender: "bot" as const,
          text: `Thank you ${leadName}! 🎉 Your details have been received. Our advisor will call you on **${leadPhone}** within 24 hours!\n\n| ✅ | **Consultation Booked!** |\n| --- | --- |\n| Info | We'll reach out to you on WhatsApp soon. Looking forward to helping you start your global investment journey! 🌍 |`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          options: ['Tell me about returns', 'What is GIFT City?', 'How do I start?']
        }];
      });
      setLeadName("");
      setLeadPhone("");
      setLeadCity("");
      setLeadJob("");
      setLeadIncome("");
    } finally {
      setLeadSubmitting(false);
    }
  };

  const clearChat = () => {
    setChatMessages([]);
    setQCount(0);
    setFormShown(false);
    setIsTyping(false);
  };
  // NEW CHATBOT STATES END

  // Calculate SIP
  useEffect(() => {
    const P = sipAmount;
    const i = (sipReturn / 100) / 12;
    const n = sipYears * 12;
    
    // SIP Formula: M = P * [ ( (1 + i)^n - 1 ) / i ] * (1 + i)
    const totalVal = P * (((Math.pow(1 + i, n) - 1) / i) * (1 + i));
    const totalInvested = P * n;
    const wealthGained = totalVal - totalInvested;
    
    setSipResult({
      totalVal: Math.round(totalVal),
      totalInvested: Math.round(totalInvested),
      wealthGained: Math.round(wealthGained)
    });
  }, [sipAmount, sipReturn, sipYears]);

  // Calculate Currency Impact
  useEffect(() => {
    const usd = currencyAmount / currencyRate;
    // Future Value factoring currency depreciation: A = P * (1 + r/100)^n
    // Assumes 10 years holding
    const years = 10;
    const futureValInr = currencyAmount * Math.pow(1 + depreciation / 100, years);
    setCurrencyResult({
      usdValue: Number(usd.toFixed(2)),
      futureValueWithHedge: Math.round(futureValInr)
    });
  }, [currencyAmount, currencyRate, depreciation]);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-grow">
        {/* SECTION 1: HERO */}
        <section className="relative overflow-hidden bg-gradient-to-b from-[#F7F9FC] via-white to-white py-20 lg:py-28">
          {/* Background shapes */}
          <div className="absolute top-0 right-0 -mr-20 h-[500px] w-[500px] rounded-full bg-[#00B386]/5 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -ml-20 h-[400px] w-[400px] rounded-full bg-[#D4AF37]/5 blur-3xl"></div>

          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center">
              {/* Left Side Info */}
              <div className="flex flex-col gap-6 animate-slide-up">
                <div className="inline-flex max-w-max items-center gap-1.5 rounded-full bg-[#00B386]/10 px-3 py-1 text-xs font-bold text-[#00B386]">
                  <Compass className="h-3.5 w-3.5" />
                  <span>Global Investment Awareness Platform</span>
                </div>

                <h1 className="text-4xl font-extrabold tracking-tight text-[#0B1F3A] sm:text-5xl lg:text-6xl">
                  Think Global. <br />
                  <span className="text-[#00B386]">Invest Smart.</span> <br />
                  Build Wealth.
                </h1>

                <p className="text-base text-[#5A6E85] leading-relaxed max-w-lg">
                  InvestorBridge Solutions connects forward-thinking investors with global wealth creation concepts. Learn currency awareness, international asset diversification and compounding dynamics.
                </p>

                <div className="flex flex-wrap gap-3 mt-2">
                  <Link
                    href="/signup"
                    className="rounded-full bg-[#00B386] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-[#00B386]/20 transition-all hover:bg-[#0B1F3A] hover:shadow-none hover:scale-105"
                  >
                    Get Started Free
                  </Link>
                  <Link
                    href="/book"
                    className="rounded-full bg-[#0B1F3A] px-6 py-3 text-sm font-bold text-white transition-all hover:bg-[#00B386] hover:scale-105"
                  >
                    Book Consultation
                  </Link>
                  <Link
                    href="/education"
                    className="rounded-full border border-gray-200 bg-white px-6 py-3 text-sm font-bold text-[#1A1A1A] transition-all hover:bg-gray-50"
                  >
                    Explore Education Hub
                  </Link>
                </div>
              </div>

              {/* Right Side: Interactive Mockup Dashboard (Fintech Feel) */}
              <div className="relative rounded-2xl bg-white p-6 shadow-xl border border-gray-100 dark-glassmorphism max-w-lg mx-auto lg:max-w-none w-full animate-fade-in">
                {/* Header widget */}
                <div className="flex justify-between items-center border-b border-white/10 pb-4 mb-4">
                  <div className="flex items-center gap-2 text-white">
                    <div className="h-2 w-2 rounded-full bg-[#00B386] animate-pulse"></div>
                    <span className="text-xs font-bold tracking-wider uppercase text-gray-300">Live Global Sandbox</span>
                  </div>
                  <span className="text-[10px] text-gray-400">Jaipur Server Node</span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="rounded-xl bg-white/5 p-4 border border-white/5">
                    <span className="text-[10px] text-gray-400 uppercase tracking-wider block">USD Asset Exposure</span>
                    <span className="text-xl font-bold text-white mt-1 block">57.4%</span>
                    <span className="text-[9px] text-[#00B386] flex items-center gap-0.5 mt-0.5">
                      <TrendingUp className="h-2.5 w-2.5" /> +8.2% exchange buffer
                    </span>
                  </div>
                  <div className="rounded-xl bg-white/5 p-4 border border-white/5">
                    <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Target Compound Yield</span>
                    <span className="text-xl font-bold text-[#D4AF37] mt-1 block">14.8% p.a.</span>
                    <span className="text-[9px] text-gray-400 block mt-0.5">Global Diversified Equities</span>
                  </div>
                </div>

                {/* Simulated Chart */}
                <div className="mb-4">
                  <span className="text-[10px] text-gray-300 uppercase tracking-wider block mb-2">Simulated Wealth Growth (15 Years)</span>
                  <div className="h-32 flex items-end gap-2 bg-white/5 rounded-lg p-3 border border-white/5">
                    {/* Simulated vertical bars of a chart */}
                    <div className="flex-1 bg-[#00B386]/30 rounded-t h-[15%] transition-all hover:bg-[#00B386]"></div>
                    <div className="flex-1 bg-[#00B386]/30 rounded-t h-[22%] transition-all hover:bg-[#00B386]"></div>
                    <div className="flex-1 bg-[#00B386]/40 rounded-t h-[30%] transition-all hover:bg-[#00B386]"></div>
                    <div className="flex-1 bg-[#00B386]/45 rounded-t h-[42%] transition-all hover:bg-[#00B386]"></div>
                    <div className="flex-1 bg-[#00B386]/50 rounded-t h-[55%] transition-all hover:bg-[#00B386]"></div>
                    <div className="flex-1 bg-[#00B386]/70 rounded-t h-[70%] transition-all hover:bg-[#00B386]"></div>
                    <div className="flex-1 bg-[#00B386] rounded-t h-[95%] relative">
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 rounded bg-[#D4AF37] text-[#0B1F3A] text-[9px] font-bold px-1 py-0.5">
                        Compounded
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between text-[9px] text-gray-400 mt-1.5 px-1">
                    <span>Year 1</span>
                    <span>Year 5</span>
                    <span>Year 10</span>
                    <span>Year 15</span>
                  </div>
                </div>

                {/* Micro widget footer */}
                <div className="rounded-lg bg-[#00B386]/10 p-3 border border-[#00B386]/20 flex items-center justify-between text-xs">
                  <span className="text-white font-medium">Hedge Currency Depreciation?</span>
                  <Link href="/global-investing" className="text-[#00B386] font-bold hover:underline inline-flex items-center gap-1">
                    Read Guide <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: TRUST BAR */}
        <section className="bg-white border-y border-gray-100 py-8">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5 items-center justify-center">
              {[
                { label: "Investor Awareness", desc: "No trading, purely education" },
                { label: "Financial Education", desc: "Interactive growth models" },
                { label: "Global Investing Insights", desc: "USD/EUR exposure rules" },
                { label: "Professional Consulting", desc: "Strategic wealth reviews" },
                { label: "Secure Platform", desc: "Role-based authentication" },
              ].map((item, idx) => (
                <div key={idx} className="flex flex-col items-center text-center p-3">
                  <div className="flex items-center gap-1.5 text-[#00B386] font-bold text-sm">
                    <CheckCircle2 className="h-4.5 w-4.5 flex-shrink-0" />
                    <span>{item.label}</span>
                  </div>
                  <span className="text-[10px] text-gray-400 mt-0.5">{item.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 3: WHY INVESTORBRIDGE */}
        <section className="py-20 bg-[#F7F9FC]">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#00B386]">Corporate Capabilities</h2>
              <p className="mt-2 text-3xl font-bold tracking-tight text-[#0B1F3A] sm:text-4xl">
                Why InvestorBridge Solutions?
              </p>
              <p className="mt-4 text-sm text-[#5A6E85] leading-relaxed">
                We bridge the gap between traditional domestic frameworks and international wealth growth paradigms.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { 
                  title: "Global Investing Insights", 
                  desc: "Understand global opportunities, currency depreciation buffers and US equity market structure.",
                  icon: Globe, 
                  color: "border-[#00B386]/30 bg-[#00B386]/5 text-[#00B386]" 
                },
                { 
                  title: "Investor Education", 
                  desc: "Free hub covering compounding curves, asset class diversification, risk limits and psychology.",
                  icon: BookOpen, 
                  color: "border-[#0B1F3A]/30 bg-[#0B1F3A]/5 text-[#0B1F3A]" 
                },
                { 
                  title: "Wealth Consulting", 
                  desc: "Connect with certified professionals to review strategic cashflow planning and global allocation.",
                  icon: BarChart3, 
                  color: "border-[#D4AF37]/30 bg-[#D4AF37]/5 text-[#D4AF37]" 
                },
                { 
                  title: "Strategic Networking", 
                  desc: "Connect with verified investment managers, wealth consultants and regulatory custodians globally.",
                  icon: ShieldCheck, 
                  color: "border-[#D4AF37]/30 bg-[#D4AF37]/5 text-[#D4AF37]" 
                },
              ].map((card, idx) => (
                <div key={idx} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm card-hover">
                  <div className={`inline-flex rounded-lg border p-2 mb-4 ${card.color}`}>
                    <card.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold text-[#0B1F3A] mb-2">{card.title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{card.desc}</p>
                </div>
              ))}
            </div>

            <div className="text-center mt-12">
              <Link 
                href="/services" 
                className="inline-flex items-center gap-1.5 rounded-full bg-[#0B1F3A] px-6 py-3 text-sm font-bold text-white transition-all hover:bg-[#00B386]"
              >
                Explore Services <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* SECTION 4: GLOBAL OPPORTUNITIES */}
        <section className="py-20 bg-white border-b border-gray-100">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center">
              {/* Left Column: Info & Country Cards */}
              <div className="flex flex-col gap-6">
                <div>
                  <h2 className="text-xs font-bold uppercase tracking-wider text-[#00B386]">Beyond Borders</h2>
                  <p className="mt-2 text-3xl font-bold tracking-tight text-[#0B1F3A] sm:text-4xl">
                    Diversification Across Currencies
                  </p>
                  <p className="mt-4 text-xs text-gray-500 leading-relaxed">
                    By limiting investments to a single home market, you bear 100% currency inflation risk. Spreading assets over multiple economic centers creates a security buffer.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  {[
                    { country: "United States", currency: "USD", buffer: "Reserve Currency", tag: "Tech Growth" },
                    { country: "Europe", currency: "EUR", buffer: "Industrial Hub", tag: "Value Plays" },
                    { country: "United Kingdom", currency: "GBP", buffer: "Financial Center", tag: "Yield Plays" },
                    { country: "India", currency: "INR", buffer: "Growth Engine", tag: "Domestic Scale" },
                    { country: "Global Markets", currency: "All", buffer: "Total Exposure", tag: "Absolute Hedge" },
                  ].map((c, idx) => (
                    <div key={idx} className="rounded-xl border border-gray-100 bg-[#F7F9FC] p-4 text-center">
                      <span className="text-xs font-bold text-[#0B1F3A] block">{c.country}</span>
                      <span className="text-sm font-extrabold text-[#00B386] mt-1 block">{c.currency}</span>
                      <span className="text-[10px] text-gray-400 mt-1 block leading-tight">{c.buffer}</span>
                      <span className="inline-block mt-2 rounded bg-white border border-gray-200 px-2 py-0.5 text-[8px] font-semibold text-[#D4AF37]">
                        {c.tag}
                      </span>
                    </div>
                  ))}
                </div>

                <div>
                  <Link
                    href="/global-investing"
                    className="inline-flex items-center gap-1.5 rounded-full bg-[#00B386] px-6 py-3 text-sm font-bold text-white transition-all hover:bg-[#0B1F3A]"
                  >
                    Learn About Global Markets <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>

              {/* Right Column: World Map visual */}
              <div className="relative rounded-2xl border border-gray-200 bg-[#0B1F3A]/5 p-8 flex items-center justify-center min-h-[300px] overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#0B1F3A_1.5px,transparent_1.5px)] [background-size:16px_16px]"></div>
                
                {/* Simulated World Map Points */}
                <div className="relative w-full max-w-sm h-48 flex items-center justify-center">
                  <div className="absolute left-10 top-10 flex flex-col items-center">
                    <span className="relative flex h-3.5 w-3.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-500"></span>
                    </span>
                    <span className="text-[9px] font-bold text-[#0B1F3A] mt-1 bg-white border border-gray-200 px-1 rounded shadow-sm">USA (USD)</span>
                  </div>

                  <div className="absolute right-1/2 top-16 flex flex-col items-center">
                    <span className="relative flex h-3.5 w-3.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-blue-500"></span>
                    </span>
                    <span className="text-[9px] font-bold text-[#0B1F3A] mt-1 bg-white border border-gray-200 px-1 rounded shadow-sm">Europe (EUR)</span>
                  </div>

                  <div className="absolute right-12 bottom-12 flex flex-col items-center">
                    <span className="relative flex h-3.5 w-3.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00B386] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-[#00B386]"></span>
                    </span>
                    <span className="text-[9px] font-bold text-[#0B1F3A] mt-1 bg-white border border-gray-200 px-1 rounded shadow-sm">India (INR)</span>
                  </div>

                  {/* Connecting dashed SVG lines */}
                  <svg className="absolute inset-0 h-full w-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                    <line x1="12%" y1="28%" x2="50%" y2="40%" stroke="#0B1F3A" strokeWidth="1" strokeDasharray="4 4" opacity="0.3" />
                    <line x1="50%" y1="40%" x2="80%" y2="78%" stroke="#0B1F3A" strokeWidth="1" strokeDasharray="4 4" opacity="0.3" />
                    <line x1="12%" y1="28%" x2="80%" y2="78%" stroke="#00B386" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.5" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 5: EDUCATION HUB PREVIEW */}
        <section className="py-20 bg-white">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#00B386]">Investor Education</h2>
                <p className="mt-2 text-3xl font-bold tracking-tight text-[#0B1F3A] sm:text-4xl">
                  Latest Research & Insight Guides
                </p>
              </div>
              <Link
                href="/education"
                className="mt-4 md:mt-0 text-sm font-bold text-[#00B386] hover:underline inline-flex items-center gap-1"
              >
                View All Articles <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {articles.slice(0, 3).map((article) => (
                <div key={article.id} className="group rounded-2xl border border-gray-100 bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  <div className="relative h-48 w-full overflow-hidden bg-gray-100">
                    <img
                      src={article.featuredImage}
                      alt={article.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <span className="absolute top-3 left-3 rounded-full bg-white/95 px-3 py-1 text-[9px] font-bold uppercase tracking-wider text-[#0B1F3A] shadow-sm">
                      {article.categoryName}
                    </span>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-3 text-[10px] text-gray-400 mb-2">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" /> {article.readingTime}
                      </span>
                      <span>•</span>
                      <span>By {article.author}</span>
                    </div>
                    <h3 className="text-base font-bold text-[#0B1F3A] line-clamp-2 group-hover:text-[#00B386] transition-colors">
                      {article.title}
                    </h3>
                    <Link
                      href={`/education/${article.slug}`}
                      className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-[#00B386] hover:underline"
                    >
                      Read Article <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 6: CALCULATORS PREVIEW */}
        <section className="py-20 bg-[#F7F9FC] border-y border-gray-100">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center">
              {/* Left Column: Calculator Widgets */}
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-md max-w-lg mx-auto lg:max-w-none w-full">
                {/* Tab selector */}
                <div className="flex border-b border-gray-200 mb-6">
                  <button
                    onClick={() => setActiveCalculator("sip")}
                    className={`flex-1 pb-3 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 ${
                      activeCalculator === "sip"
                        ? "border-[#00B386] text-[#00B386]"
                        : "border-transparent text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    SIP Calculator
                  </button>
                  <button
                    onClick={() => setActiveCalculator("currency")}
                    className={`flex-1 pb-3 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 ${
                      activeCalculator === "currency"
                        ? "border-[#00B386] text-[#00B386]"
                        : "border-transparent text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    Currency Impact
                  </button>
                </div>

                {activeCalculator === "sip" ? (
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-xs text-[#0B1F3A] font-bold mb-1">
                        <span>Monthly Investment</span>
                        <span>₹{sipAmount.toLocaleString("en-IN")}</span>
                      </div>
                      <input
                        type="range"
                        min="5000"
                        max="100000"
                        step="5000"
                        value={sipAmount}
                        onChange={(e) => setSipAmount(Number(e.target.value))}
                        className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#00B386]"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-xs text-[#0B1F3A] font-bold mb-1">
                        <span>Expected Return (p.a.)</span>
                        <span>{sipReturn}%</span>
                      </div>
                      <input
                        type="range"
                        min="5"
                        max="25"
                        step="1"
                        value={sipReturn}
                        onChange={(e) => setSipReturn(Number(e.target.value))}
                        className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#00B386]"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-xs text-[#0B1F3A] font-bold mb-1">
                        <span>Investment Period</span>
                        <span>{sipYears} Years</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="30"
                        step="1"
                        value={sipYears}
                        onChange={(e) => setSipYears(Number(e.target.value))}
                        className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#00B386]"
                      />
                    </div>

                    <div className="mt-6 rounded-xl bg-[#F7F9FC] p-4 border border-gray-100 grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Total Invested</span>
                        <span className="text-base font-extrabold text-[#0B1F3A] mt-0.5">₹{sipResult.totalInvested.toLocaleString("en-IN")}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Estimated Wealth</span>
                        <span className="text-base font-extrabold text-[#00B386] mt-0.5">₹{sipResult.totalVal.toLocaleString("en-IN")}</span>
                      </div>
                      <div className="col-span-2 pt-2 border-t border-gray-200">
                        <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Wealth Gain</span>
                        <span className="text-lg font-bold text-[#D4AF37] mt-0.5">₹{sipResult.wealthGained.toLocaleString("en-IN")}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-xs text-[#0B1F3A] font-bold mb-1">
                        <span>Domestic Investment (INR)</span>
                        <span>₹{currencyAmount.toLocaleString("en-IN")}</span>
                      </div>
                      <input
                        type="range"
                        min="10000"
                        max="1000000"
                        step="10000"
                        value={currencyAmount}
                        onChange={(e) => setCurrencyAmount(Number(e.target.value))}
                        className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#00B386]"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-xs text-[#0B1F3A] font-bold mb-1">
                        <span>USD to INR Exchange Rate</span>
                        <span>1 USD = ₹{currencyRate}</span>
                      </div>
                      <input
                        type="range"
                        min="75"
                        max="95"
                        step="0.5"
                        value={currencyRate}
                        onChange={(e) => setCurrencyRate(Number(e.target.value))}
                        className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#00B386]"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-xs text-[#0B1F3A] font-bold mb-1">
                        <span>Expected Annual INR Depreciation</span>
                        <span>{depreciation}%</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="8"
                        step="0.5"
                        value={depreciation}
                        onChange={(e) => setDepreciation(Number(e.target.value))}
                        className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#00B386]"
                      />
                    </div>

                    <div className="mt-6 rounded-xl bg-[#F7F9FC] p-4 border border-gray-100 grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-[10px] text-gray-400 uppercase tracking-wider block">USD Asset Value</span>
                        <span className="text-base font-extrabold text-[#0B1F3A] mt-0.5">${currencyResult.usdValue.toLocaleString("en-US")}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-400 uppercase tracking-wider block">10-Yr Currency Buffer value</span>
                        <span className="text-base font-extrabold text-[#00B386] mt-0.5">₹{currencyResult.futureValueWithHedge.toLocaleString("en-IN")}</span>
                      </div>
                      <div className="col-span-2 pt-2 border-t border-gray-200 text-[9px] text-gray-400 leading-tight">
                        Holding assets in USD provides a natural currency appreciation shield over time as emerging currencies deprecate.
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Text & CTA */}
              <div className="flex flex-col gap-6">
                <div>
                  <h2 className="text-xs font-bold uppercase tracking-wider text-[#00B386]">Interactive Sandbox</h2>
                  <p className="mt-2 text-3xl font-bold tracking-tight text-[#0B1F3A] sm:text-4xl">
                    Simulate Your Compounding & Exchange Gains
                  </p>
                  <p className="mt-4 text-xs text-gray-500 leading-relaxed">
                    Access our set of comprehensive financial simulation calculators. Track systemic inflation targets, compound growth factors and currency appreciation hedges.
                  </p>
                </div>

                <div className="flex flex-col gap-3">
                  <div className="flex items-start gap-2.5">
                    <div className="mt-0.5 rounded-full bg-[#00B386]/10 p-1 text-[#00B386]">
                      <CheckCircle2 className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-[#0B1F3A] block">SIP compounding projections</span>
                      <span className="text-[10px] text-gray-400">Model periodic investments and target wealth corpuses easily.</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <div className="mt-0.5 rounded-full bg-[#00B386]/10 p-1 text-[#00B386]">
                      <CheckCircle2 className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-[#0B1F3A] block">Retirement Corpus and Goal Planners</span>
                      <span className="text-[10px] text-gray-400">Map long-term wealth projections against active age limits.</span>
                    </div>
                  </div>
                </div>

                <div>
                  <Link
                    href="/calculators"
                    className="inline-flex items-center gap-1.5 rounded-full bg-[#0B1F3A] px-6 py-3 text-sm font-bold text-white transition-all hover:bg-[#00B386]"
                  >
                    Try All Calculators <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 7: INVESTMENT PROCESS TIMELINE */}
        <section className="py-20 bg-white">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#00B386]">Operational Flow</h2>
              <p className="mt-2 text-3xl font-bold tracking-tight text-[#0B1F3A] sm:text-4xl">
                Global Investing Architecture
              </p>
              <p className="mt-4 text-sm text-[#5A6E85] leading-relaxed">
                How international currency allocations and investments operate structurally behind the scenes.
              </p>
            </div>

            {/* Timeline nodes */}
            <div className="relative">
              {/* Connecting line */}
              <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-100 -translate-y-1/2 hidden lg:block"></div>
              
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-6 relative z-10">
                {[
                  { step: "01", label: "KYC Awareness", desc: "Verify identity and investment capabilities." },
                  { step: "02", label: "Fund Transfer", desc: "Authorized LRS remittance via banking channels." },
                  { step: "03", label: "Escrow Deposit", desc: "Secure temporary holding for confirmation." },
                  { step: "04", label: "Custodian Setup", desc: "Secure safekeeping of foreign securities." },
                  { step: "05", label: "Fund House Allocation", desc: "Deployment into global equity/bonds." },
                  { step: "06", label: "Audited Reporting", desc: "Detailed tax and yield ledger updates." },
                ].map((item, idx) => (
                  <div key={idx} className="flex flex-col items-center text-center p-4 bg-white border border-gray-100 rounded-2xl shadow-sm lg:shadow-none lg:border-transparent lg:bg-transparent">
                    <div className="h-10 w-10 rounded-full bg-[#0B1F3A] text-[#00B386] flex items-center justify-center font-bold text-sm mb-4 border border-gray-200 shadow-sm relative timeline-pulse">
                      {item.step}
                    </div>
                    <h3 className="text-xs font-bold text-[#0B1F3A] mb-1">{item.label}</h3>
                    <p className="text-[10px] text-gray-400 leading-normal">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-center mt-12">
              <button className="rounded-full bg-[#F7F9FC] border border-gray-200 hover:border-gray-300 px-6 py-2.5 text-xs font-semibold text-[#1A1A1A] transition-colors">
                Understand The Process Flow
              </button>
            </div>
          </div>
        </section>

        {/* SECTION 8: CONSULTATION CTA */}
        <section className="bg-[#0B1F3A] text-white py-16 relative overflow-hidden">
          <div className="absolute inset-0 opacity-5 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
          <div className="mx-auto max-w-5xl px-6 text-center relative z-10 flex flex-col items-center gap-6">
            <h2 className="text-2xl font-bold tracking-tight sm:text-4xl text-white">
              Need Professional Guidance?
            </h2>
            <p className="text-xs text-gray-300 max-w-xl leading-relaxed">
              Book a session with our team to explore currency hedging, diversification strategies and build an educational pipeline tailored to your investment objectives.
            </p>
            <div className="flex flex-wrap gap-4 justify-center mt-2">
              <Link
                href="/book"
                className="rounded-full bg-[#00B386] px-6 py-3 text-sm font-bold text-white transition-all hover:bg-white hover:text-[#0B1F3A] hover:scale-105"
              >
                Book Consultation
              </Link>
              <Link
                href="/contact"
                className="rounded-full border border-gray-600 px-6 py-3 text-sm font-bold text-white transition-all hover:bg-white/10"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      {/* NEW CHATBOT LAYOUT START */}
      <div className="chatbot-container">
        <style dangerouslySetInnerHTML={{ __html: `
          .chatbot-toggle-btn {
            position: fixed;
            right: 25px;
            bottom: 25px;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            background: #0B1F3A;
            color: #C9A84C;
            border: 1px solid #C9A84C;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            box-shadow: 0 4px 16px rgba(11,31,58,0.25);
            z-index: 1000;
            transition: transform 0.2s;
          }
          .chatbot-toggle-btn:hover {
            transform: scale(1.05);
          }
          .chatbot-panel {
            position: fixed;
            right: 25px;
            bottom: 85px;
            width: 380px;
            height: 580px;
            background: #F0F4F8;
            border-radius: 20px;
            box-shadow: 0 8px 32px rgba(11,31,58,0.2);
            border: 1px solid #DDE4EE;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            z-index: 1000;
            animation: slideUp 0.3s ease;
          }
          @keyframes slideUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .chatbot-panel * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
          }
          .chatbot-panel .header {
            background: #0B1F3A;
            padding: 0 16px;
            height: 62px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            flex-shrink: 0;
            box-shadow: 0 2px 16px rgba(0,0,0,0.25);
            z-index: 10;
          }
          .chatbot-panel .hl {
            display: flex;
            align-items: center;
            gap: 10px;
          }
          .chatbot-panel .av {
            width: 38px;
            height: 38px;
            border-radius: 11px;
            background: linear-gradient(135deg, #C9A84C, #a07820);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 18px;
            flex-shrink: 0;
          }
          .chatbot-panel .hname {
            font-family: 'Syne', sans-serif;
            font-size: 13px;
            font-weight: 700;
            color: #fff;
          }
          .chatbot-panel .hstatus {
            display: flex;
            align-items: center;
            gap: 5px;
            font-size: 10px;
            color: rgba(255,255,255,0.45);
          }
          .chatbot-panel .sdot {
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background: #1DB87A;
            animation: pulse 2s infinite;
          }
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.3; }
          }
          .chatbot-panel .hbadge {
            font-size: 9px;
            font-weight: 600;
            letter-spacing: 1px;
            text-transform: uppercase;
            color: #C9A84C;
            border: 1px solid rgba(201,168,76,0.4);
            padding: 4px 10px;
            border-radius: 100px;
          }
          .chatbot-panel .clrbtn {
            background: rgba(255,255,255,0.08);
            border: 1px solid rgba(255,255,255,0.12);
            color: rgba(255,255,255,0.5);
            font-size: 10px;
            padding: 6px 12px;
            border-radius: 100px;
            cursor: pointer;
            transition: all 0.2s;
          }
          .chatbot-panel .clrbtn:hover {
            background: rgba(255,255,255,0.18);
            color: #fff;
          }
          .chatbot-panel .msgs {
            flex: 1;
            overflow-y: auto;
            padding: 20px 16px;
            display: flex;
            flex-direction: column;
            gap: 14px;
            scroll-behavior: smooth;
          }
          .chatbot-panel .msgs::-webkit-scrollbar {
            width: 3px;
          }
          .chatbot-panel .msgs::-webkit-scrollbar-thumb {
            background: #DDE4EE;
            border-radius: 3px;
          }
          .chatbot-panel .welcome {
            background: linear-gradient(135deg, #0B1F3A, #1a3a6a);
            border-radius: 20px;
            padding: 26px 20px;
            text-align: center;
            position: relative;
            overflow: hidden;
            flex-shrink: 0;
          }
          .chatbot-panel .welcome::before {
            content: '';
            position: absolute;
            top: -50px; right: -50px;
            width: 200px; height: 200px;
            border-radius: 50%;
            background: radial-gradient(circle, rgba(201,168,76,0.15) 0%, transparent 70%);
          }
          .chatbot-panel .welcome .wi {
            font-size: 34px;
            margin-bottom: 10px;
          }
          .chatbot-panel .welcome .wt {
            font-family: 'Syne', sans-serif;
            font-size: 19px;
            font-weight: 800;
            color: #fff;
            margin-bottom: 6px;
          }
          .chatbot-panel .welcome .wt span {
            color: #C9A84C;
          }
          .chatbot-panel .welcome .ws {
            font-size: 12px;
            color: rgba(255,255,255,0.5);
            line-height: 1.6;
            margin-bottom: 18px;
          }
          .chatbot-panel .quickbtns {
            display: flex;
            flex-direction: column;
            gap: 7px;
          }
          .chatbot-panel .qbtn {
            background: rgba(255,255,255,0.07);
            border: 1px solid rgba(255,255,255,0.12);
            color: rgba(255,255,255,0.8);
            padding: 10px 13px;
            border-radius: 10px;
            font-size: 12px;
            cursor: pointer;
            text-align: left;
            transition: all 0.2s;
            width: 100%;
          }
          .chatbot-panel .qbtn:hover {
            background: rgba(255,255,255,0.14);
            border-color: #C9A84C;
            color: #fff;
          }
          .chatbot-panel .mrow {
            display: flex;
            align-items: flex-end;
            gap: 8px;
            animation: fu 0.25s ease;
          }
          @keyframes fu {
            from { opacity: 0; transform: translateY(6px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .chatbot-panel .mrow.user {
            flex-direction: row-reverse;
          }
          .chatbot-panel .mav {
            width: 28px;
            height: 28px;
            border-radius: 9px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 13px;
            flex-shrink: 0;
            margin-bottom: 2px;
          }
          .chatbot-panel .bav {
            background: linear-gradient(135deg, #C9A84C, #a07820);
          }
          .chatbot-panel .uav {
            background: #0B1F3A;
            border: 1.5px solid #DDE4EE;
          }
          .chatbot-panel .bub {
            max-width: 80%;
            padding: 12px 15px;
            border-radius: 17px;
            font-size: 13px;
            line-height: 1.6;
            word-break: break-word;
          }
          .chatbot-panel .bub.bot {
            background: #fff;
            color: #0B1F3A;
            border-bottom-left-radius: 4px;
            box-shadow: 0 2px 10px rgba(11,31,58,0.08);
            border: 1px solid #DDE4EE;
          }
          .chatbot-panel .bub.user {
            background: #0B1F3A;
            color: #fff;
            border-bottom-right-radius: 4px;
          }
          .chatbot-panel .bub.bot strong {
            color: #0B1F3A;
            font-weight: 600;
          }
          .chatbot-panel .bub.user strong {
            color: #f0d47a;
          }
          .chatbot-panel .mtime {
            font-size: 9px;
            color: #7A8BA0;
            margin-top: 3px;
            padding: 0 6px;
          }
          .chatbot-panel .mrow.user .mtime {
            text-align: right;
          }
          .chatbot-panel .typrow {
            display: flex;
            align-items: flex-end;
            gap: 8px;
          }
          .chatbot-panel .typbub {
            background: #fff;
            border: 1px solid #DDE4EE;
            border-radius: 17px;
            border-bottom-left-radius: 4px;
            padding: 13px 16px;
            box-shadow: 0 2px 10px rgba(11,31,58,0.08);
            display: flex;
            gap: 4px;
            align-items: center;
          }
          .chatbot-panel .td {
            width: 7px;
            height: 7px;
            border-radius: 50%;
            background: #7A8BA0;
            animation: tb 1.3s infinite;
          }
          .chatbot-panel .td:nth-child(2) { animation-delay: 0.2s; }
          .chatbot-panel .td:nth-child(3) { animation-delay: 0.4s; }
          @keyframes tb {
            0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
            30% { transform: translateY(-5px); opacity: 1; }
          }
          .chatbot-panel .opts {
            display: flex;
            flex-wrap: wrap;
            gap: 6px;
            margin-top: 10px;
          }
          .chatbot-panel .opt {
            background: #EEF4FF;
            border: 1.5px solid #C0D0F0;
            color: #2A4A90;
            padding: 7px 13px;
            border-radius: 100px;
            font-size: 11px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s;
          }
          .chatbot-panel .opt:hover {
            background: #0B1F3A;
            color: #C9A84C;
            border-color: #0B1F3A;
          }
          .chatbot-panel .lform {
            background: linear-gradient(135deg, #FFF8E6, #FFF3CC);
            border: 1.5px solid rgba(201,168,76,0.4);
            border-radius: 14px;
            padding: 16px;
            margin-top: 12px;
          }
          .chatbot-panel .lft {
            font-family: 'Syne', sans-serif;
            font-size: 13px;
            font-weight: 700;
            color: #0B1F3A;
            margin-bottom: 12px;
          }
          .chatbot-panel .lform input, .chatbot-panel .lform select {
            width: 100%;
            padding: 10px 12px;
            border: 1.5px solid rgba(201,168,76,0.3);
            border-radius: 10px;
            font-size: 12px;
            font-family: 'Inter', sans-serif;
            color: #0B1F3A;
            background: #fff;
            outline: none;
            margin-bottom: 8px;
            transition: border-color 0.2s;
          }
          .chatbot-panel .lform input:focus, .chatbot-panel .lform select:focus {
            border-color: #C9A84C;
          }
          .chatbot-panel .lfbtn {
            width: 100%;
            padding: 12px;
            background: #0B1F3A;
            color: #C9A84C;
            border: none;
            border-radius: 10px;
            font-size: 12px;
            font-weight: 700;
            cursor: pointer;
            font-family: 'Syne', sans-serif;
            transition: all 0.2s;
            position: relative;
          }
          .chatbot-panel .lfbtn:hover {
            background: #132d52;
          }
          .chatbot-panel .lfbtn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }
          .chatbot-panel .submitting {
            display: none;
            font-size: 11px;
            color: #7A8BA0;
            text-align: center;
            margin-top: 8px;
          }
          .chatbot-panel .qbanner {
            background: linear-gradient(135deg, #0B2A1A, #1A4A2A);
            border: 1px solid rgba(29,184,122,0.4);
            border-radius: 12px;
            padding: 13px 15px;
            display: flex;
            align-items: flex-start;
            gap: 10px;
            font-size: 11px;
            color: rgba(255,255,255,0.75);
            margin-top: 10px;
            line-height: 1.6;
          }
          .chatbot-panel .qbanner strong {
            color: #1DB87A;
            display: block;
            font-size: 12px;
            margin-bottom: 3px;
          }
          .chatbot-panel .sheet-badge {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            background: rgba(29,184,122,0.12);
            border: 1px solid rgba(29,184,122,0.3);
            color: #1DB87A;
            font-size: 10px;
            font-weight: 600;
            padding: 5px 12px;
            border-radius: 100px;
            margin-top: 8px;
          }
          .chatbot-panel .iarea {
            background: #fff;
            border-top: 1px solid #DDE4EE;
            padding: 14px 16px;
            flex-shrink: 0;
          }
          .chatbot-panel .iwrap {
            display: flex;
            align-items: flex-end;
            gap: 9px;
            background: #F0F4F8;
            border: 1.5px solid #DDE4EE;
            border-radius: 15px;
            padding: 9px 11px;
            transition: border-color 0.2s;
          }
          .chatbot-panel .iwrap:focus-within {
            border-color: #C9A84C;
            box-shadow: 0 0 0 3px rgba(201,168,76,0.1);
          }
          .chatbot-panel #ui {
            flex: 1;
            border: none;
            background: transparent;
            font-size: 13px;
            font-family: 'Inter', sans-serif;
            color: #0B1F3A;
            resize: none;
            outline: none;
            line-height: 1.5;
            max-height: 100px;
            min-height: 22px;
          }
          .chatbot-panel #ui::placeholder {
            color: #7A8BA0;
          }
          .chatbot-panel .sbtn {
            width: 36px;
            height: 36px;
            border-radius: 10px;
            background: #0B1F3A;
            border: none;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 15px;
            flex-shrink: 0;
            transition: all 0.2s;
            color: #fff;
          }
          .chatbot-panel .sbtn:hover {
            background: #132d52;
            transform: scale(1.05);
          }
          .chatbot-panel .sbtn:disabled {
            opacity: 0.35;
            cursor: not-allowed;
            transform: none;
          }
          .chatbot-panel .ihint {
            text-align: center;
            font-size: 9px;
            color: #7A8BA0;
            margin-top: 8px;
          }
        ` }} />

        {/* Toggle Button */}
        <button
          className="chatbot-toggle-btn"
          onClick={() => setIsChatOpen(!isChatOpen)}
          aria-label="Toggle Chatbot"
        >
          {isChatOpen ? "✕" : "💬"}
        </button>

        {/* Chat Window Panel */}
        {isChatOpen && (
          <div className="chatbot-panel">
            <div className="header">
              <div className="hl">
                <div className="av">🌍</div>
                <div>
                  <div className="hname">InvestorBridge AI — Bridge</div>
                  <div className="hstatus">
                    <div className="sdot"></div>
                    Online · Always available
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <div className="hbadge">GIFT City</div>
                <button className="clrbtn" onClick={clearChat}>Clear</button>
              </div>
            </div>

            <div className="msgs" id="msgs">
              <div className="welcome">
                <div className="wi">🌍</div>
                <div className="wt">Hi! I'm <span>Bridge</span></div>
                <div className="ws">
                  Your AI assistant from InvestorBridge Solutions.
                  <br />
                  Ask me anything about global investing through GIFT City.
                </div>
                <div className="quickbtns">
                  <button className="qbtn" onClick={() => handleSendMessage("What is GIFT City?")}>💰 What is GIFT City?</button>
                  <button className="qbtn" onClick={() => handleSendMessage("Global fund returns vs Indian MF?")}>📈 Global fund returns vs Indian MF?</button>
                  <button className="qbtn" onClick={() => handleSendMessage("Is S&P 500 investing legal from India?")}>✅ Is S&P 500 investing legal from India?</button>
                  <button className="qbtn" onClick={() => handleSendMessage("How to start with ₹1.5L/year?")}>🚀 How to start with ₹1.5L/year?</button>
                  <button className="qbtn" onClick={() => handleSendMessage("What about currency risk?")}>💱 What about currency risk?</button>
                </div>
              </div>

              {chatMessages.map((msg, idx) => (
                <div key={idx} className={`mrow ${msg.sender === 'user' ? 'user' : ''}`}>
                  {msg.sender === 'bot' && <div className="mav bav">🌍</div>}
                  <div>
                    <div
                      className={`bub ${msg.sender === 'user' ? 'user' : 'bot'}`}
                      dangerouslySetInnerHTML={{ __html: fmt(msg.text) }}
                    />
                    {msg.options && msg.options.length > 0 && (
                      <div className="opts">
                        {msg.options.map((opt, oIdx) => (
                          <button key={oIdx} className="opt" onClick={() => handleSendMessage(opt)}>{opt}</button>
                        ))}
                      </div>
                    )}
                    {msg.showForm && (
                      <form className="lform" onSubmit={handleLeadSubmit}>
                        <div className="lft">📋 Book Free Consultation</div>
                        <input
                          type="text"
                          required
                          placeholder="Your full name *"
                          value={leadName}
                          onChange={(e) => setLeadName(e.target.value)}
                        />
                        <input
                          type="tel"
                          required
                          placeholder="WhatsApp number *"
                          value={leadPhone}
                          onChange={(e) => setLeadPhone(e.target.value)}
                        />
                        <input
                          type="text"
                          placeholder="Your city"
                          value={leadCity}
                          onChange={(e) => setLeadCity(e.target.value)}
                        />
                        <input
                          type="text"
                          placeholder="Your profession (e.g. IT, Doctor, Business)"
                          value={leadJob}
                          onChange={(e) => setLeadJob(e.target.value)}
                        />
                        <select
                          value={leadIncome}
                          onChange={(e) => setLeadIncome(e.target.value)}
                        >
                          <option value="">Investment capacity per year</option>
                          <option value="1.5L-5L">₹1.5L – ₹5L per year</option>
                          <option value="5L-15L">₹5L – ₹15L per year</option>
                          <option value="15L-50L">₹15L – ₹50L per year</option>
                          <option value="50L+">₹50L+ per year</option>
                        </select>
                        <button
                          type="submit"
                          className="lfbtn"
                          disabled={leadSubmitting}
                        >
                          {leadSubmitting ? "⏳ Submitting..." : "📞 Connect Me with an Advisor →"}
                        </button>
                        {leadSubmitting && (
                          <div className="submitting" style={{ display: 'block' }}>
                            ⏳ Saving your details to Google Sheets...
                          </div>
                        )}
                      </form>
                    )}
                    <div className="mtime">{msg.time}</div>
                  </div>
                  {msg.sender === 'user' && <div className="mav uav">👤</div>}
                </div>
              ))}

              {isTyping && (
                <div className="typrow">
                  <div className="mav bav">🌍</div>
                  <div className="typbub">
                    <div className="td"></div>
                    <div className="td"></div>
                    <div className="td"></div>
                  </div>
                </div>
              )}
            </div>

            <div className="iarea">
              <div className="iwrap">
                <textarea
                  id="ui"
                  placeholder="Ask about GIFT City, returns, how to start..."
                  rows={1}
                  value={uiInput}
                  onChange={(e) => setUiInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage(uiInput);
                    }
                  }}
                ></textarea>
                <button
                  className="sbtn"
                  id="sb"
                  disabled={!uiInput.trim() || isTyping}
                  onClick={() => handleSendMessage(uiInput)}
                >
                  ➤
                </button>
              </div>
              <div className="ihint">InvestorBridge Solutions · GIFT City, Gujarat · RBI & SEBI Regulated</div>
            </div>
          </div>
        )}
      </div>
      {/* NEW CHATBOT LAYOUT END */}
      {/* OLD CHATBOT LOGIC COMMENTED OUT (NO PREVIOUS CHATBOT IN HOMEPAGE) */}
      {/* NEW CHATBOT LOGIC START */}
      {/* NEW CHATBOT LOGIC END */}
    </div>
  );
}

// ── KNOWLEDGE BASE & FIND RESPONSE ──
const KB = [
  {
    keys:['gift city','gift','giftcity','what is gift','gujarat','ifsc','what is it'],
    reply: `**GIFT City** (Gujarat International Finance Tec-City) is India's own international financial hub — like a mini-Singapore built right inside India! 🏙️\n\nLocated in Gandhinagar, Gujarat, it allows **every Indian resident** to legally invest in global markets like S&P 500 and NASDAQ.\n\nKey facts:\n• ✅ 100% legal — regulated by SEBI & RBI\n• ✅ Established under India's IFSC framework\n• ✅ Your money stays within India's regulatory system\n• ✅ Open to all Indian residents — not just NRIs!\n\nThink of it as India's official doorway to the world's best markets 🌍`,
    opts:['How do I invest through GIFT City?','What returns can I expect?','Is it really legal?']
  },
  {
    keys:['return','better','compare','mf','mutual fund','nifty','performance','how much','difference'],
    reply: `Here's the honest comparison on **₹1.5 Lakh per year for 25 years** 📊\n\n**FD / LIC (~7%)** → ₹98 Lakhs\n**Indian Mutual Fund (~12%)** → ₹2.4 Crore\n**S&P 500 via GIFT City (~15%)** → **₹4.1 Crore** 🔥\n**NASDAQ 100 (~18%)** → **₹5.9 Crore** 🚀\n\nThat's **₹1.7 Crore extra** just by going global — same money, same discipline, different destination!\n\n*Historical CAGR estimates. Past performance doesn't guarantee future results.*`,
    opts:['How is this legal?','What is GIFT City?','How do I get started?']
  },
  {
    keys:['legal','illegal','rbi','sebi','allowed','permitted','safe','regulated','law','legit','genuine'],
    reply: `**100% legal — here's the proof** ✅\n\nThree layers of regulation protect you:\n\n**1. RBI's LRS (Liberalised Remittance Scheme)**\nEvery Indian can invest up to **$250,000/year** abroad. Active since 2004.\n\n**2. SEBI Regulation**\nGIFT City funds are registered and monitored by SEBI — India's own market regulator.\n\n**3. IFSCA**\nA dedicated government body overseeing all GIFT City operations.\n\nThis is not a loophole. It's India's government-built infrastructure for global investing. Completely above board! 🇮🇳`,
    opts:['What documents do I need?','How much can I invest?','Tell me about returns']
  },
  {
    keys:['start','begin','how to','get started','open account','first step','process','procedure','apply'],
    reply: `Starting is **simpler than opening a demat account!** Here's the process 👇\n\n**Step 1 — KYC & Account Opening**\nShare PAN card, Aadhaar and bank details. Done online in 20-30 minutes.\n\n**Step 2 — Fund Transfer via LRS**\nTransfer from your Indian bank account via RBI-approved LRS route.\n\n**Step 3 — Choose Your Funds**\nS&P 500, NASDAQ 100, Global ETFs, or a diversified portfolio.\n\n**Step 4 — Start Investing!**\nFirst investment placed within 3-5 business days.\n\n**Minimum: ₹1.5 Lakh per year**\n\nWant me to connect you with our advisor to get started this week? 😊`,
    opts:['What documents do I need?','How much minimum?','Book a free consultation']
  },
  {
    keys:['currency','rupee','dollar','forex','exchange','usd','inr','depreciation'],
    reply: `This answer will surprise you! 💱\n\nMost people fear currency risk. **For Indian global investors — it actually helps!**\n\n• Rupee has fallen from **₹45 → ₹84 per dollar** in 20 years\n• This gives your USD returns a **bonus boost** when converted to INR\n• S&P 500 gives ~15% in USD → you effectively earn **~18-19% in INR** terms!\n\n**Simple example:**\n₹1 Lakh invested today → $1,190 at ₹84/dollar\nIf rupee falls to ₹95 → same $1,190 = ₹1,13,000 in INR — **extra profit just from currency!**\n\nCurrency "risk" is actually a currency **advantage** for Indian investors 🎯`,
    opts:['What about taxes?','Tell me about returns','How do I start?']
  },
  {
    keys:['tax','taxation','tds','capital gain','income tax','itr','80c','filing'],
    reply: `Here's the simple tax breakdown for global investments via GIFT City 📋\n\n**Capital Gains:**\n• Held < 2 years → taxed as per your income slab\n• Held > 2 years → 20% with indexation benefit\n\n**Key points:**\n• Declare foreign investments in ITR (Form FA schedule)\n• GIFT City has special tax advantages vs direct overseas investing\n• No double taxation — India has DTAA with US, UK, EU\n\n**My honest advice:**\nConsult a CA who understands GIFT City for your specific situation. Our advisor can refer a good one! 😊`,
    opts:['How do I start?','What returns can I expect?','Book a free consultation']
  },
  {
    keys:['sp500','s&p','s&p500','nasdaq','nasdaq100','etf','index','dow jones'],
    reply: `These are the **world's most powerful investment indices** 🚀\n\n**S&P 500**\n• Top 500 US companies — Apple, Microsoft, Amazon, Google\n• ~14-16% CAGR in USD over 30 years (~18% in INR)\n• Most diversified and safest global index\n\n**NASDAQ 100**\n• Top 100 tech companies — Apple, NVIDIA, Meta, Tesla\n• ~18-20% CAGR over 20 years\n• Higher return, slightly more volatile\n\n**Global Diversified ETF**\n• Mix of US, Europe, Asia\n• ~13% CAGR — maximum diversification\n\n**Best for beginners:** Start with S&P 500 — the gold standard of global investing! 🌍`,
    opts:['How do I invest in S&P 500?','What are the minimum amounts?','Is this legal?']
  },
  {
    keys:['minimum','how much','amount','1.5','150000','lakh','crore','invest how much'],
    reply: `Great news — **you don't need crores to start!** 💰\n\n**Minimum: ₹1.5 Lakh per year** (₹12,500/month equivalent)\n\n**What ₹1.5L/year becomes at 15% (S&P 500):**\n• 5 years → ₹10.1 Lakhs\n• 10 years → ₹30.5 Lakhs\n• 15 years → ₹72 Lakhs\n• **25 years → ₹4.1 Crore** 🔥\n\n**Investment modes:**\n• **Lump Sum** — Put in ₹1.5L+ at once (great for bonuses!)\n• **Yearly SIP** — Fixed amount every year\n\nMaximum via LRS: **$250,000 per year** — very high ceiling for HNIs!`,
    opts:['How do I get started?','Tell me about returns','Book a free consultation']
  },
  {
    keys:['risk','crash','safe','volatile','market fall','loss','2008','covid','worried'],
    reply: `Absolutely valid concern — here's the honest picture 📊\n\n**Yes, global markets can fall:**\n• 2008 crash: S&P 500 fell 50%\n• 2020 COVID crash: fell 35% in weeks\n\n**But the full truth:**\n• S&P 500 recovered fully within **2 years** after every crash in history\n• Over any 10-year period since 1926, **never given negative returns**\n• Longer you stay invested → safer it becomes\n\n**vs your "safe" alternatives:**\n• FD at 7% = barely beating inflation (6.5% CPI)\n• LIC at 5-6% = losing to inflation in real terms\n• **The real risk is NOT investing globally**\n\nOnly invest money you won't need for 5+ years. For long-term wealth creation — global is the smartest move 🛡️`,
    opts:['What returns can I expect?','How do I minimise risk?','Tell me about GIFT City']
  },
  {
    keys:['nri','abroad','foreign','overseas','non resident','outside india','returned'],
    reply: `GIFT City is **perfect for NRIs and returning Indians!** 🌐\n\n**For NRIs:**\n• Continue global investing after returning to India\n• Maintain USD exposure without complications\n• Smooth transition from foreign accounts to GIFT City\n\n**For returning Indians:**\n• Don't lose your global portfolio when you come back\n• Full regulatory clarity — no grey areas\n• Same global funds accessible from India\n\nYou already understand why global diversification matters — you're ahead of 99% of Indian investors! 😊`,
    opts:['How do I open a GIFT City account?','What are the returns?','Book a consultation']
  },
  {
    keys:['document','kyc','pan','aadhaar','passport','id','proof','paperwork','what do i need'],
    reply: `Super simple — **less paperwork than a demat account!** 📋\n\n**Documents needed:**\n• ✅ PAN Card (mandatory)\n• ✅ Aadhaar Card\n• ✅ Passport (for LRS)\n• ✅ Indian bank account (any bank)\n• ✅ 3-month bank statement\n• ✅ Passport-size photo\n\n**That's it!** Entire process is online — no office visits needed.\n\n**Timeline:** 20-30 min for docs → 3-5 days for account activation → invest!\n\nReady to get started? I can connect you with our advisor right now! 😊`,
    opts:['Book a free consultation','How much can I invest?','Tell me about returns']
  },
  {
    keys:['consult','advisor','call','speak','talk','meet','appointment','book','contact','connect','help me','interested'],
    reply: `I'd love to connect you with our investment advisor! 😊\n\nOur advisor will personally:\n• 📊 Show you a **personalised returns calculation** based on your income\n• 📋 Walk you through **account opening** step by step\n• ✅ Answer all questions about GIFT City, LRS & taxes\n• 🎯 Help you pick the **right fund** for your goals\n\n**Completely free — zero obligation!**\n\nPlease share your details below 👇`,
    opts: null,
    showForm: true
  },
  {
    keys:['commission','fee','charge','cost','how do you earn','how you make'],
    reply: `Fully transparent — here's exactly how it works 💼\n\n**For you — the investor:**\n• Zero account opening fee\n• Standard fund expense ratios apply (same as Indian MFs)\n• Returns shown are net of fund expenses — no hidden cuts\n\n**For InvestorBridge:**\n• We earn a distributor commission from the fund house\n• This does NOT reduce your returns\n• Works exactly like a mutual fund distributor in India\n\nWe believe in transparency because we want a **long-term relationship** — not a one-time transaction. Your growth = our growth! 🤝`,
    opts:['How do I start?','What returns can I expect?','Book a free consultation']
  },
  {
    keys:['evo','evo25','evo20','plan','product','which plan','recommend','which one'],
    reply: `We have plans for every investor profile 🎯\n\n**EVO 25** — Flagship (₹2.5L+/year) → Best returns potential\n**EVO 20** — Growth (₹2L/year) → Great for growing professionals\n**EVO 15** — Starter Plus (₹1.5L/year) → Most popular\n**EVO 10** — Starter (₹1L/year) → Entry level\n**EVO 05** — Beginner (₹50K/year) → Start small, grow big\n**Single Premium** — Lump sum for bonuses/windfalls\n\n**Our recommendation:** Start at your comfortable level. Even ₹1.5L/year for 25 years = ₹4.1 Crore at 15% CAGR!\n\nWant a personalised recommendation? Book a free call with our advisor! 😊`,
    opts:['Book a free consultation','Tell me about returns','How do I start?']
  },
];

const findResponse = (text: string) => {
  const t = text.toLowerCase();
  for (const entry of KB) {
    if (entry.keys.some(k => t.includes(k))) return entry;
  }
  return null;
};

// Formatting helper for bot messages (bold tags, newlines, markdown tables)
function fmt(text: string): string {
  let escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  escaped = escaped.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

  const lines = escaped.split('\n');
  let result: string[] = [];
  let inTable = false;
  let tableRows: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    if (l.trim().startsWith('|') && l.trim().endsWith('|')) {
      if (!inTable) {
        inTable = true;
        tableRows = [];
      }
      tableRows.push(l);
    } else {
      if (inTable) {
        result.push(buildTable(tableRows));
        inTable = false;
        tableRows = [];
      }
      result.push(l);
    }
  }
  if (inTable) {
    result.push(buildTable(tableRows));
  }
  return result.join('\n').replace(/\n/g, '<br>');
}

function buildTable(rows: string[]): string {
  let html = '<table style="border-collapse:collapse;width:100%;margin:8px 0;font-size:12px;">';
  rows.forEach((r, i) => {
    if (r.replace(/\|/g, '').trim().match(/^-+$/)) return;
    const cells = r.split('|').filter(c => c.trim() !== '');
    if (!cells.length) return;
    const tag = i === 0 ? 'th' : 'td';
    const bg = i === 0 ? 'background:#0B1F3A;color:#C9A84C;' : '';
    html += `<tr>${cells.map(c => `<${tag} style="padding:6px 10px;border:1px solid #DDE4EE;${bg}">${c.trim()}</${tag}>`).join('')}</tr>`;
  });
  return html + '</table>';
}
// NEW CHATBOT LOGIC END
