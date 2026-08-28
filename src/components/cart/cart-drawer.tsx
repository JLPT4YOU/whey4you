'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  Truck, 
  ArrowRight, 
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { useCart } from '@/context/cart-context';

export function CartDrawer() {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateQuantity,
    subtotal,
    shippingRemaining,
    shippingProgress,
    clearCart,
  } = useCart();

  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponDiscountAmount, setCouponDiscountAmount] = useState(0);
  const [couponDescription, setCouponDescription] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'shipping'>('cart');
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [orderResult, setOrderResult] = useState<{ orderCode: string; message: string } | null>(null);

  // Form states
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [orderNote, setOrderNote] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'vietqr'>('cod');
  const [formError, setFormError] = useState('');

  // Prevent background scroll when cart drawer is open
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isCartOpen]);

  if (!isCartOpen) return null;

  const discountAmount = couponApplied ? couponDiscountAmount : 0;
  const shippingFee = shippingRemaining === 0 ? 0 : 30000;
  const finalTotal = Math.max(0, subtotal - discountAmount + shippingFee);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setCouponError('');
    setCouponLoading(true);

    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode, subtotal }),
      });
      const data = await res.json();
      if (data.valid) {
        setCouponApplied(true);
        setCouponDiscountAmount(data.discountAmount || 0);
        setCouponDescription(data.description || 'Áp dụng mã thành công');
      } else {
        setCouponApplied(false);
        setCouponError(data.message || 'Mã giảm giá không hợp lệ.');
      }
    } catch {
      setCouponError('Lỗi kiểm tra mã giảm giá.');
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponApplied(false);
    setCouponCode('');
    setCouponDiscountAmount(0);
    setCouponDescription('');
    setCouponError('');
  };

  const handleProcessOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!customerName.trim() || !customerPhone.trim() || !shippingAddress.trim()) {
      setFormError('Vui lòng điền đầy đủ Họ tên, Số điện thoại và Địa chỉ giao hàng.');
      return;
    }

    setIsCheckingOut(true);

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
          shippingAddress: shippingAddress.trim(),
          note: orderNote.trim() || undefined,
          couponCode: couponApplied ? couponCode : undefined,
          subtotal,
          shippingFee,
          discountAmount,
          totalAmount: finalTotal,
          paymentMethod,
          items: cart,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setOrderResult({
          orderCode: data.orderCode || 'W4Y-ORD',
          message: data.message || 'Đặt hàng thành công!',
        });
        clearCart();
        setCheckoutStep('cart');
      } else {
        setFormError(data.error || 'Có lỗi xảy ra khi tạo đơn hàng. Vui lòng thử lại.');
      }
    } catch {
      setFormError('Lỗi kết nối máy chủ. Vui lòng thử lại sau.');
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={() => setIsCartOpen(false)}
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
          
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#0055FE]" />
              <h2 className="text-base sm:text-lg font-black text-slate-950 font-display">
                {checkoutStep === 'shipping' ? 'Thông Tin Giao Hàng' : 'Túi Hàng Của Bạn'}
              </h2>
              {checkoutStep === 'cart' && (
                <span className="bg-blue-100 text-[#0055FE] text-xs font-bold px-2 py-0.5 rounded-full">
                  {cart.reduce((s, i) => s + i.quantity, 0)} món
                </span>
              )}
            </div>
            <button
              onClick={() => {
                if (checkoutStep === 'shipping') {
                  setCheckoutStep('cart');
                } else {
                  setIsCartOpen(false);
                }
              }}
              className="p-2 text-slate-400 hover:text-slate-900 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress Bar (Chỉ hiện khi ở bước giỏ hàng) */}
          {checkoutStep === 'cart' && !orderResult && (
            <div className="p-3.5 sm:p-4 bg-blue-50/60 border-b border-blue-100">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800 mb-1.5">
                <Truck className="w-4 h-4 text-[#0055FE] shrink-0" />
                {shippingRemaining > 0 ? (
                  <span className="text-[11px] sm:text-xs">
                    Mua thêm <strong className="text-[#0055FE]">{shippingRemaining.toLocaleString('vi-VN')}₫</strong> để được <strong>FREESHIP</strong>
                  </span>
                ) : (
                  <span className="text-[#0055FE] flex items-center gap-1 font-extrabold text-[11px] sm:text-xs">
                    🎉 Đơn hàng đủ điều kiện FREESHIP toàn quốc!
                  </span>
                )}
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-[#0055FE] h-full transition-all duration-500 rounded-full"
                  style={{ width: `${shippingProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Cart Item List / Checkout Form / Success Screen */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {orderResult ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-4 sm:p-6 space-y-4">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-blue-50 rounded-full flex items-center justify-center text-[#0055FE] mb-2 animate-bounce">
                  <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10" />
                </div>
                <h3 className="text-lg sm:text-xl font-black text-slate-950 font-display">
                  Đặt Hàng Thành Công!
                </h3>
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 w-full text-left space-y-2 text-xs">
                  <div className="flex justify-between text-slate-500">
                    <span>Mã đơn hàng:</span>
                    <strong className="text-slate-900 font-mono text-sm">{orderResult.orderCode}</strong>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Phương thức:</span>
                    <span className="font-bold text-slate-800">
                      {paymentMethod === 'vietqr' ? '⚡ VietQR Tự Động' : '💵 COD (Tiền mặt)'}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Trạng thái:</span>
                    <span className="text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">Đã tiếp nhận</span>
                  </div>
                  <p className="text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                    Đội ngũ W4U sẽ liên hệ xác nhận và đóng gói giao trong 2H tại TP.HCM.
                  </p>
                </div>

                {/* VietQR Bank Transfer Quick QR */}
                {paymentMethod === 'vietqr' && (
                  <div className="w-full p-4 bg-blue-50/60 border border-blue-100 rounded-2xl text-left space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] sm:text-[11px] font-black uppercase text-[#0055FE] tracking-wider">
                        Quét Mã QR Chuyển Khoản 24/7
                      </span>
                      <span className="text-[9px] sm:text-[10px] font-bold bg-white text-slate-700 px-2 py-0.5 rounded-full border border-blue-200">
                        MBBank / Napas247
                      </span>
                    </div>

                    <div className="flex justify-center py-2">
                      <img
                        src={`https://img.vietqr.io/image/970422-99998888-compact2.png?amount=${finalTotal}&addInfo=${orderResult.orderCode}&accountName=WHEY4YOU%20NUTRITION`}
                        alt="VietQR Chuyển Khoản"
                        className="w-40 h-40 sm:w-48 sm:h-48 object-contain rounded-xl border border-slate-200 bg-white p-2 shadow-xs"
                      />
                    </div>

                    <div className="text-[10px] sm:text-[11px] space-y-1 text-slate-600 bg-white/80 p-2.5 rounded-xl border border-blue-100/60 font-mono">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Số TK:</span>
                        <strong className="text-slate-900">99998888</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Ngân hàng:</span>
                        <strong className="text-slate-900">MBBank (Quân Đội)</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Số tiền:</span>
                        <strong className="text-[#0055FE]">{finalTotal.toLocaleString('vi-VN')}₫</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Nội dung:</span>
                        <strong className="text-[#0055FE]">{orderResult.orderCode}</strong>
                      </div>
                    </div>
                  </div>
                )}

                <button
                  onClick={() => {
                    setOrderResult(null);
                    setIsCartOpen(false);
                  }}
                  className="btn-w4u-primary w-full py-3.5 font-bold rounded-full transition-all text-xs"
                >
                  Tiếp Tục Mua Sắm
                </button>
              </div>
            ) : checkoutStep === 'shipping' ? (
              <form id="shipping-form" onSubmit={handleProcessOrder} className="space-y-3.5 text-xs">
                {formError && (
                  <div className="p-3 bg-red-50 text-red-600 rounded-xl border border-red-100 text-xs font-semibold">
                    {formError}
                  </div>
                )}

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Họ và tên <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Nguyễn Văn A"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#0055FE] focus:outline-none text-base sm:text-xs font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Số điện thoại <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="0987 654 321"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#0055FE] focus:outline-none text-base sm:text-xs font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Địa chỉ giao hàng <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Số nhà, tên đường, phường/xã, quận/huyện"
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#0055FE] focus:outline-none text-base sm:text-xs font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Ghi chú giao hàng (Tuỳ chọn)
                  </label>
                  <input
                    type="text"
                    placeholder="Giao giờ hành chính, gọi trước khi đến..."
                    value={orderNote}
                    onChange={(e) => setOrderNote(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#0055FE] focus:outline-none text-base sm:text-xs font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">
                    Hình thức thanh toán
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('cod')}
                      className={`p-3 rounded-xl border text-left font-bold text-xs transition-all cursor-pointer ${
                        paymentMethod === 'cod'
                          ? 'border-[#0055FE] bg-blue-50/50 text-[#0055FE]'
                          : 'border-slate-200 bg-white text-slate-700'
                      }`}
                    >
                      💵 COD (Tiền mặt)
                      <p className="text-[10px] font-normal text-slate-500 mt-0.5">Nhận hàng kiểm tra thanh toán</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('vietqr')}
                      className={`p-3 rounded-xl border text-left font-bold text-xs transition-all cursor-pointer ${
                        paymentMethod === 'vietqr'
                          ? 'border-[#0055FE] bg-blue-50/50 text-[#0055FE]'
                          : 'border-slate-200 bg-white text-slate-700'
                      }`}
                    >
                      ⚡ VietQR Chuyển Khoản
                      <p className="text-[10px] font-normal text-slate-500 mt-0.5">Quét mã ngân hàng tự động</p>
                    </button>
                  </div>
                </div>
              </form>
            ) : cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <p className="text-base font-bold text-slate-900">
                  Túi hàng đang trống
                </p>
                <p className="text-xs text-slate-500 max-w-xs">
                  Khám phá Whey Isolate, Dầu cá Omega-3 và thực phẩm bổ sung cao cấp ngay.
                </p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="px-6 py-2.5 bg-[#0055FE] text-white text-xs font-bold rounded-full hover:bg-blue-600 transition-colors shadow-xs"
                >
                  Xem Sản Phẩm
                </button>
              </div>
            ) : (
              cart.map((item, idx) => (
                <div
                  key={`${item.product.id}-${item.selectedFlavor}-${idx}`}
                  className="flex gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100"
                >
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-14 h-14 sm:w-16 sm:h-16 object-contain rounded-xl bg-white p-1 border border-slate-100 shrink-0 mix-blend-multiply"
                  />
                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 truncate">
                        {item.product.name}
                      </h4>
                      <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5">
                        {item.selectedFlavor} {item.selectedSize ? `• ${item.selectedSize}` : ''}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border border-slate-200 rounded-full bg-white px-2 py-0.5">
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.product.id,
                              item.quantity - 1,
                              item.selectedFlavor,
                              item.selectedSize
                            )
                          }
                          className="p-1 text-slate-500 hover:text-slate-900 text-sm"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-xs font-bold text-slate-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.product.id,
                              item.quantity + 1,
                              item.selectedFlavor,
                              item.selectedSize
                            )
                          }
                          className="p-1 text-slate-500 hover:text-slate-900 text-sm"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="flex items-center gap-2.5 sm:gap-3">
                        <span className="text-xs font-black text-[#0055FE]">
                          {(item.price * item.quantity).toLocaleString('vi-VN')}₫
                        </span>
                        <button
                          onClick={() =>
                            removeFromCart(
                              item.product.id,
                              item.selectedFlavor,
                              item.selectedSize
                            )
                          }
                          className="text-slate-400 hover:text-red-500 p-1 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Checkout (Sticky Bottom) */}
          {cart.length > 0 && !orderResult && (
            <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/90 space-y-3.5 sticky bottom-0">
              {/* Coupon input (chỉ ở bước cart) */}
              {checkoutStep === 'cart' && !couponApplied && (
                <div className="space-y-1">
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Mã giảm giá (vd: WHEY10)"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="flex-1 px-3.5 py-2 bg-white text-base sm:text-xs font-bold border border-slate-200 rounded-full focus:border-[#0055FE] focus:outline-none uppercase"
                    />
                    <button
                      type="submit"
                      disabled={couponLoading || !couponCode.trim()}
                      className="px-4 py-2 bg-black hover:bg-neutral-800 disabled:opacity-50 text-white text-xs font-bold rounded-full transition-colors cursor-pointer shrink-0"
                    >
                      {couponLoading ? '...' : 'Áp dụng'}
                    </button>
                  </form>
                  {couponError && (
                    <p className="text-[10px] text-red-500 font-semibold px-2">
                      {couponError}
                    </p>
                  )}
                </div>
              )}

              {couponApplied && (
                <div className="flex items-center justify-between text-xs text-[#0055FE] font-bold bg-blue-50 p-2.5 rounded-2xl border border-blue-100">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Sparkles className="w-3.5 h-3.5 shrink-0 text-[#0055FE]" />
                    <div className="truncate text-[11px]">
                      <span className="font-mono font-black">{couponCode.toUpperCase()}</span>: {couponDescription}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    <span className="text-emerald-600 font-black text-xs">-{discountAmount.toLocaleString('vi-VN')}₫</span>
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="text-slate-400 hover:text-red-500 p-0.5"
                      title="Bỏ mã"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Subtotal */}
              <div className="space-y-1 text-xs">
                <div className="flex justify-between text-slate-500">
                  <span>Tạm tính:</span>
                  <span>{subtotal.toLocaleString('vi-VN')}₫</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Phí vận chuyển:</span>
                  <span>{shippingRemaining === 0 ? 'MIỄN PHÍ' : '30.000₫'}</span>
                </div>
                <div className="flex justify-between text-slate-900 font-extrabold text-sm pt-2 border-t border-slate-200">
                  <span>Tổng cộng:</span>
                  <span className="text-[#0055FE] font-display text-base">
                    {finalTotal.toLocaleString('vi-VN')}₫
                  </span>
                </div>
              </div>

              {/* Maintenance Banner */}
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 space-y-3">
                <div className="flex items-start gap-2.5">
                  <span className="text-xl shrink-0">🔧</span>
                  <div>
                    <p className="text-xs font-black text-amber-900">Thanh toán đang bảo trì</p>
                    <p className="text-[11px] text-amber-700 mt-0.5 leading-relaxed">
                      Vui lòng liên hệ trực tiếp qua <strong>Facebook</strong> hoặc <strong>Zalo</strong> để được hỗ trợ đặt hàng nhanh nhất.
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <a
                    href="https://www.facebook.com/p/Whey4You-61563177707517/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-[#1877F2] text-white text-[11px] font-bold hover:bg-[#166fe5] transition-colors shadow-sm"
                  >
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    Facebook
                  </a>
                  <a
                    href="https://zalo.me/g/hqwqsqcnpgik9n3zo0nk"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-[#0068FF] text-white text-[11px] font-bold hover:bg-[#0057d9] transition-colors shadow-sm"
                  >
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 50 50" fill="currentColor">
                      <path d="M25 2C12.318 2 2 12.318 2 25c0 3.96 1.023 7.854 2.963 11.29L2.037 46.73a1 1 0 001.265 1.265l10.44-2.926C17.146 46.977 21.04 48 25 48c12.682 0 23-10.318 23-23S37.682 2 25 2zm0 42c-3.744 0-7.441-.98-10.69-2.833a1 1 0 00-.738-.098l-8.054 2.257 2.257-8.054a1 1 0 00-.098-.738C5.98 32.441 5 28.744 5 25 5 13.972 13.972 5 25 5s20 8.972 20 20-8.972 20-20 20z"/>
                    </svg>
                    Zalo
                  </a>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
