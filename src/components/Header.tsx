"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { Menu, X, Landmark, User as UserIcon } from "lucide-react";

export default function Header() {
  const pathname = usePathname();
  const { currentUser, logout } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "Services", href: "/services" },
    { name: "Education Hub", href: "/education" },
    { name: "Global Investing", href: "/global-investing" },
    { name: "Calculators", href: "/calculators" },
    { name: "Contact", href: "/contact" },
  ];

  const handleLinkClick = () => {
    setMobileMenuOpen(false);
  };

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
        {/* Left Side: Brand Logo */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2" onClick={handleLinkClick}>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0B1F3A] text-[#00B386]">
              <img src="/logo-mark.png" alt="Logo" className="h-7 w-7 object-contain" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-[#0B1F3A]">
                InvestorBridge
              </span>
              <span className="hidden text-[10px] font-medium tracking-wider uppercase text-gray-400 md:block">
                Solutions
              </span>
            </div>
          </Link>
          <div className="hidden h-6 w-[1px] bg-gray-200 lg:block"></div>
          <span className="hidden text-[11px] italic text-[#D4AF37] lg:block">
            Your Goals. Our Guidance. Your Future.
          </span>
        </div>

        {/* Center: Navigation Links */}
        <nav className="hidden gap-x-8 lg:flex">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`text-sm font-semibold transition-colors duration-200 ${
                isActive(item.href)
                  ? "text-[#00B386]"
                  : "text-[#1A1A1A] hover:text-[#00B386]"
              }`}
            >
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Right Side: CTA / Dashboard / Auth buttons */}
        <div className="hidden items-center gap-x-3 lg:flex">
          <Link
            href="/book"
            className="rounded-full bg-[#0B1F3A] px-5 py-2 text-xs font-bold text-white transition-all duration-300 hover:bg-[#00B386] hover:scale-105"
          >
            Book Consultation
          </Link>

          {currentUser ? (
            <>
              <Link
                href={currentUser.role === "ADMIN" ? "/admin" : "/dashboard"}
                className="flex items-center gap-1 rounded-full border border-gray-200 px-4 py-2 text-xs font-bold text-[#1A1A1A] transition-all hover:bg-gray-50"
              >
                <UserIcon className="h-3.5 w-3.5" />
                {currentUser.role === "ADMIN" ? "Admin Panel" : "Dashboard"}
              </Link>
              <button
                onClick={logout}
                className="text-xs font-semibold text-gray-500 hover:text-red-500 transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-xs font-bold text-[#1A1A1A] hover:text-[#00B386] transition-colors px-3 py-2"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="rounded-full bg-[#00B386] px-5 py-2 text-xs font-bold text-white transition-all duration-300 hover:bg-[#0B1F3A] hover:scale-105"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="flex lg:hidden">
          <button
            type="button"
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700 hover:bg-gray-100 active:bg-gray-200 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" aria-hidden="true" />
            ) : (
              <Menu className="h-6 w-6" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-100 bg-white px-6 py-4 animate-fade-in shadow-lg">
          <div className="space-y-1 pb-3 pt-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={handleLinkClick}
                className={`block rounded-lg px-3 py-2 text-base font-semibold ${
                  isActive(item.href)
                    ? "bg-[#F7F9FC] text-[#00B386]"
                    : "text-[#1A1A1A] hover:bg-gray-50 hover:text-[#00B386]"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>
          <div className="border-t border-gray-100 pt-4 pb-2">
            <div className="flex flex-col gap-3">
              <Link
                href="/book"
                onClick={handleLinkClick}
                className="w-full text-center rounded-full bg-[#0B1F3A] px-4 py-2.5 text-sm font-bold text-white transition-all hover:bg-[#00B386]"
              >
                Book Consultation
              </Link>
              {currentUser ? (
                <>
                  <Link
                    href={currentUser.role === "ADMIN" ? "/admin" : "/dashboard"}
                    onClick={handleLinkClick}
                    className="w-full text-center flex items-center justify-center gap-2 rounded-full border border-gray-200 px-4 py-2.5 text-sm font-bold text-[#1A1A1A]"
                  >
                    <UserIcon className="h-4 w-4" />
                    {currentUser.role === "ADMIN" ? "Admin Panel" : "Dashboard"}
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      handleLinkClick();
                    }}
                    className="w-full text-center text-sm font-semibold text-red-500 py-2"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <div className="flex items-center justify-between gap-4 px-2 pt-2">
                  <Link
                    href="/login"
                    onClick={handleLinkClick}
                    className="flex-1 text-center text-sm font-bold text-[#1A1A1A] py-2 hover:bg-gray-50 rounded-lg"
                  >
                    Login
                  </Link>
                  <Link
                    href="/signup"
                    onClick={handleLinkClick}
                    className="flex-1 text-center rounded-full bg-[#00B386] px-4 py-2 text-sm font-bold text-white"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
