'use client';

import React, { useState, useEffect } from 'react';
import { X, Check, ShoppingBag, ShieldCheck, Box, Award } from 'lucide-react';
import { useCart } from '@/context/cart-context';

export function QuickViewModal() {
  const { quickViewProduct, setQuickViewProduct, addToCart } = useCart();
  const [selectedFlavor, setSelectedFlavor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  const [activeImgIndex, setActiveImgIndex] = useState(0);

  // Prevent background scroll when modal is open
  useEffect(() => {
    if (quickViewProduct) {
      document.body.style.overflow = 'hidden';
      setSelectedFlavor(quickViewProduct.flavors?.[0] || '');
      setSelectedSize(quickViewProduct.sizes?.[0] || '');
      setQuantity(1);
      setActiveImgIndex(0);
      setIsAdded(false);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [quickViewProduct]);

  if (!quickViewProduct) return null;

  const galleryImages: string[] = quickViewProduct.images && quickViewProduct.images.length > 0
    ? quickViewProduct.images
    : (quickViewProduct.image ? [quickViewProduct.image] : []);

  const activeImage = galleryImages[activeImgIndex] || quickViewProduct.image;

  const matchedVariant = quickViewProduct.sizeVariants?.find((v) => v.name === selectedSize);
  const currentPrice = matchedVariant && matchedVariant.price ? matchedVariant.price : quickViewProduct.price;
  const currentOriginalPrice = matchedVariant?.originalPrice || (matchedVariant?.price && quickViewProduct.originalPrice ? Math.round(quickViewProduct.originalPrice * (matchedVariant.price / quickViewProduct.price)) : quickViewProduct.originalPrice);

  const isProductOutOfStock = quickViewProduct.inStock === false;
  const isSizeOutOfStock = matchedVariant ? matchedVariant.inStock === false : false;
  const isOutOfStock = isProductOutOfStock || isSizeOutOfStock;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addToCart(quickViewProduct, quantity, selectedFlavor, selectedSize, currentPrice);
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
      setQuickViewProduct(null);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-2.5 sm:p-4 md:p-6 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        onClick={() => setQuickViewProduct(null)}
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-md transition-opacity"
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg sm:max-w-2xl md:max-w-3xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden z-10 border border-slate-100 animate-in zoom-in-95 duration-200 max-h-[90vh] sm:max-h-[85vh] md:max-h-[90vh] flex flex-col sm:flex-row my-auto">
        
        {/* Close Button */}
        <button
          onClick={() => setQuickViewProduct(null)}
          className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 md:top-4 md:right-4 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-100/90 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors z-30 cursor-pointer flex items-center justify-center shadow-xs"
          aria-label="Đóng"
        >
          <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>

        {/* Left: Product Image Stage */}
        <div className="p-2.5 sm:p-4 md:p-6 bg-[#F4F7FC] flex flex-col items-center justify-center relative sm:w-5/12 shrink-0 border-b sm:border-b-0 sm:border-r border-slate-100">
          <div className="relative w-full h-32 sm:h-auto sm:aspect-square flex items-center justify-center overflow-hidden">
            <img
              key={activeImage}
              src={activeImage}
              alt={quickViewProduct.name}
              className={`max-h-28 sm:max-h-48 md:max-h-56 w-auto object-contain mix-blend-multiply drop-shadow-xl transition-all duration-300 ${
                isOutOfStock ? 'grayscale opacity-75' : ''
              }`}
            />
          </div>

          {/* Quick View Mini Thumbnails */}
          {galleryImages.length > 1 && (
            <div className="flex items-center gap-1 sm:gap-1.5 pt-1.5 sm:pt-2.5 overflow-x-auto max-w-full no-scrollbar">
              {galleryImages.map((imgUrl, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveImgIndex(idx)}
                  className={`w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-lg p-0.5 border bg-white overflow-hidden transition-all shrink-0 cursor-pointer ${
                    idx === activeImgIndex
                      ? 'border-[#0055FE] ring-2 ring-blue-500/30 scale-105'
                      : 'border-slate-200 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={imgUrl} alt="" className="w-full h-full object-contain mix-blend-multiply" />
                </button>
              ))}
            </div>
          )}

          <div className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 md:top-4 md:left-4 flex flex-col gap-1 pointer-events-none">
            {quickViewProduct.badge && (
              <span className="bg-[#0055FE] text-white text-[8px] sm:text-[9px] font-black tracking-widest px-2 sm:px-2.5 py-0.5 rounded-full uppercase shadow-xs">
                {quickViewProduct.badge}
              </span>
            )}
            {isOutOfStock && (
              <span className="bg-rose-600 text-white text-[8px] sm:text-[9px] font-black tracking-widest px-2 sm:px-2.5 py-0.5 rounded-full uppercase shadow-xs">
                HẾT HÀNG
              </span>
            )}
          </div>
        </div>

        {/* Right: Product Details & Selectors (Scrollable) */}
        <div className="p-3 sm:p-4 md:p-6 flex flex-col justify-between space-y-2.5 sm:space-y-3 overflow-y-auto flex-1">
          
          <div className="space-y-2 sm:space-y-2.5">
            {/* Category & Stock (With safe padding from close button) */}
            <div className="flex items-center flex-wrap gap-1.5 pr-8 sm:pr-10">
              <span className="font-bold text-[#0055FE] uppercase tracking-wider text-[9px] sm:text-[10px] bg-blue-50 px-2 py-0.5 rounded-md">
                {quickViewProduct.categoryName}
              </span>
              {isOutOfStock ? (
                <span className="text-[9px] sm:text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200/80 px-1.5 sm:px-2 py-0.5 rounded-md flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                  <span>Tạm Hết Hàng</span>
                </span>
              ) : (
                <span className="text-[9px] sm:text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-1.5 sm:px-2 py-0.5 rounded-md flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>Còn Hàng</span>
                </span>
              )}
            </div>

            {/* Product Title */}
            <div>
              <h3 className="text-sm sm:text-base md:text-lg font-black text-slate-950 font-display tracking-tight leading-snug">
                {quickViewProduct.name}
              </h3>
              {quickViewProduct.tagline && (
                <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 leading-relaxed line-clamp-2">
                  {quickViewProduct.tagline}
                </p>
              )}
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-2 pt-0.5">
              <span className="text-lg sm:text-xl md:text-2xl font-black text-[#0055FE] font-display">
                {currentPrice.toLocaleString('vi-VN')}₫
              </span>
              {currentOriginalPrice && currentOriginalPrice > currentPrice && (
                <span className="text-xs text-slate-400 line-through">
                  {currentOriginalPrice.toLocaleString('vi-VN')}₫
                </span>
              )}
            </div>

            {/* 4 Thông Số Nổi Bật (Hero Specs & Key Macros) */}
            {quickViewProduct.macros && quickViewProduct.macros.length > 0 && (
              <div className="pt-0.5">
                <span className="text-[9.5px] sm:text-[10px] md:text-[11px] font-bold text-[#0055FE] uppercase tracking-wider block mb-1 flex items-center gap-1">
                  <Award className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#0055FE]" />
                  <span>Thông Số & Thành Phần Nổi Bật:</span>
                </span>
                <div className="grid grid-cols-4 gap-1 sm:gap-1.5">
                  {quickViewProduct.macros.slice(0, 4).map((m, idx) => (
                    <div 
                      key={idx} 
                      className="bg-blue-50/70 p-1 sm:p-1.5 md:p-2 rounded-lg sm:rounded-xl border border-blue-100/90 text-center shadow-2xs flex flex-col items-center justify-center min-w-0"
                    >
                      <span className="block text-[11px] sm:text-xs md:text-sm font-black text-slate-900 font-display tracking-tight leading-none mb-0.5 truncate w-full">
                        {m.value}
                      </span>
                      <span className="text-[7.5px] sm:text-[8px] md:text-[9px] font-bold text-slate-500 uppercase tracking-tight truncate w-full">
                        {m.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Size / Packaging Selector */}
            {quickViewProduct.sizes && quickViewProduct.sizes.length > 0 && (
              <div className="pt-0.5">
                <span className="text-[10.5px] sm:text-[11px] md:text-xs font-bold text-slate-700 block mb-1 flex items-center gap-1">
                  <Box className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-600" />
                  <span>Quy cách / Kích cỡ:</span>
                </span>
                <div className="flex flex-wrap gap-1 sm:gap-1.5">
                  {quickViewProduct.sizes.map((size) => {
                    const isSelected = selectedSize === size;
                    const vInfo = quickViewProduct.sizeVariants?.find((v) => v.name === size);
                    const isVarOOS = vInfo ? vInfo.inStock === false : false;

                    return (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`text-[10px] sm:text-[10.5px] md:text-[11px] px-2 sm:px-2.5 md:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl font-bold transition-all border cursor-pointer flex items-center gap-1 ${
                          isSelected
                            ? 'bg-amber-50 text-amber-900 border-amber-300 shadow-2xs font-black'
                            : isVarOOS
                            ? 'bg-slate-50 text-slate-400 border-slate-200'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <span>{isSelected ? '✓ ' : ''}{size}</span>
                        {isVarOOS && (
                          <span className="text-[7.5px] sm:text-[8px] px-1 py-0.2 bg-rose-100 text-rose-700 rounded font-bold">
                            Hết
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Flavor Selector */}
            {quickViewProduct.flavors && quickViewProduct.flavors.length > 0 && (
              <div className="pt-0.5">
                <span className="text-[10.5px] sm:text-[11px] md:text-xs font-bold text-slate-700 block mb-1">
                  Hương vị:
                </span>
                <div className="flex flex-wrap gap-1 sm:gap-1.5">
                  {quickViewProduct.flavors.map((flavor) => (
                    <button
                      key={flavor}
                      onClick={() => setSelectedFlavor(flavor)}
                      className={`text-[10px] sm:text-[10.5px] md:text-[11px] px-2 sm:px-2.5 md:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl font-bold transition-all border cursor-pointer ${
                        selectedFlavor === flavor
                          ? 'bg-[#0055FE] text-white border-[#0055FE] shadow-sm shadow-[#0055FE]/20'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {flavor}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Actions: Quantity & Add to Cart */}
          <div className="pt-2 sm:pt-2.5 border-t border-slate-100 space-y-1.5 sm:space-y-2 sticky bottom-0 bg-white">
            {isOutOfStock ? (
              <div className="py-2 sm:py-2.5 px-3 sm:px-4 rounded-xl bg-rose-50 border border-rose-200 text-center">
                <p className="text-[11px] sm:text-xs font-bold text-rose-700">
                  Quy cách này hiện đang tạm hết hàng
                </p>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 sm:gap-2.5">
                {/* Quantity adjuster */}
                <div className="flex items-center border border-slate-200 rounded-full bg-slate-50 px-1.5 sm:px-2.5 py-0.5 sm:py-1 shrink-0">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="text-slate-500 hover:text-slate-900 px-1 font-bold text-sm sm:text-base w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center cursor-pointer"
                  >
                    -
                  </button>
                  <span className="px-1.5 sm:px-2 text-xs font-bold text-slate-900">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="text-slate-500 hover:text-slate-900 px-1 font-bold text-sm sm:text-base w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center cursor-pointer"
                  >
                    +
                  </button>
                </div>

                {/* Add to Cart Button */}
                <button
                  onClick={handleAddToCart}
                  className="flex-1 py-2.5 sm:py-3 btn-w4u-primary font-bold text-xs sm:text-sm rounded-full transition-all active:scale-95 shadow-md flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer"
                >
                  {isAdded ? (
                    <>
                      <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      <span>Đã Thêm Vào Giỏ!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      <span>Thêm Vào Giỏ Hàng</span>
                    </>
                  )}
                </button>
              </div>
            )}

            <div className="flex items-center justify-center gap-1 sm:gap-1.5 text-[9px] sm:text-[10px] md:text-[11px] text-slate-400">
              <ShieldCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#0055FE]" />
              <span>Cam kết 100% chính hãng • Giao hàng siêu tốc 2H</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
