import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { slugify } from '@/lib/utils/slug';

interface RouteProps {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, { params }: RouteProps) {
  try {
    const { id } = await params;
    const body = await request.json();

    const supabase = createAdminClient();
    if (!supabase) {
      return NextResponse.json({ success: false, error: 'Không thể kết nối Supabase Admin' }, { status: 500 });
    }

    const updateData: Record<string, any> = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.slug !== undefined) updateData.slug = slugify(body.slug);
    if (body.tagline !== undefined) updateData.tagline = body.tagline;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.usage_guide !== undefined) updateData.usage_guide = body.usage_guide;
    if (body.usageGuide !== undefined) updateData.usage_guide = body.usageGuide;
    if (body.quality_commitment !== undefined) updateData.quality_commitment = body.quality_commitment;
    if (body.qualityCommitment !== undefined) updateData.quality_commitment = body.qualityCommitment;
    if (body.goal !== undefined) updateData.goal = body.goal;
    if (body.category_id !== undefined) {
      updateData.category_id = body.category_id;
      // Lấy category_name từ DB thay vì hardcode
      const { data: catData } = await supabase
        .from('categories')
        .select('name')
        .eq('slug', body.category_id)
        .single();
      updateData.category_name = catData?.name || 'Thực phẩm bổ sung';
    }
    if (body.images !== undefined) {
      const rawImages: string[] = Array.isArray(body.images)
        ? body.images.filter((img: string) => typeof img === 'string' && img.trim().length > 0)
        : [];
      updateData.images = rawImages;
      if (rawImages.length > 0 && body.image === undefined) {
        updateData.image = rawImages[0];
      }
    }
    if (body.image !== undefined) updateData.image = body.image;
    if (body.price !== undefined) updateData.price = body.price;
    if (body.original_price !== undefined) updateData.original_price = body.original_price;
    if (body.is_featured !== undefined) updateData.is_featured = body.is_featured;
    if (body.is_in_stock !== undefined) updateData.is_in_stock = body.is_in_stock;
    if (body.badge !== undefined) updateData.badge = body.badge;
    if (body.badge_type !== undefined) updateData.badge_type = body.badge_type;

    let updatedProductData = null;

    if (Object.keys(updateData).length > 0) {
      let { data, error } = await supabase
        .from('products')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      // Graceful fallback nếu cột images/usage_guide/quality_commitment chưa tồn tại trong Supabase
      if (error && (error.message.includes('images') || error.message.includes('usage_guide') || error.message.includes('quality_commitment'))) {
        if (error.message.includes('images')) delete updateData.images;
        if (error.message.includes('usage_guide')) delete updateData.usage_guide;
        if (error.message.includes('quality_commitment')) delete updateData.quality_commitment;

        const retry = await supabase
          .from('products')
          .update(updateData)
          .eq('id', id)
          .select()
          .single();
        data = retry.data;
        error = retry.error;
      }

      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
      }
      updatedProductData = data;
    }

    // Cập nhật is_in_stock ở products table đã được xử lý ở updateData phía trên.
    // KHÔNG overwrite is_in_stock từng variant — trạng thái kho từng size được quản lý riêng trong form edit.

    // Cập nhật Flavors nếu có
    if (Array.isArray(body.flavors)) {
      await supabase.from('product_variants').delete().eq('product_id', id).eq('type', 'flavor');
      if (body.flavors.length > 0) {
        const flavorRows = body.flavors
          .map((f: string, idx: number) => ({
            product_id: id,
            type: 'flavor',
            name: f.trim(),
            price_modifier: 0,
            stock_quantity: 100,
            is_in_stock: true,
            sort_order: idx + 1,
          }))
          .filter((f: any) => f.name.length > 0);

        if (flavorRows.length > 0) {
          await supabase.from('product_variants').insert(flavorRows);
        }
      }
    }

    // Cập nhật Sizes nếu có — lưu giá tuyệt đối trực tiếp
    if (Array.isArray(body.sizes)) {
      await supabase.from('product_variants').delete().eq('product_id', id).eq('type', 'size');
      if (body.sizes.length > 0) {
        const basePrice = Number(body.price !== undefined ? body.price : (updatedProductData?.price || 0));
        const sizeRows = body.sizes
          .map((s: any, idx: number) => {
            const isObj = typeof s === 'object' && s !== null;
            const name = (isObj ? s.name : String(s)).trim();
            const absolutePrice = isObj && s.price !== undefined && s.price !== '' ? Number(s.price) : basePrice;
            const originalPrice = isObj && s.original_price !== undefined && s.original_price !== '' && s.original_price !== null ? Number(s.original_price) : null;
            const inStock = isObj && s.is_in_stock !== undefined ? Boolean(s.is_in_stock) : true;

            return {
              product_id: id,
              type: 'size',
              name,
              price: absolutePrice,
              original_price: originalPrice,
              price_modifier: absolutePrice - basePrice,
              stock_quantity: 100,
              is_in_stock: inStock,
              sort_order: idx + 1,
            };
          })
          .filter((s: any) => s.name.length > 0);

        if (sizeRows.length > 0) {
          await supabase.from('product_variants').insert(sizeRows);
        }
      }
    }

    // Cập nhật Macros / Thông số nổi bật nếu có
    if (Array.isArray(body.macros)) {
      await supabase.from('product_nutrition').delete().eq('product_id', id);
      if (body.macros.length > 0) {
        const nutritionRows = body.macros
          .map((m: any, idx: number) => ({
            product_id: id,
            label: m.label || 'Thông số',
            value: m.value || '',
            badge_color: m.badge_color || null,
            sort_order: idx + 1,
          }))
          .filter((m: any) => m.value.length > 0);

        if (nutritionRows.length > 0) {
          await supabase.from('product_nutrition').insert(nutritionRows);
        }
      }
    }

    try {
      const { revalidateTag, revalidatePath } = await import('next/cache');
      revalidateTag('products', { expire: 0 });
      revalidateTag('categories', { expire: 0 });
      revalidatePath('/');
      revalidatePath('/category/all');
    } catch {}

    return NextResponse.json({ success: true, data: updatedProductData });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Lỗi cập nhật sản phẩm' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteProps) {
  try {
    const { id } = await params;
    const supabase = createAdminClient();
    if (!supabase) {
      return NextResponse.json({ success: false, error: 'Không thể kết nối Supabase Admin' }, { status: 500 });
    }

    const { error } = await supabase.from('products').delete().eq('id', id);

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    try {
      const { revalidateTag, revalidatePath } = await import('next/cache');
      revalidateTag('products', { expire: 0 });
      revalidateTag('categories', { expire: 0 });
      revalidatePath('/');
      revalidatePath('/category/all');
    } catch {}

    return NextResponse.json({ success: true, message: 'Đã xóa sản phẩm' });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Lỗi xóa sản phẩm' },
      { status: 500 }
    );
  }
}
