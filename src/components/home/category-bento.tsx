'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { CategorySlug } from '@/types/product';

const CATEGORIES_DATA = [
  {
    slug: 'whey-protein' as CategorySlug,
    title: 'WHEY PROTEIN',
    subtitle: 'Tăng cơ nạc siêu tốc',
    image: 'https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?auto=format&fit=crop&w=800&q=80',
  },
  {
    slug: 'strength-endurance' as CategorySlug,
    title: 'SỨC MẠNH & SỨC BỀN',
    subtitle: 'Pre-Workout & Creatine',
    image: 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?auto=format&fit=crop&w=800&q=80',
  },
  {
    slug: 'vitamins' as CategorySlug,
    title: 'VITAMINS & KHOÁNG CHẤT',
    subtitle: 'Dầu cá & Vi chất hàng ngày',
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80',
  },
];

export function CategoryBento() {
  return (
    <section id="category-bento" className="py-10 sm:py-20 bg-white border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Title */}
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between mb-6 sm:mb-8 gap-1">
          <div>
            <span className="text-[10px] sm:text-[11px] font-bold tracking-[0.2em] text-[#0055FE] uppercase block mb-1">
              BỘ SƯU TẬP W4U
            </span>
            <h2 className="text-xl sm:text-3xl font-black tracking-tight text-slate-950 uppercase font-display">
              3 Dòng Dinh Dưỡng Chủ Lực
            </h2>
          </div>
          <span className="text-xs font-bold text-slate-400">
            Chuẩn khoa học thể thao quốc tế
          </span>
        </div>

        {/* 3-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-8">
          {CATEGORIES_DATA.map((cat) => (
            <div key={cat.slug} className="w-full">
              <Link
                href={`/category/${cat.slug}`}
                className="group relative block h-60 sm:h-80 md:h-96 rounded-3xl overflow-hidden cursor-pointer bg-slate-900 shadow-sm hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-500"
              >
                {/* Background Image */}
                <img
                  src={cat.image}
                  alt={cat.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 brightness-90"
                />

                {/* Dark Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent group-hover:from-blue-950/90 transition-colors duration-500" />

                {/* Bottom Content */}
                <div className="absolute inset-x-0 bottom-0 p-5 sm:p-8 flex items-end justify-between z-10">
                  <div>
                    <p className="text-[11px] sm:text-xs font-extrabold text-[#00D2FF] uppercase tracking-widest">
                      {cat.subtitle}
                    </p>
                    <h3 className="text-lg sm:text-2xl font-black text-white uppercase font-display tracking-tight mt-0.5 sm:mt-1 group-hover:text-blue-100 transition-colors">
                      {cat.title}
                    </h3>
                  </div>

                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white group-hover:bg-[#0055FE] group-hover:text-white transition-all shrink-0 ml-3">
                    <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
