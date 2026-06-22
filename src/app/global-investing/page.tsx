"use client";

import React, { useRef } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { 
  Globe, DollarSign, ShieldAlert, PieChart, 
  ArrowDown, CheckCircle2, ChevronRight 
} from "lucide-react";

export default function GlobalInvesting() {
  const detailsRef = useRef<HTMLDivElement>(null);

  const scrollToDetails = () => {
    detailsRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const sections = [
    {
      id: "markets",
      title: "Global Markets Exposure",
      desc: "Investing strictly domestically restricts your portfolio to one country's economy. Accessing global markets (such as the US market) exposes your capital to the largest tech and index companies (Apple, Microsoft, Nvidia, Berkshire Hathaway) that shape global GDP.",
      icon: Globe,
      points: [
        "Capture global technological and medical innovations.",
        "Gain exposure to secular growth drivers outside your domestic boundary.",
        "Mitigate domestic political and regulatory systemic events."
      ]
    },
    {
      id: "currency",
      title: "Currency Diversification Dynamics",
      desc: "Inflation and monetary policies cause currencies of emerging economies to depreciate over long cycles. Holding assets in reserve currencies like the US Dollar (USD), Euro (EUR), or British Pound (GBP) provides a capital appreciation buffer simply through exchange rate changes.",
      icon: DollarSign,
      points: [
        "USD acts as a flight-to-safety asset during global market panics.",
        "Counteracts domestic purchasing power devaluation.",
        "Secures international educational or relocation funds ahead of time."
      ]
    },
    {
      id: "risk",
      title: "Risk Awareness & LRS Compliance",
      desc: "International investing is subject to regulations, capital transfer fees, foreign tax compliance (W-8BEN, double tax treaties) and volatility. Understanding local currency transfers under the Liberalised Remittance Scheme (LRS) is vital.",
      icon: ShieldAlert,
      points: [
        "Awareness of Remittance Tax Collected at Source (TCS) thresholds.",
        "Double Taxation Avoidance Agreement (DTAA) tax filing options.",
        "Evaluating currency conversion spread commissions from banking nodes."
      ]
    },
    {
      id: "portfolio",
      title: "Optimized Portfolio Allocation",
      desc: "Modern Portfolio Theory suggests that adding uncorrelated assets increases returns while reducing variance (volatility). Global assets act as a stabilizing anchor in a high-growth domestic portfolio.",
      icon: PieChart,
      points: [
        "Low correlation between local mid-caps and global large-caps.",
        "Structured rebalancing cycles to lock in exchange conversion profits.",
        "Diversified real estate, equity and debt options."
      ]
    }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-grow bg-white">
        {/* Page Hero */}
        <section className="bg-gradient-to-b from-[#F7F9FC] to-white py-16 lg:py-24 border-b border-gray-100">
          <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center flex flex-col items-center gap-6">
            <span className="text-xs font-bold uppercase tracking-wider text-[#00B386]">Macro Education</span>
            <h1 className="text-4xl font-extrabold tracking-tight text-[#0B1F3A] sm:text-5xl lg:text-6xl max-w-3xl">
              Think Beyond Borders
            </h1>
            <p className="text-base text-[#5A6E85] leading-relaxed max-w-xl">
              Understand the strategic logic, compliance parameters and structural benefits of holding multi-currency assets across the globe.
            </p>
            <div className="flex gap-3 mt-2">
              <button
                onClick={scrollToDetails}
                className="rounded-full bg-[#0B1F3A] px-6 py-3 text-sm font-bold text-white transition-all hover:bg-[#00B386] flex items-center gap-1"
              >
                Learn More <ArrowDown className="h-4 w-4" />
              </button>
              <Link
                href="/book"
                className="rounded-full border border-gray-200 bg-white px-6 py-3 text-sm font-bold text-[#1A1A1A] transition-all hover:bg-gray-50"
              >
                Schedule Consultation
              </Link>
            </div>
          </div>
        </section>

        {/* Informational Sections */}
        <section ref={detailsRef} className="py-20 bg-white scroll-mt-20">
          <div className="mx-auto max-w-5xl px-6 lg:px-8 space-y-20">
            {sections.map((section, idx) => (
              <div 
                key={section.id} 
                className={`grid grid-cols-1 gap-12 lg:grid-cols-12 items-start ${
                  idx % 2 === 1 ? "lg:flex-row-reverse" : ""
                }`}
              >
                {/* Icon Column */}
                <div className="lg:col-span-3 flex lg:justify-center">
                  <div className="rounded-2xl bg-[#F7F9FC] border border-gray-100 p-5 text-[#0B1F3A] shadow-sm">
                    <section.icon className="h-10 w-10 text-[#00B386]" />
                  </div>
                </div>

                {/* Details Column */}
                <div className="lg:col-span-9 flex flex-col gap-4">
                  <h2 className="text-xl font-bold text-[#0B1F3A] flex items-center gap-2">
                    <span className="text-[#00B386] font-mono text-sm">0{idx + 1}.</span>
                    {section.title}
                  </h2>
                  <p className="text-xs text-gray-500 leading-relaxed">{section.desc}</p>
                  
                  <ul className="mt-2 space-y-2.5">
                    {section.points.map((pt, pIdx) => (
                      <li key={pIdx} className="flex items-start gap-2 text-xs text-gray-400">
                        <CheckCircle2 className="h-4.5 w-4.5 text-[#00B386] flex-shrink-0 mt-0.5" />
                        <span className="text-gray-500 leading-normal">{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Banner */}
        <section className="bg-[#F7F9FC] py-16 border-t border-gray-100">
          <div className="mx-auto max-w-4xl px-6 text-center flex flex-col items-center gap-6">
            <h2 className="text-2xl font-bold text-[#0B1F3A]">Want to Model Your Global Allocation?</h2>
            <p className="text-xs text-[#5A6E85] max-w-lg leading-relaxed">
              Book an investor awareness session. Our consultants will walk you through LRS remittance parameters, compliance tax declarations and simulate compound yield curves.
            </p>
            <div className="mt-2">
              <Link
                href="/book?service=Investor%20Awareness%20Session"
                className="inline-flex items-center gap-1 rounded-full bg-[#00B386] px-6 py-3 text-sm font-bold text-white transition-all hover:bg-[#0B1F3A]"
              >
                Schedule Consultation <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
