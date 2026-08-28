'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { 
  DollarSign, 
  ShoppingBag, 
  Clock, 
  PhoneCall, 
  TrendingUp, 
  ArrowRight,
  Package,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface OrderItem {
  id: string;
  order_code: string;
  customer_name: string;
  customer_phone: string;
  total_amount: number;
  payment_method: string;
  payment_status: string;
  order_status: string;
  created_at: string;
}

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    pendingOrders: 0,
    pendingConsultations: 0,
    totalProducts: 6,
  });
  const [recentOrders, setRecentOrders] = useState<OrderItem[]>([]);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const supabase = createClient();
        
        // 1. Fetch Orders
        const { data: orders } = await supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false });

        const orderList = orders || [];
        const revenue = orderList.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);
        const pendingCount = orderList.filter((o) => o.order_status === 'pending').length;

        // 2. Fetch Consultations
        const { data: consultations } = await supabase
          .from('consultation_requests')
          .select('id, status');
        const pendingConsult = (consultations || []).filter((c) => c.status === 'pending').length;

        // 3. Fetch Products Count
        const { count: prodCount } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true });

        setStats({
          totalRevenue: revenue,
          totalOrders: orderList.length,
          pendingOrders: pendingCount,
          pendingConsultations: pendingConsult,
          totalProducts: prodCount || 6,
        });

        setRecentOrders(orderList.slice(0, 5));
      } catch (err) {
        console.error('Error loading admin dashboard:', err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#08183A] to-[#0038FF] rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-[#00D2FF] uppercase tracking-wider">Bảng Điều Khiển</span>
          <h2 className="text-2xl sm:text-3xl font-black font-display mt-1">
            Chào mừng trở lại, Admin!
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            Toàn bộ dữ liệu đơn hàng, sản phẩm và yêu cầu tư vấn thể hình của Whey4You đang được đồng bộ thời gian thực qua Supabase.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/orders"
            className="px-5 py-3 bg-white text-[#08183A] font-bold text-xs rounded-2xl hover:bg-slate-100 transition-colors flex items-center gap-2 whitespace-nowrap shadow-sm"
          >
            <span>Xử Lý Đơn Hàng</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Doanh Thu */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tổng Doanh Thu</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 font-display">
            {stats.totalRevenue.toLocaleString('vi-VN')}₫
          </p>
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 font-bold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Tất cả các đơn đã tạo</span>
          </div>
        </div>

        {/* Card 2: Đơn Chờ Xử Lý */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Đơn Chờ Xử Lý</span>
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 font-display">
            {stats.pendingOrders} <span className="text-sm font-normal text-slate-400">/ {stats.totalOrders} đơn</span>
          </p>
          <div className="text-[11px] text-slate-500">
            Cần đóng gói & xác nhận giao
          </div>
        </div>

        {/* Card 3: Yêu Cầu Gọi Lại */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Yêu Cầu Gọi Lại</span>
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#0055FE] flex items-center justify-center">
              <PhoneCall className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 font-display">
            {stats.pendingConsultations}
          </p>
          <div className="text-[11px] text-slate-500">
            Khách gửi số cần tư vấn
          </div>
        </div>

        {/* Card 4: Tổng Sản Phẩm */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Sản Phẩm Trong Kho</span>
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 font-display">
            {stats.totalProducts}
          </p>
          <div className="text-[11px] text-emerald-600 font-bold">
            100% còn hàng sẵn sàng bán
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-black text-slate-900 font-display">
              Đơn Hàng Gần Đây
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Danh sách đơn đặt mới nhất từ khách hàng
            </p>
          </div>
          <Link
            href="/admin/orders"
            className="text-xs text-[#0055FE] hover:underline font-bold flex items-center gap-1"
          >
            <span>Xem tất cả ({stats.totalOrders})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">
            Đang tải dữ liệu đơn hàng...
          </div>
        ) : recentOrders.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500 space-y-2">
            <ShoppingBag className="w-8 h-8 text-slate-300 mx-auto" />
            <p>Chưa có đơn hàng nào. Hãy đặt thử một đơn hàng trên website!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider text-[10px]">
                  <th className="pb-3 font-bold">Mã Đơn</th>
                  <th className="pb-3 font-bold">Khách Hàng</th>
                  <th className="pb-3 font-bold">Số Điện Thoại</th>
                  <th className="pb-3 font-bold">Tổng Tiền</th>
                  <th className="pb-3 font-bold">Thanh Toán</th>
                  <th className="pb-3 font-bold">Trạng Thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 font-mono font-bold text-slate-900">
                      {order.order_code}
                    </td>
                    <td className="py-3.5 font-bold text-slate-800">
                      {order.customer_name}
                    </td>
                    <td className="py-3.5 text-slate-600 font-mono">
                      {order.customer_phone}
                    </td>
                    <td className="py-3.5 font-bold text-[#0055FE]">
                      {Number(order.total_amount).toLocaleString('vi-VN')}₫
                    </td>
                    <td className="py-3.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        order.payment_status === 'paid'
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {order.payment_method.toUpperCase()} ({order.payment_status === 'paid' ? 'Đã thu' : 'Chờ thu'})
                      </span>
                    </td>
                    <td className="py-3.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        order.order_status === 'pending'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : order.order_status === 'shipping'
                          ? 'bg-blue-50 text-[#0055FE] border border-blue-200'
                          : order.order_status === 'delivered'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {order.order_status === 'pending' ? 'Chờ xác nhận' :
                         order.order_status === 'confirmed' ? 'Đã xác nhận' :
                         order.order_status === 'shipping' ? 'Đang giao' :
                         order.order_status === 'delivered' ? 'Đã giao' : 'Đã hủy'}
                      </span>
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
