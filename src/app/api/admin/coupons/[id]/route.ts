import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    const supabase = createAdminClient();
    if (supabase) {
      const updatePayload: Record<string, any> = {};
      if (body.code !== undefined) updatePayload.code = body.code.trim().toUpperCase();
      if (body.description !== undefined) updatePayload.description = body.description;
      if (body.discount_percent !== undefined) updatePayload.discount_percent = body.discount_percent ? Number(body.discount_percent) : null;
      if (body.discount_amount !== undefined) updatePayload.discount_amount = body.discount_amount ? Number(body.discount_amount) : null;
      if (body.min_order_value !== undefined) updatePayload.min_order_value = Number(body.min_order_value);
      if (body.max_discount !== undefined) updatePayload.max_discount = body.max_discount ? Number(body.max_discount) : null;
      if (body.expires_at !== undefined) updatePayload.expires_at = body.expires_at;
      if (body.usage_limit !== undefined) updatePayload.usage_limit = body.usage_limit ? Number(body.usage_limit) : null;
      if (body.is_active !== undefined) updatePayload.is_active = Boolean(body.is_active);

      const { data, error } = await supabase
        .from('coupons')
        .update(updatePayload)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
      }

      return NextResponse.json({ success: true, data });
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Lỗi cập nhật coupon' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const supabase = createAdminClient();
    if (supabase) {
      const { error } = await supabase
        .from('coupons')
        .delete()
        .eq('id', id);

      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
      }
    }

    return NextResponse.json({ success: true, message: 'Đã xóa coupon' });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Lỗi xóa coupon' },
      { status: 500 }
    );
  }
}
