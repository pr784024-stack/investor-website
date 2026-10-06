"use client";

import React from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { 
  BarChart3, Landmark, Sparkles, Megaphone, 
  Send, Users, HelpCircle, ArrowRight, ShieldCheck 
} from "lucide-react";

export default function Services() {
  const servicesList = [
    {
      title: "Financial Consulting",
      desc: "Detailed cashflow modeling, asset allocations, risk appetite profiling and currency hedging strategies.",
      icon: BarChart3,
      tag: "Investor Focus"
    },
    {
      title: "Business Consulting",
      desc: "Capital structure assessment, financial roadmap preparation, LRS framework advisory and scaling planning.",
      icon: Landmark,
      tag: "Corporate Focus"
    },
    {
      title: "Advisor Networking",
      desc: "Introducing wealth managers, family offices and individual consultants to international legal custodians.",
      icon: ShieldCheck,
      tag: "Networking Focus"
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="grow bg-[#F7F9FC] py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          {/* Section Header */}
          <div className="max-w-3xl mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-[#00B386]">Services Catalog</span>
            <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-[#0B1F3A]">
              Comprehensive Solutions for Capital & Growth
            </h1>
            <p className="mt-4 text-xs text-gray-500 leading-relaxed">
              We specialize in investor awareness, financial education, global allocation consulting and enterprise B2B brand marketing.
            </p>
          </div>

          {/* Grid Layout */}
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {servicesList.map((service, idx) => (
              <div 
                key={idx} 
                className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="inline-flex rounded-lg bg-[#0B1F3A]/5 p-2.5 text-[#0B1F3A]">
                      <service.icon className="h-5.5 w-5.5" />
                    </div>
                    <span className="rounded-full bg-[#00B386]/10 px-2.5 py-0.5 text-[8px] font-bold uppercase tracking-wider text-[#00B386]">
                      {service.tag}
                    </span>
                  </div>
                  <h2 className="text-base font-bold text-[#0B1F3A] mb-2">{service.title}</h2>
                  <p className="text-xs text-gray-400 leading-relaxed">{service.desc}</p>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-50 flex items-center justify-between gap-3">
                  <Link
                    href={`/contact?interest=${encodeURIComponent(service.title)}`}
                    className="text-xs font-bold text-[#1A1A1A] hover:text-[#00B386] transition-colors"
                  >
                    Learn More
                  </Link>
                  <Link
                    href={`/book?service=${encodeURIComponent(service.title)}`}
                    className="rounded-full bg-[#0B1F3A] px-4 py-2 text-[10px] font-bold text-white hover:bg-[#00B386] transition-colors"
                  >
                    Book Consultation
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* B2B email and growth widget */}
          <div className="mt-16 rounded-2xl bg-gradient-to-r from-[#0B1F3A] to-[#00B386] p-8 text-white shadow-lg relative overflow-hidden">
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]"></div>
            <div className="relative z-10 max-w-3xl flex flex-col gap-4">
              <h2 className="text-xl font-bold md:text-2xl">B2B Financial Growth & Email Marketing Programs</h2>
              <p className="text-xs text-gray-200 leading-relaxed">
                Are you an investment manager, advisor, or developer looking to scale your network? We compile bespoke marketing lists, set up secure automation pipelines and handle cold/warm outreach compliant with global regulations.
              </p>
              <div className="mt-2">
                <Link
                  href="/contact?interest=B2B Marketing Packages"
                  className="inline-flex items-center gap-1.5 rounded-full bg-white px-5 py-2.5 text-xs font-bold text-[#0B1F3A] hover:bg-gray-100 transition-colors"
                >
                  Consult B2B Packages <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
