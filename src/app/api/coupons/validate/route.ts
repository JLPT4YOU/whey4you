import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: NextRequest) {
  try {
    const { code, subtotal = 0 } = await request.json();

    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { valid: false, message: 'Vui lòng nhập mã giảm giá.' },
        { status: 400 }
      );
    }

    const cleanCode = code.trim().toUpperCase();

    // 1. Check Supabase DB
    const supabase = createAdminClient();
    if (supabase) {
      const { data: coupon, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', cleanCode)
        .eq('is_active', true)
        .single();

      if (!error && coupon) {
        // Check expiration
        if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
          return NextResponse.json({
            valid: false,
            message: 'Mã giảm giá này đã hết hạn sử dụng.',
          });
        }

        // Check min order value
        if (coupon.min_order_value && subtotal < Number(coupon.min_order_value)) {
          return NextResponse.json({
            valid: false,
            message: `Đơn hàng tối thiểu ${Number(coupon.min_order_value).toLocaleString('vi-VN')}₫ để áp dụng mã này.`,
          });
        }

        let discountAmount = 0;
        if (coupon.discount_percent) {
          discountAmount = Math.round((subtotal * coupon.discount_percent) / 100);
          if (coupon.max_discount && discountAmount > Number(coupon.max_discount)) {
            discountAmount = Number(coupon.max_discount);
          }
        } else if (coupon.discount_amount) {
          discountAmount = Number(coupon.discount_amount);
        }

        return NextResponse.json({
          valid: true,
          code: coupon.code,
          description: coupon.description || `Giảm ${coupon.discount_percent ? `${coupon.discount_percent}%` : `${discountAmount.toLocaleString('vi-VN')}₫`}`,
          discountPercent: coupon.discount_percent || 0,
          discountAmount: Math.min(discountAmount, subtotal),
        });
      }
    }

    // 2. Fallback promo codes
    const FALLBACK_COUPONS: Record<string, { percent: number; desc: string }> = {
      WHEY10: { percent: 10, desc: 'Giảm 10% đơn hàng Whey4You' },
      GYM10: { percent: 10, desc: 'Ưu đãi 10% thành viên Gymer' },
      W4U: { percent: 10, desc: 'Mã tri ân khách hàng thân thiết 10%' },
      SUPERPUMP: { percent: 15, desc: 'Giảm 15% tối đa sức mạnh' },
    };

    if (FALLBACK_COUPONS[cleanCode]) {
      const c = FALLBACK_COUPONS[cleanCode];
      const discountAmount = Math.round((subtotal * c.percent) / 100);
      return NextResponse.json({
        valid: true,
        code: cleanCode,
        description: c.desc,
        discountPercent: c.percent,
        discountAmount,
      });
    }

    return NextResponse.json({
      valid: false,
      message: 'Mã giảm giá không tồn tại hoặc đã hết hạn! Hãy thử: WHEY10 (Giảm 10%)',
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { valid: false, message: error instanceof Error ? error.message : 'Lỗi kiểm tra mã giảm giá' },
      { status: 500 }
    );
  }
}
