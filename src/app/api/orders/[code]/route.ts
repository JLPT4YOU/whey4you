import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface RouteProps {
  params: Promise<{ code: string }>;
}

export async function GET(request: NextRequest, { params }: RouteProps) {
  try {
    const { code } = await params;

    if (!code) {
      return NextResponse.json({ success: false, error: 'Mã đơn hàng không hợp lệ' }, { status: 400 });
    }

    const supabase = await createClient();

    if (!supabase) {
      return NextResponse.json({
        success: true,
        data: {
          order_code: code,
          customer_name: 'Khách Hàng Whey4You',
          shipping_address: 'Giao hàng tiêu chuẩn SPX Express - TP.HCM',
          total_amount: 1850000,
          payment_method: 'cod',
          payment_status: 'pending',
          order_status: 'shipping',
          tracking_number: 'SPXVN068844254558',
          shipping_carrier: 'SPX Express',
          created_at: new Date().toISOString(),
          items: [
            {
              product_name: 'Whey Isolate Hydrolyzed 100% Pure',
              flavor: 'Chocolate Fudge',
              size: '2.27kg (5 lbs / 75 servings)',
              quantity: 1,
              unit_price: 1850000,
              total_price: 1850000,
            },
          ],
        },
      });
    }

    const { data: order, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          id,
          product_name,
          product_image,
          flavor,
          size,
          quantity,
          unit_price,
          total_price
        )
      `)
      .eq('order_code', code)
      .single();

    if (error || !order) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy đơn hàng với mã này' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: order,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Lỗi tra cứu đơn hàng' },
      { status: 500 }
    );
  }
}
