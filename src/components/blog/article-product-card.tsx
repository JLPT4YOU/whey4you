'use client';

import React from 'react';
import { ShoppingBag, Zap } from 'lucide-react';
import { Product } from '@/types/product';
import { useCart } from '@/context/cart-context';

interface ArticleProductCardProps {
  product: Product;
  variant?: 'inline' | 'sidebar';
}

export function ArticleProductCard({ product, variant = 'inline' }: ArticleProductCardProps) {
  const { setQuickViewProduct } = useCart();

  const handleOpenSelector = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setQuickViewProduct(product);
  };

  const isOutOfStock = product.inStock === false;

  if (variant === 'sidebar') {
    return (
      <div className="group bg-white rounded-2xl border border-slate-100 p-3.5 shadow-sm hover:shadow-md transition-all flex flex-col">
        <div 
          onClick={handleOpenSelector}
          className="relative aspect-square w-full rounded-xl overflow-hidden bg-slate-50 mb-3 cursor-pointer"
        >
          <img
            src={product.image}
            alt={product.name}
            className={`w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300 ${
              isOutOfStock ? 'grayscale opacity-75' : ''
            }`}
          />
          {isOutOfStock ? (
            <span className="absolute top-2 left-2 bg-rose-600 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full shadow-xs">
              Hết Hàng
            </span>
          ) : (
            product.badge && (
              <span className="absolute top-2 left-2 bg-[#0055FE] text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full shadow-xs">
                {product.badge}
              </span>
            )
          )}
        </div>

        <div className="flex-1 flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold text-[#0055FE] uppercase tracking-wider">
              {product.categoryName}
            </span>
            <h4 
              onClick={handleOpenSelector}
              className="text-xs font-bold text-slate-900 line-clamp-2 mt-0.5 group-hover:text-[#0055FE] transition-colors cursor-pointer"
            >
              {product.name}
            </h4>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-sm font-black text-slate-900">
                {product.price.toLocaleString('vi-VN')}₫
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-[11px] text-slate-400 line-through">
                  {product.originalPrice.toLocaleString('vi-VN')}₫
                </span>
              )}
            </div>
          </div>

          <div className="mt-3">
            {isOutOfStock ? (
              <span className="w-full flex items-center justify-center py-2 px-3 bg-slate-100 text-slate-400 text-xs font-bold rounded-xl cursor-not-allowed">
                Tạm Hết Hàng
              </span>
            ) : (
              <button
                onClick={handleOpenSelector}
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-[#0055FE] hover:bg-blue-600 active:scale-95 text-white text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Mua Ngay</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="my-8 p-4 sm:p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-[#08183A] to-slate-900 text-white border border-slate-800 shadow-xl overflow-hidden relative group">
      {/* Background Accent Glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex items-center gap-2 mb-4 text-xs font-black uppercase tracking-wider text-blue-400">
        <Zap className="w-4 h-4 text-yellow-400 fill-yellow-400" />
        <span>Sản Phẩm Đề Xuất Cho Bài Viết Này</span>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-5 sm:gap-6">
        {/* Product Image */}
        <div 
          onClick={handleOpenSelector}
          className="relative w-36 h-36 sm:w-44 sm:h-44 shrink-0 rounded-2xl bg-white/5 p-3 backdrop-blur-md border border-white/10 flex items-center justify-center cursor-pointer"
        >
          <img
            src={product.image}
            alt={product.name}
            className={`w-full h-full object-contain group-hover:scale-105 transition-transform duration-300 ${
              isOutOfStock ? 'grayscale opacity-75' : ''
            }`}
          />
          {isOutOfStock ? (
            <span className="absolute top-2 left-2 bg-rose-600 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full shadow-sm">
              Hết Hàng
            </span>
          ) : (
            product.badge && (
              <span className="absolute top-2 left-2 bg-[#0055FE] text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full shadow-sm">
                {product.badge}
              </span>
            )
          )}
        </div>

        {/* Product Details */}
        <div className="flex-1 text-center sm:text-left space-y-2">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <span className="text-[11px] font-bold text-blue-300 uppercase tracking-wider">
              {product.categoryName}
            </span>
          </div>

          <h3 
            onClick={handleOpenSelector}
            className="text-base sm:text-lg font-black text-white leading-snug cursor-pointer hover:text-blue-300 transition-colors"
          >
            {product.name}
          </h3>

          <p className="text-xs text-white/70 line-clamp-2 leading-relaxed">
            {product.tagline || product.description}
          </p>

          {/* Macro Highlights */}
          {product.macros && product.macros.length > 0 && (
            <div className="flex items-center justify-center sm:justify-start gap-2 pt-1 flex-wrap">
              {product.macros.slice(0, 3).map((m, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-0.5 rounded-lg bg-white/10 text-white text-[11px] font-bold border border-white/10"
                >
                  {m.label}: <strong className="text-blue-300">{m.value}</strong>
                </span>
              ))}
            </div>
          )}

          {/* Pricing & CTA */}
          <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-baseline justify-center sm:justify-start gap-2">
              <span className="text-xl font-black text-white">
                {product.price.toLocaleString('vi-VN')}₫
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-xs text-white/50 line-through">
                  {product.originalPrice.toLocaleString('vi-VN')}₫
                </span>
              )}
            </div>

            <div className="flex items-center justify-center sm:justify-start gap-2">
              {isOutOfStock ? (
                <span className="px-6 py-2.5 rounded-xl bg-white/10 text-white/60 text-xs font-bold cursor-not-allowed">
                  Tạm Hết Hàng
                </span>
              ) : (
                <button
                  onClick={handleOpenSelector}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#0055FE] to-blue-600 hover:from-blue-600 hover:to-blue-700 active:scale-95 text-white text-xs sm:text-sm font-black shadow-lg shadow-blue-500/30 transition-all cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Mua Ngay</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

