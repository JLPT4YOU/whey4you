import { NextRequest, NextResponse } from 'next/server';
import { updateArticle, deleteArticle } from '@/lib/services/article-service';
import { UpdateArticleInput } from '@/types/article';

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body: Partial<UpdateArticleInput> = await request.json();

    const updated = await updateArticle({
      ...body,
      id,
    });

    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy bài viết để cập nhật' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updated,
      message: 'Cập nhật bài viết thành công!',
    });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Lỗi khi cập nhật bài viết',
      },
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
    const deleted = await deleteArticle(id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'Không thể xóa bài viết hoặc bài viết không tồn tại' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Đã xóa bài viết thành công!',
    });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Lỗi khi xóa bài viết',
      },
      { status: 500 }
    );
  }
}
