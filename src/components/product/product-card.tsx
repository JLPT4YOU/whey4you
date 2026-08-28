'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';
import { Product } from '@/types/product';
import { useCart } from '@/context/cart-context';

export function ProductCard({ product }: { product: Product }) {
  const { setQuickViewProduct } = useCart();
  const isOutOfStock = product.inStock === false;

  return (
    <article
      id={product.id}
      className="group relative flex flex-col justify-between transition-all select-none bg-white rounded-2xl sm:rounded-3xl p-2 sm:p-2.5 hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-300 border border-transparent hover:border-blue-100"
    >
      <Link
        href={`/product/${product.slug}`}
        className="block flex-1"
      >
        {/* Product Image Stage */}
        <div className="relative aspect-square w-full rounded-xl sm:rounded-2xl overflow-hidden bg-[#F4F7FC] p-3.5 sm:p-6 lg:p-8 flex items-center justify-center transition-all group-hover:bg-[#EBF1FA]">
          <img
            src={product.image}
            alt={`${product.name} - Thực phẩm thể hình chính hãng Whey4You`}
            loading="lazy"
            className={`w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500 ${
              isOutOfStock ? 'grayscale opacity-75' : ''
            }`}
          />

          {/* Out of Stock Overlay / Badge */}
          {isOutOfStock ? (
            <div className="absolute top-2 left-2 z-10">
              <span className="text-[9px] sm:text-[10px] font-black uppercase text-white bg-rose-600 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full shadow-xs">
                Hết Hàng
              </span>
            </div>
          ) : (
            product.badge && (
              <div className="absolute top-2 left-2 z-10">
                <span className="text-[8px] sm:text-[9px] font-black uppercase text-white bg-[#0055FE] px-2 py-0.5 rounded-full shadow-xs">
                  {product.badge}
                </span>
              </div>
            )
          )}

          {/* Key Macro Tag on Bottom Left */}
          {product.macros && product.macros.length > 0 && !isOutOfStock && (
            <div className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3 z-10 pointer-events-none">
              <span className="text-[9px] sm:text-[11px] font-bold tracking-tight text-[#0055FE] bg-white/90 backdrop-blur-md px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full shadow-xs border border-blue-100 max-w-[120px] truncate block">
                {product.macros[0]?.value} {product.macros[0]?.label}
              </span>
            </div>
          )}
        </div>

        {/* Minimal Details */}
        <div className="mt-2.5 sm:mt-3 space-y-0.5 sm:space-y-1">
          <p className="text-[9px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider truncate">
            {product.categoryName}
          </p>
          <h3 className="font-bold text-xs sm:text-sm text-slate-950 font-display tracking-tight group-hover:text-[#0055FE] transition-colors line-clamp-2 leading-snug">
            {product.name}
          </h3>
        </div>
      </Link>

      {/* Price & Unified Action Button */}
      <div className="mt-2.5 sm:mt-3 pt-2 sm:pt-2.5 border-t border-slate-100 flex items-center justify-between gap-1.5 sm:gap-2">
        <div className="flex flex-col min-w-0">
          <span className="text-xs sm:text-base font-black text-slate-950 font-display truncate">
            {product.price.toLocaleString('vi-VN')}₫
          </span>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="text-[10px] sm:text-xs text-slate-400 line-through truncate">
              {product.originalPrice.toLocaleString('vi-VN')}₫
            </span>
          )}
        </div>

        {isOutOfStock ? (
          <span className="px-2.5 sm:px-3 py-1.5 sm:py-2 bg-slate-100 text-slate-400 text-[10px] sm:text-xs font-bold rounded-xl shrink-0 cursor-not-allowed">
            Hết Hàng
          </span>
        ) : (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setQuickViewProduct(product);
            }}
            className="px-2.5 sm:px-3.5 py-1.5 sm:py-2 bg-[#0055FE] hover:bg-blue-600 active:scale-95 text-white text-[11px] sm:text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1 sm:gap-1.5 cursor-pointer shrink-0"
          >
            <ShoppingBag className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
            <span>Mua Ngay</span>
          </button>
        )}
      </div>
    </article>
  );
}


