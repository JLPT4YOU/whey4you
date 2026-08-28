'use client';

import React, { useState } from 'react';
import { ChevronDown, HelpCircle, Sparkles } from 'lucide-react';
import { CATEGORY_FAQS, FAQItem } from '@/data/category-faqs';

export type { FAQItem };
export { CATEGORY_FAQS };

export function CategoryFaq({ slug }: { slug: string }) {
  const faqs = CATEGORY_FAQS[slug] || CATEGORY_FAQS['all'] || [];
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <section className="mt-12 sm:mt-16 bg-white rounded-3xl p-6 sm:p-10 border border-slate-100 shadow-xs">
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="w-4 h-4 text-[#0055FE]" />
        <span className="text-xs font-black uppercase tracking-wider text-[#0055FE]">
          Hỏi Đáp Chuyên Sâu
        </span>
      </div>

      <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-display tracking-tight mb-6">
        Câu Hỏi Thường Gặp Của Gymer & Khách Hàng
      </h2>

      <div className="space-y-3">
        {faqs.map((faq, idx) => {
          const isOpen = openIdx === idx;
          return (
            <div
              key={idx}
              className="border border-slate-100 rounded-2xl overflow-hidden transition-colors bg-[#FAFBFD]"
            >
              <button
                type="button"
                onClick={() => setOpenIdx(isOpen ? null : idx)}
                className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-bold text-xs sm:text-sm text-slate-900 cursor-pointer hover:text-[#0055FE] transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <HelpCircle className="w-4 h-4 text-[#0055FE] shrink-0" />
                  <span>{faq.question}</span>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                    isOpen ? 'rotate-180 text-[#0055FE]' : ''
                  }`}
                />
              </button>

              {isOpen && (
                <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100/80">
                  <p>{faq.answer}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
