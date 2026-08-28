import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

// Sample default seed coupons if database table is empty
const DEFAULT_COUPONS = [
  {
    id: 'c-1',
    code: 'WHEY10',
    description: 'Giảm 10% cho toàn bộ đơn hàng',
    discount_percent: 10,
    discount_amount: null,
    min_order_value: 0,
    max_discount: 200000,
    expires_at: '2026-12-31T23:59:59Z',
    usage_limit: 500,
    used_count: 38,
    is_active: true,
  },
  {
    id: 'c-2',
    code: 'SALE50K',
    description: 'Giảm trực tiếp 50.000₫ cho đơn từ 800.000₫',
    discount_percent: null,
    discount_amount: 50000,
    min_order_value: 800000,
    max_discount: null,
    expires_at: '2026-12-31T23:59:59Z',
    usage_limit: 200,
    used_count: 15,
    is_active: true,
  },
  {
    id: 'c-3',
    code: 'FREESHIP',
    description: 'Miễn phí giao hàng 30.000₫ cho đơn từ 500.000₫',
    discount_percent: null,
    discount_amount: 30000,
    min_order_value: 500000,
    max_discount: null,
    expires_at: '2026-12-31T23:59:59Z',
    usage_limit: 1000,
    used_count: 82,
    is_active: true,
  },
  {
    id: 'c-4',
    code: 'SUPERPUMP',
    description: 'Giảm 15% tối đa 300.000₫ cho dòng Sức mạnh',
    discount_percent: 15,
    discount_amount: null,
    min_order_value: 1200000,
    max_discount: 300000,
    expires_at: '2026-12-31T23:59:59Z',
    usage_limit: 100,
    used_count: 12,
    is_active: true,
  },
];

export async function GET() {
  try {
    const supabase = createAdminClient();
    if (!supabase) {
      return NextResponse.json({ success: true, data: DEFAULT_COUPONS });
    }

    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      return NextResponse.json({ success: true, data: DEFAULT_COUPONS });
    }

    return NextResponse.json({ success: true, data });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Lỗi lấy danh sách coupon' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.code || typeof body.code !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Vui lòng nhập mã coupon.' },
        { status: 400 }
      );
    }

    const cleanCode = body.code.trim().toUpperCase();

    const couponData = {
      code: cleanCode,
      description: body.description?.trim() || `Ưu đãi mã ${cleanCode}`,
      discount_percent: body.discount_percent ? Number(body.discount_percent) : null,
      discount_amount: body.discount_amount ? Number(body.discount_amount) : null,
      min_order_value: body.min_order_value ? Number(body.min_order_value) : 0,
      max_discount: body.max_discount ? Number(body.max_discount) : null,
      expires_at: body.expires_at || null,
      usage_limit: body.usage_limit ? Number(body.usage_limit) : null,
      is_active: body.is_active !== undefined ? Boolean(body.is_active) : true,
    };

    const supabase = createAdminClient();
    if (supabase) {
      const { data, error } = await supabase
        .from('coupons')
        .insert([couponData])
        .select()
        .single();

      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
      }

      return NextResponse.json({ success: true, data }, { status: 201 });
    }

    return NextResponse.json({
      success: true,
      data: { id: `c-${Date.now()}`, ...couponData, used_count: 0 },
    }, { status: 201 });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Lỗi tạo coupon mới' },
      { status: 500 }
    );
  }
}
