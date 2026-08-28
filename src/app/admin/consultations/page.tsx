'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { 
  PhoneCall, 
  Phone, 
  User, 
  CheckCircle2, 
  Clock, 
  Search,
  MessageSquare,
  Sparkles
} from 'lucide-react';

interface ConsultationItem {
  id: string;
  full_name: string;
  phone: string;
  fitness_goal?: string;
  note?: string;
  status: string;
  created_at: string;
}

export default function AdminConsultationsPage() {
  const [requests, setRequests] = useState<ConsultationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchConsultations = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('consultation_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setRequests(data);
      }
    } catch (err) {
      console.error('Lỗi tải danh sách tư vấn:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConsultations();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/consultations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setRequests((prev) =>
          prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
        );
      }
    } catch (err) {
      console.error('Lỗi cập nhật trạng thái gọi:', err);
    }
  };

  const filteredRequests = requests.filter((r) => {
    if (statusFilter !== 'all' && r.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return r.full_name.toLowerCase().includes(q) || r.phone.includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-display">
            Yêu Cầu Tư Vấn & Gọi Lại ({filteredRequests.length})
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Danh sách khách hàng để lại thông tin cần chuyên viên W4U tư vấn lộ trình
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full sm:w-auto">
          {[
            { id: 'all', label: 'Tất Cả' },
            { id: 'pending', label: 'Chờ Liên Hệ' },
            { id: 'contacted', label: 'Đã Gọi Điện' },
            { id: 'completed', label: 'Đã Xong' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                statusFilter === tab.id
                  ? 'bg-[#0055FE] text-white'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo tên hoặc SĐT..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:border-[#0055FE] focus:outline-none"
          />
        </div>
      </div>

      {/* Consultations Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-xs text-slate-400">
            Đang tải dữ liệu từ Supabase...
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="py-20 text-center text-xs text-slate-500 space-y-2">
            <PhoneCall className="w-8 h-8 text-slate-300 mx-auto" />
            <p>Chưa có yêu cầu gọi lại nào.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-400 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-6 py-4 font-bold">Khách Hàng</th>
                  <th className="px-6 py-4 font-bold">Số Điện Thoại</th>
                  <th className="px-6 py-4 font-bold">Mục Tiêu Thể Hình</th>
                  <th className="px-6 py-4 font-bold">Thời Gian Gửi</th>
                  <th className="px-6 py-4 font-bold">Trạng Thái</th>
                  <th className="px-6 py-4 font-bold text-right">Hành Động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-blue-50 text-[#0055FE] flex items-center justify-center font-black text-[10px]">
                          {req.full_name.charAt(0).toUpperCase()}
                        </div>
                        <span>{req.full_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-slate-800">
                      <a
                        href={`tel:${req.phone}`}
                        className="text-[#0055FE] hover:underline flex items-center gap-1.5"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>{req.phone}</span>
                      </a>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      <span className="px-2.5 py-1 bg-slate-100 rounded-lg text-[11px] font-medium text-slate-700">
                        {req.fitness_goal || 'Tư vấn chung'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-400 text-[11px]">
                      {new Date(req.created_at).toLocaleDateString('vi-VN')} {new Date(req.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        req.status === 'pending'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : req.status === 'contacted'
                          ? 'bg-blue-50 text-[#0055FE] border border-blue-200'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}>
                        {req.status === 'pending' ? '🟡 Chờ gọi' :
                         req.status === 'contacted' ? '🔵 Đã gọi điện' : '🟢 Hoàn tất'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {req.status === 'pending' && (
                          <button
                            onClick={() => handleUpdateStatus(req.id, 'contacted')}
                            className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-[#0055FE] text-[11px] font-bold rounded-xl transition-colors"
                          >
                            Đánh dấu đã gọi
                          </button>
                        )}
                        {req.status === 'contacted' && (
                          <button
                            onClick={() => handleUpdateStatus(req.id, 'completed')}
                            className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 text-[11px] font-bold rounded-xl transition-colors"
                          >
                            Hoàn tất
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
