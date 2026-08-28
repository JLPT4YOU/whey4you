'use client';

import React from 'react';
import { RotateCcw } from 'lucide-react';
import { CategorySlug, Product } from '@/types/product';

export interface FilterState {
  category: CategorySlug;
  priceRange: 'all' | 'under-500' | '500-1000' | 'above-1000';
}

const CATEGORIES = [
  { id: 'all', name: 'Tất Cả Sản Phẩm', slug: 'all' },
  { id: 'whey-protein', name: 'Whey Protein', slug: 'whey-protein' },
  { id: 'strength-endurance', name: 'Sức Mạnh & Sức Bền', slug: 'strength-endurance' },
  { id: 'vitamins', name: 'Vitamins & Khoáng Chất', slug: 'vitamins' },
];

interface CategorySidebarProps {
  filters: FilterState;
  onFilterChange: (newFilters: Partial<FilterState>) => void;
  onResetFilters: () => void;
  products?: Product[];
}

export function CategorySidebar({
  filters,
  onFilterChange,
  onResetFilters,
  products = [],
}: CategorySidebarProps) {
  const getCategoryCount = (slug: string) => {
    if (slug === 'all') return products.length;
    return products.filter((p) => p.category === slug).length;
  };

  const isFiltered =
    filters.category !== 'all' ||
    filters.priceRange !== 'all';

  return (
    <aside className="w-full space-y-8 select-none text-xs">
      
      {/* 1. Danh Mục Sản Phẩm (3 Danh Mục Chính) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-extrabold text-[11px] uppercase tracking-widest text-neutral-400 font-display">
            Danh Mục W4U
          </span>
          {isFiltered && (
            <button
              onClick={onResetFilters}
              className="text-[11px] font-bold text-neutral-500 hover:text-black transition-colors flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              Xóa bộ lọc
            </button>
          )}
        </div>

        <ul className="space-y-2">
          {CATEGORIES.map((cat) => {
            const isActive = filters.category === cat.slug;
            const count = getCategoryCount(cat.slug);

            return (
              <li key={cat.id}>
                <button
                  onClick={() => onFilterChange({ category: cat.slug as CategorySlug })}
                  className={`w-full flex items-center justify-between py-1 text-left transition-colors ${
                    isActive
                      ? 'font-black text-black text-sm tracking-tight'
                      : 'font-medium text-neutral-600 hover:text-black'
                  }`}
                >
                  <span>{cat.name}</span>
                  <span className="text-[11px] text-neutral-400 font-normal">
                    {count}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* 2. Khoảng Giá */}
      <div className="space-y-3 pt-6 border-t border-neutral-100">
        <span className="font-extrabold text-[11px] uppercase tracking-widest text-neutral-400 font-display block">
          Khoảng Giá
        </span>

        <ul className="space-y-2">
          {[
            { id: 'all', label: 'Tất cả mức giá' },
            { id: 'under-500', label: 'Dưới 500.000₫' },
            { id: '500-1000', label: '500.000₫ - 1.000.000₫' },
            { id: 'above-1000', label: 'Trên 1.000.000₫' },
          ].map((item) => {
            const isSelected = filters.priceRange === item.id;
            return (
              <li key={item.id}>
                <button
                  onClick={() => onFilterChange({ priceRange: item.id as any })}
                  className={`w-full text-left py-0.5 transition-colors ${
                    isSelected
                      ? 'font-bold text-black'
                      : 'font-medium text-neutral-500 hover:text-black'
                  }`}
                >
                  {item.label}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

    </aside>
  );
}
