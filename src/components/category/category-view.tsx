'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { SlidersHorizontal, X, ArrowUpDown } from 'lucide-react';
import { ProductCard } from '@/components/product/product-card';
import { CategorySidebar, FilterState } from '@/components/category/category-sidebar';
import { CategorySlug, Product } from '@/types/product';

interface CategoryViewProps {
  initialSlug: string;
  initialProducts: Product[];
}

const CATEGORY_NAMES: Record<string, string> = {
  'all': 'TẤT CẢ SẢN PHẨM',
  'whey-protein': 'WHEY PROTEIN',
  'strength-endurance': 'SỨC MẠNH & SỨC BỀN',
  'vitamins': 'VITAMINS & KHOÁNG CHẤT',
};

export function CategoryView({ initialSlug, initialProducts }: CategoryViewProps) {
  const [filters, setFilters] = useState<FilterState>({
    category: (initialSlug as CategorySlug) || 'all',
    priceRange: 'all',
  });

  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating'>('featured');
  const [showSidebar, setShowSidebar] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const [allProducts, setAllProducts] = useState<Product[]>(
    initialProducts || []
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent background scroll when mobile filter is open
  useEffect(() => {
    if (mobileFilterOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileFilterOpen]);

  useEffect(() => {
    if (initialSlug) {
      setFilters((prev) => ({ ...prev, category: initialSlug as CategorySlug }));
    }
  }, [initialSlug]);

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

  const handleFilterChange = (newFilters: Partial<FilterState>) => {
    if (newFilters.category && newFilters.category !== filters.category) {
      try {
        window.history.replaceState(null, '', `/category/${newFilters.category}`);
      } catch {}
    }
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleResetFilters = () => {
    try {
      window.history.replaceState(null, '', '/category/all');
    } catch {}
    setFilters({
      category: 'all',
      priceRange: 'all',
    });
  };

  // Filter products
  const filteredProducts = allProducts.filter((product) => {
    if (filters.category !== 'all' && product.category !== filters.category) {
      return false;
    }
    if (filters.priceRange === 'under-500' && product.price >= 500000) return false;
    if (filters.priceRange === '500-1000' && (product.price < 500000 || product.price > 1000000)) return false;
    if (filters.priceRange === 'above-1000' && product.price <= 1000000) return false;

    return true;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    if (sortBy === 'rating') return b.rating - a.rating;
    return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
  });

  const currentCategoryTitle = CATEGORY_NAMES[filters.category] || 'SẢN PHẨM';
  const hasActiveFilters = filters.category !== 'all' || filters.priceRange !== 'all';

  return (
    <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
      {/* Top Minimal Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between pb-4 sm:pb-6 border-b border-neutral-100 mb-6 sm:mb-8 gap-3">
        <div>
          <h1 className="text-lg sm:text-2xl font-black text-black uppercase font-display tracking-tight">
            {currentCategoryTitle} <span className="text-slate-400 font-bold text-sm sm:text-lg">({sortedProducts.length})</span>
          </h1>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-6 text-xs font-semibold">
          {/* Toggle Sidebar (Desktop) */}
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="hidden lg:flex items-center gap-1.5 text-neutral-600 hover:text-black transition-colors cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>{showSidebar ? 'Ẩn Bộ Lọc' : 'Hiện Bộ Lọc'}</span>
          </button>

          {/* Mobile Filter Button */}
          <button
            onClick={() => setMobileFilterOpen(true)}
            className={`lg:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all text-xs font-bold cursor-pointer ${
              hasActiveFilters
                ? 'bg-blue-50 text-[#0055FE] border-blue-200 shadow-2xs'
                : 'bg-slate-50 text-slate-800 border-slate-200'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#0055FE]" />
            <span>Bộ Lọc</span>
            {hasActiveFilters && (
              <span className="w-1.5 h-1.5 rounded-full bg-[#0055FE]" />
            )}
          </button>

          {/* Clean Sort Selector */}
          <div className="flex items-center gap-1.5 bg-slate-50 sm:bg-transparent px-2.5 sm:px-0 py-1.5 sm:py-0 rounded-xl sm:rounded-none border sm:border-0 border-slate-200">
            <ArrowUpDown className="w-3 h-3 text-slate-400 sm:hidden" />
            <span className="text-neutral-400 font-medium hidden sm:inline">Sắp xếp theo:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent font-bold text-black focus:outline-none cursor-pointer text-xs"
            >
              <option value="featured">Nổi bật</option>
              <option value="rating">Đánh giá cao</option>
              <option value="price-asc">Giá: Thấp đến Cao</option>
              <option value="price-desc">Giá: Cao đến Thấp</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content Layout */}
      <div className="flex gap-8 lg:gap-10">
        {/* Left Minimalist Sidebar (Desktop) */}
        {showSidebar && (
          <div className="hidden lg:block w-56 shrink-0">
            <div className="sticky top-28">
              <CategorySidebar
                filters={filters}
                onFilterChange={handleFilterChange}
                onResetFilters={handleResetFilters}
                products={allProducts}
              />
            </div>
          </div>
        )}

        {/* Right Products Grid (2 cols on mobile, 3-4 cols on desktop) */}
        <div className="flex-1 min-w-0">
          {sortedProducts.length > 0 ? (
            <div
              className={`grid grid-cols-2 ${
                showSidebar ? 'lg:grid-cols-3' : 'lg:grid-cols-4'
              } gap-x-3 sm:gap-x-6 gap-y-6 sm:gap-y-12`}
            >
              {sortedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="py-16 sm:py-20 text-center space-y-3 bg-slate-50 rounded-3xl p-6">
              <p className="text-sm font-bold text-slate-900">
                Không tìm thấy sản phẩm phù hợp với bộ lọc hiện tại.
              </p>
              <button
                onClick={handleResetFilters}
                className="px-6 py-2.5 bg-[#0055FE] text-white text-xs font-bold rounded-full hover:bg-blue-600 transition-colors shadow-xs cursor-pointer"
              >
                Xóa tất cả bộ lọc
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filter Drawer rendered in Portal on document.body */}
      {mounted && mobileFilterOpen && createPortal(
        <div className="fixed inset-0 z-[100] lg:hidden overflow-hidden">
          {/* Backdrop */}
          <div
            onClick={() => setMobileFilterOpen(false)}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
          />
          
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10 z-10">
            <div className="w-screen max-w-xs h-full bg-white p-5 sm:p-6 overflow-y-auto flex flex-col justify-between shadow-2xl animate-in slide-in-from-right duration-300">
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
                  <span className="text-sm font-black text-black font-display uppercase">
                    Bộ Lọc Sản Phẩm
                  </span>
                  <button
                    onClick={() => setMobileFilterOpen(false)}
                    className="p-1.5 text-neutral-400 hover:text-black rounded-full cursor-pointer"
                    aria-label="Đóng bộ lọc"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <CategorySidebar
                  filters={filters}
                  onFilterChange={(newFilters) => {
                    handleFilterChange(newFilters);
                  }}
                  onResetFilters={handleResetFilters}
                  products={allProducts}
                />
              </div>

              <div className="pt-6 border-t border-slate-100 space-y-2 mt-6">
                <button
                  onClick={() => setMobileFilterOpen(false)}
                  className="w-full py-3.5 btn-w4u-primary font-bold text-xs rounded-full shadow-md cursor-pointer"
                >
                  Xem {sortedProducts.length} Sản Phẩm
                </button>
                {hasActiveFilters && (
                  <button
                    onClick={handleResetFilters}
                    className="w-full py-2.5 text-slate-500 hover:text-slate-900 font-bold text-xs rounded-full cursor-pointer"
                  >
                    Xóa Bộ Lọc
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </main>
  );
}
