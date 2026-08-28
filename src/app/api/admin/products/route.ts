import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { slugify } from '@/lib/utils/slug';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const cleanSlug = slugify(body.slug || body.name);

    const rawImages: string[] = Array.isArray(body.images) && body.images.length > 0
      ? body.images.filter((img: string) => typeof img === 'string' && img.trim().length > 0)
      : (body.image ? [body.image.trim()] : []);

    const primaryImage = rawImages.length > 0 ? rawImages[0] : (body.image || '');

    if (!body.name || !cleanSlug || !body.category_id || !body.price || !primaryImage) {
      return NextResponse.json(
        { success: false, error: 'Thiếu các thông tin bắt buộc (Tên, Slug, Danh mục, Giá, Hình ảnh)' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();
    if (!supabase) {
      return NextResponse.json({ success: false, error: 'Không thể kết nối Supabase Admin' }, { status: 500 });
    }

    // Lấy category_name từ DB thay vì hardcode
    let categoryName = 'Thực phẩm bổ sung';
    if (body.category_id) {
      const { data: catData } = await supabase
        .from('categories')
        .select('name')
        .eq('slug', body.category_id)
        .single();
      if (catData?.name) categoryName = catData.name;
    }

    const insertPayload: Record<string, any> = {
      name: body.name,
      slug: cleanSlug,
      tagline: body.tagline || body.name,
      category_id: body.category_id,
      category_name: categoryName,
      price: Number(body.price),
      original_price: body.original_price ? Number(body.original_price) : null,
      rating: 5.0,
      review_count: 0,
      image: primaryImage,
      images: rawImages,
      badge: body.badge || null,
      badge_type: body.badge_type || null,
      description: body.description || body.tagline || body.name,
      usage_guide: body.usage_guide || body.usageGuide || null,
      quality_commitment: body.quality_commitment || body.qualityCommitment || null,
      goal: body.goal || 'muscle-growth',
      is_featured: Boolean(body.is_featured),
    };

    let { data: newProd, error: prodError } = await supabase
      .from('products')
      .insert(insertPayload)
      .select()
      .single();

    // Graceful fallback nếu cột images/usage_guide/quality_commitment chưa tồn tại trong Supabase
    if (prodError && (prodError.message.includes('images') || prodError.message.includes('usage_guide') || prodError.message.includes('quality_commitment'))) {
      if (prodError.message.includes('images')) delete insertPayload.images;
      if (prodError.message.includes('usage_guide')) delete insertPayload.usage_guide;
      if (prodError.message.includes('quality_commitment')) delete insertPayload.quality_commitment;

      const retryResult = await supabase
        .from('products')
        .insert(insertPayload)
        .select()
        .single();
      newProd = retryResult.data;
      prodError = retryResult.error;
    }

    if (prodError || !newProd) {
      return NextResponse.json({ success: false, error: prodError?.message || 'Lỗi thêm sản phẩm' }, { status: 500 });
    }

    const productId = newProd.id;

    // 1. Thêm các hương vị (Flavors)
    if (Array.isArray(body.flavors) && body.flavors.length > 0) {
      const flavorRows = body.flavors
        .map((f: string, idx: number) => ({
          product_id: productId,
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

    // 2. Thêm các kích cỡ (Sizes) — lưu giá tuyệt đối trực tiếp
    if (Array.isArray(body.sizes) && body.sizes.length > 0) {
      const basePrice = Number(body.price || 0);
      const sizeRows = body.sizes
        .map((s: any, idx: number) => {
          const isObj = typeof s === 'object' && s !== null;
          const name = (isObj ? s.name : String(s)).trim();
          const absolutePrice = isObj && s.price !== undefined && s.price !== '' ? Number(s.price) : basePrice;
          const originalPrice = isObj && s.original_price !== undefined && s.original_price !== '' && s.original_price !== null ? Number(s.original_price) : null;
          const inStock = isObj && s.is_in_stock !== undefined ? Boolean(s.is_in_stock) : true;

          return {
            product_id: productId,
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

    // 3. Thêm các chỉ số dinh dưỡng (Macros)
    if (Array.isArray(body.macros) && body.macros.length > 0) {
      const nutritionRows = body.macros
        .map((m: any, idx: number) => ({
          product_id: productId,
          label: m.label || 'Macro',
          value: m.value || '',
          badge_color: m.badge_color || null,
          sort_order: idx + 1,
        }))
        .filter((m: any) => m.value.length > 0);

      if (nutritionRows.length > 0) {
        await supabase.from('product_nutrition').insert(nutritionRows);
      }
    }

    try {
      const { revalidateTag, revalidatePath } = await import('next/cache');
      revalidateTag('products', { expire: 0 });
      revalidateTag('categories', { expire: 0 });
      revalidatePath('/');
      revalidatePath('/category/all');
    } catch {}

    return NextResponse.json({ success: true, data: newProd }, { status: 201 });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Lỗi tạo sản phẩm mới' },
      { status: 500 }
    );
  }
}
