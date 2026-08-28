import { NextRequest, NextResponse } from 'next/server';

interface RouteProps {
  params: Promise<{ trackingNumber: string }>;
}

export interface SPXTimelineRecord {
  trackingCode: string;
  trackingName: string;
  milestoneCode: number;
  milestoneName: string;
  actualTime: number; // Unix timestamp (seconds)
  formattedTime: string;
  buyerDescription: string;
  sellerDescription: string;
  currentLocation?: {
    locationName: string;
    fullAddress: string;
    lat?: string;
    lng?: string;
  };
  nextLocation?: {
    locationName: string;
    fullAddress: string;
    lat?: string;
    lng?: string;
  };
}

export interface SPXTrackingResponse {
  carrier: 'SPX Express';
  trackingNumber: string;
  slsTrackingNumber?: string;
  status: string;
  statusGroup: string;
  statusDescription: string;
  isDelivered: boolean;
  estimatedDelivery?: {
    minTime: number;
    maxTime: number;
    formattedRange: string;
  };
  receiverName?: string;
  records: SPXTimelineRecord[];
}

function formatUnixTime(timestampSec: number): string {
  if (!timestampSec) return '';
  const date = new Date(timestampSec * 1000);
  return date.toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function formatStatusGroup(groupName: string): string {
  switch (groupName?.toLowerCase()) {
    case 'delivered':
      return 'Giao hàng thành công';
    case 'out for delivery':
      return 'Đang giao hàng';
    case 'in transit':
      return 'Đang trung chuyển';
    case 'preparing to ship':
      return 'Người bán đang chuẩn bị hàng';
    case 'cancelled':
      return 'Đã hủy';
    case 'pending':
      return 'Chờ tiếp nhận';
    default:
      return groupName || 'Đang xử lý';
  }
}

export async function GET(request: NextRequest, { params }: RouteProps) {
  try {
    const { trackingNumber } = await params;

    if (!trackingNumber || !trackingNumber.trim()) {
      return NextResponse.json(
        { success: false, error: 'Mã vận đơn không được để trống' },
        { status: 400 }
      );
    }

    const cleanTN = trackingNumber.trim().toUpperCase();

    // Call SPX Open API with required headers to prevent 403 / anti-bot
    const spxUrl = `https://spx.vn/shipment/order/open/order/get_order_info?spx_tn=${encodeURIComponent(cleanTN)}&language_code=vi`;

    const spxRes = await fetch(spxUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'vi,en-US;q=0.9,en;q=0.8',
        'Cookie': 'app_lang=vi',
        'Referer': 'https://spx.vn/track',
        'Sec-Ch-Ua': '"Not=A?Brand";v="99", "Google Chrome";v="151", "Chromium";v="151"',
        'Sec-Ch-Ua-Mobile': '?0',
        'Sec-Ch-Ua-Platform': '"macOS"',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-origin',
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36',
      },
      next: { revalidate: 30 }, // cache 30s for performance
    });

    if (!spxRes.ok) {
      return NextResponse.json(
        {
          success: false,
          error: `Không thể kết nối đến máy chủ SPX Express (Mã lỗi ${spxRes.status})`,
        },
        { status: 502 }
      );
    }

    const rawData = await spxRes.json();

    if (rawData.retcode !== 0 || !rawData.data) {
      return NextResponse.json(
        {
          success: false,
          error: 'Không tìm thấy thông tin vận đơn SPX này. Vui lòng kiểm tra lại mã vận đơn.',
        },
        { status: 404 }
      );
    }

    const data = rawData.data;
    const orderInfo = data.order_info || {};
    const slsTrackingInfo = data.sls_tracking_info || {};
    const rawRecords = slsTrackingInfo.records || [];
    const eddInfo = data.edd_info;

    const statusGroup = orderInfo.tracking_code_group_name || '';
    const isDelivered = statusGroup.toLowerCase() === 'delivered';

    // Parse records into standardized clean list
    const records: SPXTimelineRecord[] = rawRecords.map((r: any) => {
      const actualTime = r.actual_time || 0;
      return {
        trackingCode: r.tracking_code || '',
        trackingName: r.tracking_name || '',
        milestoneCode: r.milestone_code || 0,
        milestoneName: r.milestone_name || '',
        actualTime,
        formattedTime: formatUnixTime(actualTime),
        buyerDescription: r.buyer_description || r.description || '',
        sellerDescription: r.seller_description || r.description || '',
        currentLocation: r.current_location?.location_name
          ? {
              locationName: r.current_location.location_name,
              fullAddress: r.current_location.full_address?.trim() || '',
              lat: r.current_location.lat,
              lng: r.current_location.lng,
            }
          : undefined,
        nextLocation: r.next_location?.location_name
          ? {
              locationName: r.next_location.location_name,
              fullAddress: r.next_location.full_address?.trim() || '',
              lat: r.next_location.lat,
              lng: r.next_location.lng,
            }
          : undefined,
      };
    });

    let estimatedDelivery: SPXTrackingResponse['estimatedDelivery'] = undefined;
    if (eddInfo && eddInfo.edd_min && eddInfo.edd_max) {
      const minDate = new Date(eddInfo.edd_min * 1000).toLocaleDateString('vi-VN');
      const maxDate = new Date(eddInfo.edd_max * 1000).toLocaleDateString('vi-VN');
      estimatedDelivery = {
        minTime: eddInfo.edd_min,
        maxTime: eddInfo.edd_max,
        formattedRange: minDate === maxDate ? minDate : `${minDate} - ${maxDate}`,
      };
    }

    const latestRecord = records[0];
    const statusDesc = latestRecord?.buyerDescription || latestRecord?.sellerDescription || formatStatusGroup(statusGroup);

    const formattedResponse: SPXTrackingResponse = {
      carrier: 'SPX Express',
      trackingNumber: orderInfo.spx_tn || cleanTN,
      slsTrackingNumber: orderInfo.sls_tn || undefined,
      status: statusGroup,
      statusGroup: formatStatusGroup(statusGroup),
      statusDescription: statusDesc,
      isDelivered,
      estimatedDelivery,
      receiverName: slsTrackingInfo.receiver_name || undefined,
      records,
    };

    return NextResponse.json({
      success: true,
      data: formattedResponse,
    });
  } catch (err: unknown) {
    console.error('SPX Tracking Proxy Error:', err);
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : 'Lỗi hệ thống khi tra cứu vận đơn SPX',
      },
      { status: 500 }
    );
  }
}
