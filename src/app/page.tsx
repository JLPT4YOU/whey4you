import React from 'react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { HeroSection } from '@/components/home/hero-section';
import { CategoryBento } from '@/components/home/category-bento';
import { LatestArticlesSection } from '@/components/home/latest-articles-section';
import { CartDrawer } from '@/components/cart/cart-drawer';
import { QuickViewModal } from '@/components/product/quick-view-modal';
import { FloatingContactHub } from '@/components/ui/floating-contact-hub';
import { getProducts } from '@/lib/services/product-service';
import { getArticles } from '@/lib/services/article-service';

export const revalidate = 60; // ISR cache every 60 seconds

export default async function HomePage() {
  const [products, articles] = await Promise.all([
    getProducts({ limit: 12 }),
    getArticles({ limit: 5 }),
  ]);

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Sticky Header with W4U Logo & Spotlight Search */}
      <Header initialProducts={products} />

      {/* Main Content */}
      <main className="flex-1">
        {/* Animated Hero Section */}
        <HeroSection initialProducts={products} />

        {/* Lookbook Category Grid: Bộ Sưu Tập W4U */}
        <CategoryBento />

        {/* Cẩm Nang & Blog Dinh Dưỡng Thể Hình Mới Nhất */}
        <LatestArticlesSection initialArticles={articles} />
      </main>

      {/* Fast Quick View Modal */}
      <QuickViewModal />

      {/* Slide-over Cart Drawer */}
      <CartDrawer />

      {/* Unified Bottom-Right Dock (AI Coach, Zalo, Facebook) */}
      <FloatingContactHub />

      {/* Modern Midnight Blue Footer */}
      <Footer />
    </div>
  );
}
