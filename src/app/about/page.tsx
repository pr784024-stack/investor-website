"use client";

import React from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Landmark, Compass, Eye, ShieldCheck, Heart, Award, ArrowRight } from "lucide-react";

export default function About() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-grow bg-[#F7F9FC]">
        {/* About Hero */}
        <section className="bg-white py-16 lg:py-24 border-b border-gray-100">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="max-w-3xl">
              <span className="text-xs font-bold uppercase tracking-wider text-[#00B386]">About InvestorBridge Solutions</span>
              <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-[#0B1F3A] sm:text-5xl">
                Democratizing Global Investment Awareness
              </h1>
              <p className="mt-6 text-sm text-[#5A6E85] leading-relaxed">
                InvestorBridge Solutions was founded in 2026 as an enterprise-grade fintech education, consulting and B2B lead generation company. We help retail and high-net-worth investors understand macroeconomics, compounding mechanics, currency diversification rules and international market frameworks.
              </p>
            </div>
          </div>
        </section>

        {/* Mission, Vision and Values */}
        <section className="py-20">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {/* Mission */}
              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <div className="inline-flex rounded-lg bg-[#00B386]/10 p-2.5 text-[#00B386] mb-4">
                  <Compass className="h-6 w-6" />
                </div>
                <h2 className="text-lg font-bold text-[#0B1F3A] mb-3">Our Mission</h2>
                <p className="text-xs text-gray-500 leading-relaxed">
                  To empower investors globally by bridging the information asymmetry regarding international wealth allocation, currency depreciation protection and systemic risk management.
                </p>
              </div>

              {/* Vision */}
              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <div className="inline-flex rounded-lg bg-[#0B1F3A]/10 p-2.5 text-[#0B1F3A] mb-4">
                  <Eye className="h-6 w-6" />
                </div>
                <h2 className="text-lg font-bold text-[#0B1F3A] mb-3">Our Vision</h2>
                <p className="text-xs text-gray-500 leading-relaxed">
                  To become the primary trusted global hub for macroeconomic investor education and strategic wealth consulting, recognized for integrity, security and premium user experience.
                </p>
              </div>

              {/* Core Values */}
              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <div className="inline-flex rounded-lg bg-[#D4AF37]/10 p-2.5 text-[#D4AF37] mb-4">
                  <Heart className="h-6 w-6" />
                </div>
                <h2 className="text-lg font-bold text-[#0B1F3A] mb-3">Core Values</h2>
                <ul className="text-xs text-gray-500 space-y-2">
                  <li className="flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4 text-[#00B386] flex-shrink-0" />
                    <span><strong>Trust & Integrity:</strong> Objectivity first.</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4 text-[#00B386] flex-shrink-0" />
                    <span><strong>Education Driven:</strong> Awareness over sales.</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4 text-[#00B386] flex-shrink-0" />
                    <span><strong>Security Oriented:</strong> Complete input safety.</span>
                  </li>
                </ul>
              </div>

              {/* Our Goal */}
              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <div className="inline-flex rounded-lg bg-[#00B386]/10 p-2.5 text-[#00B386] mb-4">
                  <Award className="h-6 w-6" />
                </div>
                <h2 className="text-lg font-bold text-[#0B1F3A] mb-3">Our Goal</h2>
                <p className="text-xs text-gray-500 leading-relaxed">
                  At InvestorBridge Solutions, our goal is to empower individuals with the knowledge, awareness and confidence needed to understand global investing opportunities. We aim to bridge the gap between investors and international financial markets through education, transparency and long-term wealth-building insights. By making global investment concepts more accessible, we strive to help investors make informed financial decisions in an increasingly connected world.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="py-20 bg-white border-t border-gray-100">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#00B386]">Strategic Focus</span>
                <h2 className="mt-2 text-3xl font-bold tracking-tight text-[#0B1F3A]">
                  Business Philosophy & Focus
                </h2>
                <p className="mt-4 text-xs text-gray-500 leading-relaxed">
                  InvestorBridge Solutions is built to educate, not to trade. By keeping ourselves strictly as an <strong>Investor Awareness and Wealth Consulting</strong> company, we avoid the conflicts of interest associated with brokerages or direct trading executions.
                </p>
                <p className="mt-4 text-xs text-gray-500 leading-relaxed">
                  This enables our consultants to provide unbiased, institutional-grade guidance on capital preservation, currency hedging (specifically USD-exposure), compounding velocity and geographical diversification.
                </p>
                <div className="mt-8">
                  <Link
                    href="/book"
                    className="inline-flex items-center gap-1.5 rounded-full bg-[#00B386] px-6 py-3 text-sm font-bold text-white transition-all hover:bg-[#0B1F3A]"
                  >
                    Book Consultation <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {[
                  { title: "No Execution Conflict", desc: "Since we do not route trades, our assessments are strictly objective and conflict-free." },
                  { title: "Founded in 2026", desc: "Formed with modern cross-border capital rules (LRS framework) in mind." },
                  { title: "Meticulous Analytics", desc: "Data driven modeling of global market metrics and compounding yields." },
                  { title: "Secure Safeguards", desc: "Every transaction, form submission and profile update has multi-layer security." },
                ].map((item, idx) => (
                  <div key={idx} className="rounded-xl border border-gray-100 bg-[#F7F9FC] p-5">
                    <div className="h-8 w-8 rounded-full bg-[#0B1F3A]/5 text-[#0B1F3A] flex items-center justify-center font-bold text-xs mb-3">
                      {idx + 1}
                    </div>
                    <h3 className="text-xs font-bold text-[#0B1F3A] mb-1.5">{item.title}</h3>
                    <p className="text-[10px] text-gray-400 leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
