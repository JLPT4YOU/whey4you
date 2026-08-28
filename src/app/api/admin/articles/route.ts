import { NextRequest, NextResponse } from 'next/server';
import { getArticles, createArticle } from '@/lib/services/article-service';
import { CreateArticleInput } from '@/types/article';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || 'all';
    const status = (searchParams.get('status') as 'published' | 'draft' | 'all') || 'all';
    const search = searchParams.get('search') || '';

    const articles = await getArticles({
      category: category === 'all' ? undefined : category,
      status,
      search: search || undefined,
    });

    return NextResponse.json({
      success: true,
      data: articles,
      count: articles.length,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Lỗi lấy danh sách bài viết trong admin',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateArticleInput = await request.json();

    if (!body.title || !body.slug || !body.content) {
      return NextResponse.json(
        { success: false, error: 'Tiêu đề, slug và nội dung bài viết là bắt buộc' },
        { status: 400 }
      );
    }

    const created = await createArticle(body);

    return NextResponse.json({
      success: true,
      data: created,
      message: 'Tạo bài viết thành công!',
    });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Lỗi khi tạo bài viết mới',
      },
      { status: 500 }
    );
  }
}
