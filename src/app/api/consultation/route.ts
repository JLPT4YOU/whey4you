import { NextRequest, NextResponse } from 'next/server';
import { submitConsultationRequest } from '@/lib/services/order-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.fullName || !body.phone) {
      return NextResponse.json(
        { success: false, error: 'Vui lòng cung cấp họ tên và số điện thoại.' },
        { status: 400 }
      );
    }

    const result = await submitConsultationRequest({
      fullName: body.fullName,
      phone: body.phone,
      fitnessGoal: body.fitnessGoal,
      note: body.note,
    });

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 });
    }

    return NextResponse.json(result, { status: 201 });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Lỗi gửi yêu cầu tư vấn' },
      { status: 500 }
    );
  }
}
