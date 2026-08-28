'use client';

import React, { useState, useEffect } from 'react';
import { 
  Tag, 
  Plus, 
  Search, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Sparkles, 
  Truck, 
  Percent, 
  DollarSign, 
  Calendar, 
  Users, 
  Sliders,
  Check,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';

interface CouponItem {
  id: string;
  code: string;
  description: string;
  discount_percent: number | null;
  discount_amount: number | null;
  min_order_value: number;
  max_discount: number | null;
  expires_at: string | null;
  usage_limit: number | null;
  used_count: number;
  is_active: boolean;
  created_at?: string;
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<CouponItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'percent' | 'fixed' | 'freeship'>('all');

  // Freeship Store Policy State (Stored in localStorage / settings)
  const [freeshipThreshold, setFreeshipThreshold] = useState('1000000');
  const [isFreeshipEnabled, setIsFreeshipEnabled] = useState(true);
  const [freeshipSaved, setFreeshipSaved] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [discountType, setDiscountType] = useState<'percent' | 'fixed' | 'freeship'>('percent');
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discount_percent: '10',
    discount_amount: '50000',
    min_order_value: '0',
    max_discount: '',
    expires_at: '',
    usage_limit: '100',
    is_active: true,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Fetch all coupons
  const fetchCoupons = async () => {
    try {
      const res = await fetch('/api/admin/coupons');
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setCoupons(data.data);
      }
    } catch (err) {
      console.error('Lỗi tải coupon:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();

    // Load store freeship policy from localStorage
    try {
      const savedThreshold = localStorage.getItem('w4u_freeship_threshold');
      if (savedThreshold) setFreeshipThreshold(savedThreshold);
      const savedActive = localStorage.getItem('w4u_freeship_active');
      if (savedActive !== null) setIsFreeshipEnabled(savedActive === 'true');
    } catch {}
  }, []);

  const handleSaveFreeshipPolicy = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      localStorage.setItem('w4u_freeship_threshold', freeshipThreshold);
      localStorage.setItem('w4u_freeship_active', String(isFreeshipEnabled));
      setFreeshipSaved(true);
      setTimeout(() => setFreeshipSaved(false), 2500);
    } catch {}
  };

  const handleToggleStatus = async (coupon: CouponItem) => {
    const nextVal = !coupon.is_active;
    try {
      const res = await fetch(`/api/admin/coupons/${coupon.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: nextVal }),
      });
      const data = await res.json();
      if (data.success) {
        setCoupons((prev) =>
          prev.map((c) => (c.id === coupon.id ? { ...c, is_active: nextVal } : c))
        );
      }
    } catch (err) {
      console.error('Lỗi đổi trạng thái:', err);
    }
  };

  const handleDeleteCoupon = async (couponId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa mã coupon này?')) return;
    try {
      const res = await fetch(`/api/admin/coupons/${couponId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setCoupons((prev) => prev.filter((c) => c.id !== couponId));
      }
    } catch (err) {
      console.error('Lỗi xóa coupon:', err);
    }
  };

  const handleOpenModal = () => {
    setSubmitError(null);
    setDiscountType('percent');
    setFormData({
      code: '',
      description: '',
      discount_percent: '10',
      discount_amount: '50000',
      min_order_value: '0',
      max_discount: '200000',
      expires_at: '2026-12-31',
      usage_limit: '200',
      is_active: true,
    });
    setIsModalOpen(true);
  };

  const handleSubmitModal = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!formData.code.trim()) {
      setSubmitError('Vui lòng nhập Mã code coupon.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: any = {
        code: formData.code.trim().toUpperCase(),
        description: formData.description.trim() || undefined,
        min_order_value: Number(formData.min_order_value) || 0,
        expires_at: formData.expires_at ? new Date(formData.expires_at).toISOString() : null,
        usage_limit: formData.usage_limit ? Number(formData.usage_limit) : null,
        is_active: formData.is_active,
      };

      if (discountType === 'percent') {
        payload.discount_percent = Number(formData.discount_percent);
        payload.discount_amount = null;
        payload.max_discount = formData.max_discount ? Number(formData.max_discount) : null;
      } else if (discountType === 'fixed') {
        payload.discount_percent = null;
        payload.discount_amount = Number(formData.discount_amount);
        payload.max_discount = null;
      } else if (discountType === 'freeship') {
        payload.discount_percent = null;
        payload.discount_amount = 30000; // Free shipping fee
        payload.max_discount = null;
      }

      const res = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setIsModalOpen(false);
        fetchCoupons();
      } else {
        setSubmitError(data.error || 'Lỗi khi tạo coupon.');
      }
    } catch (err: any) {
      setSubmitError(err.message || 'Lỗi kết nối máy chủ.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredCoupons = coupons.filter((c) => {
    if (filterType === 'percent' && !c.discount_percent) return false;
    if (filterType === 'fixed' && (!c.discount_amount || c.discount_amount === 30000)) return false;
    if (filterType === 'freeship' && c.discount_amount !== 30000 && !c.code.includes('SHIP')) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        c.code.toLowerCase().includes(q) ||
        (c.description && c.description.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const activeCount = coupons.filter((c) => c.is_active).length;
  const totalUsed = coupons.reduce((sum, c) => sum + (c.used_count || 0), 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-display tracking-tight">
            Khuyến Mãi & Quản Lý Coupon
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Tạo mã giảm theo %, giảm thẳng số tiền (VNĐ) và thiết lập ưu đãi Freeship theo giá trị đơn.
          </p>
        </div>

        <button
          onClick={handleOpenModal}
          className="btn-w4u-primary px-5 py-3 rounded-2xl font-bold text-xs flex items-center gap-2 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Tạo Mã Coupon Mới</span>
        </button>
      </div>

      {/* FREESHIP POLICY CONFIGURATION CARD (ƯU ĐÃI FREESHIP TOÀN CỬA HÀNG) */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-950 rounded-3xl p-5 sm:p-6 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
          <div className="space-y-1.5 max-w-lg">
            <div className="flex items-center gap-2">
              <span className="p-2 bg-blue-500/20 text-[#00D2FF] rounded-xl border border-blue-400/20">
                <Truck className="w-5 h-5" />
              </span>
              <h3 className="text-base font-black font-display tracking-tight text-white">
                Chính Sách Miễn Phí Vận Chuyển Toàn Sàn (Auto Freeship)
              </h3>
            </div>
            <p className="text-xs text-blue-200/80 leading-relaxed">
              Khi khách hàng đạt tổng giá trị đơn hàng vượt mức này, hệ thống sẽ tự động miễn phí 100% tiền ship (30.000₫) tại trang giỏ hàng.
            </p>
          </div>

          {/* Freeship Setting Form */}
          <form onSubmit={handleSaveFreeshipPolicy} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="bg-white/10 backdrop-blur-md p-1.5 rounded-2xl border border-white/10 flex items-center gap-2">
              <span className="text-[11px] font-bold text-blue-200 pl-3">Đơn từ:</span>
              <input
                type="text"
                value={freeshipThreshold ? Number(freeshipThreshold.replace(/\D/g, '')).toLocaleString('vi-VN') : ''}
                onChange={(e) => setFreeshipThreshold(e.target.value.replace(/\D/g, ''))}
                placeholder="1.000.000"
                className="w-32 sm:w-36 px-3 py-1.5 bg-white text-slate-900 rounded-xl text-xs font-black font-display focus:outline-none text-center"
              />
              <span className="text-xs font-bold text-white pr-2">VNĐ</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsFreeshipEnabled(!isFreeshipEnabled)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-colors border ${
                  isFreeshipEnabled
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                {isFreeshipEnabled ? 'Đang Bật' : 'Đã Tắt'}
              </button>

              <button
                type="submit"
                className="btn-w4u-primary px-5 py-2 rounded-xl text-xs font-bold shadow-sm flex items-center justify-center gap-1.5 whitespace-nowrap"
              >
                {freeshipSaved ? (
                  <>
                    <Check className="w-4 h-4 text-white" />
                    <span>Đã Lưu!</span>
                  </>
                ) : (
                  <span>Lưu Ngưỡng</span>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Quick presets for Freeship */}
        <div className="mt-4 pt-4 border-t border-white/10 flex flex-wrap items-center gap-2 text-[11px]">
          <span className="text-blue-300 font-medium">Gợi ý nhanh:</span>
          {[
            { label: '500.000₫', val: '500000' },
            { label: '800.000₫', val: '800000' },
            { label: '1.000.000₫ (Chuẩn W4U)', val: '1000000' },
            { label: '1.500.000₫', val: '1500000' },
          ].map((preset) => (
            <button
              key={preset.val}
              type="button"
              onClick={() => setFreeshipThreshold(preset.val)}
              className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors font-bold border border-white/10"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-bold">
            <Tag className="w-4 h-4 text-[#0055FE]" />
            <span>Tổng Mã Coupon</span>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 font-display mt-2">
            {coupons.length}
          </p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Đang Hoạt Động</span>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-emerald-600 font-display mt-2">
            {activeCount}
          </p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-bold">
            <Users className="w-4 h-4 text-amber-500" />
            <span>Lượt Đã Dùng</span>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 font-display mt-2">
            {totalUsed}
          </p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-bold">
            <Truck className="w-4 h-4 text-[#00D2FF]" />
            <span>Ngưỡng Freeship Sàn</span>
          </div>
          <p className="text-xl sm:text-2xl font-black text-[#0055FE] font-display mt-2">
            {Number(freeshipThreshold).toLocaleString('vi-VN')}₫
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full sm:w-auto">
          {[
            { id: 'all', label: 'Tất Cả' },
            { id: 'percent', label: 'Giảm Phần Trăm (%)' },
            { id: 'fixed', label: 'Giảm Thẳng (VNĐ)' },
            { id: 'freeship', label: 'Mã Freeship' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setFilterType(t.id as any)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                filterType === t.id
                  ? 'bg-[#0055FE] text-white shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo mã (WHEY10, SALE...)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:border-[#0055FE] focus:outline-none uppercase"
          />
        </div>
      </div>

      {/* COUPONS TABLE */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-xs text-slate-400">
            Đang tải dữ liệu coupon...
          </div>
        ) : filteredCoupons.length === 0 ? (
          <div className="py-20 text-center text-xs text-slate-500 space-y-2">
            <Tag className="w-8 h-8 text-slate-300 mx-auto" />
            <p>Không tìm thấy mã coupon nào.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-400 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-6 py-4 font-bold">Mã Coupon</th>
                  <th className="px-6 py-4 font-bold">Mức Giảm Giá</th>
                  <th className="px-6 py-4 font-bold">Đơn Hàng Tối Thiểu</th>
                  <th className="px-6 py-4 font-bold">Lượt Dùng & Hạn Dùng</th>
                  <th className="px-6 py-4 font-bold text-center">Trạng Thái</th>
                  <th className="px-6 py-4 font-bold text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCoupons.map((coupon) => {
                  const isPercent = Boolean(coupon.discount_percent);
                  const isFreeship = coupon.discount_amount === 30000 || coupon.code.includes('SHIP');

                  return (
                    <tr key={coupon.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Code & Description */}
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-[#0055FE] border border-blue-200 rounded-lg text-xs font-mono font-black tracking-wider">
                            <Sparkles className="w-3 h-3" />
                            <span>{coupon.code}</span>
                          </span>
                          <p className="text-[11px] text-slate-500 font-medium max-w-xs">
                            {coupon.description || 'Ưu đãi mua hàng'}
                          </p>
                        </div>
                      </td>

                      {/* Discount Value */}
                      <td className="px-6 py-4">
                        {isPercent ? (
                          <div className="space-y-0.5">
                            <span className="text-sm font-black text-[#0055FE] font-display">
                              Giảm {coupon.discount_percent}%
                            </span>
                            {coupon.max_discount && (
                              <p className="text-[10px] text-slate-400">
                                Tối đa {Number(coupon.max_discount).toLocaleString('vi-VN')}₫
                              </p>
                            )}
                          </div>
                        ) : isFreeship ? (
                          <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 inline-flex items-center gap-1">
                            <Truck className="w-3.5 h-3.5" />
                            <span>Freeship 30.000₫</span>
                          </span>
                        ) : (
                          <span className="text-sm font-black text-emerald-600 font-display">
                            -{(coupon.discount_amount || 0).toLocaleString('vi-VN')}₫
                          </span>
                        )}
                      </td>

                      {/* Min Order Value */}
                      <td className="px-6 py-4">
                        {coupon.min_order_value > 0 ? (
                          <span className="font-bold text-slate-700">
                            Từ {Number(coupon.min_order_value).toLocaleString('vi-VN')}₫
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">Mọi giá trị đơn</span>
                        )}
                      </td>

                      {/* Usage & Expiration */}
                      <td className="px-6 py-4 space-y-1 text-slate-600">
                        <div className="flex items-center gap-1 text-[11px]">
                          <span className="font-bold text-slate-900">{coupon.used_count || 0}</span>
                          <span className="text-slate-400">/ {coupon.usage_limit ? coupon.usage_limit : '∞'} lượt</span>
                        </div>
                        {coupon.expires_at && (
                          <div className="flex items-center gap-1 text-[10px] text-slate-400">
                            <Calendar className="w-3 h-3" />
                            <span>HSD: {new Date(coupon.expires_at).toLocaleDateString('vi-VN')}</span>
                          </div>
                        )}
                      </td>

                      {/* Status Toggle */}
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleToggleStatus(coupon)}
                          className={`px-3 py-1 rounded-full text-[11px] font-bold inline-flex items-center gap-1.5 transition-all ${
                            coupon.is_active
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                              : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${coupon.is_active ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                          <span>{coupon.is_active ? 'Kích hoạt' : 'Tạm dừng'}</span>
                        </button>
                      </td>

                      {/* Delete */}
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDeleteCoupon(coupon.id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                          title="Xóa coupon"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODAL: TẠO MÃ COUPON MỚI (% HOẶC TIỀN MẶT VNĐ HOẶC FREESHIP)             */}
      {/* ========================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 max-h-[92vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold text-[#0055FE] uppercase tracking-wider bg-blue-50 px-2.5 py-1 rounded-md">
                  Tạo Mã Giảm Giá
                </span>
                <h3 className="text-xl font-black text-slate-900 font-display mt-1.5">
                  Thêm Mã Khuyến Mãi Mới
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-900 rounded-full hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {submitError && (
              <div className="p-3 bg-red-50 text-red-700 text-xs font-bold rounded-2xl flex items-center gap-2 border border-red-200">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{submitError}</span>
              </div>
            )}

            <form onSubmit={handleSubmitModal} className="space-y-4 text-xs">
              {/* Code & Description */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mã Coupon (Code) *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: WHEY20, GIAM100K..."
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#0055FE] focus:outline-none font-mono font-bold text-sm text-[#0055FE] uppercase"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mô tả ngắn hiển thị</label>
                  <input
                    type="text"
                    placeholder="Giảm 10% tối đa 200k..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#0055FE] focus:outline-none"
                  />
                </div>
              </div>

              {/* LOẠI GIẢM GIÁ: 3 TÙY CHỌN (% HOẶC VNĐ HOẶC FREESHIP) */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <label className="block font-bold text-slate-800 text-xs">
                  Hình Thức Giảm Giá:
                </label>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setDiscountType('percent')}
                    className={`py-2.5 px-3 rounded-xl font-bold flex flex-col items-center gap-1 transition-all border ${
                      discountType === 'percent'
                        ? 'bg-[#0055FE] text-white border-[#0055FE] shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <Percent className="w-4 h-4" />
                    <span>Giảm Theo %</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDiscountType('fixed')}
                    className={`py-2.5 px-3 rounded-xl font-bold flex flex-col items-center gap-1 transition-all border ${
                      discountType === 'fixed'
                        ? 'bg-[#0055FE] text-white border-[#0055FE] shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <DollarSign className="w-4 h-4" />
                    <span>Giảm Thẳng VNĐ</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDiscountType('freeship')}
                    className={`py-2.5 px-3 rounded-xl font-bold flex flex-col items-center gap-1 transition-all border ${
                      discountType === 'freeship'
                        ? 'bg-[#0055FE] text-white border-[#0055FE] shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <Truck className="w-4 h-4" />
                    <span>Mã Freeship</span>
                  </button>
                </div>

                {/* Conditional Fields based on discountType */}
                {discountType === 'percent' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Phần trăm giảm (%) *</label>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        required
                        placeholder="10"
                        value={formData.discount_percent}
                        onChange={(e) => setFormData({ ...formData, discount_percent: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:border-[#0055FE] focus:outline-none font-bold text-[#0055FE]"
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="font-bold text-slate-700">Giảm tối đa (VNĐ, tùy chọn)</label>
                        {formData.max_discount && (
                          <span className="text-[11px] font-bold text-slate-500">
                            {Number(formData.max_discount.replace(/\D/g, '')).toLocaleString('vi-VN')}₫
                          </span>
                        )}
                      </div>
                      <input
                        type="text"
                        placeholder="Ví dụ: 200.000"
                        value={formData.max_discount ? Number(formData.max_discount.replace(/\D/g, '')).toLocaleString('vi-VN') : ''}
                        onChange={(e) => setFormData({ ...formData, max_discount: e.target.value.replace(/\D/g, '') })}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:border-[#0055FE] focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                {discountType === 'fixed' && (
                  <div className="pt-2">
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-bold text-slate-700">Số tiền giảm trực tiếp (VNĐ) *</label>
                      {formData.discount_amount && (
                        <span className="text-[11px] font-black text-emerald-600 font-display">
                          {Number(formData.discount_amount.replace(/\D/g, '')).toLocaleString('vi-VN')}₫
                        </span>
                      )}
                    </div>
                    <input
                      type="text"
                      required
                      placeholder="Ví dụ: 50.000, 100.000, 200.000"
                      value={formData.discount_amount ? Number(formData.discount_amount.replace(/\D/g, '')).toLocaleString('vi-VN') : ''}
                      onChange={(e) => setFormData({ ...formData, discount_amount: e.target.value.replace(/\D/g, '') })}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl focus:border-[#0055FE] focus:outline-none font-black text-sm text-emerald-600"
                    />
                  </div>
                )}

                {discountType === 'freeship' && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-[11px] flex items-center gap-2">
                    <Truck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Mã này sẽ tự động giảm 100% phí giao hàng (30.000₫) cho khách hàng.</span>
                  </div>
                )}
              </div>

              {/* Conditions: Min Order & Usage Limit */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-slate-700">Đơn hàng tối thiểu (VNĐ)</label>
                    {formData.min_order_value && Number(formData.min_order_value) > 0 && (
                      <span className="text-[11px] font-bold text-slate-500">
                        {Number(formData.min_order_value.replace(/\D/g, '')).toLocaleString('vi-VN')}₫
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    placeholder="0 (Áp dụng mọi đơn)"
                    value={formData.min_order_value && formData.min_order_value !== '0' ? Number(formData.min_order_value.replace(/\D/g, '')).toLocaleString('vi-VN') : ''}
                    onChange={(e) => setFormData({ ...formData, min_order_value: e.target.value.replace(/\D/g, '') })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#0055FE] focus:outline-none font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Giới hạn số lượt dùng</label>
                  <input
                    type="number"
                    placeholder="100 (Để trống = Vô hạn)"
                    value={formData.usage_limit}
                    onChange={(e) => setFormData({ ...formData, usage_limit: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#0055FE] focus:outline-none"
                  />
                </div>
              </div>

              {/* Expiration Date & Active Toggle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center pt-1">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Ngày hết hạn</label>
                  <input
                    type="date"
                    value={formData.expires_at}
                    onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#0055FE] focus:outline-none"
                  />
                </div>
                <div className="flex items-center gap-2 pt-5">
                  <input
                    type="checkbox"
                    id="coupon-active-check"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-4 h-4 text-[#0055FE] rounded border-slate-300 focus:ring-[#0055FE]"
                  />
                  <label htmlFor="coupon-active-check" className="text-xs font-bold text-slate-800 cursor-pointer">
                    Kích hoạt sử dụng ngay
                  </label>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-w4u-primary px-7 py-2.5 font-bold rounded-xl shadow-xs disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmitting ? 'Đang Tạo...' : 'Tạo Coupon Ngay'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
