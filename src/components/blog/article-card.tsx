'use client';

import React from 'react';
import Link from 'next/link';
import { Clock, Eye, ArrowRight, Flame } from 'lucide-react';
import { Article, formatArticleDate } from '@/types/article';

interface ArticleCardProps {
  article: Article;
  featured?: boolean;
}

export function ArticleCard({ article, featured = false }: ArticleCardProps) {
  const formattedDate = formatArticleDate(article.createdAt);

  if (featured) {
    return (
      <Link
        href={`/blog/${article.slug}`}
        className="group relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-xl transition-all duration-300 hover:shadow-2xl hover:border-blue-500/40 flex flex-col lg:flex-row min-h-[380px]"
      >
        {/* Cover Image with gradient overlay */}
        <div className="lg:w-7/12 relative min-h-[260px] lg:min-h-full overflow-hidden">
          <img
            src={article.coverImage}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-slate-900" />
          
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-[#0055FE] text-white text-xs font-black uppercase tracking-wider shadow-md">
              {article.categoryName}
            </span>
            {article.isFeatured && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500 text-slate-950 text-xs font-black uppercase tracking-wider shadow-md">
                <Flame className="w-3.5 h-3.5" /> Tiêu Điểm
              </span>
            )}
          </div>
        </div>

        {/* Content Side */}
        <div className="lg:w-5/12 p-6 sm:p-8 flex flex-col justify-between text-white">
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-xs text-slate-400 font-medium">
              <span>{formattedDate}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> {article.readingTime} phút đọc
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-white group-hover:text-blue-400 transition-colors leading-snug">
              {article.title}
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 line-clamp-3 leading-relaxed">
              {article.excerpt}
            </p>
          </div>

          <div className="pt-6 border-t border-slate-800 flex items-center justify-between mt-4">
            <div className="flex items-center gap-2.5">
              {article.authorAvatar && (
                <img
                  src={article.authorAvatar}
                  alt={article.authorName}
                  className="w-8 h-8 rounded-full object-cover border border-white/20"
                />
              )}
              <div>
                <p className="text-xs font-bold text-white">{article.authorName}</p>
                <p className="text-[10px] text-slate-400">{article.authorRole}</p>
              </div>
            </div>

            <span className="inline-flex items-center gap-1 text-xs font-bold text-[#0055FE] group-hover:translate-x-1 transition-transform">
              <span>Đọc tiếp</span>
              <ArrowRight className="w-4 h-4" />
            </span>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/blog/${article.slug}`}
      className="group flex flex-col bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-xl hover:border-blue-200 transition-all duration-300"
    >
      {/* Thumbnail */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
        <img
          src={article.coverImage}
          alt={article.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          <span className="px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-bold uppercase tracking-wider">
            {article.categoryName}
          </span>
          {article.isFeatured && (
            <span className="p-1 rounded-full bg-amber-400 text-slate-900" title="Bài viết nổi bật">
              <Flame className="w-3 h-3" />
            </span>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium">
            <span>{formattedDate}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" /> {article.readingTime} phút đọc
            </span>
          </div>

          <h3 className="text-base sm:text-lg font-black text-slate-900 group-hover:text-[#0055FE] transition-colors leading-snug line-clamp-2">
            {article.title}
          </h3>

          <p className="text-xs sm:text-sm text-slate-500 line-clamp-2 leading-relaxed">
            {article.excerpt}
          </p>
        </div>

        {/* Footer info */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {article.authorAvatar && (
              <img
                src={article.authorAvatar}
                alt={article.authorName}
                className="w-6 h-6 rounded-full object-cover border border-slate-200"
              />
            )}
            <span className="text-xs font-semibold text-slate-700">{article.authorName}</span>
          </div>

          <span className="text-xs font-bold text-[#0055FE] group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
            <span>Xem</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
