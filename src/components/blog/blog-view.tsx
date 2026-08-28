'use client';

import React, { useState, useEffect } from 'react';
import { ArticleCard } from '@/components/blog/article-card';
import { FeaturedArticlesCarousel } from '@/components/blog/featured-articles-carousel';
import { Article, ARTICLE_CATEGORIES } from '@/types/article';
import { 
  BookOpen, 
  Search, 
  Sparkles, 
  Flame, 
  Dumbbell, 
  Zap, 
  Apple, 
  ShieldPlus,
  RefreshCw
} from 'lucide-react';

interface BlogViewProps {
  initialArticles?: Article[];
}

export function BlogView({ initialArticles = [] }: BlogViewProps) {
  const [articles, setArticles] = useState<Article[]>(initialArticles);
  const [loading, setLoading] = useState(initialArticles.length === 0);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (initialArticles && initialArticles.length > 0) {
      setArticles(initialArticles);
      setLoading(false);
      return;
    }

    async function loadArticles() {
      try {
        setLoading(true);
        const res = await fetch('/api/articles');
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setArticles(json.data);
        }
      } catch (err) {
        console.warn('Lỗi tải bài viết:', err);
      } finally {
        setLoading(false);
      }
    }
    loadArticles();
  }, [initialArticles]);

  const filteredArticles = articles.filter((art) => {
    const matchCategory = selectedCategory === 'all' || art.category === selectedCategory;
    const matchSearch =
      searchQuery.trim() === '' ||
      art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (art.tags || []).some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchCategory && matchSearch;
  });

  const displayFeatured = filteredArticles.filter((a) => a.isFeatured);
  const regularArticles = filteredArticles;

  return (
    <main className="flex-1">
      {/* HERO SECTION */}
      <section className="relative bg-gradient-to-b from-[#08183A] via-[#0B1E48] to-[#08183A] text-white py-10 sm:py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-72 sm:w-96 h-72 sm:h-96 bg-[#0055FE]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-60 sm:w-80 h-60 sm:h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto text-center relative z-10 space-y-3 sm:space-y-5">
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[10px] sm:text-xs font-black uppercase tracking-wider text-blue-300">
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            <span>Góc Chuyên Gia & Cẩm Nang Thể Hình W4U</span>
          </div>

          <h1 className="text-2xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-snug sm:leading-tight">
            Kiến Thức Dinh Dưỡng <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-400 bg-clip-text text-transparent">
              Chuẩn Khoa Học & Thực Chiến
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-xs sm:text-base text-slate-300 leading-relaxed font-medium">
            Khám phá các bí quyết tăng cơ nạc, thực đơn siết mỡ cắt nét, và cách sử dụng Whey, Creatine, Pre-Workout chuẩn y khoa từ đội ngũ Huấn luyện viên W4U.
          </p>

          {/* Search Input Bar */}
          <div className="max-w-xl mx-auto pt-2 sm:pt-4">
            <div className="relative flex items-center shadow-2xl rounded-2xl overflow-hidden bg-white/10 backdrop-blur-xl border border-white/20">
              <Search className="w-4 h-4 sm:w-5 sm:h-5 text-slate-300 absolute left-4" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm bài viết, whey, creatine, giảm mỡ..."
                className="w-full pl-11 sm:pl-12 pr-4 py-3 sm:py-3.5 text-base sm:text-sm text-white placeholder:text-slate-400 bg-transparent focus:outline-none focus:ring-2 focus:ring-[#0055FE]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="pr-4 text-xs text-slate-400 hover:text-white cursor-pointer"
                >
                  Xóa
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORY FILTER PILLS */}
      <section className="border-b border-slate-200 bg-white sticky top-16 sm:top-20 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3.5 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-2 sm:gap-3 min-w-max">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-[#0055FE] text-white shadow-md shadow-blue-500/20'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              Tất Cả Chủ Đề
            </button>

            {ARTICLE_CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 sm:gap-2 cursor-pointer ${
                    isSelected
                      ? 'bg-[#0055FE] text-white shadow-md shadow-blue-500/20'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {cat.id === 'tang-co' && <Dumbbell className="w-3.5 h-3.5" />}
                  {cat.id === 'giam-mo' && <Flame className="w-3.5 h-3.5" />}
                  {cat.id === 'supplement' && <Zap className="w-3.5 h-3.5" />}
                  {cat.id === 'dinh-duong-chung' && <Apple className="w-3.5 h-3.5" />}
                  {cat.id === 'phuc-hoi' && <ShieldPlus className="w-3.5 h-3.5" />}
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ARTICLES CONTENT GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14 space-y-8 sm:space-y-10">
        {loading ? (
          <div className="py-16 sm:py-20 text-center space-y-3">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-[#0055FE]" />
            <p className="text-sm font-bold text-slate-600">Đang tải cẩm nang dinh dưỡng...</p>
          </div>
        ) : filteredArticles.length === 0 ? (
          <div className="py-12 sm:py-16 text-center bg-white rounded-3xl border border-slate-200 p-6 sm:p-8">
            <BookOpen className="w-10 h-10 sm:w-12 sm:h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base sm:text-lg font-bold text-slate-800">Không tìm thấy bài viết nào</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              Không có bài viết phù hợp với tiêu chí tìm kiếm hoặc chuyên mục này. Hãy thử chọn Tất cả chủ đề.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSearchQuery('');
              }}
              className="mt-4 px-5 py-2 rounded-xl bg-[#0055FE] text-white text-xs font-bold cursor-pointer"
            >
              Xem tất cả bài viết
            </button>
          </div>
        ) : (
          <>
            {/* Featured Articles Carousel */}
            {displayFeatured.length > 0 && (
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#0055FE]" />
                    <h2 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-900">
                      Bài Viết Tiêu Điểm Nổi Bật
                    </h2>
                  </div>
                  {displayFeatured.length > 1 && (
                    <span className="text-xs font-semibold text-slate-500 hidden sm:inline">
                      {displayFeatured.length} bài viết tiêu điểm
                    </span>
                  )}
                </div>
                <FeaturedArticlesCarousel articles={displayFeatured} />
              </div>
            )}

            {/* Grid of Other Articles */}
            {regularArticles.length > 0 && (
              <div className="space-y-4 sm:space-y-6 pt-2 sm:pt-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight">
                    Cẩm Nang & Bài Viết Mới Nhất
                  </h2>
                  <span className="text-xs font-semibold text-slate-500">
                    {regularArticles.length} bài viết
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
                  {regularArticles.map((article) => (
                    <ArticleCard key={article.id} article={article} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
}
