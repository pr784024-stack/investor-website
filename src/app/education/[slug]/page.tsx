"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useApp } from "@/context/AppContext";
import { 
  ArrowLeft, Clock, Calendar, User as UserIcon, Bookmark, 
  BookmarkCheck, Share2, Download, CheckCircle2, ChevronRight, HelpCircle 
} from "lucide-react";

export default function ArticleDetail() {
  const params = useParams();
  const router = useRouter();
  const { slug } = params;
  const { articles, savedArticleIds, toggleSaveArticle, addNotification } = useApp();
  
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  // Find active article
  const article = articles.find((art) => art.slug === slug);

  if (!article) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow bg-[#F7F9FC] flex flex-col items-center justify-center p-8 text-center">
          <h2 className="text-xl font-bold text-[#0B1F3A]">Article Not Found</h2>
          <p className="text-xs text-gray-500 mt-2">The article slug is invalid or the post has been unpublished.</p>
          <Link href="/education" className="mt-6 inline-flex items-center gap-1 text-sm font-bold text-[#00B386] hover:underline">
            <ArrowLeft className="h-4 w-4" /> Back to Education Hub
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  // Related articles (matching same category, filtering current out)
  const relatedArticles = articles
    .filter((art) => art.categoryName === article.categoryName && art.id !== article.id)
    .slice(0, 3);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    addNotification("Article Shared", `Copied article link to clipboard: ${article.title}`, "SYSTEM");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPDF = () => {
    setDownloading(true);
    
    // Simulate PDF download
    setTimeout(() => {
      setDownloading(false);
      addNotification("PDF Downloaded", `Successfully downloaded PDF version of article: ${article.title}`, "SYSTEM");
      
      // Native window print triggers a beautiful standard system PDF printer/exporter!
      window.print();
    }, 1000);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-grow bg-[#F7F9FC] py-12">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          {/* Back button */}
          <div className="mb-6">
            <Link
              href="/education"
              className="inline-flex items-center gap-1 text-xs font-bold text-[#5A6E85] hover:text-[#00B386] transition-colors"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Education Hub
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            {/* Left: Main Content (8 cols) */}
            <article className="lg:col-span-8 rounded-2xl border border-gray-100 bg-white p-6 md:p-10 shadow-sm">
              {/* Meta information */}
              <div className="flex flex-wrap items-center gap-4 text-[10px] font-bold text-[#00B386] uppercase tracking-wider mb-4">
                <span>{article.categoryName}</span>
                <span className="h-1.5 w-1.5 rounded-full bg-gray-300"></span>
                <span className="flex items-center gap-1 text-gray-400 normal-case font-medium">
                  <Clock className="h-3.5 w-3.5" /> {article.readingTime}
                </span>
                <span className="h-1.5 w-1.5 rounded-full bg-gray-300"></span>
                <span className="flex items-center gap-1 text-gray-400 normal-case font-medium">
                  <Calendar className="h-3.5 w-3.5" /> {new Date(article.publishedAt).toLocaleDateString()}
                </span>
              </div>

              <h1 className="text-2xl font-extrabold tracking-tight text-[#0B1F3A] sm:text-3xl lg:text-4xl mb-6">
                {article.title}
              </h1>

              {/* Author & Actions bar */}
              <div className="flex flex-wrap items-center justify-between border-y border-gray-100 py-4 mb-8 gap-4">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-full bg-[#0B1F3A]/5 text-[#0B1F3A] flex items-center justify-center">
                    <UserIcon className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#1A1A1A] block">{article.author}</span>
                    <span className="text-[9px] text-gray-400 block">Verified Educator</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleSaveArticle(article.id)}
                    className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-[10px] font-bold text-[#1A1A1A] transition-colors hover:bg-gray-50"
                  >
                    {savedArticleIds.includes(article.id) ? (
                      <>
                        <BookmarkCheck className="h-3.5 w-3.5 text-[#00B386]" />
                        <span className="text-[#00B386]">Bookmarked</span>
                      </>
                    ) : (
                      <>
                        <Bookmark className="h-3.5 w-3.5 text-gray-400" />
                        <span>Bookmark</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleShare}
                    className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-[10px] font-bold text-[#1A1A1A] transition-colors hover:bg-gray-50"
                  >
                    <Share2 className="h-3.5 w-3.5 text-gray-400" />
                    <span>{copied ? "Link Copied!" : "Share"}</span>
                  </button>

                  <button
                    onClick={handleDownloadPDF}
                    disabled={downloading}
                    className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-[10px] font-bold text-[#1A1A1A] transition-colors hover:bg-gray-50 disabled:opacity-50"
                  >
                    <Download className="h-3.5 w-3.5 text-gray-400" />
                    <span>{downloading ? "Formatting..." : "Download PDF"}</span>
                  </button>
                </div>
              </div>

              {/* Cover Image */}
              <div className="rounded-xl overflow-hidden h-64 md:h-96 bg-gray-100 mb-8 border border-gray-100">
                <img
                  src={article.featuredImage}
                  alt={article.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* HTML Content (Safe simulation render) */}
              <div 
                className="prose max-w-none text-xs text-gray-500 leading-relaxed space-y-4"
                dangerouslySetInnerHTML={{ __html: article.content }}
              />

              {/* Help Banner at the bottom of the article */}
              <div className="mt-12 rounded-xl bg-gray-50 border border-gray-100 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex gap-3">
                  <div className="mt-0.5 rounded-full bg-[#00B386]/10 p-1.5 text-[#00B386] h-fit">
                    <HelpCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#0B1F3A] block">Need help applying this concept?</span>
                    <span className="text-[10px] text-gray-400 leading-relaxed">Schedule a free investor awareness consultation with our global strategy desk.</span>
                  </div>
                </div>
                <Link
                  href={`/book?service=Investor%20Awareness%20Session&ref=${encodeURIComponent(article.title)}`}
                  className="rounded-full bg-[#0B1F3A] px-5 py-2.5 text-[10px] font-bold text-white hover:bg-[#00B386] transition-colors whitespace-nowrap text-center"
                >
                  Book Session
                </Link>
              </div>
            </article>

            {/* Right: Sidebar widgets (4 cols) */}
            <aside className="lg:col-span-4 space-y-6">
              {/* Consultation Widget */}
              <div className="rounded-2xl border border-gray-100 bg-[#0B1F3A] text-white p-6 shadow-sm relative overflow-hidden">
                <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#ffffff_1.5px,transparent_1.5px)] [background-size:16px_16px]"></div>
                <div className="relative z-10 space-y-4">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-[#00B386] block">Consultation desk</span>
                  <h3 className="text-base font-extrabold">Strategic Cashflow & Remittance Review</h3>
                  <p className="text-[10px] text-gray-300 leading-relaxed">
                    Set up direct currency hedging buffers (remitting to USD) and capture foreign compounding indexes. Verified compliance guidelines under the LRS scheme.
                  </p>
                  <Link
                    href="/book"
                    className="w-full text-center block rounded-full bg-[#00B386] px-4 py-2.5 text-xs font-bold text-white transition-transform hover:scale-105"
                  >
                    Schedule Session
                  </Link>
                </div>
              </div>

              {/* Related Articles list */}
              {relatedArticles.length > 0 && (
                <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                  <h3 className="text-sm font-bold text-[#0B1F3A] mb-4 border-b border-gray-50 pb-2">Related Articles</h3>
                  <div className="space-y-4">
                    {relatedArticles.map((art) => (
                      <Link 
                        key={art.id} 
                        href={`/education/${art.slug}`}
                        className="group flex gap-3 items-start"
                      >
                        <img
                          src={art.featuredImage}
                          alt={art.title}
                          className="h-12 w-12 rounded object-cover flex-shrink-0 bg-gray-50"
                        />
                        <div>
                          <h4 className="text-[11px] font-bold text-gray-700 leading-tight group-hover:text-[#00B386] transition-colors line-clamp-2">
                            {art.title}
                          </h4>
                          <span className="text-[9px] text-gray-400 mt-1 block font-medium uppercase tracking-wider">{art.readingTime}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </aside>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
