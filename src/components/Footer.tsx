"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { Landmark, Phone, Mail, MapPin, Send, CheckCircle2 } from "lucide-react";

export default function Footer() {
  const { addNotification } = useApp();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    // Simulate subscribing
    const subscribers = JSON.parse(localStorage.getItem("ib_subscribers") || "[]");
    if (!subscribers.includes(email)) {
      subscribers.push(email);
      localStorage.setItem("ib_subscribers", JSON.stringify(subscribers));
    }
    
    setSubscribed(true);
    setEmail("");
    addNotification("Newsletter Subscribed", `Successfully subscribed ${email} to weekly financial updates.`, "SYSTEM");
  };

  return (
    <footer className="bg-[#0B1F3A] text-white border-t border-gray-800">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4 md:grid-cols-2">
          {/* Column 1: Brand details */}
          <div className="flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#00B386] text-white">
                <img src="/logo-mark.png" alt="Logo" className="h-7 w-7 object-contain" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                InvestorBridge
              </span>
            </Link>
            <p className="text-xs text-gray-400 leading-relaxed">
              Global Investment Awareness, Financial Education and Wealth Consulting Platform. empowering investors to think global and invest smart.
            </p>
            <p className="text-xs font-semibold text-[#D4AF37] italic">
              "Your Goals. Our Guidance. Your Future."
            </p>
          </div>

          {/* Column 2: Quick links */}
          <div>
            <h3 className="text-sm font-semibold text-[#00B386] tracking-wider uppercase mb-4">
              Resources
            </h3>
            <ul className="space-y-3 text-xs text-gray-400">
              <li>
                <Link href="/about" className="hover:text-white transition-colors">About Us</Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-white transition-colors">Services Directory</Link>
              </li>
              <li>
                <Link href="/education" className="hover:text-white transition-colors">Education Hub</Link>
              </li>
              <li>
                <Link href="/global-investing" className="hover:text-white transition-colors">Global Investing Awareness</Link>
              </li>
              <li>
                <Link href="/calculators" className="hover:text-white transition-colors">SIP & Wealth Calculators</Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact */}
          <div>
            <h3 className="text-sm font-semibold text-[#00B386] tracking-wider uppercase mb-4">
              Get in Touch
            </h3>
            <ul className="space-y-3 text-xs text-gray-400">
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-[#D4AF37]" />
                <a href="tel:7340806804" className="hover:text-white">7340806804</a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-[#D4AF37]" />
                <a href="mailto:infoinvestorbridgesolutions@gmail.com" className="hover:text-white">infoinvestorbridgesolutions@gmail.com</a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-[#D4AF37] mt-0.5" />
                <span>Chandigarh, Sector 127 Shivalik City, Punjab (140307), India</span>
              </li>
            </ul>
          </div>

          {/* Column 4: Newsletter */}
          <div>
            <h3 className="text-sm font-semibold text-[#00B386] tracking-wider uppercase mb-4">
              Weekly Newsletter
            </h3>
            <p className="text-xs text-gray-400 leading-relaxed mb-4">
              Subscribe to get global market insights, compounding guides and risk analysis articles directly in your inbox.
            </p>
            {subscribed ? (
              <div className="flex items-center gap-2 rounded-lg bg-green-950/50 border border-green-800 p-3 text-xs text-green-400">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>Subscription successful! Thank you.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex gap-2">
                <input
                  type="email"
                  required
                  placeholder="Enter email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 rounded-lg border border-gray-700 bg-gray-900/50 px-3 py-2 text-xs text-white placeholder-gray-500 focus:border-[#00B386] focus:outline-none"
                />
                <button
                  type="submit"
                  className="flex items-center justify-center rounded-lg bg-[#00B386] px-3 py-2 hover:bg-[#009b74] transition-colors"
                >
                  <Send className="h-3.5 w-3.5" />
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Financial Disclaimers */}
        <div className="mt-12 pt-8 border-t border-gray-800 text-[10px] text-gray-500 space-y-4">
          <p className="leading-relaxed">
            <strong>Platform Disclaimer:</strong> InvestorBridge Solutions is an Investor Awareness, Financial Education and Wealth Consulting platform. This platform is <strong>NOT</strong> a trading platform, brokerage, exchange, portfolio execution system, bank, or custodian. We do not provide securities transaction services, nor do we host direct trading services.
          </p>
          <p className="leading-relaxed">
            <strong>Investment Risk Disclaimer:</strong> Educational content, calculators and simulations provided are for informational purposes only and should not be construed as professional, certified investment advice or financial suggestions. All investments carry risks, including currency inflation and capital loss. Investors must consult with a certified financial advisor before committing funds.
          </p>
          <p className="leading-relaxed text-center text-gray-400">
            © {new Date().getFullYear()} InvestorBridge Solutions. Founded 2026. All Rights Reserved. Secure checkout via PCI-DSS compliant gateways.
          </p>
        </div>
      </div>
    </footer>
  );
}
