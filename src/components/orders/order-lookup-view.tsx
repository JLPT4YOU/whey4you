'use client';

import React, { useState } from 'react';
import {
  Search,
  Truck,
  Clock,
  AlertCircle,
  ExternalLink,
  Copy,
  Check,
  MapPin,
  Calendar,
  Building2,
} from 'lucide-react';
import type { SPXTrackingResponse } from '@/app/api/shipping/spx/[trackingNumber]/route';

export function OrderLookupView() {
  const [searchCode, setSearchCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [spxData, setSpxData] = useState<SPXTrackingResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [copied, setCopied] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSearch = async (e?: React.FormEvent, customCode?: string) => {
    if (e) e.preventDefault();
    const code = (customCode !== undefined ? customCode : searchCode).trim();
    if (!code) return;

    setIsLoading(true);
    setErrorMsg('');
    setSpxData(null);

    try {
      const res = await fetch(`/api/shipping/spx/${encodeURIComponent(code)}`);
      const data = await res.json();

      if (data.success && data.data) {
        setSpxData(data.data);
      } else {
        setErrorMsg(
          data.error || 'Không tìm thấy thông tin mã vận đơn SPX này. Vui lòng kiểm tra lại.'
        );
      }
    } catch {
      setErrorMsg('Lỗi kết nối máy chủ. Vui lòng thử lại sau giây lát.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-10">
      {/* Page Title & Partner Badge */}
      <div className="text-center mb-6 sm:mb-8">
        <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200/60 text-[#EE4D2D] rounded-full text-[10px] sm:text-xs font-black uppercase tracking-wider mb-2.5 sm:mb-3.5 shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-[#EE4D2D] animate-ping shrink-0" />
          <Truck className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">Đối Tác Vận Chuyển Chính Thức SPX Express</span>
        </div>
        <h1 className="text-xl sm:text-3xl lg:text-4xl font-black text-slate-950 font-display uppercase tracking-tight">
          Tra Cứu Vận Đơn SPX Express
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1.5 max-w-lg mx-auto">
          Nhập mã vận đơn SPX Express để cập nhật tức thì từng mốc hành trình và kho bãi theo thời gian thực.
        </p>
      </div>

      {/* Search Input Box */}
      <div className="bg-white p-4 sm:p-7 rounded-3xl shadow-xs border border-slate-200/80 mb-6 sm:mb-8">
        <form onSubmit={(e) => handleSearch(e)} className="flex flex-col sm:flex-row gap-2.5 sm:gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Nhập mã vận đơn SPX (vd: SPXVN...)..."
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value)}
              className="w-full pl-10 sm:pl-11 pr-4 py-3 sm:py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-base sm:text-sm font-bold text-slate-900 focus:bg-white focus:border-[#EE4D2D] focus:outline-none transition-colors uppercase font-mono tracking-wide placeholder:font-sans placeholder:font-normal placeholder:normal-case"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || !searchCode.trim()}
            className="px-6 sm:px-8 py-3 sm:py-3.5 rounded-2xl font-bold text-xs sm:text-sm text-white disabled:opacity-50 whitespace-nowrap transition-all shadow-xs cursor-pointer bg-[#EE4D2D] hover:bg-[#D93D1E] shadow-orange-500/20"
          >
            {isLoading ? (
              <span className="inline-flex items-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Đang tra cứu...
              </span>
            ) : (
              'Tra Cứu Ngay'
            )}
          </button>
        </form>

        {errorMsg && (
          <div className="mt-3.5 p-3 sm:p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100 text-xs font-semibold flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* SPX Express Tracking Result View */}
      {spxData && (
        <div className="bg-white rounded-3xl shadow-xs border border-slate-200/80 overflow-hidden mb-8 animate-in fade-in slide-in-from-bottom-3 duration-300">
          {/* SPX Header Banner */}
          <div className="bg-gradient-to-r from-orange-500 via-[#EE4D2D] to-red-600 p-4 sm:p-7 text-white">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-white/20 backdrop-blur-md rounded-full text-[10px] sm:text-[11px] font-bold uppercase tracking-wider">
                  <Truck className="w-3 h-3" />
                  SPX Express (Shopee Xpress)
                </div>
                <div className="flex items-center gap-2.5 pt-0.5">
                  <h2 className="text-lg sm:text-2xl font-black font-mono tracking-wide">
                    {spxData.trackingNumber}
                  </h2>
                  <button
                    type="button"
                    onClick={() => handleCopy(spxData.trackingNumber)}
                    className="p-1.5 rounded-lg bg-white/15 hover:bg-white/25 transition-colors cursor-pointer text-white"
                    title="Sao chép mã vận đơn"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                {spxData.slsTrackingNumber && (
                  <p className="text-[10px] sm:text-[11px] text-white/80 font-mono">
                    Mã SLS: {spxData.slsTrackingNumber}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-black border backdrop-blur-md ${
                    spxData.isDelivered
                      ? 'bg-emerald-500 text-white border-emerald-400'
                      : 'bg-white text-[#EE4D2D] border-white/50'
                  }`}
                >
                  {spxData.statusGroup}
                </span>
                <a
                  href={`https://spx.vn/track?${encodeURIComponent(spxData.trackingNumber)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-bold bg-white/15 hover:bg-white/25 border border-white/30 text-white transition-colors"
                >
                  Xem trên SPX.vn
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>

          {/* Quick Status Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 p-4 sm:p-7 bg-orange-50/30 border-b border-slate-100">
            <div className="flex items-start gap-3 p-3.5 sm:p-4 bg-white rounded-2xl border border-orange-100">
              <div className="p-2 sm:p-2.5 rounded-xl bg-orange-100 text-[#EE4D2D] shrink-0">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Trạng thái mới nhất
                </span>
                <p className="text-xs sm:text-sm font-bold text-slate-900 mt-0.5">
                  {spxData.statusDescription}
                </p>
                {spxData.records[0] && (
                  <p className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5">
                    Cập nhật: {spxData.records[0].formattedTime}
                  </p>
                )}
              </div>
            </div>

            {spxData.estimatedDelivery && (
              <div className="flex items-start gap-3 p-3.5 sm:p-4 bg-white rounded-2xl border border-orange-100">
                <div className="p-2 sm:p-2.5 rounded-xl bg-amber-100 text-amber-700 shrink-0">
                  <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div>
                  <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Thời gian dự kiến giao (EDD)
                  </span>
                  <p className="text-xs sm:text-sm font-bold text-slate-900 mt-0.5">
                    {spxData.estimatedDelivery.formattedRange}
                  </p>
                  <p className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5">
                    Giao tận tay • Có ký nhận EPOD
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Detailed Real-time Timeline */}
          <div className="p-4 sm:p-8">
            <div className="flex items-center justify-between mb-5 sm:mb-6">
              <h3 className="text-[11px] sm:text-xs font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5 sm:gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#EE4D2D]" />
                Hành Trình Vận Chuyển ({spxData.records.length} mốc)
              </h3>
              <span className="text-[10px] sm:text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full border border-emerald-100">
                Thời Gian Thực
              </span>
            </div>

            <div className="relative pl-5 sm:pl-6 border-l-2 border-slate-200/80 space-y-5 sm:space-y-8 ml-1 sm:ml-2">
              {spxData.records.map((record, idx) => {
                const isLatest = idx === 0;
                const isCompleted = record.milestoneName === 'Delivered' || record.trackingCode === 'F980';

                return (
                  <div key={idx} className="relative group">
                    {/* Timeline Dot */}
                    <div
                      className={`absolute -left-[27px] sm:-left-[31px] top-1 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full border-2 transition-all ${
                        isLatest
                          ? isCompleted
                            ? 'bg-emerald-500 border-white ring-4 ring-emerald-100'
                            : 'bg-[#EE4D2D] border-white ring-4 ring-orange-100'
                          : 'bg-white border-slate-300 group-hover:border-slate-400'
                      }`}
                    />

                    <div className="space-y-1">
                      {/* Time & Milestone badge */}
                      <div className="flex items-center flex-wrap gap-1.5 sm:gap-2">
                        <span className="text-[11px] sm:text-xs font-mono font-bold text-slate-800">
                          {record.formattedTime}
                        </span>
                        <span
                          className={`text-[9px] sm:text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider ${
                            isCompleted
                              ? 'bg-emerald-100 text-emerald-700'
                              : isLatest
                              ? 'bg-orange-100 text-[#EE4D2D]'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {record.milestoneName || record.trackingName}
                        </span>
                      </div>

                      {/* Description */}
                      <p
                        className={`text-xs sm:text-sm ${
                          isLatest ? 'font-bold text-slate-950' : 'font-medium text-slate-700'
                        }`}
                      >
                        {record.buyerDescription || record.sellerDescription}
                      </p>

                      {/* Location Details if available */}
                      {record.currentLocation?.locationName && (
                        <div className="inline-flex items-center gap-1.5 text-[10px] sm:text-[11px] text-slate-500 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100 mt-1 max-w-full">
                          <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="font-semibold text-slate-700 truncate">
                            {record.currentLocation.locationName}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
