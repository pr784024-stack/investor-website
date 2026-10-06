"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useApp } from "@/context/AppContext";
import { Search, Clock, ArrowRight, Bookmark, BookmarkCheck } from "lucide-react";

export default function EducationHub() {
  const { articles, savedArticleIds, toggleSaveArticle } = useApp();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [filteredArticles, setFilteredArticles] = useState(articles);
  const [rateLimitWarning, setRateLimitWarning] = useState(false);
  const [searchCount, setSearchCount] = useState(0);

  const categories = [
    "All",
    "Global Investing",
    "Compounding",
    "Diversification",
    "Currency Awareness",
    "Investor Psychology",
    "Risk Management",
    "Wealth Creation",
  ];

  // Simulated search rate limiting (security rule)
  useEffect(() => {
    if (searchCount > 15) {
      setRateLimitWarning(true);
      const timer = setTimeout(() => {
        setSearchCount(0);
        setRateLimitWarning(false);
      }, 10000); // Reset limit after 10s
      return () => clearTimeout(timer);
    }
  }, [searchCount]);

  // Handle article filtering & search
  useEffect(() => {
    // 1. Sanitize Search Query (SQLi & XSS mitigation)
    // Strip common SQL query elements and HTML scripts
    let sanitized = searchQuery
      .replace(/['";\-/\*]/g, "") // remove quotes, semi-colons, hyphens, slashes, asterisks
      .replace(/<[^>]*>/g, "") // remove HTML tags
      .trim();

    let result = articles;

    // Filter by Category
    if (activeCategory !== "All") {
      result = result.filter(
        (art) => art.categoryName.toLowerCase() === activeCategory.toLowerCase()
      );
    }

    // Filter by Search Query
    if (sanitized) {
      const queryLower = sanitized.toLowerCase();
      result = result.filter(
        (art) =>
          art.title.toLowerCase().includes(queryLower) ||
          art.content.toLowerCase().includes(queryLower) ||
          art.categoryName.toLowerCase().includes(queryLower)
      );
    }

    setFilteredArticles(result);
  }, [searchQuery, activeCategory, articles]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (rateLimitWarning) return;
    setSearchQuery(e.target.value);
    setSearchCount((prev) => prev + 1);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="grow bg-[#F7F9FC] py-12">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-[#00B386]">Investor Education Hub</span>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-[#0B1F3A] sm:text-4xl">
              Knowledge is the Best Investment
            </h1>
            <p className="mt-4 text-xs text-[#5A6E85] leading-relaxed">
              Browse macro research, diversification guides, compounding simulators and behavioral analysis articles. All guides are structured conflict-free.
            </p>
          </div>

          {/* Search Bar & Categories */}
          <div className="max-w-4xl mx-auto mb-10 flex flex-col gap-4">
            {/* Search Input */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-400">
                <Search className="h-5 w-5" />
              </div>
              <input
                type="text"
                disabled={rateLimitWarning}
                placeholder={rateLimitWarning ? "Rate limit reached. Please wait 10s..." : "Search articles by title, tags, keywords..."}
                value={searchQuery}
                onChange={handleSearchChange}
                className={`w-full rounded-2xl border bg-white pl-11 pr-4 py-3.5 text-xs text-[#1A1A1A] placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#00B386] ${
                  rateLimitWarning 
                    ? "border-red-300 bg-red-50 text-red-600 focus:ring-red-500" 
                    : "border-gray-200"
                }`}
              />
            </div>
            
            {rateLimitWarning && (
              <p className="text-[10px] text-red-500 font-semibold px-2">
                ⚠️ Security Rate Limiter: Too many search requests. Please wait a moment.
              </p>
            )}

            {/* Filter Tags */}
            <div className="flex flex-wrap gap-2 overflow-x-auto py-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`rounded-full px-4 py-2 text-[10px] font-bold uppercase tracking-wider transition-all duration-200 ${
                    activeCategory === cat
                      ? "bg-[#0B1F3A] text-white"
                      : "bg-white border border-gray-200 text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Grid Layout */}
          {filteredArticles.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 max-w-lg mx-auto">
              <p className="text-sm font-semibold text-gray-500">No articles matched your criteria.</p>
              <button 
                onClick={() => { setSearchQuery(""); setActiveCategory("All"); }}
                className="mt-4 text-xs font-bold text-[#00B386] hover:underline"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {filteredArticles.map((art) => (
                <div 
                  key={art.id} 
                  className="group rounded-2xl border border-gray-100 bg-white overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="relative h-48 w-full overflow-hidden bg-gray-100">
                      <img
                        src={art.featuredImage}
                        alt={art.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <span className="absolute top-3 left-3 rounded-full bg-white/95 px-3 py-1 text-[9px] font-bold uppercase tracking-wider text-[#0B1F3A] shadow-sm">
                        {art.categoryName}
                      </span>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          toggleSaveArticle(art.id);
                        }}
                        className="absolute top-3 right-3 rounded-full bg-white/95 p-1.5 text-gray-400 hover:text-[#00B386] shadow-sm transition-colors"
                      >
                        {savedArticleIds.includes(art.id) ? (
                          <BookmarkCheck className="h-4 w-4 text-[#00B386]" />
                        ) : (
                          <Bookmark className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    <div className="p-6">
                      <div className="flex items-center gap-3 text-[10px] text-gray-400 mb-2">
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" /> {art.readingTime}
                        </span>
                        <span>•</span>
                        <span>By {art.author}</span>
                      </div>
                      <h3 className="text-base font-bold text-[#0B1F3A] line-clamp-2 group-hover:text-[#00B386] transition-colors">
                        {art.title}
                      </h3>
                    </div>
                  </div>

                  <div className="px-6 pb-6 pt-2 border-t border-gray-50 flex items-center justify-between">
                    <Link
                      href={`/education/${art.slug}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#00B386] hover:underline"
                    >
                      Read Article <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
