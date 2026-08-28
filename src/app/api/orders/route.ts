import { NextRequest, NextResponse } from 'next/server';
import { createOrder } from '@/lib/services/order-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.customerName || !body.customerPhone || !body.shippingAddress || !body.items || body.items.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Thiếu thông tin bắt buộc (Tên, Số điện thoại, Địa chỉ giao hàng hoặc Giỏ hàng trống)',
        },
        { status: 400 }
      );
    }

    const result = await createOrder(body);

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 });
    }

    return NextResponse.json(result, { status: 201 });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Lỗi xử lý đơn hàng' },
      { status: 500 }
    );
  }
}
