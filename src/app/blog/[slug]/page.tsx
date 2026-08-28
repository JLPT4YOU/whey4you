import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { CartDrawer } from '@/components/cart/cart-drawer';
import { QuickViewModal } from '@/components/product/quick-view-modal';
import { FloatingContactHub } from '@/components/ui/floating-contact-hub';
import { MarkdownRenderer } from '@/components/blog/markdown-renderer';
import { TableOfContents } from '@/components/blog/table-of-contents';
import { ArticleProductCard } from '@/components/blog/article-product-card';
import { ArticleCard } from '@/components/blog/article-card';
import { ConsultationSidebarCard } from '@/components/blog/consultation-sidebar-card';
import { getArticleBySlug, getRelatedArticles } from '@/lib/services/article-service';
import { getProducts } from '@/lib/services/product-service';
import { Product } from '@/types/product';
import { formatArticleDate } from '@/types/article';
import { 
  Clock, 
  Eye, 
  Calendar, 
  ChevronRight, 
  ArrowLeft, 
  ShieldCheck, 
  Sparkles
} from 'lucide-react';

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = 60; // ISR cache 60s

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://whey4you.vn';

/**
 * Generate Dynamic SEO Metadata & OpenGraph
 */
export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    return {
      title: 'Không tìm thấy bài viết | Whey4You',
    };
  }

  return {
    title: `${article.title} - Kiến Thức Dinh Dưỡng`,
    description: article.excerpt,
    keywords: [...(article.tags || []), 'Whey4You', 'Dinh Dưỡng Thể Hình', article.categoryName],
    alternates: {
      canonical: `/blog/${article.slug}`,
    },
    openGraph: {
      title: article.title,
      description: article.excerpt,
      url: `${BASE_URL}/blog/${article.slug}`,
      siteName: 'Whey4You Vietnam',
      type: 'article',
      publishedTime: article.createdAt,
      modifiedTime: article.updatedAt,
      authors: [article.authorName],
      images: [
        {
          url: article.coverImage,
          width: 1200,
          height: 630,
          alt: article.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.excerpt,
      images: [article.coverImage],
    },
  };
}

export default async function ArticleDetailPage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  const relatedArticles = await getRelatedArticles(article.slug, article.category, 3);
  const allProducts = await getProducts();
  const suggestedProducts: Product[] = [];
  if (article.suggestedProductSlugs && article.suggestedProductSlugs.length > 0) {
    for (const pSlug of article.suggestedProductSlugs) {
      const found = allProducts.find((p) => p.slug === pSlug);
      if (found && !suggestedProducts.some((p) => p.id === found.id)) {
        suggestedProducts.push(found);
      }
    }
  }

  if (suggestedProducts.length === 0 && allProducts.length > 0) {
    suggestedProducts.push(allProducts[0]);
  }

  const formattedDate = formatArticleDate(article.createdAt);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${BASE_URL}/blog/${article.slug}`,
    },
    headline: article.title,
    description: article.excerpt,
    image: [article.coverImage],
    datePublished: article.createdAt,
    dateModified: article.updatedAt,
    author: {
      '@type': 'Person',
      name: article.authorName,
      jobTitle: article.authorRole,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Whey4You - Hệ Thống Dinh Dưỡng Thể Hình Cao Cấp',
      logo: {
        '@type': 'ImageObject',
        url: `${BASE_URL}/logo.webp`,
      },
    },
  };

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
      {
        '@type': 'ListItem',
        position: 3,
        name: article.title,
        item: `${BASE_URL}/blog/${article.slug}`,
      },
    ],
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#FBFBFE]">
      {/* Inject JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* Sticky Header */}
      <Header />

      <main className="flex-1 pb-12 sm:pb-16">
        
        {/* BREADCRUMBS & TOP NAVIGATION */}
        <div className="bg-white border-b border-slate-100 py-2.5 sm:py-3 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto flex items-center justify-between text-xs text-slate-500">
            <nav className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
              <Link href="/" className="hover:text-[#0055FE] transition-colors whitespace-nowrap">
                Trang Chủ
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
              <Link href="/blog" className="hover:text-[#0055FE] transition-colors whitespace-nowrap">
                Kiến Thức Dinh Dưỡng
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
              <span className="font-semibold text-slate-900 truncate max-w-[140px] sm:max-w-md">
                {article.title}
              </span>
            </nav>

            <Link
              href="/blog"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-[#0055FE] hover:underline"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Tất cả bài viết</span>
            </Link>
          </div>
        </div>

        {/* ARTICLE HEADER & HERO */}
        <article className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-12">
          
          <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6 text-center">
            {/* Category & Badge */}
            <div className="inline-flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-blue-50 text-[#0055FE] text-[11px] sm:text-xs font-black uppercase tracking-wider border border-blue-100">
                {article.categoryName}
              </span>
            </div>

            {/* Title H1 */}
            <h1 className="text-xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-snug sm:leading-snug">
              {article.title}
            </h1>

            {/* Author & Meta Info */}
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-[11px] sm:text-xs text-slate-500 pt-2 pb-4 border-b border-slate-200/80">
              <div className="flex items-center gap-2">
                {article.authorAvatar && (
                  <img
                    src={article.authorAvatar}
                    alt={article.authorName}
                    className="w-7 h-7 sm:w-9 sm:h-9 rounded-full object-cover border border-white shadow-2xs"
                  />
                )}
                <div className="text-left">
                  <p className="font-bold text-slate-900">{article.authorName}</p>
                  <p className="text-[9px] sm:text-[10px] text-slate-400">{article.authorRole}</p>
                </div>
              </div>

              <div className="hidden sm:block w-1 h-1 rounded-full bg-slate-300" />

              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {formattedDate}
              </span>

              <div className="w-1 h-1 rounded-full bg-slate-300" />

              <span className="flex items-center gap-1 font-semibold text-slate-700">
                <Clock className="w-3.5 h-3.5 text-[#0055FE]" />
                {article.readingTime} phút đọc
              </span>

              <div className="w-1 h-1 rounded-full bg-slate-300" />

              <span className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5 text-slate-400" />
                {(article.viewCount || 0) + 120} lượt xem
              </span>
            </div>
          </div>

          {/* Hero Cover Image */}
          <div className="max-w-5xl mx-auto my-6 sm:my-8 rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl border border-slate-100 bg-slate-900 aspect-[16/10] sm:aspect-[21/9] relative">
            <img
              src={article.coverImage}
              alt={article.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* TWO-COLUMN LAYOUT: CONTENT + STICKY SIDEBAR */}
          <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 pt-2 sm:pt-4">
            
            {/* MAIN ARTICLE BODY (8 COLS) */}
            <div className="lg:col-span-8 space-y-6 sm:space-y-8">
              
              {/* Excerpt Highlight Box */}
              <div className="p-4 sm:p-6 rounded-2xl bg-slate-50 border-l-4 border-[#0055FE] shadow-2xs">
                <p className="text-sm sm:text-lg font-semibold text-slate-800 leading-relaxed italic">
                  &ldquo;{article.excerpt}&rdquo;
                </p>
              </div>

              {/* Main Markdown Content with In-Article Secondary Image */}
              {(() => {
                const renderSecondaryImageCard = () => {
                  if (!article.secondaryImage) return null;
                  return (
                    <figure className="my-8 rounded-3xl overflow-hidden border border-slate-100 bg-white shadow-md p-2.5 sm:p-4 space-y-3 animate-in fade-in">
                      <div className="rounded-2xl overflow-hidden aspect-[16/10] sm:aspect-[16/9] relative bg-slate-900 group">
                        <img
                          src={article.secondaryImage}
                          alt={article.secondaryImageCaption || article.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                          loading="lazy"
                        />
                      </div>
                      {article.secondaryImageCaption && (
                        <figcaption className="text-center text-xs sm:text-sm text-slate-600 font-medium italic px-3 py-1 flex items-center justify-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-[#0055FE] shrink-0" />
                          <span>{article.secondaryImageCaption}</span>
                        </figcaption>
                      )}
                    </figure>
                  );
                };

                if (!article.secondaryImage) {
                  return (
                    <div className="space-y-6 sm:space-y-8">
                      <MarkdownRenderer content={article.content} />
                    </div>
                  );
                }

                // Tách theo tiêu đề H2 (##) hoặc đoạn văn
                const rawSections = (article.content || '').split(/(?=\n##\s+|^##\s+)/m).filter(Boolean);
                
                if (rawSections.length >= 2) {
                  const midIndex = Math.max(1, Math.floor(rawSections.length / 2));
                  const firstHalf = rawSections.slice(0, midIndex).join('\n');
                  const secondHalf = rawSections.slice(midIndex).join('\n');

                  return (
                    <div className="space-y-6 sm:space-y-8">
                      <MarkdownRenderer content={firstHalf} />
                      {renderSecondaryImageCard()}
                      <MarkdownRenderer content={secondHalf} />
                    </div>
                  );
                }

                // Nếu không có nhiều H2, tách theo đoạn văn \n\n
                const paragraphs = (article.content || '').split(/\n\n+/);
                if (paragraphs.length >= 3) {
                  const midPIndex = Math.max(1, Math.floor(paragraphs.length / 2));
                  const firstHalfP = paragraphs.slice(0, midPIndex).join('\n\n');
                  const secondHalfP = paragraphs.slice(midPIndex).join('\n\n');

                  return (
                    <div className="space-y-6 sm:space-y-8">
                      <MarkdownRenderer content={firstHalfP} />
                      {renderSecondaryImageCard()}
                      <MarkdownRenderer content={secondHalfP} />
                    </div>
                  );
                }

                return (
                  <div className="space-y-6 sm:space-y-8">
                    <MarkdownRenderer content={article.content} />
                    {renderSecondaryImageCard()}
                  </div>
                );
              })()}

              {/* In-Article Embedded Product Recommendations */}
              {suggestedProducts.length > 0 && (
                <div className="pt-4 sm:pt-6">
                  {suggestedProducts.map((prod) => (
                    <ArticleProductCard key={prod.id} product={prod} variant="inline" />
                  ))}
                </div>
              )}

              {/* Tags Section */}
              {article.tags && article.tags.length > 0 && (
                <div className="pt-4 sm:pt-6 border-t border-slate-200 space-y-2">
                  <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-500">
                    Chủ Đề Liên Quan:
                  </span>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {article.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 sm:px-3 py-1 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-blue-50 hover:text-[#0055FE] transition-colors"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Author Box */}
              <div className="p-4 sm:p-6 rounded-3xl bg-white border border-slate-100 shadow-sm flex flex-col sm:flex-row items-center gap-4 sm:gap-5">
                {article.authorAvatar && (
                  <img
                    src={article.authorAvatar}
                    alt={article.authorName}
                    className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover shadow-md border-2 border-[#0055FE]/20 shrink-0"
                  />
                )}
                <div className="space-y-1 text-center sm:text-left flex-1">
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <h4 className="text-sm sm:text-base font-black text-slate-900">{article.authorName}</h4>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-50 text-[#0055FE] text-[9px] sm:text-[10px] font-black uppercase">
                      <ShieldCheck className="w-3 h-3" /> Kiểm duyệt Y khoa
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium">{article.authorRole}</p>
                  <p className="text-xs text-slate-600 leading-relaxed pt-1">
                    Cố vấn dinh dưỡng cao cấp tại Whey4You. Chuyên xây dựng giáo án nạp Macro cá nhân hóa cho vận động viên và gymer Việt Nam.
                  </p>
                </div>
              </div>

            </div>

            {/* STICKY SIDEBAR (4 COLS) */}
            <aside className="lg:col-span-4 space-y-6">
              
              <div className="lg:sticky lg:top-24 space-y-6">
                
                {/* Table of Contents */}
                <TableOfContents content={article.content} />

                {/* Sidebar Product Recommendation */}
                {suggestedProducts.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#0055FE]" />
                      <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                        Sản Phẩm Đề Xuất
                      </h3>
                    </div>
                    <ArticleProductCard product={suggestedProducts[0]} variant="sidebar" />
                  </div>
                )}

                {/* Free Consultation Box */}
                <ConsultationSidebarCard />

              </div>

            </aside>

          </div>

        </article>

        {/* RELATED ARTICLES SECTION */}
        {relatedArticles.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-16 mt-10 sm:mt-16 border-t border-slate-200">
            <div className="flex items-center justify-between mb-6 sm:mb-8">
              <div>
                <h2 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight">
                  Bài Viết Liên Quan
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  Tiếp tục nâng cấp kiến thức thể hình chuẩn khoa học
                </p>
              </div>

              <Link
                href="/blog"
                className="text-xs sm:text-sm font-bold text-[#0055FE] hover:underline flex items-center gap-1"
              >
                <span>Xem tất cả</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
              {relatedArticles.map((rel) => (
                <ArticleCard key={rel.id} article={rel} />
              ))}
            </div>
          </section>
        )}

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
