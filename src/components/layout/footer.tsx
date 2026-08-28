import React from 'react';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import { Logo } from '@/components/ui/logo';

export function Footer() {
  return (
    <footer className="bg-[#08183A] text-slate-300 border-t border-slate-800 text-xs py-10 sm:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Directory */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 pb-10 sm:pb-12 border-b border-slate-800">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-3.5 sm:space-y-4">
            <Logo size="lg" onDark />
            <p className="text-slate-400 leading-relaxed text-xs max-w-sm">
              Thực phẩm bổ sung thể hình cao cấp — 100% Whey Isolate, Dầu cá Omega-3 chuẩn IFOS & Vitamins chính hãng.
            </p>
            <div className="pt-1 text-[11px] text-slate-400 space-y-1">
              <p>Hotline tư vấn: <strong className="text-white">1900 8888</strong> (8h - 22h)</p>
              <p>
                Email:{' '}
                <a
                  href="mailto:whey4you.owner@gmail.com"
                  className="text-[#00D2FF] hover:underline font-semibold"
                >
                  whey4you.owner@gmail.com
                </a>
              </p>
            </div>
          </div>

          {/* 3 Categories */}
          <div className="space-y-3">
            <p className="font-bold text-white uppercase tracking-wider text-[11px]">
              Sản Phẩm
            </p>
            <ul className="space-y-2 text-slate-400">
              <li><Link href="/category/whey-protein" className="hover:text-white transition-colors">Whey Protein</Link></li>
              <li><Link href="/category/strength-endurance" className="hover:text-white transition-colors">Sức Mạnh & Sức Bền</Link></li>
              <li><Link href="/category/vitamins" className="hover:text-white transition-colors">Vitamins & Khoáng Chất</Link></li>
              <li><Link href="/blog" className="text-blue-400 hover:text-white transition-colors font-bold">Kiến Thức Dinh Dưỡng</Link></li>
            </ul>
          </div>

          {/* Contact & Social Channels */}
          <div className="space-y-3">
            <p className="font-bold text-white uppercase tracking-wider text-[11px]">
              Liên Hệ & Hỗ Trợ
            </p>
            <ul className="space-y-2.5 text-slate-400">
              <li>
                <a
                  href="https://www.facebook.com/p/Whey4You-61563177707517/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors flex items-center gap-2 group"
                >
                  <span className="w-5 h-5 rounded-full bg-[#1877F2] text-white flex items-center justify-center text-[10px] font-black shrink-0">
                    f
                  </span>
                  <span>Facebook Fanpage</span>
                  <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-white transition-colors" />
                </a>
              </li>
              <li>
                <a
                  href="https://zalo.me/g/hqwqsqcnpgik9n3zo0nk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors flex items-center gap-2 group"
                >
                  <span className="w-5 h-5 rounded-full bg-[#0068FF] text-white flex items-center justify-center text-[10px] font-black shrink-0">
                    Z
                  </span>
                  <span>Zalo Group Tư Vấn</span>
                  <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-white transition-colors" />
                </a>
              </li>
              <li>
                <Link
                  href="/tra-cuu-don-hang"
                  className="hover:text-white transition-colors flex items-center gap-2 group"
                >
                  <span className="w-5 h-5 rounded-full bg-slate-700 text-white flex items-center justify-center shrink-0">
                    📦
                  </span>
                  <span>Tra Cứu Đơn Hàng</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Guarantee */}
          <div className="space-y-3">
            <p className="font-bold text-white uppercase tracking-wider text-[11px]">
              Bảo Đảm
            </p>
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1">
              <span className="text-[#00D2FF] font-black text-xs block">
                ★ 100% CHÍNH HÃNG
              </span>
              <p className="text-[11px] text-slate-400 leading-snug">
                Hoàn tiền 200% nếu phát hiện sản phẩm không đạt chuẩn.
              </p>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-6 sm:pt-8 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 text-slate-500 text-[11px] text-center sm:text-left">
          <p>© 2026 W4U - WHEY4YOU. All rights reserved. Fuel Your Goals.</p>
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            <a href="#" className="hover:text-white transition-colors">Quyền riêng tư</a>
            <a href="#" className="hover:text-white transition-colors">Điều khoản dịch vụ</a>
            <a href="#" className="hover:text-white transition-colors">Showroom</a>
          </div>
        </div>

      </div>
    </footer>
  );
}
