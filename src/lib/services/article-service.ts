import { unstable_cache, revalidateTag, revalidatePath } from 'next/cache';
import { createPublicClient } from '@/lib/supabase/public';
import { createAdminClient } from '@/lib/supabase/admin';
import { MOCK_ARTICLES } from '@/data/mock-articles';
import { Article, ArticleCategory, CreateArticleInput, UpdateArticleInput } from '@/types/article';
import { slugify, cleanSlugParam } from '@/lib/utils/slug';

export interface GetArticlesOptions {
  category?: ArticleCategory | 'all' | string;
  search?: string;
  status?: 'published' | 'draft' | 'all';
  limit?: number;
  featuredOnly?: boolean;
}

/**
 * Lấy danh sách bài viết (Cache 60s & Graceful Fallback)
 */
export async function getArticles(options: GetArticlesOptions = {}): Promise<Article[]> {
  const cacheKey = `w4u-articles-${JSON.stringify(options)}`;
  return unstable_cache(
    async () => {
      try {
        const supabase = createPublicClient();
        if (!supabase) {
          return filterMockArticles(options);
        }

        let query = supabase
          .from('articles')
          .select('*')
          .order('created_at', { ascending: false });

        if (options.status && options.status !== 'all') {
          query = query.eq('status', options.status);
        } else if (!options.status) {
          // Mặc định khách chỉ xem bài đã xuất bản
          query = query.eq('status', 'published');
        }

        if (options.category && options.category !== 'all') {
          query = query.eq('category', options.category);
        }

        if (options.featuredOnly) {
          query = query.eq('is_featured', true);
        }

        if (options.limit) {
          query = query.limit(options.limit);
        }

        const { data, error } = await query;

        if (error || !data || data.length === 0) {
          return filterMockArticles(options);
        }

        let results = data.map(mapDbArticleToArticle);

        if (options.search && options.search.trim()) {
          const q = options.search.toLowerCase();
          results = results.filter(
            (a) =>
              a.title.toLowerCase().includes(q) ||
              a.excerpt.toLowerCase().includes(q) ||
              a.tags.some((t) => t.toLowerCase().includes(q))
          );
        }

        return results;
      } catch (err) {
        console.warn('Lỗi lấy danh sách bài viết, fallback về mock data:', err);
        return filterMockArticles(options);
      }
    },
    [cacheKey],
    { revalidate: 60, tags: ['articles'] }
  )();
}

/**
 * Lấy chi tiết bài viết theo Slug (Cache 60s)
 */
export async function getArticleBySlug(rawSlug: string): Promise<Article | null> {
  const slug = cleanSlugParam(rawSlug);
  if (!slug) return null;

  const cacheKey = `w4u-article-slug-${slug}`;
  return unstable_cache(
    async () => {
      try {
        const supabase = createPublicClient();
        if (!supabase) {
          return MOCK_ARTICLES.find((a) => a.slug.toLowerCase() === slug.toLowerCase()) || null;
        }

        const { data, error } = await supabase
          .from('articles')
          .select('*')
          .ilike('slug', slug)
          .single();

        if (error || !data) {
          return MOCK_ARTICLES.find((a) => a.slug.toLowerCase() === slug.toLowerCase()) || null;
        }

        return mapDbArticleToArticle(data);
      } catch {
        return MOCK_ARTICLES.find((a) => a.slug.toLowerCase() === slug.toLowerCase()) || null;
      }
    },
    [cacheKey],
    { revalidate: 60, tags: ['articles'] }
  )();
}

/**
 * Lấy danh sách bài viết liên quan (Cache 60s)
 */
export async function getRelatedArticles(currentSlug: string, category: string, limit = 3): Promise<Article[]> {
  const all = await getArticles({ category: category as ArticleCategory, status: 'published' });
  const filtered = all.filter((a) => a.slug !== currentSlug);
  if (filtered.length >= limit) {
    return filtered.slice(0, limit);
  }
  const fallbackAll = await getArticles({ status: 'published' });
  const extra = fallbackAll.filter((a) => a.slug !== currentSlug && !filtered.some((f) => f.id === a.id));
  return [...filtered, ...extra].slice(0, limit);
}

/**
 * Tạo bài viết mới trong Admin
 */
export async function createArticle(input: CreateArticleInput): Promise<Article> {
  const adminClient = createAdminClient();
  const safeSlug = slugify(input.slug || input.title) || `bai-viet-${Date.now()}`;

  const newArticle: Article = {
    id: `art-${Date.now()}`,
    title: input.title,
    slug: safeSlug,
    excerpt: input.excerpt,
    content: input.content,
    coverImage: input.coverImage,
    secondaryImage: input.secondaryImage || undefined,
    secondaryImageCaption: input.secondaryImageCaption || undefined,
    category: input.category,
    categoryName: input.categoryName,
    authorName: input.authorName || 'Chuyên gia Whey4You',
    authorRole: input.authorRole || 'HLV Dinh Dưỡng W4U',
    authorAvatar: input.authorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    readingTime: input.readingTime || Math.max(2, Math.ceil(input.content.split(' ').length / 200)),
    status: input.status || 'published',
    isFeatured: input.isFeatured || false,
    viewCount: 0,
    suggestedProductSlugs: input.suggestedProductSlugs || [],
    tags: input.tags || [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (!adminClient) {
    // Fallback: Thêm vào mock memory
    MOCK_ARTICLES.unshift(newArticle);
    return newArticle;
  }

  const insertPayload: Record<string, any> = {
    title: input.title,
    slug: safeSlug,
    excerpt: input.excerpt,
    content: input.content,
    cover_image: input.coverImage,
    secondary_image: input.secondaryImage || null,
    secondary_image_caption: input.secondaryImageCaption || null,
    category: input.category,
    category_name: input.categoryName,
    author_name: input.authorName || 'Chuyên gia Whey4You',
    author_role: input.authorRole || 'HLV Dinh Dưỡng W4U',
    author_avatar: input.authorAvatar,
    reading_time: newArticle.readingTime,
    status: input.status || 'published',
    is_featured: input.isFeatured || false,
    suggested_product_slugs: input.suggestedProductSlugs || [],
    tags: input.tags || [],
  };

  let { data, error } = await adminClient
    .from('articles')
    .insert([insertPayload])
    .select()
    .single();

  // Graceful fallback nếu cột secondary_image chưa có trong Supabase
  if (error && (error.message.includes('secondary_image') || error.message.includes('secondary_image_caption'))) {
    delete insertPayload.secondary_image;
    delete insertPayload.secondary_image_caption;
    const retryResult = await adminClient
      .from('articles')
      .insert([insertPayload])
      .select()
      .single();
    data = retryResult.data;
    error = retryResult.error;
  }

  if (error || !data) {
    MOCK_ARTICLES.unshift(newArticle);
    return newArticle;
  }

  try {
    revalidateTag('articles', { expire: 0 });
    revalidatePath('/blog');
    revalidatePath('/');
  } catch {}

  return mapDbArticleToArticle(data);
}

/**
 * Cập nhật bài viết
 */
export async function updateArticle(input: UpdateArticleInput): Promise<Article | null> {
  const adminClient = createAdminClient();
  const now = new Date().toISOString();

  if (!adminClient) {
    const idx = MOCK_ARTICLES.findIndex((a) => a.id === input.id);
    if (idx !== -1) {
      MOCK_ARTICLES[idx] = {
        ...MOCK_ARTICLES[idx],
        ...input,
        updatedAt: now,
      } as Article;
      return MOCK_ARTICLES[idx];
    }
    return null;
  }

  const updatePayload: Record<string, any> = {
    updated_at: now,
  };

  if (input.title !== undefined) updatePayload.title = input.title;
  if (input.slug !== undefined) updatePayload.slug = slugify(input.slug);
  if (input.excerpt !== undefined) updatePayload.excerpt = input.excerpt;
  if (input.content !== undefined) updatePayload.content = input.content;
  if (input.coverImage !== undefined) updatePayload.cover_image = input.coverImage;
  if (input.secondaryImage !== undefined) updatePayload.secondary_image = input.secondaryImage;
  if (input.secondaryImageCaption !== undefined) updatePayload.secondary_image_caption = input.secondaryImageCaption;
  if (input.category !== undefined) updatePayload.category = input.category;
  if (input.categoryName !== undefined) updatePayload.category_name = input.categoryName;
  if (input.authorName !== undefined) updatePayload.author_name = input.authorName;
  if (input.authorRole !== undefined) updatePayload.author_role = input.authorRole;
  if (input.authorAvatar !== undefined) updatePayload.author_avatar = input.authorAvatar;
  if (input.readingTime !== undefined) updatePayload.reading_time = input.readingTime;
  if (input.status !== undefined) updatePayload.status = input.status;
  if (input.isFeatured !== undefined) updatePayload.is_featured = input.isFeatured;
  if (input.suggestedProductSlugs !== undefined) updatePayload.suggested_product_slugs = input.suggestedProductSlugs;
  if (input.tags !== undefined) updatePayload.tags = input.tags;

  let { data, error } = await adminClient
    .from('articles')
    .update(updatePayload)
    .eq('id', input.id)
    .select()
    .single();

  // Graceful fallback nếu cột secondary_image chưa có trong Supabase
  if (error && (error.message.includes('secondary_image') || error.message.includes('secondary_image_caption'))) {
    delete updatePayload.secondary_image;
    delete updatePayload.secondary_image_caption;
    const retryResult = await adminClient
      .from('articles')
      .update(updatePayload)
      .eq('id', input.id)
      .select()
      .single();
    data = retryResult.data;
    error = retryResult.error;
  }

  if (error || !data) {
    const idx = MOCK_ARTICLES.findIndex((a) => a.id === input.id);
    if (idx !== -1) {
      MOCK_ARTICLES[idx] = { ...MOCK_ARTICLES[idx], ...input, updatedAt: now } as Article;
      return MOCK_ARTICLES[idx];
    }
    return null;
  }

  try {
    revalidateTag('articles', { expire: 0 });
    revalidatePath('/blog');
    revalidatePath('/');
  } catch {}

  return mapDbArticleToArticle(data);
}

/**
 * Xóa bài viết
 */
export async function deleteArticle(id: string): Promise<boolean> {
  const adminClient = createAdminClient();
  if (!adminClient) {
    const idx = MOCK_ARTICLES.findIndex((a) => a.id === id);
    if (idx !== -1) {
      MOCK_ARTICLES.splice(idx, 1);
      return true;
    }
    return false;
  }

  const { error } = await adminClient.from('articles').delete().eq('id', id);
  if (!error) {
    try {
      revalidateTag('articles', { expire: 0 });
      revalidatePath('/blog');
      revalidatePath('/');
    } catch {}
  }
  return !error;
}

/**
 * Helper Map Supabase DB record to TypeScript Article
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapDbArticleToArticle(record: any): Article {
  return {
    id: record.id,
    title: record.title || '',
    slug: record.slug || '',
    excerpt: record.excerpt || '',
    content: record.content || '',
    coverImage: record.cover_image || '',
    secondaryImage: record.secondary_image || undefined,
    secondaryImageCaption: record.secondary_image_caption || undefined,
    category: (record.category as ArticleCategory) || 'dinh-duong-chung',
    categoryName: record.category_name || 'Dinh Dưỡng Thể Hình',
    authorName: record.author_name || 'Chuyên gia Whey4You',
    authorRole: record.author_role || 'HLV Dinh Dưỡng W4U',
    authorAvatar: record.author_avatar,
    readingTime: record.reading_time || 5,
    status: record.status || 'published',
    isFeatured: Boolean(record.is_featured),
    viewCount: record.view_count || 0,
    suggestedProductSlugs: record.suggested_product_slugs || [],
    tags: record.tags || [],
    createdAt: record.created_at || new Date().toISOString(),
    updatedAt: record.updated_at || new Date().toISOString(),
  };
}

/**
 * Helper Filter Mock Articles
 */
function filterMockArticles(options: GetArticlesOptions): Article[] {
  let list = [...MOCK_ARTICLES];

  if (options.status && options.status !== 'all') {
    list = list.filter((a) => a.status === options.status);
  } else if (!options.status) {
    list = list.filter((a) => a.status === 'published');
  }

  if (options.category && options.category !== 'all') {
    list = list.filter((a) => a.category === options.category);
  }

  if (options.featuredOnly) {
    list = list.filter((a) => a.isFeatured);
  }

  if (options.search && options.search.trim()) {
    const q = options.search.toLowerCase();
    list = list.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.excerpt.toLowerCase().includes(q) ||
        a.tags.some((t) => t.toLowerCase().includes(q))
    );
  }

  if (options.limit) {
    list = list.slice(0, options.limit);
  }

  return list;
}
