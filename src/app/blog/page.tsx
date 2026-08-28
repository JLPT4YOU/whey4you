import React from 'react';
import { Metadata } from 'next';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { CartDrawer } from '@/components/cart/cart-drawer';
import { QuickViewModal } from '@/components/product/quick-view-modal';
import { FloatingContactHub } from '@/components/ui/floating-contact-hub';
import { BlogView } from '@/components/blog/blog-view';
import { getArticles } from '@/lib/services/article-service';
import { getProducts } from '@/lib/services/product-service';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://whey4you.vn';

export const revalidate = 60; // ISR cache 60s

export const metadata: Metadata = {
  title: 'Kiến Thức Dinh Dưỡng Thể Hình & Cẩm Nang Tăng Cơ Giảm Mỡ',
  description:
    'Chuyên mục cẩm nang thể hình & dinh dưỡng chuẩn y khoa: Hướng dẫn nạp Whey Protein, lịch trình dùng Creatine, thực đơn siết cơ cutting và bí quyết phục hồi thể lực từ các HLV & Bác sĩ y học thể thao.',
  keywords: [
    'Kiến thức dinh dưỡng thể hình',
    'Cách uống whey protein',
    'Hướng dẫn dùng creatine',
    'Thực đơn giảm mỡ tăng cơ',
    'Cẩm nang supplement',
    'Dinh dưỡng gymer',
    'Whey4You blog',
  ],
  alternates: {
    canonical: '/blog',
  },
  openGraph: {
    title: 'Kiến Thức Dinh Dưỡng Thể Hình & Cẩm Nang Tăng Cơ | Whey4You',
    description:
      'Tổng hợp kiến thức khoa học về dinh dưỡng thể thao, cách sử dụng thực phẩm bổ sung an toàn và hiệu quả cao.',
    url: `${BASE_URL}/blog`,
    siteName: 'Whey4You Vietnam',
    locale: 'vi_VN',
    type: 'website',
    images: ['/logo-brand.webp'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kiến Thức Dinh Dưỡng Thể Hình Chuẩn Khoa Học | Whey4You',
    description: 'Bí quyết tăng cơ, giảm mỡ và tối ưu hóa hiệu suất tập luyện từ Whey4You.',
    images: ['/logo-brand.webp'],
  },
};

export default async function BlogIndexPage() {
  const [articles, products] = await Promise.all([
    getArticles(),
    getProducts({ limit: 12 }),
  ]);

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
        name: 'Kiến Thức Dinh Dưỡng',
        item: `${BASE_URL}/blog`,
      },
    ],
  };

  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Kiến Thức Dinh Dưỡng Thể Hình & Cẩm Nang Supplement',
    url: `${BASE_URL}/blog`,
    description:
      'Chuyên trang kiến thức dinh dưỡng thể hình, bài viết nghiên cứu và thực đơn tăng cơ giảm mỡ chuẩn y khoa.',
    hasPart: articles.map((art) => ({
      '@type': 'Article',
      headline: art.title,
      url: `${BASE_URL}/blog/${art.slug}`,
      image: art.coverImage,
      author: {
        '@type': 'Person',
        name: art.authorName,
      },
    })),
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#FBFBFE]">
      {/* Inject Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />

      {/* Sticky Header with products for search */}
      <Header initialProducts={products} />

      {/* Main Content with initial cached articles */}
      <BlogView initialArticles={articles} />

      {/* Global Modals & Drawers */}
      <QuickViewModal />
      <CartDrawer />
      <FloatingContactHub />

      {/* Modern Midnight Blue Footer */}
      <Footer />
    </div>
  );
}
