'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  Check, 
  ShoppingBag, 
  Zap, 
  ChevronRight, 
  ChevronLeft,
  Award, 
  Sparkles,
  Share2,
  CheckCircle2,
  HelpCircle,
  Clock,
  Droplets,
  Flame,
  BadgeCheck,
  Headphones,
  FileCheck,
  AlertCircle
} from 'lucide-react';
import { Product } from '@/types/product';
import { useCart } from '@/context/cart-context';
import { ProductCard } from '@/components/product/product-card';

// ─── AI Text Renderer ────────────────────────────────────────────────────────
// Parse markdown-like text từ AI thành UI đẹp
function renderAIText(raw: string, accentColor = '#0055FE') {
  if (!raw) return null;

  // Tách theo dòng để phân tích cú pháp từng dòng
  const lines = raw.split('\n');
  const elements: React.ReactNode[] = [];
  let i = 0;

  // Helper: parse inline markdown → HTML string
  const inlineHtml = (text: string) =>
    text
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/`(.+?)`/g, '<code style="background:#f1f5f9;padding:1px 5px;border-radius:4px;font-size:11px;font-family:monospace">$1</code>');

  // Helper: kiểm tra dòng có phải table separator không (|---|---|)
  const isTableSeparator = (line: string) =>
    /^\|[\s|:-]+\|$/.test(line.trim());

  // Helper: parse một dòng table → mảng cells
  const parseTableRow = (line: string): string[] =>
    line.trim()
      .replace(/^\|/, '')
      .replace(/\|$/, '')
      .split('|')
      .map((c) => c.trim());

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    // Dòng trống → skip
    if (!trimmed) { i++; continue; }

    // === Horizontal rule: --- hoặc *** hoặc ___ ===
    if (/^[-*_]{3,}$/.test(trimmed)) {
      elements.push(<hr key={i} className="border-slate-200 my-3" />);
      i++;
      continue;
    }

    // === Markdown Table: dòng bắt đầu bằng | ===
    if (trimmed.startsWith('|')) {
      // Thu thập tất cả dòng thuộc table
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        tableLines.push(lines[i].trim());
        i++;
      }

      // Lọc ra header + separator + body
      const nonSep = tableLines.filter((l) => !isTableSeparator(l));
      const headerRow = nonSep[0];
      const bodyRows = nonSep.slice(1);

      if (!headerRow) continue;

      const headerCells = parseTableRow(headerRow);
      const bodyData = bodyRows.map(parseTableRow);

      elements.push(
        <div key={`table-${i}`} className="overflow-x-auto rounded-xl border border-slate-200 my-2">
          <table className="w-full text-xs sm:text-sm border-collapse">
            <thead>
              <tr style={{ backgroundColor: accentColor + '15' }}>
                {headerCells.map((cell, ci) => (
                  <th
                    key={ci}
                    className="px-3 py-2.5 text-left font-black text-slate-800 border-b border-slate-200 whitespace-nowrap"
                    style={{ color: ci === 0 ? accentColor : undefined }}
                    dangerouslySetInnerHTML={{ __html: inlineHtml(cell) }}
                  />
                ))}
              </tr>
            </thead>
            <tbody>
              {bodyData.map((row, ri) => (
                <tr key={ri} className={ri % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}>
                  {row.map((cell, ci) => (
                    <td
                      key={ci}
                      className={`px-3 py-2 border-b border-slate-100 text-slate-700 ${ci === 0 ? 'font-semibold' : ''}`}
                      dangerouslySetInnerHTML={{ __html: inlineHtml(cell) }}
                    />
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      continue;
    }

    // === Heading ### cấp 3 ===
    const h3Match = trimmed.match(/^###\s+(.+)$/);
    if (h3Match) {
      elements.push(
        <p key={i} className="font-bold text-slate-700 text-xs sm:text-sm pt-2 pb-0.5 uppercase tracking-wide"
          dangerouslySetInnerHTML={{ __html: inlineHtml(h3Match[1]) }}
        />
      );
      i++;
      continue;
    }

    // === Heading ## cấp 2 hoặc **Tiêu đề** đứng một mình ===
    const h2Match = trimmed.match(/^##\s+(.+)$/);
    const boldAloneMatch = trimmed.match(/^\*\*(.+)\*\*:?\s*$/);
    const numberedHeader = trimmed.match(/^(\d+)\.\s+\*\*(.+)\*\*:?\s*$/);

    if (h2Match || boldAloneMatch || numberedHeader) {
      const label = h2Match ? h2Match[1]
        : boldAloneMatch ? boldAloneMatch[1]
        : `${numberedHeader![1]}. ${numberedHeader![2]}`;
      elements.push(
        <div key={i} className="flex items-center gap-2 pt-3 pb-1">
          <span className="w-1 h-4 rounded-full shrink-0" style={{ backgroundColor: accentColor }} />
          <p className="font-black text-slate-900 text-sm sm:text-[15px] tracking-tight">{label.replace(/\*\*/g, '')}</p>
        </div>
      );
      i++;
      continue;
    }

    // === Numbered heading: "1. Text" (không có **) ===
    const numHeading = trimmed.match(/^(\d+)\.\s+(.+)$/);
    if (numHeading) {
      const next = lines[i + 1]?.trim() || '';
      if (next.startsWith('-') || next.startsWith('*') || next.startsWith('|') || next === '') {
        elements.push(
          <div key={i} className="flex items-center gap-2 pt-3 pb-1">
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full text-white text-[10px] font-black shrink-0" style={{ backgroundColor: accentColor }}>{numHeading[1]}</span>
            <p className="font-bold text-slate-800 text-sm sm:text-[14px]">{numHeading[2].replace(/\*\*/g, '')}</p>
          </div>
        );
        i++;
        continue;
      }
    }

    // === Bullet list: - hoặc * ===
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      const bullets: string[] = [];
      while (i < lines.length) {
        const t = lines[i].trim();
        if (t.startsWith('- ') || t.startsWith('* ')) {
          bullets.push(t.replace(/^[-*]\s*/, '').trim());
          i++;
        } else { break; }
      }
      elements.push(
        <ul key={`ul-${i}`} className="space-y-1.5 pl-1 py-1">
          {bullets.map((item, bIdx) => (
            <li key={bIdx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: accentColor }} />
              <span dangerouslySetInnerHTML={{ __html: inlineHtml(item) }} />
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // === Regular paragraph ===
    elements.push(
      <p key={i} className="text-xs sm:text-sm text-slate-700 leading-relaxed"
        dangerouslySetInnerHTML={{ __html: inlineHtml(trimmed) }}
      />
    );
    i++;
  }

  return elements;
}

interface ProductDetailViewProps {
  product: Product;
  relatedProducts: Product[];
}

export function ProductDetailView({ product, relatedProducts }: ProductDetailViewProps) {
  const { addToCart, setIsCartOpen } = useCart();
  
  const galleryImages: string[] = product.images && product.images.length > 0
    ? product.images
    : (product.image ? [product.image] : []);
  
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const activeImage = galleryImages[selectedImageIndex] || product.image;

  const [selectedFlavor, setSelectedFlavor] = useState<string>(
    product.flavors && product.flavors.length > 0 ? product.flavors[0] : 'Tiêu Chuẩn'
  );
  
  const [selectedSize, setSelectedSize] = useState<string>(
    product.sizes && product.sizes.length > 0 ? product.sizes[0] : 'Tiêu Chuẩn'
  );
  
  const [quantity, setQuantity] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<'info' | 'usage' | 'guarantee'>('info');
  const [copied, setCopied] = useState(false);

  // Tính toán giá động theo quy cách được chọn
  const matchedVariant = product.sizeVariants?.find((v) => v.name === selectedSize);
  const currentPrice = matchedVariant && matchedVariant.price ? matchedVariant.price : product.price;
  const currentOriginalPrice = matchedVariant?.originalPrice || (matchedVariant?.price && product.originalPrice ? Math.round(product.originalPrice * (matchedVariant.price / product.price)) : product.originalPrice);

  // Kiểm tra tình trạng còn / hết hàng
  const isProductOutOfStock = product.inStock === false;
  const isSizeOutOfStock = matchedVariant ? matchedVariant.inStock === false : false;
  const isOutOfStock = isProductOutOfStock || isSizeOutOfStock;

  const discountPercent = currentOriginalPrice && currentOriginalPrice > currentPrice
    ? Math.round(((currentOriginalPrice - currentPrice) / currentOriginalPrice) * 100)
    : 0;

  const handlePrevImage = () => {
    setSelectedImageIndex((prev) => (prev > 0 ? prev - 1 : galleryImages.length - 1));
  };

  const handleNextImage = () => {
    setSelectedImageIndex((prev) => (prev < galleryImages.length - 1 ? prev + 1 : 0));
  };

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addToCart(product, quantity, selectedFlavor, selectedSize, currentPrice);
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    addToCart(product, quantity, selectedFlavor, selectedSize, currentPrice);
    setIsCartOpen(true);
  };

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="bg-[#FAFBFD] pb-28 md:pb-16">
      
      {/* BREADCRUMBS */}
      <div className="bg-white border-b border-slate-100 py-3 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs text-slate-500">
          <nav className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-[#0055FE] transition-colors whitespace-nowrap">
              Trang Chủ
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
            <Link 
              href={`/category/${product.category}`} 
              className="hover:text-[#0055FE] transition-colors whitespace-nowrap"
            >
              {product.categoryName}
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
            <span className="font-semibold text-slate-900 truncate max-w-[160px] sm:max-w-md">
              {product.name}
            </span>
          </nav>

          <button
            onClick={handleShare}
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-[#0055FE] transition-colors cursor-pointer"
            title="Sao chép link chia sẻ"
          >
            {copied ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-600 font-bold">Đã sao chép link</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" />
                <span>Chia sẻ</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* PRODUCT HERO CONTAINER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 bg-white rounded-3xl p-4 sm:p-8 lg:p-10 shadow-xs border border-slate-100">
          
          {/* LEFT: PRODUCT IMAGE STAGE (5 COLS) */}
          <div className="lg:col-span-5 space-y-3.5">
            {/* Main Featured Image Stage */}
            <div className="relative aspect-square w-full rounded-3xl bg-gradient-to-b from-[#F4F7FC] to-[#E9EFF8] p-6 sm:p-10 flex items-center justify-center border border-slate-100 overflow-hidden group">
              <img
                key={activeImage}
                src={activeImage}
                alt={`${product.name} - Hình ảnh ${selectedImageIndex + 1} - Thực phẩm bổ sung chính hãng Whey4You`}
                className={`w-full h-full object-contain mix-blend-multiply transition-all duration-500 group-hover:scale-105 ${
                  isOutOfStock ? 'grayscale opacity-75' : ''
                }`}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = product.image || 'https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?auto=format&fit=crop&w=800&q=80';
                }}
              />

              {/* Slider Next/Prev Arrow Controls if multiple images */}
              {galleryImages.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={handlePrevImage}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-slate-800 flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-all hover:scale-110 cursor-pointer"
                    title="Ảnh trước"
                  >
                    <ChevronLeft className="w-5 h-5 text-slate-700" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNextImage}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-slate-800 flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-all hover:scale-110 cursor-pointer"
                    title="Ảnh tiếp theo"
                  >
                    <ChevronRight className="w-5 h-5 text-slate-700" />
                  </button>
                </>
              )}

              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-1.5 pointer-events-none">
                {product.badge && (
                  <span className="px-3 py-1 rounded-full text-xs font-black bg-[#0055FE] text-white shadow-md uppercase tracking-wider">
                    {product.badge}
                  </span>
                )}
                {isOutOfStock && (
                  <span className="px-3 py-1 rounded-full text-xs font-black bg-rose-600 text-white shadow-md uppercase tracking-wider">
                    TẠM HẾT HÀNG
                  </span>
                )}
              </div>

              {discountPercent > 0 && (
                <div className="absolute top-4 right-4 pointer-events-none">
                  <span className="px-2.5 py-1 rounded-full text-xs font-black bg-rose-500 text-white shadow-md">
                    -{discountPercent}%
                  </span>
                </div>
              )}

              {/* Image index counter badge */}
              {galleryImages.length > 1 && (
                <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-xs text-white text-[11px] font-bold">
                  {selectedImageIndex + 1} / {galleryImages.length}
                </div>
              )}
            </div>

            {/* Thumbnail Strip (Multi-Image Selector) */}
            {galleryImages.length > 1 && (
              <div className="flex items-center gap-2.5 overflow-x-auto py-1 px-0.5 no-scrollbar">
                {galleryImages.map((imgUrl, idx) => {
                  const isSelected = idx === selectedImageIndex;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedImageIndex(idx)}
                      onMouseEnter={() => setSelectedImageIndex(idx)}
                      className={`relative aspect-square w-16 sm:w-20 rounded-2xl p-1.5 bg-gradient-to-b from-[#F4F7FC] to-[#E9EFF8] border-2 transition-all shrink-0 cursor-pointer overflow-hidden ${
                        isSelected
                          ? 'border-[#0055FE] ring-2 ring-blue-500/30 scale-105 shadow-sm'
                          : 'border-slate-200 hover:border-slate-300 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={imgUrl}
                        alt={`Thumbnail ${idx + 1}`}
                        className="w-full h-full object-contain mix-blend-multiply"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = product.image || 'https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?auto=format&fit=crop&w=400&q=80';
                        }}
                      />
                    </button>
                  );
                })}
              </div>
            )}

            {/* Trust Badges Bar */}
            <div className="grid grid-cols-3 gap-2 text-center pt-2">
              <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-center">
                <ShieldCheck className="w-4 h-4 text-emerald-600 mb-1" />
                <span className="text-[10px] font-bold text-slate-800">100% Chính Hãng</span>
                <span className="text-[9px] text-slate-400">Đền 200% nếu giả</span>
              </div>
              <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-center">
                <Truck className="w-4 h-4 text-[#EE4D2D] mb-1" />
                <span className="text-[10px] font-bold text-slate-800">Giao Nhanh SPX</span>
                <span className="text-[9px] text-slate-400">Ship hỏa tốc</span>
              </div>
              <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-center">
                <RotateCcw className="w-4 h-4 text-[#0055FE] mb-1" />
                <span className="text-[10px] font-bold text-slate-800">Đổi Trả 7 Ngày</span>
                <span className="text-[9px] text-slate-400">An tâm tuyệt đối</span>
              </div>
            </div>
          </div>

          {/* RIGHT: PRODUCT INFO & BUY BOX (7 COLS) */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
            
            {/* Title, Category & Ratings */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-blue-50 text-[#0055FE] text-xs font-black uppercase tracking-wider">
                  {product.categoryName}
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  Mã SP: {product.id}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-950 font-display tracking-tight leading-tight">
                {product.name}
              </h1>

              <p className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed">
                {product.tagline || product.description}
              </p>

              {/* Stock status */}
              <div className="flex items-center gap-3 pt-1">
                {isOutOfStock ? (
                  <span className="text-xs text-rose-600 font-bold flex items-center gap-1.5 bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                    <span>Tạm Hết Hàng {isSizeOutOfStock && !isProductOutOfStock ? `(${selectedSize})` : ''}</span>
                  </span>
                ) : (
                  <span className="text-xs text-emerald-600 font-bold flex items-center gap-1.5 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Còn Hàng Sẵn Sàng Giao
                  </span>
                )}
              </div>
            </div>

            {/* Price Box */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-blue-50/70 to-indigo-50/50 border border-blue-100/80 flex items-baseline justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                  Giá Theo Quy Cách Đã Chọn
                </span>
                <div className="flex items-baseline gap-3">
                  <span className="text-2xl sm:text-3xl font-black text-[#0055FE] font-display">
                    {currentPrice.toLocaleString('vi-VN')}₫
                  </span>
                  {currentOriginalPrice && currentOriginalPrice > currentPrice && (
                    <span className="text-sm sm:text-base text-slate-400 line-through">
                      {currentOriginalPrice.toLocaleString('vi-VN')}₫
                    </span>
                  )}
                </div>
              </div>

              {currentOriginalPrice && currentOriginalPrice > currentPrice && (
                <div className="text-right">
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100/80 px-2.5 py-1 rounded-full inline-block">
                    Tiết kiệm {(currentOriginalPrice - currentPrice).toLocaleString('vi-VN')}₫
                  </span>
                </div>
              )}
            </div>

            {/* Key Macro Highlights */}
            {product.macros && product.macros.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Hàm Lượng Dinh Dưỡng Mỗi Khẩu Phần:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {product.macros.map((macro, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200/70 text-center"
                    >
                      <span className="text-sm sm:text-base font-black text-slate-900 font-display block">
                        {macro.value}
                      </span>
                      <span className="text-[10px] font-bold text-slate-500 uppercase">
                        {macro.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Flavor Options */}
            {product.flavors && product.flavors.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Chọn Hương Vị: <span className="text-[#0055FE]">{selectedFlavor}</span>
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.flavors.map((flavor) => {
                    const isSelected = selectedFlavor === flavor;
                    return (
                      <button
                        key={flavor}
                        type="button"
                        onClick={() => setSelectedFlavor(flavor)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                          isSelected
                            ? 'bg-blue-50 border-[#0055FE] text-[#0055FE] shadow-xs'
                            : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        {flavor}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Size Options */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Chọn Quy Cách / Khối Lượng: <span className="text-[#0055FE]">{selectedSize}</span>
                </span>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => {
                    const isSelected = selectedSize === size;
                    const vInfo = product.sizeVariants?.find((v) => v.name === size);
                    const isVarOOS = vInfo ? vInfo.inStock === false : false;

                    return (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setSelectedSize(size)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-blue-50 border-[#0055FE] text-[#0055FE] shadow-xs'
                            : isVarOOS
                            ? 'bg-slate-50 border-slate-200 text-slate-400 hover:border-slate-300'
                            : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        <span>{size}</span>
                        {isVarOOS && (
                          <span className="text-[9px] px-1.5 py-0.5 bg-rose-100 text-rose-700 rounded font-bold">
                            Hết
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Action Buttons: Add to Cart & Buy Now */}
            <div className="pt-2 space-y-3">
              {isOutOfStock ? (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-center space-y-1">
                  <p className="font-extrabold text-sm text-rose-700 flex items-center justify-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                    <span>Sản phẩm hoặc quy cách này hiện đang TẠM HẾT HÀNG</span>
                  </p>
                  <p className="text-xs text-rose-600/80">
                    Vui lòng chọn quy cách khác hoặc liên hệ hotline để nhận thông báo khi có hàng mới.
                  </p>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  {/* Quantity */}
                  <div className="flex items-center border border-slate-200 rounded-2xl p-1 bg-slate-50">
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-8 h-8 rounded-xl bg-white text-slate-700 font-bold hover:bg-slate-200 transition-colors flex items-center justify-center cursor-pointer shadow-2xs"
                    >
                      -
                    </button>
                    <span className="w-10 text-center font-black text-sm text-slate-900">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-8 h-8 rounded-xl bg-white text-slate-700 font-bold hover:bg-slate-200 transition-colors flex items-center justify-center cursor-pointer shadow-2xs"
                    >
                      +
                    </button>
                  </div>

                  {/* Add to Cart */}
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    className="flex-1 py-3.5 px-4 rounded-2xl bg-blue-50 text-[#0055FE] border-2 border-[#0055FE]/30 font-extrabold text-sm hover:bg-blue-100 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Thêm Vào Giỏ</span>
                  </button>

                  {/* Buy Now */}
                  <button
                    type="button"
                    onClick={handleBuyNow}
                    className="flex-1 py-3.5 px-4 rounded-2xl bg-[#0055FE] hover:bg-[#0044CC] text-white font-extrabold text-sm transition-all shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Zap className="w-4 h-4 fill-white" />
                    <span>Mua Ngay</span>
                  </button>
                </div>
              )}

              {/* Express delivery note */}
              <p className="text-[11px] text-slate-500 text-center flex items-center justify-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-[#EE4D2D]" />
                Đồng kiểm khi nhận hàng • Miễn phí vận chuyển cho đơn từ 500.000₫
              </p>
            </div>

          </div>

        </div>
      </div>

      {/* DETAILED TABS SECTION */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-xs border border-slate-100 space-y-6">
          
          {/* Tab Navigation */}
          <div className="flex border-b border-slate-100 gap-6 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveTab('info')}
              className={`pb-3.5 font-bold text-sm uppercase tracking-wider transition-all border-b-2 cursor-pointer whitespace-nowrap ${
                activeTab === 'info'
                  ? 'border-[#0055FE] text-[#0055FE]'
                  : 'border-transparent text-slate-400 hover:text-slate-700'
              }`}
            >
              Mô Tả & Thành Phần
            </button>
            <button
              onClick={() => setActiveTab('usage')}
              className={`pb-3.5 font-bold text-sm uppercase tracking-wider transition-all border-b-2 cursor-pointer whitespace-nowrap ${
                activeTab === 'usage'
                  ? 'border-[#0055FE] text-[#0055FE]'
                  : 'border-transparent text-slate-400 hover:text-slate-700'
              }`}
            >
              Hướng Dẫn Sử Dụng
            </button>
            <button
              onClick={() => setActiveTab('guarantee')}
              className={`pb-3.5 font-bold text-sm uppercase tracking-wider transition-all border-b-2 cursor-pointer whitespace-nowrap ${
                activeTab === 'guarantee'
                  ? 'border-[#0055FE] text-[#0055FE]'
                  : 'border-transparent text-slate-400 hover:text-slate-700'
              }`}
            >
              Cam Kết Chất Lượng
            </button>
          </div>

          {/* Tab Content */}
          <div className="text-slate-700 text-sm sm:text-base leading-relaxed">
            {activeTab === 'info' && (
              <div className="space-y-6">
                {/* Tagline Callout */}
                {product.tagline && (
                  <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-blue-50/90 via-indigo-50/50 to-blue-50/90 border border-blue-100 flex items-start sm:items-center gap-3.5 shadow-2xs">
                    <div className="w-10 h-10 rounded-xl bg-[#0055FE] text-white flex items-center justify-center shrink-0 shadow-sm">
                      <Sparkles className="w-5 h-5 text-yellow-300" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#0055FE] uppercase tracking-wider">Điểm Nhấn Độc Quyền</p>
                      <p className="text-sm sm:text-base font-extrabold text-slate-900 mt-0.5">{product.tagline}</p>
                    </div>
                  </div>
                )}

                {/* Main Description Formatted */}
                <div className="space-y-4">
                  <h3 className="text-base sm:text-lg font-black text-slate-950 flex items-center gap-2">
                    <span className="w-2 h-5 bg-[#0055FE] rounded-full" />
                    <span>Mô Tả Sản Phẩm & Phân Tích Dinh Dưỡng</span>
                  </h3>
                  
                  <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/70 space-y-1">
                    {renderAIText(product.description)}
                  </div>
                </div>

                {/* 3 Core Benefit Feature Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-2">
                  <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-2 hover:border-blue-200 transition-colors">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#0055FE] flex items-center justify-center">
                      <Zap className="w-4 h-4" />
                    </div>
                    <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm">Hấp Thu Tốc Độ Cao</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Công nghệ lọc siêu vi mô giúp bột hòa tan tức thì, giải phóng Amino Acid nhanh vào cơ bắp.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-2 hover:border-emerald-200 transition-colors">
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm">Độ Tinh Khiết Chuẩn Quốc Tế</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Loại bỏ tạp chất, chất béo xấu và đường phụ gia, tối ưu hóa quá trình tăng cơ nạc không mỡ thừa.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-2 hover:border-indigo-200 transition-colors">
                    <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                      <BadgeCheck className="w-4 h-4" />
                    </div>
                    <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm">Kiểm Nghiệm FDA / GMP</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      100% được sản xuất tại các nhà máy đạt chuẩn cGMP khắt khe, không chứa chất cấm thể thao.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'usage' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-base sm:text-lg font-black text-slate-950 flex items-center gap-2">
                    <span className="w-2 h-5 bg-emerald-500 rounded-full" />
                    <span>Hướng Dẫn Sử Dụng Đạt Hiệu Quả Tối Đa</span>
                  </h3>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    Chuẩn Huấn Luyện Viên W4U
                  </span>
                </div>

                {/* 3 Visual Step Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 sm:p-5 rounded-2xl bg-blue-50/60 border border-blue-100 space-y-2">
                    <div className="flex items-center gap-2 text-[#0055FE]">
                      <Clock className="w-4 h-4 shrink-0" />
                      <span className="font-black text-xs uppercase tracking-wider">Thời Điểm Vàng</span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                      Sáng thức dậy hoặc <strong>sau tập 20-30 phút</strong> để nạp dinh dưỡng vào &quot;cửa sổ đồng hóa&quot; cơ bắp.
                    </p>
                  </div>

                  <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/60 border border-emerald-100 space-y-2">
                    <div className="flex items-center gap-2 text-emerald-700">
                      <Droplets className="w-4 h-4 shrink-0" />
                      <span className="font-black text-xs uppercase tracking-wider">Tỷ Lệ Pha Chuẩn</span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                      Pha <strong>1 muỗng</strong> với <strong>250 - 350ml</strong> nước mát hoặc sữa tươi không đường, lắc đều 15s.
                    </p>
                  </div>

                  <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/60 border border-amber-100 space-y-2">
                    <div className="flex items-center gap-2 text-amber-700">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span className="font-black text-xs uppercase tracking-wider">Lưu Ý Quan Trọng</span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                      Tuyệt đối <strong>không pha nước sôi</strong> để tránh biến tính protein. Đậy kín nắp và để nơi thoáng mát.
                    </p>
                  </div>
                </div>

                {/* Usage Guide Detailed Content from AI / Database */}
                {product.usageGuide && (
                  <div className="rounded-2xl bg-white border border-emerald-100 overflow-hidden">
                    <div className="flex items-center gap-2.5 px-5 py-3.5 bg-emerald-50 border-b border-emerald-100">
                      <Droplets className="w-4 h-4 text-emerald-600 shrink-0" />
                      <p className="font-black text-emerald-800 text-xs uppercase tracking-wider">
                        Chi tiết hướng dẫn từ hãng
                      </p>
                    </div>
                    <div className="p-5 space-y-1">
                      {renderAIText(product.usageGuide, '#059669')}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'guarantee' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-base sm:text-lg font-black text-slate-950 flex items-center gap-2">
                    <span className="w-2 h-5 bg-amber-500 rounded-full" />
                    <span>Cam Kết Chất Lượng & Chính Sách Khách Hàng W4U</span>
                  </h3>
                  <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                    Bảo Vệ Người Tiêu Dùng 100%
                  </span>
                </div>

                {/* 4 Guarantee Grid Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2 hover:border-blue-300 transition-colors">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#0055FE] flex items-center justify-center font-bold">
                        <ShieldCheck className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-black text-slate-900 text-xs sm:text-sm">100% Chính Hãng Nhập Khẩu</h4>
                        <p className="text-[11px] text-slate-400">Tem phụ tiếng Việt & mã cào xác thực</p>
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed pt-1">
                      Toàn bộ sản phẩm đều được nhập khẩu chính ngạch từ các thương hiệu hàng đầu thế giới, đầy đủ chứng từ hải quan.
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2 hover:border-emerald-300 transition-colors">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                        <RotateCcw className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-black text-slate-900 text-xs sm:text-sm">Cam Kết Hoàn Tiền 200%</h4>
                        <p className="text-[11px] text-slate-400">Đền bù thỏa đáng nếu phát hiện hàng giả</p>
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed pt-1">
                      Whey4You cam kết bồi thường gấp đôi giá trị đơn hàng nếu phát hiện sản phẩm giả mạo, kém chất lượng hoặc cận date dưới 6 tháng.
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2 hover:border-purple-300 transition-colors">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                        <FileCheck className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-black text-slate-900 text-xs sm:text-sm">Kiểm Định An Toàn Quốc Tế</h4>
                        <p className="text-[11px] text-slate-400">FDA, GMP, Informed-Choice</p>
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed pt-1">
                      Được kiểm định độc lập tại các phòng lab uy tín, loại bỏ tạp chất kim loại nặng và hóa chất độc hại.
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2 hover:border-indigo-300 transition-colors">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                        <Headphones className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-black text-slate-900 text-xs sm:text-sm">Tư Vấn Dinh Dưỡng 24/7</h4>
                        <p className="text-[11px] text-slate-400">Đội ngũ NSCA-CPT đồng hành</p>
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed pt-1">
                      Hỗ trợ giải đáp về cách dùng, tính toán Macro và thực đơn tăng cơ/giảm mỡ hoàn toàn miễn phí trọn đời qua Hotline & Zalo.
                    </p>
                  </div>
                </div>

                {/* Additional quality commitment text if available */}
                {product.qualityCommitment && (
                  <div className="rounded-2xl bg-white border border-amber-100 overflow-hidden">
                    <div className="flex items-center gap-2.5 px-5 py-3.5 bg-amber-50 border-b border-amber-100">
                      <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
                      <p className="font-black text-amber-800 text-xs uppercase tracking-wider">
                        Cam kết chi tiết từ Whey4You
                      </p>
                    </div>
                    <div className="p-5 space-y-1">
                      {renderAIText(product.qualityCommitment, '#d97706')}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* RELATED PRODUCTS */}
      {relatedProducts && relatedProducts.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 sm:mt-16">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-950 font-display tracking-tight">
                Sản Phẩm Cùng Danh Mục
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Các dòng sản phẩm thể hình được gymer tin dùng nhất
              </p>
            </div>
            <Link
              href={`/category/${product.category}`}
              className="text-xs sm:text-sm font-bold text-[#0055FE] hover:underline flex items-center gap-1"
            >
              <span>Xem tất cả</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
            {relatedProducts.slice(0, 4).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}

      {/* STICKY BOTTOM PURCHASE DOCK (Mobile Only) */}
      <div className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-slate-200/80 p-3 z-40 md:hidden flex items-center justify-between gap-3 shadow-2xl">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] text-slate-500 font-bold uppercase truncate">
            {selectedFlavor} • {selectedSize}
          </p>
          <div className="flex items-baseline gap-1.5">
            <span className="text-base font-black text-[#0055FE] font-display">
              {currentPrice.toLocaleString('vi-VN')}₫
            </span>
            {currentOriginalPrice && currentOriginalPrice > currentPrice && (
              <span className="text-[10px] text-slate-400 line-through">
                {currentOriginalPrice.toLocaleString('vi-VN')}₫
              </span>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-1.5 shrink-0">
          {isOutOfStock ? (
            <span className="px-4 py-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-xl">
              Hết Hàng
            </span>
          ) : (
            <>
              <button
                type="button"
                onClick={handleAddToCart}
                className="px-3 py-2.5 rounded-xl bg-blue-50 text-[#0055FE] font-bold text-xs border border-blue-200 active:scale-95 transition-all flex items-center gap-1 cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Thêm</span>
              </button>
              <button
                type="button"
                onClick={handleBuyNow}
                className="px-4 py-2.5 rounded-xl bg-[#0055FE] text-white font-black text-xs active:scale-95 transition-all shadow-md shadow-blue-500/25 flex items-center gap-1 cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 fill-white" />
                <span>Mua Ngay</span>
              </button>
            </>
          )}
        </div>
      </div>

    </div>
  );
}
