import React from "react";
import Link from "next/link";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Terms & Conditions | InvestorBridge Solutions",
  description: "Terms and Conditions governing the use of InvestorBridge Solutions services.",
};

export default function TermsAndConditions() {
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
            <span className="text-[#00B386]">Terms & Conditions</span>
          </nav>

          <h1 className="text-3xl font-extrabold mb-2 text-white">Terms & Conditions</h1>
          <p className="text-xs text-gray-400 mb-8">Effective Date: June 2026</p>

          <div className="space-y-6 text-xs text-gray-300 leading-relaxed scrollable-content max-h-[60vh] overflow-y-auto pr-4 scrollbar-thin">
            <section>
              <h2 className="text-sm font-bold text-[#00B386] mb-2">1. About InvestorBridge Solutions</h2>
              <p>InvestorBridge Solutions is engaged in investor education, portfolio diversification awareness, and financial planning consultation. We provide resources to enhance financial literacy and connect clients with general investment advisory guidelines.</p>
            </section>

            <section>
              <h2 className="text-sm font-bold text-[#00B386] mb-2">2. Eligibility</h2>
              <p>By using this platform, you represent that you are at least 18 years of age and possess the legal capacity to enter into binding agreements under applicable jurisdictions.</p>
            </section>

            <section>
              <h2 className="text-sm font-bold text-[#00B386] mb-2">3. Nature of Services</h2>
              <p>Our platform compiles financial content, educational articles, and wealth compounding simulators. Any advisory or consultation services booked represent informational planning advice only.</p>
            </section>

            <section>
              <h2 className="text-sm font-bold text-[#00B386] mb-2">4. Investment Risk Disclosure</h2>
              <p>All financial investments involve risks, including the loss of principal capital and asset volatility. Users should execute independent due diligence or consult registered brokers before engaging in transactions.</p>
            </section>

            <section>
              <h2 className="text-sm font-bold text-[#00B386] mb-2">5. No Guarantee of Returns</h2>
              <p>InvestorBridge Solutions makes no representations, claims, or guarantees regarding guaranteed interest rates, future returns, or performance indices depicted in any calculators or articles.</p>
            </section>

            <section>
              <h2 className="text-sm font-bold text-[#00B386] mb-2">6. User Responsibilities</h2>
              <p>You agree to provide true, accurate, and current information when registering, logging in, or booking consultations. You are responsible for safeguarding your credentials.</p>
            </section>

            <section>
              <h2 className="text-sm font-bold text-[#00B386] mb-2">7. Third-Party Services</h2>
              <p>We may link to or integrate with third-party tools, payment gateways (like Razorpay), and authentication providers. We do not control or assume liability for third-party websites or services.</p>
            </section>

            <section>
              <h2 className="text-sm font-bold text-[#00B386] mb-2">8. Intellectual Property</h2>
              <p>All source code, platform designs, articles, branding marks, and content are the sole property of InvestorBridge Solutions. Unauthorized duplication or redistribution is strictly prohibited.</p>
            </section>

            <section>
              <h2 className="text-sm font-bold text-[#00B386] mb-2">9. Privacy and Data Collection</h2>
              <p>Your access to and use of this website is also governed by our Privacy Policy, which explains our data collection practices and user security guidelines.</p>
            </section>

            <section>
              <h2 className="text-sm font-bold text-[#00B386] mb-2">10. Limitation of Liability</h2>
              <p>To the fullest extent permitted by law, InvestorBridge Solutions, its directors, and employees will not be held liable for any indirect, special, incidental, or consequential damages resulting from your use of the website.</p>
            </section>

            <section>
              <h2 className="text-sm font-bold text-[#00B386] mb-2">11. Regulatory Compliance</h2>
              <p>We perform our operations in strict compliance with the relevant financial regulations and user data protection protocols under regional laws.</p>
            </section>

            <section>
              <h2 className="text-sm font-bold text-[#00B386] mb-2">12. Website Content</h2>
              <p>We reserve the right to modify, edit, suspend, or discontinue any feature, service section, or article at any time without prior notice.</p>
            </section>

            <section>
              <h2 className="text-sm font-bold text-[#00B386] mb-2">13. Amendments</h2>
              <p>InvestorBridge Solutions reserves the right to modify these Terms & Conditions. Continued use of the platform after updates indicates your acceptance of the revised Terms.</p>
            </section>

            <section>
              <h2 className="text-sm font-bold text-[#00B386] mb-2">14. Governing Law</h2>
              <p>These terms and conditions are governed by and construed in accordance with the laws of India, and any disputes will be subject to the exclusive jurisdiction of the courts of Chandigarh, India.</p>
            </section>

            <section>
              <h2 className="text-sm font-bold text-[#00B386] mb-2">15. Contact Us</h2>
              <p>If you have any questions, clarifications, or feedback regarding these terms, please contact us at <a href="mailto:info@investorbridgesolutions.com" className="text-[#00B386] hover:underline">info@investorbridgesolutions.com</a>.</p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
