'use client';

import React from 'react';
import { Award } from 'lucide-react';

export function ConsultationSidebarCard() {
  const handleOpenContact = () => {
    const dockBtn = document.querySelector('[aria-label="Liên hệ W4U"]');
    if (dockBtn instanceof HTMLElement) {
      dockBtn.click();
    }
  };

  return (
    <div className="p-5 rounded-2xl bg-gradient-to-br from-[#08183A] to-slate-900 text-white shadow-lg space-y-3">
      <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
        <Award className="w-4 h-4" />
      </div>
      <h4 className="text-sm font-black">Cần Tư Vấn Dinh Dưỡng Cá Nhân Hóa?</h4>
      <p className="text-xs text-slate-300 leading-relaxed">
        AI Coach và chuyên gia W4U luôn sẵn sàng hỗ trợ bạn tính toán Macro và chọn Combo tối ưu.
      </p>
      <button
        type="button"
        onClick={handleOpenContact}
        className="w-full py-2.5 px-3 bg-[#0055FE] hover:bg-blue-600 active:scale-95 text-white text-xs font-black rounded-xl transition-all shadow-md cursor-pointer text-center"
      >
        Trò Chuyện Cùng Chuyên Gia
      </button>
    </div>
  );
}
