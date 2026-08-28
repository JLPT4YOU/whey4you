'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, 
  ArrowRight, 
  Flame, 
  ChevronLeft, 
  ChevronRight,
  Pause,
  Sparkles
} from 'lucide-react';
import { Article, formatArticleDate } from '@/types/article';

interface FeaturedArticlesCarouselProps {
  articles: Article[];
  autoPlayInterval?: number;
}

export function FeaturedArticlesCarousel({
  articles,
  autoPlayInterval = 5000,
}: FeaturedArticlesCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [direction, setDirection] = useState(1);

  const total = articles.length;

  const nextSlide = useCallback(() => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % total);
  }, [total]);

  const prevSlide = useCallback(() => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  const goToSlide = (index: number) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  };

  useEffect(() => {
    if (total <= 1 || isPaused) return;

    const timer = setInterval(() => {
      nextSlide();
    }, autoPlayInterval);

    return () => clearInterval(timer);
  }, [total, isPaused, autoPlayInterval, nextSlide]);

  if (!articles || articles.length === 0) return null;

  const currentArticle = articles[currentIndex] || articles[0];
  const formattedDate = formatArticleDate(currentArticle.createdAt);

  const slideVariants = {
    enter: (dir: number) => ({
      opacity: 0,
      x: dir > 0 ? 30 : -30,
      scale: 0.98,
    }),
    center: {
      zIndex: 1,
      opacity: 1,
      x: 0,
      scale: 1,
      transition: {
        x: { type: 'spring' as const, stiffness: 300, damping: 30 },
        opacity: { duration: 0.35 },
      },
    },
    exit: (dir: number) => ({
      zIndex: 0,
      opacity: 0,
      x: dir > 0 ? -30 : 30,
      scale: 0.98,
      transition: {
        opacity: { duration: 0.25 },
      },
    }),
  };

  return (
    <div 
      className="space-y-3 sm:space-y-4 select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* 1. MAIN HERO BANNER (Big Featured Slide) */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-950 border border-slate-800 shadow-2xl min-h-[360px] sm:min-h-[460px] flex flex-col">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentArticle.id}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="w-full flex-1 flex flex-col lg:flex-row"
          >
            {/* Cover Image */}
            <div className="lg:w-7/12 relative min-h-[200px] sm:min-h-[320px] lg:min-h-full overflow-hidden">
              <img
                src={currentArticle.coverImage}
                alt={currentArticle.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent lg:bg-gradient-to-r lg:from-transparent lg:via-slate-950/60 lg:to-slate-950" />
              
              {/* Badges */}
              <div className="absolute top-3 left-3 sm:top-4 sm:left-4 flex flex-wrap items-center gap-1.5 sm:gap-2 z-10">
                <span className="px-2.5 sm:px-3.5 py-1 rounded-full bg-[#0055FE] text-white text-[10px] sm:text-xs font-black uppercase tracking-wider shadow-lg shadow-blue-500/30">
                  {currentArticle.categoryName}
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 sm:px-3.5 py-1 rounded-full bg-amber-500 text-slate-950 text-[10px] sm:text-xs font-black uppercase tracking-wider shadow-lg shadow-amber-500/30">
                  <Flame className="w-3.5 h-3.5 fill-slate-950" /> Tiêu Điểm W4U
                </span>
              </div>

              {/* Status */}
              {total > 1 && (
                <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 z-10 hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-md border border-white/10 text-[11px] font-bold text-slate-300">
                  {isPaused ? (
                    <>
                      <Pause className="w-3 h-3 text-amber-400" />
                      <span>Tạm dừng đọc</span>
                    </>
                  ) : (
                    <>
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span>Tự động cuộn ({currentIndex + 1}/{total})</span>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Content Side */}
            <div className="lg:w-5/12 p-4 sm:p-8 lg:p-10 flex flex-col justify-between text-white bg-slate-950 relative z-10">
              <div className="space-y-2.5 sm:space-y-4">
                <div className="flex items-center gap-2 sm:gap-3 text-[11px] sm:text-xs text-slate-400 font-medium">
                  <span className="text-slate-300">{formattedDate}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-blue-400 font-semibold">
                    <Clock className="w-3.5 h-3.5" /> {currentArticle.readingTime} phút đọc
                  </span>
                </div>

                <Link
                  href={`/blog/${currentArticle.slug}`}
                  className="block group/title"
                >
                  <h2 className="text-base sm:text-2xl lg:text-3xl font-black text-white group-hover/title:text-blue-400 transition-colors leading-snug">
                    {currentArticle.title}
                  </h2>
                </Link>

                <p className="text-xs sm:text-sm text-slate-300 line-clamp-2 sm:line-clamp-4 leading-relaxed font-normal">
                  {currentArticle.excerpt}
                </p>

                {currentArticle.tags && currentArticle.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {currentArticle.tags.slice(0, 3).map((tag, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-[10px] sm:text-[11px] font-bold text-slate-300"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Author & Button */}
              <div className="pt-4 sm:pt-6 border-t border-slate-800/80 flex items-center justify-between mt-4 sm:mt-6">
                <div className="flex items-center gap-2.5 sm:gap-3">
                  {currentArticle.authorAvatar ? (
                    <img
                      src={currentArticle.authorAvatar}
                      alt={currentArticle.authorName}
                      className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover border-2 border-[#0055FE]"
                    />
                  ) : (
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#0055FE] flex items-center justify-center font-bold text-white text-xs sm:text-sm">
                      {currentArticle.authorName.charAt(0)}
                    </div>
                  )}
                  <div>
                    <p className="text-xs sm:text-sm font-bold text-white">{currentArticle.authorName}</p>
                    <p className="text-[9px] sm:text-xs text-slate-400 font-medium">{currentArticle.authorRole}</p>
                  </div>
                </div>

                <Link
                  href={`/blog/${currentArticle.slug}`}
                  className="inline-flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-[#0055FE] hover:bg-blue-600 active:scale-95 text-white text-xs sm:text-sm font-black shadow-lg shadow-blue-500/25 transition-all cursor-pointer shrink-0"
                >
                  <span>Khám phá</span>
                  <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </Link>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation bar with Prev/Next buttons */}
        {total > 1 && (
          <div className="px-4 sm:px-6 py-2.5 sm:py-3 bg-slate-950/95 border-t border-slate-800/80 flex items-center justify-between gap-3 z-20">
            <div className="flex items-center gap-1.5 sm:gap-2 text-xs text-slate-400 truncate">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="font-semibold text-slate-300 truncate text-[11px] sm:text-xs">
                Tiêu điểm: <span className="text-white font-bold">{currentArticle.title}</span>
              </span>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <span className="text-[11px] sm:text-xs font-black text-slate-400 font-mono tracking-wider">
                <span className="text-white">0{currentIndex + 1}</span> / 0{total}
              </span>

              <div className="flex items-center gap-1">
                <button
                  onClick={prevSlide}
                  aria-label="Bài viết trước"
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-900 hover:bg-[#0055FE] text-slate-300 hover:text-white border border-slate-800 hover:border-blue-500 flex items-center justify-center transition-all cursor-pointer active:scale-90"
                >
                  <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
                <button
                  onClick={nextSlide}
                  aria-label="Bài viết tiếp theo"
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-900 hover:bg-[#0055FE] text-slate-300 hover:text-white border border-slate-800 hover:border-blue-500 flex items-center justify-center transition-all cursor-pointer active:scale-90"
                >
                  <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 2. CÁC Ô MỤC NHỎ TIÊU ĐIỂM BÊN DƯỚI HERO SECTION */}
      {total > 1 && (
        <div className="space-y-2 pt-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-4">
            {articles.map((art, idx) => {
              const isActive = idx === currentIndex;
              return (
                <div
                  key={art.id}
                  onClick={() => goToSlide(idx)}
                  className={`group/mini relative flex items-center gap-3 p-2.5 sm:p-3 rounded-2xl border transition-all duration-300 cursor-pointer text-left ${
                    isActive
                      ? 'bg-blue-50/90 border-[#0055FE] ring-2 ring-[#0055FE]/30 shadow-md shadow-blue-500/10'
                      : 'bg-white border-slate-200/80 hover:border-blue-300 hover:bg-slate-50 shadow-2xs'
                  }`}
                >
                  {/* Active Indicator */}
                  {isActive && (
                    <span className="absolute top-2 right-2 flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0055FE] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[#0055FE]"></span>
                    </span>
                  )}

                  {/* Thumbnail */}
                  <div className="w-14 h-14 sm:w-18 sm:h-18 rounded-xl overflow-hidden bg-slate-100 shrink-0 relative">
                    <img
                      src={art.coverImage}
                      alt={art.title}
                      className="w-full h-full object-cover group-hover/mini:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-1 left-1">
                      <span className={`px-1.5 py-0.5 rounded-md text-[8px] sm:text-[9px] font-black uppercase ${
                        isActive ? 'bg-[#0055FE] text-white' : 'bg-slate-950/80 text-amber-400'
                      }`}>
                        #{idx + 1}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] sm:text-[10px] font-bold text-[#0055FE] uppercase tracking-wider truncate">
                        {art.categoryName}
                      </span>
                      <span className="text-[9px] sm:text-[10px] text-slate-400 shrink-0">• {art.readingTime}p</span>
                    </div>

                    <h4 className={`text-xs font-bold line-clamp-2 leading-snug transition-colors ${
                      isActive ? 'text-[#0055FE]' : 'text-slate-800 group-hover/mini:text-[#0055FE]'
                    }`}>
                      {art.title}
                    </h4>

                    <p className="text-[9px] sm:text-[10px] text-slate-400 line-clamp-1">
                      {art.excerpt}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
