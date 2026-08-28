import React from 'react';
import { Metadata } from 'next';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { CartDrawer } from '@/components/cart/cart-drawer';
import { FloatingContactHub } from '@/components/ui/floating-contact-hub';
import { OrderLookupView } from '@/components/orders/order-lookup-view';
import { getProducts } from '@/lib/services/product-service';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://whey4you.vn';

export const metadata: Metadata = {
  title: 'Tra Cứu Vận Đơn SPX Express Trực Tuyến Thời Gian Thực',
  description:
    'Công cụ tra cứu mã vận đơn SPX Express (Shopee Xpress) của Whey4You. Cập nhật vị trí bưu kiện, lịch trình luân chuyển kho bãi và thời gian giao hàng dự kiến nhanh chóng.',
  keywords: [
    'Tra cứu đơn hàng SPX',
    'Kiểm tra đơn hàng Whey4You',
    'Shopee Xpress tracking',
    'Tra cứu vận đơn thể hình',
    'SPX tracking Vietnam',
    'Whey4You',
  ],
  alternates: {
    canonical: '/tra-cuu-don-hang',
  },
  openGraph: {
    title: 'Tra Cứu Vận Đơn SPX Express Trực Tuyến | Whey4You',
    description:
      'Nhập mã vận đơn SPX Express để xem lịch trình di chuyển và thời gian nhận kiện hàng dinh dưỡng thể thao Whey4You.',
    url: `${BASE_URL}/tra-cuu-don-hang`,
    siteName: 'Whey4You Vietnam',
    locale: 'vi_VN',
    type: 'website',
    images: ['/logo-brand.webp'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tra Cứu Vận Đơn SPX Express | Whey4You',
    description: 'Cập nhật hành trình bưu kiện SPX Express thời gian thực.',
    images: ['/logo-brand.webp'],
  },
};

export default async function OrderLookupPage() {
  const products = await getProducts({ limit: 8 });

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Trang Chủ',
        item: BASE_URL,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Tra Cứu Vận Đơn SPX',
        item: `${BASE_URL}/tra-cuu-don-hang`,
      },
    ],
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#F8FAFC]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <Header initialProducts={products} />
      <OrderLookupView />
      <CartDrawer />
      <FloatingContactHub />
      <Footer />
    </div>
  );
}
