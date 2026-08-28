'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Sparkles, 
  ArrowRight, 
  Clock, 
  Flame, 
  ChevronRight
} from 'lucide-react';
import { Article, formatArticleDate } from '@/types/article';
import { MOCK_ARTICLES } from '@/data/mock-articles';

interface LatestArticlesSectionProps {
  initialArticles?: Article[];
}

export function LatestArticlesSection({ initialArticles }: LatestArticlesSectionProps) {
  const [articles, setArticles] = useState<Article[]>(
    initialArticles && initialArticles.length > 0 ? initialArticles.slice(0, 5) : MOCK_ARTICLES.slice(0, 5)
  );

  useEffect(() => {
    if (initialArticles && initialArticles.length > 0) {
      setArticles(initialArticles.slice(0, 5));
      return;
    }

    async function loadLatestArticles() {
      try {
        const res = await fetch('/api/articles?limit=5');
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          setArticles(json.data.slice(0, 5));
        }
      } catch {
        // Fallback
      }
    }

    loadLatestArticles();
  }, [initialArticles]);

  const featured = articles.find((a) => a.isFeatured) || articles[0];
  const subArticles = articles.filter((a) => a.id !== featured?.id).slice(0, 4);

  return (
    <section className="py-12 sm:py-24 bg-[#F8FAFC] border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-12 gap-3 sm:gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-[#0055FE] text-[10px] sm:text-[11px] font-black uppercase tracking-wider mb-2 border border-blue-100">
              <Sparkles className="w-3.5 h-3.5 text-[#0055FE]" />
              <span>Kiến Thức Dinh Dưỡng & Cẩm Nang Thể Hình</span>
            </div>
            <h2 className="text-xl sm:text-4xl font-black tracking-tight text-slate-900 font-display">
              Kiến Thức Thể Hình & Dinh Dưỡng Mới Nhất
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
              Cập nhật các nghiên cứu khoa học, thực đơn tăng cơ giảm mỡ và bí quyết sử dụng Supplement chuẩn y khoa.
            </p>
          </div>

          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-black text-[#0055FE] hover:text-blue-700 group transition-colors self-start md:self-auto pt-1"
          >
            <span>Khám phá tất cả bài viết</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Editorial Bento Grid: 1 Featured (Large) + 4 Compact Cards */}
        {articles.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-8">
            
            {/* Main Featured Article (7 Cols) */}
            {featured && (
              <div className="lg:col-span-7">
                <Link
                  href={`/blog/${featured.slug}`}
                  className="group flex flex-col justify-between h-full bg-slate-900 rounded-3xl overflow-hidden shadow-xl border border-slate-800 hover:border-blue-500/50 hover:shadow-2xl transition-all duration-300 relative min-h-[320px] sm:min-h-[460px]"
                >
                  {/* Image Background with Dark Gradient */}
                  <div className="absolute inset-0 z-0">
                    <img
                      src={featured.coverImage}
                      alt={featured.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-60 group-hover:opacity-75"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
                  </div>

                  {/* Top Badges */}
                  <div className="relative z-10 p-4 sm:p-8 flex items-center gap-2">
                    <span className="px-2.5 sm:px-3 py-1 rounded-full bg-[#0055FE] text-white text-[10px] sm:text-[11px] font-black uppercase tracking-wider shadow-md">
                      {featured.categoryName}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500 text-slate-950 text-[10px] sm:text-[11px] font-black uppercase tracking-wider shadow-md">
                      <Flame className="w-3 h-3" /> Mới Nhất
                    </span>
                  </div>

                  {/* Bottom Text Content */}
                  <div className="relative z-10 p-5 sm:p-8 space-y-2.5 sm:space-y-3">
                    <div className="flex items-center gap-2.5 sm:gap-3 text-[11px] sm:text-xs text-slate-300 font-medium">
                      <span>{formatArticleDate(featured.createdAt)}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-blue-400" /> {featured.readingTime} phút đọc
                      </span>
                    </div>

                    <h3 className="text-lg sm:text-3xl font-black text-white group-hover:text-blue-300 transition-colors leading-snug sm:leading-tight">
                      {featured.title}
                    </h3>

                    <p className="text-xs sm:text-sm text-slate-300 line-clamp-2 leading-relaxed font-normal">
                      {featured.excerpt}
                    </p>

                    <div className="pt-3 sm:pt-4 flex items-center justify-between border-t border-white/15">
                      <div className="flex items-center gap-2">
                        {featured.authorAvatar && (
                          <img
                            src={featured.authorAvatar}
                            alt={featured.authorName}
                            className="w-6 h-6 sm:w-7 sm:h-7 rounded-full object-cover border border-white/30"
                          />
                        )}
                        <span className="text-xs font-bold text-white">{featured.authorName}</span>
                      </div>

                      <span className="text-xs font-black text-[#00D2FF] group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                        <span>Đọc ngay</span>
                        <ChevronRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </Link>
              </div>
            )}

            {/* 4 Sub-Articles Grid (5 Cols) */}
            <div className="lg:col-span-5 flex flex-col justify-between gap-3 sm:gap-4">
              {subArticles.map((art) => (
                <div key={art.id} className="w-full">
                  <Link
                    href={`/blog/${art.slug}`}
                    className="group flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-white rounded-2xl border border-slate-100 shadow-xs hover:shadow-md hover:border-blue-200 transition-all duration-200"
                  >
                    {/* Thumbnail */}
                    <div className="w-18 h-18 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-slate-100 shrink-0 relative">
                      <img
                        src={art.coverImage}
                        alt={art.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>

                    {/* Text */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] sm:text-[10px] font-bold text-[#0055FE] uppercase tracking-wider truncate">
                          {art.categoryName}
                        </span>
                        <span className="text-[9px] sm:text-[10px] text-slate-400 shrink-0">• {art.readingTime}p</span>
                      </div>

                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-2 group-hover:text-[#0055FE] transition-colors leading-snug">
                        {art.title}
                      </h4>

                      <p className="text-[10px] sm:text-[11px] text-slate-400 line-clamp-1">
                        {art.excerpt}
                      </p>
                    </div>

                    <div className="text-slate-300 group-hover:text-[#0055FE] group-hover:translate-x-0.5 transition-all shrink-0">
                      <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                  </Link>
                </div>
              ))}
            </div>

          </div>
        )}

      </div>
    </section>
  );
}
