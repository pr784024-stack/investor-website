import React from "react";
import Link from "next/link";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Privacy Policy | InvestorBridge Solutions",
  description: "Learn how InvestorBridge Solutions collects, uses and protects your personal information.",
};

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[#0B1F3A] text-white flex flex-col">
      <header className="border-b border-gray-800 bg-[#0B1F3A]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#00B386] text-white">
              <img src="/logo-mark.png" alt="Logo" className="h-7 w-7 object-contain" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">InvestorBridge</span>
          </Link>
          <Link href="/signup" className="text-xs font-bold text-[#00B386] hover:underline">
            Back to Signup
          </Link>
        </div>
      </header>

      <main className="flex-1 py-12 px-6">
        <div className="mx-auto max-w-4xl bg-[#112240] rounded-2xl p-8 border border-gray-850 shadow-xl">
          <nav className="text-xs text-gray-400 mb-6 flex gap-2">
            <Link href="/" className="hover:text-white">Home</Link>
            <span>&gt;</span>
            <span className="text-[#00B386]">Privacy Policy</span>
          </nav>

          <h1 className="text-3xl font-extrabold mb-2 text-white">Privacy Policy</h1>
          <p className="text-xs text-gray-400 mb-8">Effective Date: June 2026</p>

          <div className="space-y-6 text-xs text-gray-300 leading-relaxed scrollable-content max-h-[60vh] overflow-y-auto pr-4 scrollbar-thin">
            <section>
              <h2 className="text-sm font-bold text-[#00B386] mb-2">1. Information We Collect</h2>
              <p>We collect personal information including full name, email address, mobile number, IP address, device specifications, and browser data to deliver authentication and personalized experiences.</p>
            </section>

            <section>
              <h2 className="text-sm font-bold text-[#00B386] mb-2">2. How We Use Your Information</h2>
              <p>Your details are used to verify accounts, validate transactions, enforce authentication protocols, and record session audits to guard against unauthorized platform logins.</p>
            </section>

            <section>
              <h2 className="text-sm font-bold text-[#00B386] mb-2">3. Sharing of Information</h2>
              <p>We do not sell user data. Information is only shared with essential payment processors (Razorpay) and communication channels (SMTP, MSG91, Resend) required to complete operations.</p>
            </section>

            <section>
              <h2 className="text-sm font-bold text-[#00B386] mb-2">4. Data Security</h2>
              <p>We maintain industry-standard security measures including HTTPS connections, salted password/token hashing, database authorization layers, and session expiration rules.</p>
            </section>

            <section>
              <h2 className="text-sm font-bold text-[#00B386] mb-2">5. Cookies and Tracking Technologies</h2>
              <p>We utilize HTTP-only, secure cookies with SameSite=Strict configuration to maintain active sessions, prevent cross-site request forgery, and log access details securely.</p>
            </section>

            <section>
              <h2 className="text-sm font-bold text-[#00B386] mb-2">6. Third-Party Websites</h2>
              <p>Our platform contains links to external sites. We are not responsible for the privacy practices, content policies, or security guidelines of external resources.</p>
            </section>

            <section>
              <h2 className="text-sm font-bold text-[#00B386] mb-2">7. Your Rights</h2>
              <p>Depending on legal provisions, you have the right to inspect, update, or request deletion of stored personal profiles by contacting our support team.</p>
            </section>

            <section>
              <h2 className="text-sm font-bold text-[#00B386] mb-2">8. Data Retention</h2>
              <p>User profile information and transactional parameters are retained for as long as needed to satisfy security requirements and regulatory recording norms.</p>
            </section>

            <section>
              <h2 className="text-sm font-bold text-[#00B386] mb-2">9. Children's Privacy</h2>
              <p>Our platform does not intentionally collect information from individuals under the age of 18. Registered profiles must meet target age requirements.</p>
            </section>

            <section>
              <h2 className="text-sm font-bold text-[#00B386] mb-2">10. International Data Transfers</h2>
              <p>Your details may be processed and hosted on cloud servers globally. We utilize standard security safeguards for all cross-border communications.</p>
            </section>

            <section>
              <h2 className="text-sm font-bold text-[#00B386] mb-2">11. Changes to This Privacy Policy</h2>
              <p>We may modify this policy periodically to align with website service enhancements. The effective date is updated when revisions are published.</p>
            </section>

            <section>
              <h2 className="text-sm font-bold text-[#00B386] mb-2">12. Contact Information</h2>
              <p>For inquiries, feedback, or support requests concerning your data privacy, please write to us at <a href="mailto:info@investorbridgesolutions.com" className="text-[#00B386] hover:underline">info@investorbridgesolutions.com</a>.</p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
