import { createClient } from '@/lib/supabase/server';
import { CartItem } from '@/types/product';

export interface CreateOrderParams {
  userId?: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  shippingAddress: string;
  city?: string;
  district?: string;
  ward?: string;
  note?: string;
  couponCode?: string;
  subtotal: number;
  shippingFee: number;
  discountAmount: number;
  totalAmount: number;
  paymentMethod: 'cod' | 'vietqr' | 'momo' | 'vnpay' | 'zalopay';
  items: CartItem[];
}

export interface ConsultationParams {
  fullName: string;
  phone: string;
  fitnessGoal?: string;
  note?: string;
}

/**
 * Tạo đơn hàng mới trong Supabase
 */
export async function createOrder(params: CreateOrderParams) {
  try {
    const supabase = await createClient();
    const orderCode = `W4Y-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

    if (!supabase) {
      // Mock success if Supabase is not yet configured
      return {
        success: true,
        orderCode,
        isMock: true,
        message: 'Đơn hàng đã được ghi nhận (Chế độ mô phỏng).',
      };
    }

    // 1. Tạo bản ghi đơn hàng
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert({
        order_code: orderCode,
        user_id: params.userId || null,
        customer_name: params.customerName,
        customer_phone: params.customerPhone,
        customer_email: params.customerEmail || null,
        shipping_address: params.shippingAddress,
        city: params.city || 'Hồ Chí Minh',
        district: params.district || null,
        ward: params.ward || null,
        note: params.note || null,
        coupon_code: params.couponCode || null,
        subtotal: params.subtotal,
        shipping_fee: params.shippingFee,
        discount_amount: params.discountAmount,
        total_amount: params.totalAmount,
        payment_method: params.paymentMethod,
        payment_status: 'pending',
        order_status: 'pending',
      })
      .select('id, order_code')
      .single();

    if (orderError || !orderData) {
      console.error('Lỗi khi tạo đơn hàng Supabase:', orderError);
      return {
        success: false,
        error: orderError?.message || 'Không thể tạo đơn hàng.',
      };
    }

    // 2. Tạo các mục chi tiết đơn hàng (order_items)
    const orderItems = params.items.map((item) => ({
      order_id: orderData.id,
      product_id: item.product.id && !item.product.id.startsWith('prod-') ? item.product.id : null,
      product_name: item.product.name,
      product_image: item.product.image,
      flavor: item.selectedFlavor || null,
      size: item.selectedSize || null,
      quantity: item.quantity,
      unit_price: item.price,
      total_price: item.price * item.quantity,
    }));

    const { error: itemsError } = await supabase.from('order_items').insert(orderItems);

    if (itemsError) {
      console.warn('Lỗi khi thêm order_items:', itemsError);
    }

    return {
      success: true,
      orderId: orderData.id,
      orderCode: orderData.order_code,
      message: 'Đặt hàng thành công!',
    };
  } catch (err: unknown) {
    console.error('Lỗi không xác định khi tạo đơn:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Lỗi xử lý đơn hàng.',
    };
  }
}

/**
 * Gửi yêu cầu tư vấn gọi lại (từ Floating Hub / Popup)
 */
export async function submitConsultationRequest(params: ConsultationParams) {
  try {
    const supabase = await createClient();

    if (!supabase) {
      return {
        success: true,
        isMock: true,
        message: 'Yêu cầu tư vấn đã được tiếp nhận (Mô phỏng).',
      };
    }

    const { error } = await supabase.from('consultation_requests').insert({
      full_name: params.fullName,
      phone: params.phone,
      fitness_goal: params.fitnessGoal || null,
      note: params.note || null,
      status: 'pending',
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, message: 'Yêu cầu tư vấn đã được gửi thành công!' };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Lỗi không xác định' };
  }
}
