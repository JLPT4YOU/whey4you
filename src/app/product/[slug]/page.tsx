import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { CartDrawer } from '@/components/cart/cart-drawer';
import { QuickViewModal } from '@/components/product/quick-view-modal';
import { FloatingContactHub } from '@/components/ui/floating-contact-hub';
import { ProductDetailView } from '@/components/product/product-detail-view';
import { getProductBySlug, getProducts } from '@/lib/services/product-service';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://whey4you.vn';

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = 60; // ISR cache 60s

/**
 * Generate Dynamic SEO Metadata & OpenGraph for Product
 */
export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return {
      title: 'Không tìm thấy sản phẩm | Whey4You',
      description: 'Sản phẩm bạn đang tìm kiếm không tồn tại hoặc đã hết hàng tại Whey4You.',
    };
  }

  const title = `${product.name} Chính Hãng - Giá Tốt Nhất`;
  const description = `${product.tagline || product.description} Mua ngay tại Whey4You cam kết 100% chính hãng, đền 200% nếu phát hiện hàng giả, giao hàng nhanh SPX toàn quốc.`;

  return {
    title,
    description,
    keywords: [
      product.name,
      product.categoryName,
      'Whey4You',
      'Thực phẩm bổ sung',
      'Dinh dưỡng thể hình',
      'Whey Protein chính hãng',
      ...(product.flavors || []),
      ...(product.macros?.map((m) => `${m.value} ${m.label}`) || []),
    ],
    alternates: {
      canonical: `/product/${product.slug}`,
    },
    openGraph: {
      title,
      description,
      url: `${BASE_URL}/product/${product.slug}`,
      siteName: 'Whey4You Vietnam',
      locale: 'vi_VN',
      type: 'website',
      images: [
        {
          url: product.image,
          width: 800,
          height: 800,
          alt: `${product.name} - Whey4You`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [product.image],
    },
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  // Load related products from the same category
  const allCategoryProducts = await getProducts({ category: product.category, limit: 5 });
  const relatedProducts = allCategoryProducts.filter((p) => p.id !== product.id);

  // Schema.org Product JSON-LD Structured Data
  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: [product.image],
    description: product.description || product.tagline,
    sku: product.id,
    mpn: product.id,
    brand: {
      '@type': 'Brand',
      name: 'Whey4You',
    },
    category: product.categoryName,
    offers: {
      '@type': 'Offer',
      url: `${BASE_URL}/product/${product.slug}`,
      priceCurrency: 'VND',
      price: product.price,
      priceValidUntil: '2027-12-31',
      itemCondition: 'https://schema.org/NewCondition',
      availability: 'https://schema.org/InStock',
      seller: {
        '@type': 'Organization',
        name: 'Whey4You',
      },
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: product.rating,
      reviewCount: product.reviewCount || 100,
      bestRating: '5',
      worstRating: '1',
    },
  };

  // Breadcrumbs Schema JSON-LD
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
        name: product.categoryName,
        item: `${BASE_URL}/category/${product.category}`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: product.name,
        item: `${BASE_URL}/product/${product.slug}`,
      },
    ],
  };

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Inject Structured Data Schemas */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* Header */}
      <Header />

      {/* Main Product Details */}
      <main className="flex-1">
        <ProductDetailView product={product} relatedProducts={relatedProducts} />
      </main>

      {/* Global Modals & Drawers */}
      <QuickViewModal />
      <CartDrawer />
      <FloatingContactHub />

      {/* Modern Midnight Blue Footer */}
      <Footer />
    </div>
  );
}
