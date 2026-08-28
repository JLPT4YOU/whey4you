import { unstable_cache } from 'next/cache';
import { createPublicClient } from '@/lib/supabase/public';
import { Product, CategorySlug, Category } from '@/types/product';
import { cleanSlugParam } from '@/lib/utils/slug';

export interface GetProductsOptions {
  category?: CategorySlug | string;
  goal?: string;
  search?: string;
  sortBy?: 'price-asc' | 'price-desc' | 'rating' | 'popular';
  limit?: number;
}

/**
 * Lấy danh sách danh mục (Từ Supabase với Cache 60s)
 */
export async function getCategories(): Promise<Category[]> {
  return unstable_cache(
    async (): Promise<Category[]> => {
      try {
        const supabase = createPublicClient();
        if (!supabase) return [];

        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .order('sort_order', { ascending: true });

        if (error || !data || data.length === 0) {
          return [];
        }

        return data as Category[];
      } catch {
        return [];
      }
    },
    ['w4u-categories'],
    { revalidate: 60, tags: ['categories'] }
  )();
}

/**
 * Lấy danh sách sản phẩm theo bộ lọc (Từ Supabase với Cache 60s)
 */
export async function getProducts(options: GetProductsOptions = {}): Promise<Product[]> {
  const cacheKey = `w4u-products-${JSON.stringify(options)}`;
  return unstable_cache(
    async () => {
      try {
        const supabase = createPublicClient();
        if (!supabase) {
          return [];
        }

        let query = supabase
          .from('products')
          .select(`
            *,
            product_nutrition (label, value, badge_color, sort_order),
            product_variants (type, name, price, original_price, price_modifier, is_in_stock, sort_order)
          `);

        if (options.category && options.category !== 'all') {
          query = query.eq('category_id', options.category);
        }

        if (options.goal && options.goal !== 'all') {
          query = query.eq('goal', options.goal);
        }

        if (options.search) {
          query = query.ilike('name', `%${options.search}%`);
        }

        if (options.sortBy === 'price-asc') {
          query = query.order('price', { ascending: true });
        } else if (options.sortBy === 'price-desc') {
          query = query.order('price', { ascending: false });
        } else if (options.sortBy === 'rating') {
          query = query.order('rating', { ascending: false });
        } else {
          query = query.order('review_count', { ascending: false });
        }

        if (options.limit) {
          query = query.limit(options.limit);
        }

        const { data, error } = await query;

        if (error || !data || data.length === 0) {
          return [];
        }

        return data.map(mapDbProductToAppProduct);
      } catch {
        return [];
      }
    },
    [cacheKey],
    { revalidate: 60, tags: ['products'] }
  )();
}


/**
 * Lấy chi tiết 1 sản phẩm theo slug (Cache 60s)
 */
export async function getProductBySlug(rawSlug: string): Promise<Product | null> {
  const slug = cleanSlugParam(rawSlug);
  if (!slug) return null;

  const cacheKey = `w4u-product-slug-${slug}`;
  return unstable_cache(
    async () => {
      try {
        const supabase = createPublicClient();
        if (!supabase) {
          return null;
        }

        const { data, error } = await supabase
          .from('products')
          .select(`
            *,
            product_nutrition (label, value, badge_color, sort_order),
            product_variants (type, name, price, original_price, price_modifier, is_in_stock, sort_order)
          `)
          .ilike('slug', slug)
          .single();

        if (error || !data) {
          return null;
        }

        return mapDbProductToAppProduct(data);
      } catch {
        return null;
      }
    },
    [cacheKey],
    { revalidate: 60, tags: ['products'] }
  )();
}

/**
 * Lấy danh sách sản phẩm nổi bật (Cache 60s)
 */
export async function getFeaturedProducts(limit = 6): Promise<Product[]> {
  const cacheKey = `w4u-featured-products-${limit}`;
  return unstable_cache(
    async () => {
      try {
        const supabase = createPublicClient();
        if (!supabase) {
          return [];
        }

        const { data, error } = await supabase
          .from('products')
          .select(`
            *,
            product_nutrition (label, value, badge_color, sort_order),
            product_variants (type, name, price, original_price, price_modifier, is_in_stock, sort_order)
          `)
          .eq('is_featured', true)
          .limit(limit);

        if (error || !data || data.length === 0) {
          return [];
        }

        return data.map(mapDbProductToAppProduct);
      } catch {
        return [];
      }
    },
    [cacheKey],
    { revalidate: 60, tags: ['products'] }
  )();
}

// ---------------------------------------------------------
// Helper functions
// ---------------------------------------------------------

function mapDbProductToAppProduct(row: any): Product {
  const nutrition = (row.product_nutrition || [])
    .sort((a: any, b: any) => a.sort_order - b.sort_order)
    .map((n: any) => ({
      label: n.label,
      value: n.value,
      badgeColor: n.badge_color || undefined,
    }));

  const flavors = (row.product_variants || [])
    .filter((v: any) => v.type === 'flavor')
    .sort((a: any, b: any) => a.sort_order - b.sort_order)
    .map((v: any) => v.name);

  const basePrice = Number(row.price);
  const baseOriginalPrice = row.original_price ? Number(row.original_price) : undefined;

  const rawSizes = (row.product_variants || [])
    .filter((v: any) => v.type === 'size')
    .sort((a: any, b: any) => a.sort_order - b.sort_order);

  const sizes = rawSizes.map((v: any) => v.name);

  const sizeVariants = rawSizes.map((v: any) => {
    // Ưu tiên đọc giá tuyệt đối từ DB, fallback về basePrice + modifier
    const variantPrice = v.price && Number(v.price) > 0
      ? Number(v.price)
      : basePrice + Number(v.price_modifier || 0);

    // Ưu tiên đọc original_price từ DB, fallback tính tỷ lệ từ base
    const variantOriginalPrice = v.original_price && Number(v.original_price) > 0
      ? Number(v.original_price)
      : (baseOriginalPrice && basePrice > 0
        ? Math.round(variantPrice * (baseOriginalPrice / basePrice))
        : undefined);

    return {
      id: v.id,
      name: v.name,
      price: variantPrice,
      priceModifier: Number(v.price_modifier || 0),
      originalPrice: variantOriginalPrice,
      inStock: v.is_in_stock !== false,
    };
  });

  const inStock = (row.is_in_stock !== undefined ? row.is_in_stock !== false : true)
    && (sizeVariants.length === 0 || sizeVariants.some((v: { inStock?: boolean }) => v.inStock));

  const images: string[] = Array.isArray(row.images) && row.images.length > 0
    ? row.images
    : (row.image ? [row.image] : []);

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    tagline: row.tagline,
    category: row.category_id as CategorySlug,
    categoryName: row.category_name,
    price: basePrice,
    originalPrice: baseOriginalPrice,
    rating: Number(row.rating),
    reviewCount: Number(row.review_count),
    image: row.image || images[0] || '',
    images: images,
    badge: row.badge || undefined,
    badgeType: row.badge_type || undefined,
    macros: nutrition,
    description: row.description,
    usageGuide: row.usage_guide || row.usageGuide || undefined,
    qualityCommitment: row.quality_commitment || row.qualityCommitment || undefined,
    flavors: flavors.length > 0 ? flavors : undefined,
    sizes: sizes.length > 0 ? sizes : undefined,
    sizeVariants: sizeVariants.length > 0 ? sizeVariants : undefined,
    inStock: inStock,
    goal: row.goal,
    isFeatured: row.is_featured,
  };
}
