import { NextRequest, NextResponse } from 'next/server';
import { getArticles } from '@/lib/services/article-service';

export const revalidate = 60; // Cache 60s

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || undefined;
    const search = searchParams.get('search') || undefined;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : undefined;
    const featuredOnly = searchParams.get('featured') === 'true';

    const articles = await getArticles({
      category,
      search,
      limit,
      featuredOnly,
      status: 'published',
    });

    const response = NextResponse.json({
      success: true,
      data: articles,
      count: articles.length,
    });

    response.headers.set(
      'Cache-Control',
      'public, s-maxage=60, stale-while-revalidate=300'
    );

    return response;
  } catch (error: unknown) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Lỗi truy vấn bài viết dinh dưỡng',
      },
      { status: 500 }
    );
  }
}
