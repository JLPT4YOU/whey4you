'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronLeft, ChevronRight, Zap, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/context/cart-context';
import { MOCK_PRODUCTS } from '@/data/mock-products';
import { Product } from '@/types/product';

const AUTO_PLAY_INTERVAL = 4500; // 4.5 seconds per product

interface HeroSectionProps {
  initialProducts?: Product[];
}

export function HeroSection({ initialProducts }: HeroSectionProps) {
  const { addToCart, setQuickViewProduct } = useCart();
  
  const [allProducts, setAllProducts] = useState<Product[]>(
    initialProducts && initialProducts.length > 0 ? initialProducts : MOCK_PRODUCTS
  );

  useEffect(() => {
    if (initialProducts && initialProducts.length > 0) return;

    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          setAllProducts(data.data);
        }
      })
      .catch(() => {});
  }, [initialProducts]);

  // Get all featured products from live DB or fallback
  const featuredProducts = allProducts.filter((p) => p.isFeatured).length > 0
    ? allProducts.filter((p) => p.isFeatured)
    : allProducts;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [direction, setDirection] = useState(1); // 1 for next, -1 for prev

  const currentProduct = featuredProducts[currentIndex] || featuredProducts[0];

  const nextSlide = useCallback(() => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % featuredProducts.length);
  }, [featuredProducts.length]);

  const prevSlide = useCallback(() => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + featuredProducts.length) % featuredProducts.length);
  }, [featuredProducts.length]);

  const goToSlide = (index: number) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  };

  // Auto-scroll timer
  useEffect(() => {
    if (isHovered) return;
    const timer = setInterval(() => {
      nextSlide();
    }, AUTO_PLAY_INTERVAL);

    return () => clearInterval(timer);
  }, [isHovered, nextSlide]);

  return (
    <section
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative overflow-hidden bg-white pt-6 pb-12 sm:pt-14 sm:pb-24 select-none"
    >
      {/* Background Radial Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] sm:w-[650px] h-[350px] sm:h-[650px] bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Main Hero Showcase */}
        <div className="flex flex-col items-center text-center space-y-4 sm:space-y-5 max-w-4xl mx-auto">
          
          {/* Subtle Tag */}
          <div className="inline-flex items-center gap-1.5 sm:gap-2 bg-blue-50 text-[#0055FE] px-3.5 sm:px-4 py-1.5 rounded-full border border-blue-100/80 shadow-xs">
            <Zap className="w-3.5 h-3.5 fill-current shrink-0" />
            <span className="text-[10px] sm:text-[11px] font-black tracking-widest uppercase">
              W4U • FUEL YOUR GOALS 2026
            </span>
          </div>

          {/* Bold Universal Headline */}
          <h1 className="text-2xl sm:text-5xl lg:text-6xl font-black tracking-tighter text-slate-950 uppercase font-display leading-[1.05] sm:leading-[0.98]">
            PURE POWER. <br />
            <span className="text-gradient-blue">FUEL YOUR GOALS.</span>
          </h1>

          {/* Dynamic Tagline & Product Name */}
          <div className="min-h-[50px] sm:min-h-[56px] flex flex-col items-center justify-center px-2">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={currentProduct.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                className="space-y-1"
              >
                <p className="text-[11px] sm:text-xs font-black text-[#0055FE] uppercase tracking-widest">
                  {currentProduct.categoryName} • {currentProduct.badge || 'NỔI BẬT'}
                </p>
                <h2 className="text-base sm:text-2xl font-extrabold text-slate-900 font-display tracking-tight line-clamp-1 sm:line-clamp-none">
                  {currentProduct.name}
                </h2>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Minimalist Action Button */}
          <div className="flex items-center justify-center pt-1 w-full max-w-sm sm:max-w-none">
            <button
              onClick={() => setQuickViewProduct(currentProduct)}
              className="btn-w4u-primary px-8 sm:px-10 py-3 sm:py-3.5 font-bold text-xs sm:text-sm rounded-full transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4 shrink-0" />
              <span className="truncate">Mua Ngay • {currentProduct.price.toLocaleString('vi-VN')}₫</span>
            </button>
          </div>

          {/* Product Centerpiece Visual with Carousel Controls */}
          <div className="relative w-full max-w-2xl py-2 sm:py-6 flex items-center justify-center">
            
            {/* Left Chevron Button */}
            <button
              onClick={prevSlide}
              className="absolute left-1 sm:-left-6 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-white/90 hover:bg-[#0055FE] hover:text-white text-slate-700 shadow-md border border-slate-200/80 flex items-center justify-center transition-all z-20 active:scale-90"
              aria-label="Sản phẩm trước"
            >
              <ChevronLeft className="w-4 h-4 sm:w-6 sm:h-6" />
            </button>

            {/* Center Product Image (Slide Transition) */}
            <div
              onClick={() => setQuickViewProduct(currentProduct)}
              className="relative aspect-[16/11] sm:aspect-[16/9] w-full max-w-[280px] sm:max-w-none flex items-center justify-center cursor-pointer group"
            >
              <AnimatePresence mode="wait" custom={direction} initial={false}>
                <motion.img
                  key={currentProduct.id}
                  src={currentProduct.image}
                  alt={currentProduct.name}
                  custom={direction}
                  initial={{ opacity: 0, x: direction * 40, scale: 0.96 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -direction * 40, scale: 0.96 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  className="max-h-52 sm:max-h-full w-auto object-contain drop-shadow-2xl group-hover:scale-105 transition-transform duration-500 animate-float-subtle"
                />
              </AnimatePresence>
            </div>

            {/* Right Chevron Button */}
            <button
              onClick={nextSlide}
              className="absolute right-1 sm:-right-6 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-white/90 hover:bg-[#0055FE] hover:text-white text-slate-700 shadow-md border border-slate-200/80 flex items-center justify-center transition-all z-20 active:scale-90"
              aria-label="Sản phẩm tiếp theo"
            >
              <ChevronRight className="w-4 h-4 sm:w-6 sm:h-6" />
            </button>

          </div>

          {/* Interactive Progress Indicator Tabs (Apple Carousel Style) */}
          <div className="flex items-center justify-center gap-1.5 sm:gap-2 pt-1">
            {featuredProducts.map((p, idx) => {
              const isActive = idx === currentIndex;
              return (
                <button
                  key={p.id}
                  onClick={() => goToSlide(idx)}
                  className={`group relative h-2 rounded-full transition-all duration-300 ${
                    isActive ? 'w-8 sm:w-14 bg-slate-200' : 'w-2 sm:w-3 bg-slate-200 hover:bg-slate-300'
                  }`}
                  aria-label={`Chuyển đến ${p.name}`}
                >
                  {isActive && (
                    <motion.div
                      initial={{ width: '0%' }}
                      animate={{ width: '100%' }}
                      transition={{
                        duration: isHovered ? 0 : AUTO_PLAY_INTERVAL / 1000,
                        ease: 'linear',
                      }}
                      className="h-full bg-[#0055FE] rounded-full"
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Dynamic 4 Minimal Metric Specs per Product */}
          <div className="pt-5 sm:pt-6 border-t border-slate-100 w-full max-w-3xl min-h-[75px] sm:min-h-[85px]">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={`${currentProduct.id}-macros`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-6 text-center"
              >
                {(currentProduct.macros && currentProduct.macros.length > 0
                  ? currentProduct.macros.slice(0, 4)
                  : [
                      { value: '100%', label: 'PURE QUALITY' },
                      { value: 'Lab Tested', label: 'TIÊU CHUẨN' },
                      { value: '0g', label: 'TẠP CHẤT' },
                      { value: '100%', label: 'CHÍNH HÃNG' },
                    ]
                ).map((m, idx) => (
                  <div
                    key={idx}
                    className={`p-2 sm:p-0 rounded-2xl sm:rounded-none border sm:border-0 ${
                      idx % 2 === 1
                        ? 'bg-blue-50/40 sm:bg-transparent border-blue-100/60'
                        : 'bg-slate-50/70 sm:bg-transparent border-slate-100'
                    }`}
                  >
                    <p
                      className={`text-base sm:text-2xl font-black tracking-tight font-display ${
                        idx % 2 === 1 ? 'text-[#0055FE]' : 'text-slate-950'
                      }`}
                    >
                      {m.value}
                    </p>
                    <p className="text-[9px] sm:text-[11px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">
                      {m.label}
                    </p>
                  </div>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>

        </div>

      </div>
    </section>
  );
}
