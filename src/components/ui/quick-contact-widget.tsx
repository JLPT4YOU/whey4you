'use client';

import React from 'react';
import { Mail, MessageCircle } from 'lucide-react';

export function QuickContactWidget() {
  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3 pointer-events-auto">
      
      {/* Zalo Quick Chat Button */}
      <a
        href="https://zalo.me/g/hqwqsqcnpgik9n3zo0nk"
        target="_blank"
        rel="noopener noreferrer"
        className="group flex items-center gap-2.5 bg-[#0068FF] hover:bg-[#0055D4] text-white pl-4 pr-3.5 py-2.5 rounded-full shadow-lg shadow-blue-500/25 transition-all duration-300 hover:scale-105 active:scale-95"
        aria-label="Chat Zalo W4U"
      >
        <span className="text-xs font-bold tracking-tight hidden group-hover:inline-block transition-all">
          Chat Zalo W4U
        </span>
        <div className="w-6 h-6 rounded-full bg-white text-[#0068FF] flex items-center justify-center font-black text-xs">
          Z
        </div>
      </a>

      {/* Facebook Fanpage Button */}
      <a
        href="https://www.facebook.com/p/Whey4You-61563177707517/"
        target="_blank"
        rel="noopener noreferrer"
        className="group flex items-center gap-2.5 bg-[#1877F2] hover:bg-[#1465CE] text-white pl-4 pr-3.5 py-2.5 rounded-full shadow-lg shadow-blue-600/25 transition-all duration-300 hover:scale-105 active:scale-95"
        aria-label="Facebook Fanpage Whey4You"
      >
        <span className="text-xs font-bold tracking-tight hidden group-hover:inline-block transition-all">
          Facebook W4U
        </span>
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      </a>

    </div>
  );
}
