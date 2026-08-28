'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { 
  ShoppingBag, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  Truck, 
  XCircle, 
  Eye, 
  X,
  Phone,
  MapPin,
  FileText
} from 'lucide-react';

interface OrderItem {
  id: string;
  order_code: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  shipping_address: string;
  city: string;
  note?: string;
  subtotal: number;
  shipping_fee: number;
  discount_amount: number;
  total_amount: number;
  payment_method: string;
  payment_status: string;
  order_status: string;
  created_at: string;
  order_items?: any[];
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<OrderItem | null>(null);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setOrders(data);
      }
    } catch (err) {
      console.error('Lỗi tải đơn hàng:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    setIsUpdating(orderId);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, order_status: newStatus } : o))
        );
        if (selectedOrder?.id === orderId) {
          setSelectedOrder((prev) => (prev ? { ...prev, order_status: newStatus } : null));
        }
      }
    } catch (err) {
      console.error('Lỗi cập nhật trạng thái:', err);
    } finally {
      setIsUpdating(null);
    }
  };

  const handleUpdatePaymentStatus = async (orderId: string, newPaymentStatus: string) => {
    setIsUpdating(orderId);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payment_status: newPaymentStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, payment_status: newPaymentStatus } : o))
        );
        if (selectedOrder?.id === orderId) {
          setSelectedOrder((prev) => (prev ? { ...prev, payment_status: newPaymentStatus } : null));
        }
      }
    } catch (err) {
      console.error('Lỗi cập nhật thanh toán:', err);
    } finally {
      setIsUpdating(null);
    }
  };

  // Filter orders
  const filteredOrders = orders.filter((o) => {
    if (statusFilter !== 'all' && o.order_status !== statusFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        o.order_code.toLowerCase().includes(q) ||
        o.customer_name.toLowerCase().includes(q) ||
        o.customer_phone.includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-display">
            Quản Lý Đơn Hàng ({filteredOrders.length})
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Xử lý và cập nhật tiến trình vận chuyển cho các đơn đặt hàng
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar w-full md:w-auto">
          {[
            { id: 'all', label: 'Tất Cả' },
            { id: 'pending', label: 'Chờ Xử Lý' },
            { id: 'confirmed', label: 'Đã Xác Nhận' },
            { id: 'shipping', label: 'Đang Giao' },
            { id: 'delivered', label: 'Đã Giao' },
            { id: 'cancelled', label: 'Đã Hủy' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                statusFilter === tab.id
                  ? 'bg-[#0055FE] text-white shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo mã, tên, SĐT..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:border-[#0055FE] focus:outline-none"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-xs text-slate-400">
            Đang tải dữ liệu từ Supabase...
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="py-20 text-center text-xs text-slate-500 space-y-2">
            <ShoppingBag className="w-8 h-8 text-slate-300 mx-auto" />
            <p>Không tìm thấy đơn hàng nào phù hợp.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-400 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-6 py-4 font-bold">Mã Đơn</th>
                  <th className="px-6 py-4 font-bold">Khách Hàng</th>
                  <th className="px-6 py-4 font-bold">SĐT</th>
                  <th className="px-6 py-4 font-bold">Tổng Tiền</th>
                  <th className="px-6 py-4 font-bold">Thanh Toán</th>
                  <th className="px-6 py-4 font-bold">Trạng Thái Đơn</th>
                  <th className="px-6 py-4 font-bold text-right">Chi Tiết</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-slate-900">
                      {order.order_code}
                      <span className="block text-[10px] font-normal text-slate-400 font-sans mt-0.5">
                        {new Date(order.created_at).toLocaleDateString('vi-VN')}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-800">
                      {order.customer_name}
                    </td>
                    <td className="px-6 py-4 font-mono text-slate-600">
                      {order.customer_phone}
                    </td>
                    <td className="px-6 py-4 font-black text-[#0055FE]">
                      {Number(order.total_amount).toLocaleString('vi-VN')}₫
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={order.payment_status}
                        onChange={(e) => handleUpdatePaymentStatus(order.id, e.target.value)}
                        disabled={isUpdating === order.id}
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border focus:outline-none cursor-pointer ${
                          order.payment_status === 'paid'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        <option value="pending">⏳ Chờ thu ({order.payment_method.toUpperCase()})</option>
                        <option value="paid">✅ Đã thu tiền</option>
                        <option value="failed">❌ Thất bại</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={order.order_status}
                        onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                        disabled={isUpdating === order.id}
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border focus:outline-none cursor-pointer ${
                          order.order_status === 'pending'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : order.order_status === 'confirmed'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : order.order_status === 'shipping'
                            ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                            : order.order_status === 'delivered'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-red-50 text-red-700 border-red-200'
                        }`}
                      >
                        <option value="pending">🟡 Chờ xác nhận</option>
                        <option value="confirmed">🔵 Đã xác nhận</option>
                        <option value="shipping">🚚 Đang giao hàng</option>
                        <option value="delivered">🟢 Giao thành công</option>
                        <option value="cancelled">🔴 Đã hủy</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="p-2 text-slate-500 hover:text-[#0055FE] hover:bg-blue-50 rounded-xl transition-colors"
                        title="Xem chi tiết đơn"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Chi Tiết Đơn Hàng</span>
                <h3 className="text-xl font-black text-slate-900 font-mono mt-0.5">
                  {selectedOrder.order_code}
                </h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 text-slate-400 hover:text-slate-900 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Recipient info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-2xl text-xs">
              <div className="space-y-1.5">
                <p className="font-bold text-slate-400 uppercase text-[10px]">Người nhận hàng</p>
                <p className="font-bold text-slate-900">{selectedOrder.customer_name}</p>
                <p className="flex items-center gap-1 text-slate-600 font-mono">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  {selectedOrder.customer_phone}
                </p>
              </div>
              <div className="space-y-1.5">
                <p className="font-bold text-slate-400 uppercase text-[10px]">Địa chỉ giao hàng</p>
                <p className="flex items-start gap-1 text-slate-700 leading-snug">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span>{selectedOrder.shipping_address}, {selectedOrder.city}</span>
                </p>
                {selectedOrder.note && (
                  <p className="text-[11px] text-amber-700 bg-amber-50 p-1.5 rounded-lg">
                    Ghi chú: {selectedOrder.note}
                  </p>
                )}
              </div>
            </div>

            {/* Products List */}
            <div className="space-y-3">
              <p className="text-xs font-bold text-slate-900 uppercase">
                Sản phẩm trong đơn ({selectedOrder.order_items?.length || 0})
              </p>
              <div className="space-y-2">
                {(selectedOrder.order_items || []).map((item: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-slate-50/80 rounded-xl border border-slate-100 text-xs">
                    <div>
                      <p className="font-bold text-slate-900">{item.product_name}</p>
                      <p className="text-[11px] text-slate-400">
                        {item.flavor ? `Vị: ${item.flavor}` : ''} {item.size ? `• ${item.size}` : ''} • SL: x{item.quantity}
                      </p>
                    </div>
                    <span className="font-bold text-slate-900">
                      {Number(item.total_price).toLocaleString('vi-VN')}₫
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Total summary */}
            <div className="p-4 bg-blue-50/60 rounded-2xl text-xs space-y-1.5 border border-blue-100/60">
              <div className="flex justify-between text-slate-600">
                <span>Tạm tính:</span>
                <span>{Number(selectedOrder.subtotal).toLocaleString('vi-VN')}₫</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Phí vận chuyển:</span>
                <span>{Number(selectedOrder.shipping_fee) === 0 ? 'MIỄN PHÍ' : `${Number(selectedOrder.shipping_fee).toLocaleString('vi-VN')}₫`}</span>
              </div>
              {Number(selectedOrder.discount_amount) > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Giảm giá:</span>
                  <span>-{Number(selectedOrder.discount_amount).toLocaleString('vi-VN')}₫</span>
                </div>
              )}
              <div className="flex justify-between text-slate-900 font-extrabold text-sm pt-2 border-t border-blue-100">
                <span>Tổng thu:</span>
                <span className="text-[#0055FE] font-display text-base">
                  {Number(selectedOrder.total_amount).toLocaleString('vi-VN')}₫
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
