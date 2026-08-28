'use client';

import React, { useState, useEffect } from 'react';
import { ListTree, ChevronRight } from 'lucide-react';

interface TocItem {
  id: string;
  text: string;
}

interface TableOfContentsProps {
  content: string;
}

export function TableOfContents({ content }: TableOfContentsProps) {
  const [headings, setHeadings] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    // Trích xuất các tiêu đề H2 (##)
    const lines = content.split('\n');
    const items: TocItem[] = [];

    lines.forEach((line) => {
      const trimmed = line.trim();
      if (trimmed.startsWith('## ')) {
        const text = trimmed.replace(/^##\s+/, '').replace(/\*\*/g, '').trim();
        const id = text
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9\s-]/g, '')
          .trim()
          .replace(/\s+/g, '-');
        items.push({ id, text });
      }
    });

    setHeadings(items);
  }, [content]);

  useEffect(() => {
    const handleScroll = () => {
      const headingElements = headings.map((h) => document.getElementById(h.id)).filter(Boolean);
      const scrollPosition = window.scrollY + 140;

      for (let i = headingElements.length - 1; i >= 0; i--) {
        const el = headingElements[i];
        if (el && el.offsetTop <= scrollPosition) {
          setActiveId(el.id);
          return;
        }
      }
      if (headings.length > 0) {
        setActiveId(headings[0].id);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [headings]);

  if (headings.length === 0) return null;

  const scrollToHeading = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-3">
      <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
        <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#0055FE] flex items-center justify-center">
          <ListTree className="w-4 h-4" />
        </div>
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
          Mục Lục Bài Viết
        </h3>
      </div>

      <nav className="space-y-1.5 text-xs">
        {headings.map((h, idx) => {
          const isActive = activeId === h.id;
          return (
            <button
              key={idx}
              onClick={() => scrollToHeading(h.id)}
              className={`w-full text-left py-1.5 px-2.5 rounded-xl transition-all flex items-start gap-2 cursor-pointer ${
                isActive
                  ? 'bg-blue-50 text-[#0055FE] font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <ChevronRight
                className={`w-3.5 h-3.5 mt-0.5 shrink-0 transition-transform ${
                  isActive ? 'text-[#0055FE] translate-x-0.5' : 'text-slate-300'
                }`}
              />
              <span className="line-clamp-2 leading-relaxed">{h.text}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
