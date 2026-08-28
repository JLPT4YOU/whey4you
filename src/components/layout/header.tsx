'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createPortal } from 'react-dom';
import { 
  ShoppingBag, 
  Search, 
  X, 
  ArrowRight, 
  Menu, 
  Truck, 
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Dumbbell,
  Zap,
  Pill,
  BookOpen
} from 'lucide-react';
import { useCart } from '@/context/cart-context';
import { Logo } from '@/components/ui/logo';
import { Product } from '@/types/product';

interface HeaderProps {
  initialProducts?: Product[];
}

export function Header({ initialProducts = [] }: HeaderProps) {
  const pathname = usePathname();
  const { totalItems, setIsCartOpen, setQuickViewProduct } = useCart();
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mounted, setMounted] = useState(false);
  const [allProducts, setAllProducts] = useState<Product[]>(initialProducts);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close mobile drawer and search on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  // Prevent background scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    if (initialProducts && initialProducts.length > 0) {
      setAllProducts(initialProducts);
      return;
    }

    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          setAllProducts(data.data);
        }
      })
      .catch(() => {});
  }, [initialProducts]);

  const searchResults = searchQuery.trim()
    ? allProducts.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.categoryName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (p.flavors || []).some((f) => f.toLowerCase().includes(searchQuery.toLowerCase()))
      ).slice(0, 4)
    : [];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-slate-100 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Left: Official W4U Brand Logo */}
          <Link href="/" className="group flex items-center shrink-0">
            <Logo size="md" />
          </Link>

          {/* Center: Desktop Navigation Links (Clean & Consistent) */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-8 text-xs sm:text-sm font-bold tracking-tight text-slate-700">
            <Link 
              href="/category/whey-protein" 
              className={`hover:text-[#0055FE] transition-colors py-1 ${
                pathname === '/category/whey-protein' ? 'text-[#0055FE]' : ''
              }`}
            >
              Whey Protein
            </Link>
            <Link 
              href="/category/strength-endurance" 
              className={`hover:text-[#0055FE] transition-colors py-1 ${
                pathname === '/category/strength-endurance' ? 'text-[#0055FE]' : ''
              }`}
            >
              Sức Mạnh & Sức Bền
            </Link>
            <Link 
              href="/category/vitamins" 
              className={`hover:text-[#0055FE] transition-colors py-1 ${
                pathname === '/category/vitamins' ? 'text-[#0055FE]' : ''
              }`}
            >
              Vitamins & Khoáng Chất
            </Link>
            <Link 
              href="/blog" 
              className={`hover:text-[#0055FE] transition-colors py-1 ${
                pathname.startsWith('/blog') ? 'text-[#0055FE]' : ''
              }`}
            >
              Kiến Thức Dinh Dưỡng
            </Link>
            <Link 
              href="/tra-cuu-don-hang" 
              className={`hover:text-[#0055FE] transition-colors py-1 ${
                pathname === '/tra-cuu-don-hang' ? 'text-[#0055FE]' : ''
              }`}
            >
              Tra Cứu Đơn Hàng
            </Link>
          </nav>

          {/* Right Action Icons */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            
            {/* Search Trigger */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 sm:p-2.5 text-slate-700 hover:text-[#0055FE] hover:bg-blue-50/60 rounded-full transition-colors cursor-pointer"
              aria-label="Tìm kiếm sản phẩm"
            >
              <Search className="w-5 h-5 stroke-[2]" />
            </button>

            {/* Bag / Cart Icon */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 sm:p-2.5 text-slate-900 hover:text-[#0055FE] hover:bg-blue-50/60 rounded-full transition-colors flex items-center cursor-pointer"
              aria-label="Túi hàng"
            >
              <ShoppingBag className="w-5 h-5 stroke-[2]" />
              {totalItems > 0 && (
                <span className="absolute top-0.5 sm:top-1 right-0.5 sm:right-1 bg-[#0055FE] text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center animate-pulse-glow">
                  {totalItems}
                </span>
              )}
            </button>

            {/* Mobile / Tablet Hamburger Menu Button (Right aligned) */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 text-slate-800 hover:text-[#0055FE] hover:bg-blue-50/60 rounded-xl transition-colors cursor-pointer ml-0.5"
              aria-label="Mở menu danh mục"
            >
              <Menu className="w-5 h-5 stroke-[2.2]" />
            </button>

          </div>

        </div>
      </div>

      {/* Expandable Search Modal */}
      {searchOpen && (
        <div className="border-t border-slate-100 bg-white/95 backdrop-blur-2xl px-4 sm:px-6 py-4 sm:py-6 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="max-w-3xl mx-auto">
            <div className="relative flex items-center">
              <Search className="w-5 h-5 text-slate-400 absolute left-0" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm Whey, Creatine, Pre-Workout, Omega-3..."
                className="w-full pl-8 pr-10 py-2.5 text-base font-semibold text-slate-900 placeholder-slate-400 bg-transparent border-b border-slate-200 focus:border-[#0055FE] outline-none transition-colors"
              />
              <button
                onClick={() => {
                  setSearchOpen(false);
                  setSearchQuery('');
                }}
                className="p-1 text-slate-400 hover:text-slate-900 absolute right-0 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Results */}
            {searchResults.length > 0 && (
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 max-h-64 overflow-y-auto">
                {searchResults.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      setQuickViewProduct(item);
                      setSearchOpen(false);
                    }}
                    className="p-2.5 sm:p-3 hover:bg-blue-50/50 rounded-2xl flex items-center gap-3 cursor-pointer transition-colors border border-transparent hover:border-blue-100 bg-slate-50/60 sm:bg-transparent"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-11 h-11 sm:w-12 sm:h-12 object-contain bg-white rounded-xl p-1 border border-slate-100 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {item.name}
                      </p>
                      <p className="text-xs text-[#0055FE] font-bold">
                        {item.price.toLocaleString('vi-VN')}₫
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mobile Navigation Drawer rendered in React Portal directly on document.body */}
      {mounted && mobileMenuOpen && createPortal(
        <div className="fixed inset-0 z-[100] lg:hidden overflow-hidden">
          {/* Full Screen Backdrop */}
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
          />

          {/* Slide-out Drawer from Right */}
          <div className="fixed inset-y-0 right-0 w-[85vw] max-w-sm h-full bg-white shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-300">
            {/* Drawer Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80 shrink-0">
              <Link href="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center">
                <Logo size="md" />
              </Link>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-900 rounded-full transition-colors cursor-pointer"
                aria-label="Đóng menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Content (Identical consistent list of 5 main links) */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              
              <div className="space-y-1">
                <p className="text-[11px] font-black uppercase tracking-wider text-slate-400 px-3 mb-2">
                  Danh Mục & Menu
                </p>

                {/* 1. Whey Protein */}
                <Link
                  href="/category/whey-protein"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between p-3 rounded-2xl font-bold text-sm transition-colors ${
                    pathname === '/category/whey-protein'
                      ? 'bg-blue-50 text-[#0055FE]'
                      : 'text-slate-800 hover:bg-slate-50 hover:text-[#0055FE]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-blue-100 text-[#0055FE] flex items-center justify-center">
                      <Dumbbell className="w-4 h-4" />
                    </div>
                    <span>Whey Protein</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </Link>

                {/* 2. Sức Mạnh & Sức Bền */}
                <Link
                  href="/category/strength-endurance"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between p-3 rounded-2xl font-bold text-sm transition-colors ${
                    pathname === '/category/strength-endurance'
                      ? 'bg-blue-50 text-[#0055FE]'
                      : 'text-slate-800 hover:bg-slate-50 hover:text-[#0055FE]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                      <Zap className="w-4 h-4" />
                    </div>
                    <span>Sức Mạnh & Sức Bền</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </Link>

                {/* 3. Vitamins & Khoáng Chất */}
                <Link
                  href="/category/vitamins"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between p-3 rounded-2xl font-bold text-sm transition-colors ${
                    pathname === '/category/vitamins'
                      ? 'bg-blue-50 text-[#0055FE]'
                      : 'text-slate-800 hover:bg-slate-50 hover:text-[#0055FE]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                      <Pill className="w-4 h-4" />
                    </div>
                    <span>Vitamins & Khoáng Chất</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </Link>

                {/* 4. Kiến Thức Dinh Dưỡng */}
                <Link
                  href="/blog"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between p-3 rounded-2xl font-bold text-sm transition-colors ${
                    pathname.startsWith('/blog')
                      ? 'bg-blue-50 text-[#0055FE]'
                      : 'text-slate-800 hover:bg-slate-50 hover:text-[#0055FE]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <span>Kiến Thức Dinh Dưỡng</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </Link>

                {/* 5. Tra Cứu Đơn Hàng */}
                <Link
                  href="/tra-cuu-don-hang"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between p-3 rounded-2xl font-bold text-sm transition-colors ${
                    pathname === '/tra-cuu-don-hang'
                      ? 'bg-blue-50 text-[#0055FE]'
                      : 'text-slate-800 hover:bg-slate-50 hover:text-[#0055FE]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-orange-100 text-[#EE4D2D] flex items-center justify-center">
                      <Truck className="w-4 h-4" />
                    </div>
                    <span>Tra Cứu Đơn Hàng</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </Link>
              </div>

              {/* 100% Genuine Guarantee banner */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-black text-[#0055FE]">
                  <ShieldCheck className="w-4 h-4" />
                  <span>100% CHÍNH HÃNG</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-snug">
                  Cam kết chất lượng quốc tế, hoàn tiền 200% nếu phát hiện hàng không đạt chuẩn.
                </p>
              </div>

            </div>

            {/* Drawer Footer / Direct Contacts */}
            <div className="p-5 border-t border-slate-100 bg-slate-50/90 space-y-3 shrink-0">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Hotline hỗ trợ 24/7:</span>
                <a href="tel:19008888" className="font-extrabold text-[#0055FE]">
                  1900 8888
                </a>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <a
                  href="https://zalo.me/g/hqwqsqcnpgik9n3zo0nk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 px-3 rounded-xl bg-[#0068FF] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <span>Chat Zalo</span>
                  <ExternalLink className="w-3 h-3" />
                </a>

                <a
                  href="https://www.facebook.com/p/Whey4You-61563177707517/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 px-3 rounded-xl bg-[#1877F2] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <span>Facebook</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </header>
  );
}
