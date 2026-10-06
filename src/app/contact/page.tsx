"use client";

import React, { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  Mail, Phone, MapPin, Clock, Send, MessageSquare,
  ShieldCheck, CheckCircle2, ArrowRight
} from "lucide-react";

// Inline Custom SVGs for Social Icons (since lucide-react v1+ does not ship brand logos)
const LinkedinIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={props.className}
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

/* OLD TWITTER ICON CODE COMMENTED
const TwitterIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={props.className}
  >
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);
*/

// NEW FACEBOOK ICON
const FacebookIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={props.className}
  >
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

// NEW INSTAGRAM ICON
const InstagramIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={props.className}
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" y2="6.5" />
  </svg>
);

// NEW WHATSAPP ICON
const WhatsAppIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={props.className}
  >
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
  </svg>
);

const CONTACT_INFO = [
  {
    icon: Phone,
    label: "Call Us",
    value: "+91 7340806804",
    sub: "Mon–Sat, 9:00 AM – 7:00 PM IST",
    color: "#0B1F3A",
  },
  {
    icon: Mail,
    label: "Email Us",
    value: "infoinvestorbridgesolutions@gmail.com",
    sub: "We respond within 24 hours",
    color: "#00B386",
  },
  {
    icon: MapPin,
    label: "Visit Us",
    value: "Chandigarh, Punjab, India",
    sub: "India — Virtual & In-Person consultations",
    color: "#D4AF37",
  },
  {
    icon: Clock,
    label: "Business Hours",
    value: "Mon – Sat: 9 AM – 7 PM",
    sub: "Sunday: Closed",
    color: "#0B1F3A",
  },
];

const FAQS = [
  {
    q: "Is InvestorBridge SEBI registered?",
    a: "InvestorBridge Solutions is a financial education and awareness platform. We do not provide SEBI-regulated investment advice. We share global investing awareness, educational content and connect investors with advisors.",
  },
  {
    q: "How do I book a consultation?",
    a: "Visit our Book Consultation page, select a service, choose your preferred date and time, fill in your details and complete the payment. You'll receive a confirmation via email and WhatsApp.",
  },
  {
    q: "Are my personal details safe?",
    a: "Absolutely. All data is encrypted end-to-end, never sold to third parties and stored with enterprise-grade security including TLS 1.3 encryption.",
  },
  {
    q: "Can I get a refund?",
    a: "Yes. If you cancel your consultation at least 24 hours before the scheduled time, you are eligible for a full refund. Late cancellations are reviewed case-by-case.",
  },
];

function sanitizeInput(value: string): string {
  return value.replace(/<[^>]*>?/gm, "").replace(/['";<>]/g, "").trim();
}

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePhone(phone: string): boolean {
  return /^(\+91|0)?[6-9]\d{9}$/.test(phone.replace(/\s/g, ""));
}

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
    agreement: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Client-side form validation (security rule)
  const validate = () => {
    const newErrors: Record<string, string> = {};

    const cleanName = sanitizeInput(form.name);
    if (!cleanName || cleanName.length < 2 || cleanName.length > 100) {
      newErrors.name = "Full name must be 2–100 characters (letters and spaces only).";
    } else if (!/^[a-zA-Z\s\-'.]+$/.test(cleanName)) {
      newErrors.name = "Name can only contain letters, spaces, hyphens and apostrophes.";
    }

    if (!validateEmail(form.email)) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (form.phone && !validatePhone(form.phone)) {
      newErrors.phone = "Please enter a valid Indian mobile number.";
    }

    const cleanSubject = sanitizeInput(form.subject);
    if (!cleanSubject || cleanSubject.length < 3) {
      newErrors.subject = "Please provide a subject (min 3 characters).";
    }

    const cleanMessage = sanitizeInput(form.message);
    if (!cleanMessage || cleanMessage.length < 20) {
      newErrors.message = "Message must be at least 20 characters.";
    } else if (cleanMessage.length > 2000) {
      newErrors.message = "Message must be under 2000 characters.";
    }

    if (!form.agreement) {
      newErrors.agreement = "You must agree to our Privacy Policy.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      setForm((prev) => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: sanitizeInput(form.name),
          email: form.email.trim().toLowerCase(),
          phone: form.phone.trim(),
          subject: sanitizeInput(form.subject),
          message: sanitizeInput(form.message),
        }),
      });

      if (res.ok) {
        setSubmitted(true);
      } else {
        const data = await res.json();
        setErrors({ form: data.error || "Something went wrong. Please try again." });
      }
    } catch {
      setErrors({ form: "Network error. Please check your connection and try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="grow">
        {/* HERO BANNER */}
        <section className="relative overflow-hidden bg-linear-to-br from-[#0B1F3A] via-[#0d2847] to-[#0B1F3A] py-20 lg:py-28">
          <div className="absolute inset-0">
            <div className="absolute top-0 right-0 -mr-10 h-[400px] w-[400px] rounded-full bg-[#00B386]/10 blur-3xl" />
            <div className="absolute bottom-0 left-0 -ml-10 h-[300px] w-[300px] rounded-full bg-[#D4AF37]/10 blur-3xl" />
          </div>
          <div className="relative mx-auto max-w-7xl px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-semibold text-[#00B386] mb-6">
              <MessageSquare className="h-4 w-4" />
              Get In Touch
            </div>
            <h1 className="text-4xl lg:text-5xl font-extrabold text-white mb-6 tracking-tight">
              We&apos;d Love to{" "}
              <span className="text-[#00B386]">Hear From You</span>
            </h1>
            <p className="text-lg text-white/70 max-w-2xl mx-auto">
              Have a question, want to partner with us, or ready to start your global investing journey?
              Our team is here to help — reach out anytime.
            </p>
          </div>
        </section>

        {/* CONTACT INFO CARDS */}
        <section className="bg-white py-16">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {CONTACT_INFO.map((info, i) => {
                const Icon = info.icon;
                return (
                  <div
                    key={i}
                    className="card-hover rounded-2xl border border-[#E2E8F0] bg-white p-6 text-center shadow-sm"
                  >
                    <div
                      className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl"
                      style={{ background: `${info.color}15` }}
                    >
                      <Icon className="h-6 w-6" style={{ color: info.color }} />
                    </div>
                    <p className="text-sm font-semibold text-[#5A6E85] uppercase tracking-wider mb-1">
                      {info.label}
                    </p>
                    <p className="text-base font-bold text-[#0B1F3A] mb-1 break-all">{info.value}</p>
                    <p className="text-xs text-[#5A6E85]">{info.sub}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* CONTACT FORM + FAQ */}
        <section className="bg-[#F7F9FC] py-20">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

              {/* CONTACT FORM */}
              <div>
                <h2 className="text-3xl font-extrabold text-[#0B1F3A] mb-2">
                  Send Us a Message
                </h2>
                <p className="text-[#5A6E85] mb-8">
                  Fill out the form and we&apos;ll get back to you within 24 hours.
                </p>

                {submitted ? (
                  <div className="rounded-2xl border border-[#00B386]/30 bg-[#00B386]/10 p-10 text-center">
                    <CheckCircle2 className="mx-auto mb-4 h-14 w-14 text-[#00B386]" />
                    <h3 className="text-2xl font-bold text-[#0B1F3A] mb-2">
                      Message Sent Successfully!
                    </h3>
                    <p className="text-[#5A6E85]">
                      Thank you for reaching out! Our team will respond to you within 24 business hours.
                    </p>
                    <button
                      onClick={() => {
                        setSubmitted(false);
                        setForm({
                          name: "", email: "", phone: "", subject: "", message: "", agreement: false,
                        });
                      }}
                      className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#0B1F3A] px-6 py-3 text-sm font-bold text-white hover:bg-[#0d2847] transition-colors"
                    >
                      Send Another Message <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <form
                    onSubmit={handleSubmit}
                    noValidate
                    className="rounded-2xl border border-[#E2E8F0] bg-white p-8 shadow-sm space-y-6"
                  >
                    {/* Security indicator */}
                    <div className="flex items-center gap-2 rounded-lg bg-[#00B386]/10 px-3 py-2 text-xs text-[#00B386] font-medium">
                      <ShieldCheck className="h-4 w-4 shrink-0" />
                      Your data is encrypted and protected by TLS 1.3
                    </div>

                    {/* Global error */}
                    {errors.form && (
                      <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                        {errors.form}
                      </div>
                    )}

                    {/* Full Name */}
                    <div>
                      <label htmlFor="contact-name" className="block text-sm font-semibold text-[#0B1F3A] mb-1.5">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="contact-name"
                        name="name"
                        type="text"
                        autoComplete="name"
                        value={form.name}
                        onChange={handleChange}
                        maxLength={100}
                        placeholder="Rajan Sharma"
                        className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition-all ${
                          errors.name
                            ? "border-red-400 bg-red-50 focus:ring-2 focus:ring-red-200"
                            : "border-[#E2E8F0] bg-white focus:border-[#00B386] focus:ring-2 focus:ring-[#00B386]/20"
                        }`}
                      />
                      {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
                    </div>

                    {/* Email + Phone Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="contact-email" className="block text-sm font-semibold text-[#0B1F3A] mb-1.5">
                          Email <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="contact-email"
                          name="email"
                          type="email"
                          autoComplete="email"
                          value={form.email}
                          onChange={handleChange}
                          placeholder="you@example.com"
                          className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition-all ${
                            errors.email
                              ? "border-red-400 bg-red-50 focus:ring-2 focus:ring-red-200"
                              : "border-[#E2E8F0] bg-white focus:border-[#00B386] focus:ring-2 focus:ring-[#00B386]/20"
                          }`}
                        />
                        {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
                      </div>
                      <div>
                        <label htmlFor="contact-phone" className="block text-sm font-semibold text-[#0B1F3A] mb-1.5">
                          Mobile Number
                        </label>
                        <input
                          id="contact-phone"
                          name="phone"
                          type="tel"
                          autoComplete="tel"
                          value={form.phone}
                          onChange={handleChange}
                          placeholder="+91 98765 43210"
                          className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition-all ${
                            errors.phone
                              ? "border-red-400 bg-red-50 focus:ring-2 focus:ring-red-200"
                              : "border-[#E2E8F0] bg-white focus:border-[#00B386] focus:ring-2 focus:ring-[#00B386]/20"
                          }`}
                        />
                        {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone}</p>}
                      </div>
                    </div>

                    {/* Subject */}
                    <div>
                      <label htmlFor="contact-subject" className="block text-sm font-semibold text-[#0B1F3A] mb-1.5">
                        Subject <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="contact-subject"
                        name="subject"
                        value={form.subject}
                        onChange={handleChange}
                        className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition-all bg-white ${
                          errors.subject
                            ? "border-red-400 focus:ring-2 focus:ring-red-200"
                            : "border-[#E2E8F0] focus:border-[#00B386] focus:ring-2 focus:ring-[#00B386]/20"
                        }`}
                      >
                        <option value="">Select a topic...</option>
                        <option value="General Enquiry">General Enquiry</option>
                        <option value="Book Consultation">Book Consultation</option>
                        <option value="Partnership Opportunity">Partnership Opportunity</option>
                        <option value="Education Hub Query">Education Hub Query</option>
                        <option value="Technical Support">Technical Support</option>
                        <option value="Billing & Payments">Billing &amp; Payments</option>
                        <option value="Other">Other</option>
                      </select>
                      {errors.subject && <p className="mt-1 text-xs text-red-600">{errors.subject}</p>}
                    </div>

                    {/* Message */}
                    <div>
                      <label htmlFor="contact-message" className="block text-sm font-semibold text-[#0B1F3A] mb-1.5">
                        Message <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        id="contact-message"
                        name="message"
                        rows={5}
                        value={form.message}
                        onChange={handleChange}
                        maxLength={2000}
                        placeholder="Tell us how we can help you..."
                        className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition-all resize-none ${
                          errors.message
                            ? "border-red-400 bg-red-50 focus:ring-2 focus:ring-red-200"
                            : "border-[#E2E8F0] bg-white focus:border-[#00B386] focus:ring-2 focus:ring-[#00B386]/20"
                        }`}
                      />
                      <div className="flex justify-between items-center mt-1">
                        {errors.message ? (
                          <p className="text-xs text-red-600">{errors.message}</p>
                        ) : (
                          <span />
                        )}
                        <p className="text-xs text-[#5A6E85] ml-auto">
                          {form.message.length}/2000
                        </p>
                      </div>
                    </div>

                    {/* Agreement */}
                    <div>
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          id="contact-agreement"
                          name="agreement"
                          type="checkbox"
                          checked={form.agreement}
                          onChange={handleChange}
                          className="mt-0.5 h-4 w-4 rounded accent-[#00B386]"
                        />
                        <span className="text-sm text-[#5A6E85]">
                          I agree to InvestorBridge&apos;s{" "}
                          <a href="/privacy-policy" className="text-[#00B386] font-semibold hover:underline">
                            Privacy Policy
                          </a>{" "}
                          and consent to being contacted via email.
                        </span>
                      </label>
                      {errors.agreement && (
                        <p className="mt-1 text-xs text-red-600">{errors.agreement}</p>
                      )}
                    </div>

                    <button
                      id="contact-submit-btn"
                      type="submit"
                      disabled={loading}
                      className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#0B1F3A] px-6 py-3.5 text-sm font-bold text-white hover:bg-[#00B386] transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
                          </svg>
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          Send Message
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>

              {/* FAQ SECTION */}
              <div>
                <h2 className="text-3xl font-extrabold text-[#0B1F3A] mb-2">
                  Frequently Asked Questions
                </h2>
                <p className="text-[#5A6E85] mb-8">
                  Quick answers to common questions about InvestorBridge Solutions.
                </p>

                <div className="space-y-4">
                  {FAQS.map((faq, i) => (
                    <div
                      key={i}
                      className="rounded-2xl border border-[#E2E8F0] bg-white overflow-hidden shadow-sm"
                    >
                      <button
                        id={`faq-btn-${i}`}
                        onClick={() => setOpenFaq(openFaq === i ? null : i)}
                        className="w-full flex items-center justify-between px-6 py-4 text-left text-sm font-semibold text-[#0B1F3A] hover:bg-[#F7F9FC] transition-colors"
                      >
                        <span>{faq.q}</span>
                        <span
                          className="ml-4 shrink-0 text-[#00B386] transition-transform duration-200"
                          style={{ transform: openFaq === i ? "rotate(45deg)" : "rotate(0deg)" }}
                        >
                          <ArrowRight className="h-4 w-4 rotate-90" />
                        </span>
                      </button>
                      {openFaq === i && (
                        <div className="px-6 pb-4 text-sm text-[#5A6E85] leading-relaxed border-t border-[#E2E8F0] pt-4">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Social Links */}
                <div className="mt-10 rounded-2xl bg-[#0B1F3A] p-8 text-white">
                  <h3 className="text-xl font-bold mb-2">Follow Us</h3>
                  <p className="text-white/70 text-sm mb-6">
                    Stay connected for investing insights, market updates and platform news.
                  </p>
                  <div className="flex flex-wrap gap-4">
                    {/* NEW FACEBOOK ICON */}
                    <a
                      href="https://facebook.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      id="contact-facebook"
                      className="flex items-center gap-2 rounded-xl bg-white/10 px-5 py-3 text-sm font-semibold hover:bg-[#00B386] transition-colors"
                    >
                      <FacebookIcon className="h-4 w-4" />
                      Facebook
                    </a>

                    <a
                      href="https://www.linkedin.com/company/investorsbridge-solutions/"
                      target="_blank"
                      rel="noopener noreferrer"
                      id="contact-linkedin"
                      className="flex items-center gap-2 rounded-xl bg-white/10 px-5 py-3 text-sm font-semibold hover:bg-[#00B386] transition-colors"
                    >
                      <LinkedinIcon className="h-4 w-4" />
                      LinkedIn
                    </a>

                    {/* OLD TWITTER LINK CODE COMMENTED */}
                    {/*
                    <a
                      href="https://twitter.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      id="contact-twitter"
                      className="flex items-center gap-2 rounded-xl bg-white/10 px-5 py-3 text-sm font-semibold hover:bg-[#00B386] transition-colors"
                    >
                      <TwitterIcon className="h-4 w-4" />
                      Twitter / X
                    </a>
                    */}

                    {/* NEW INSTAGRAM ICON */}
                    <a
                      href="https://www.instagram.com/investorbridge_solutions?igsh=MWlwMXg3eGc4OXY5aA=="
                      target="_blank"
                      rel="noopener noreferrer"
                      id="contact-instagram"
                      className="flex items-center gap-2 rounded-xl bg-white/10 px-5 py-3 text-sm font-semibold hover:bg-[#00B386] transition-colors"
                    >
                      <InstagramIcon className="h-4 w-4" />
                      Instagram
                    </a>

                    {/* NEW WHATSAPP ICON */}
                    <a
                      href="https://wa.me/917340806804"
                      target="_blank"
                      rel="noopener noreferrer"
                      id="contact-whatsapp"
                      className="flex items-center gap-2 rounded-xl bg-white/10 px-5 py-3 text-sm font-semibold hover:bg-[#00B386] transition-colors"
                    >
                      <WhatsAppIcon className="h-4 w-4" />
                      WhatsApp
                    </a>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* MAP PLACEHOLDER */}
        <section className="bg-white py-16">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="rounded-3xl overflow-hidden border border-[#E2E8F0] h-64 bg-linear-to-br from-[#0B1F3A] to-[#1a3560] flex items-center justify-center">
              <div className="text-center text-white">
                <MapPin className="h-12 w-12 mx-auto mb-3 text-[#00B386]" />
                <p className="text-xl font-bold">Chandigarh, Punjab, India</p>
                <p className="text-white/60 text-sm mt-1">Virtual Consultations Available Worldwide</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
