import React from 'react';
import { Metadata } from 'next';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { QuickViewModal } from '@/components/product/quick-view-modal';
import { CartDrawer } from '@/components/cart/cart-drawer';
import { FloatingContactHub } from '@/components/ui/floating-contact-hub';
import { CategoryView } from '@/components/category/category-view';
import { CategoryFaq } from '@/components/category/category-faq';
import { CATEGORY_FAQS } from '@/data/category-faqs';
import { getProducts, getCategories } from '@/lib/services/product-service';
import { cleanSlugParam } from '@/lib/utils/slug';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://whey4you.vn';

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = 60; // ISR cache 60s

const CATEGORY_SEO_DATA: Record<
  string,
  { title: string; description: string; keywords: string[] }
> = {
  'whey-protein': {
    title: 'Whey Protein & Whey Isolate Tăng Cơ Nạc Chính Hãng',
    description:
      'Mua Whey Protein Isolate & Hydrolyzed thủy phân siêu tinh khiết. Hấp thu siêu tốc 20 phút, 0% lactose, tăng cơ nạc tối đa cho gymer. Đền 200% nếu phát hiện hàng giả.',
    keywords: [
      'Whey Protein',
      'Whey Isolate',
      'Whey Hydrolyzed',
      'Sữa tăng cơ bắp',
      'Whey protein giá rẻ',
      'Tăng cơ giảm mỡ',
      'Whey4You',
    ],
  },
  'strength-endurance': {
    title: 'Pre-Workout, Creatine & EAA Tăng Sức Mạnh Bùng Nổ',
    description:
      'Tổng hợp thực phẩm bổ sung tăng sức mạnh và sức bền: Creatine Monohydrate chuẩn Creapure Đức, Pre-Workout pump cơ cực đại & EAA bù khoáng phục hồi thể hình.',
    keywords: [
      'Pre-Workout',
      'Creatine Monohydrate',
      'Creapure',
      'EAA bù điện giải',
      'Tăng sức mạnh tập gym',
      'Pump cơ bắp',
      'Whey4You',
    ],
  },
  'vitamins': {
    title: 'Dầu Cá Omega-3 IFOS & Vitamin Khoáng Chất Thể Hình',
    description:
      'Dầu cá Omega-3 nồng độ cao đạt chuẩn quốc tế IFOS 5 sao và Multi-Vitamins thể thao toàn diện, giúp bảo vệ xương khớp, giảm viêm cơ và tăng cường sinh lực.',
    keywords: [
      'Dầu cá Omega 3',
      'Omega 3 IFOS 5 sao',
      'Vitamin cho người tập gym',
      'Bổ khớp thể thao',
      'Multi-vitamin thể hình',
      'Whey4You',
    ],
  },
  all: {
    title: 'Tất Cả Thực Phẩm Bổ Sung & Dinh Dưỡng Thể Hình Cao Cấp',
    description:
      'Hệ thống phân phối thực phẩm bổ sung dinh dưỡng thể hình cao cấp: Whey Isolate, Creatine, Dầu cá Omega-3, Pre-Workout nhập khẩu chính hãng tại Việt Nam.',
    keywords: [
      'Thực phẩm bổ sung thể hình',
      'Dinh dưỡng thể thao',
      'Whey Protein chính hãng',
      'Whey4You',
    ],
  },
};

/**
 * Generate Dynamic SEO Metadata & OpenGraph for Category Pages
 */
export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug: rawSlug } = await params;
  const slug = cleanSlugParam(rawSlug) || 'all';
  const seoInfo = CATEGORY_SEO_DATA[slug] || CATEGORY_SEO_DATA['all'];

  return {
    title: seoInfo.title,
    description: seoInfo.description,
    keywords: seoInfo.keywords,
    alternates: {
      canonical: `/category/${slug}`,
    },
    openGraph: {
      title: seoInfo.title,
      description: seoInfo.description,
      url: `${BASE_URL}/category/${slug}`,
      siteName: 'Whey4You Vietnam',
      locale: 'vi_VN',
      type: 'website',
      images: [
        {
          url: '/logo-brand.webp',
          width: 1200,
          height: 630,
          alt: seoInfo.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: seoInfo.title,
      description: seoInfo.description,
      images: ['/logo-brand.webp'],
    },
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug: rawSlug } = await params;
  const slug = cleanSlugParam(rawSlug) || 'all';
  const [products, categories] = await Promise.all([getProducts(), getCategories()]);

  const currentCategory = categories.find((c) => c.slug.toLowerCase() === slug.toLowerCase());
  const categoryName = currentCategory ? currentCategory.name : 'Danh Mục Sản Phẩm';
  const categoryProducts = slug === 'all' ? products : products.filter((p) => p.category === slug);
  const faqs = (CATEGORY_FAQS && CATEGORY_FAQS[slug]) || (CATEGORY_FAQS && CATEGORY_FAQS['all']) || [];

  // 1. Breadcrumbs Schema
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
        name: categoryName,
        item: `${BASE_URL}/category/${slug}`,
      },
    ],
  };

  // 2. ItemList Schema for Products
  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: categoryName,
    itemListElement: categoryProducts.map((prod, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: prod.name,
      url: `${BASE_URL}/product/${prod.slug}`,
      image: prod.image,
    })),
  };

  // 3. FAQPage Schema for Rich Snippets
  const faqSchema = faqs.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  } : null;

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Structured Data Schemas */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}

      <Header initialProducts={products} />

      <main className="flex-1">
        <CategoryView initialSlug={slug} initialProducts={products} />

        {/* SEO FAQ Section at bottom */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 sm:pb-16">
          <CategoryFaq slug={slug} />
        </div>
      </main>

      {/* Fast Quick View Modal */}
      <QuickViewModal />

      {/* Slide-over Cart Drawer */}
      <CartDrawer />

      {/* Unified Bottom-Right Dock */}
      <FloatingContactHub />

      {/* Modern Minimalist Footer */}
      <Footer />
    </div>
  );
}
