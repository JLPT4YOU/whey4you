import { NextRequest, NextResponse } from 'next/server';
import { getProducts, GetProductsOptions } from '@/lib/services/product-service';

export const revalidate = 60; // Cache 60s

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category') || undefined;
    const goal = searchParams.get('goal') || undefined;
    const search = searchParams.get('search') || undefined;
    const sortBy = (searchParams.get('sortBy') as GetProductsOptions['sortBy']) || undefined;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;

    const products = await getProducts({
      category,
      goal,
      search,
      sortBy,
      limit,
    });

    const response = NextResponse.json({
      success: true,
      count: products.length,
      data: products,
    });

    response.headers.set(
      'Cache-Control',
      'public, s-maxage=60, stale-while-revalidate=300'
    );

    return response;
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Lỗi lấy danh sách sản phẩm' },
      { status: 500 }
    );
  }
}
