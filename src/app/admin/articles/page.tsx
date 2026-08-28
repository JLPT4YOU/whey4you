'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  BookOpen, 
  Sparkles, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Eye, 
  CheckCircle2, 
  Clock, 
  ExternalLink,
  RefreshCw,
  Globe,
  Tag as TagIcon,
  Flame,
  AlertCircle,
  FileText,
  Dumbbell,
  Link as LinkIcon,
  RotateCcw,
  Check,
  X,
  Upload,
  Image as ImageIcon
} from 'lucide-react';
import { Article, ArticleCategory, ARTICLE_CATEGORIES } from '@/types/article';
import { Product } from '@/types/product';
import { slugify } from '@/lib/utils/slug';
import { MarkdownRenderer } from '@/components/blog/markdown-renderer';

// Chủ đề gợi ý mặc định chất lượng cao cho Gymer & Nutritionist
const DEFAULT_QUICK_TOPICS = [
  { topic: 'Uống Whey Khi Nào Tốt Nhất? 4 Thời Điểm Vàng Tối Ưu Tăng Cơ', cat: 'tang-co' },
  { topic: 'Hướng dẫn nạp Creatine chuẩn y khoa: Loading vs Steady', cat: 'supplement' },
  { topic: 'So sánh Whey Isolate vs Hydrolyzed vs Concentrate: Nên chọn loại nào?', cat: 'tang-co' },
  { topic: 'Thực đơn giảm mỡ siết cơ 1800 Calo giữ cơ tối đa cho Gymer', cat: 'giam-mo' },
  { topic: 'Tại sao uống Whey bị nổi mụn hoặc đau bụng và cách khắc phục triệt để', cat: 'tang-co' },
  { topic: 'Cách chọn Pre-Workout tăng sức mạnh không lo mất ngủ hay tim đập nhanh', cat: 'supplement' },
  { topic: 'Lợi ích của Omega-3 đối with xương khớp và phục hồi cơ bắp sau tập nặng', cat: 'phuc-hoi' },
  { topic: 'Lật tẩy 5 lầm tưởng tai hại về nạp Protein mà 90% gymer mắc phải', cat: 'dinh-duong-chung' },
];

export default function AdminArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'published' | 'draft'>('all');

  // Quản lý danh sách chủ đề mẫu (Quick Topics) có thể tự thêm / xóa
  const [quickTopics, setQuickTopics] = useState<{ topic: string; cat: string }[]>(DEFAULT_QUICK_TOPICS);
  const [isAddingTopic, setIsAddingTopic] = useState(false);
  const [newTopicText, setNewTopicText] = useState('');
  const [newTopicCat, setNewTopicCat] = useState<ArticleCategory>('tang-co');

  // AI Generator Modal State
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiTopic, setAiTopic] = useState('');
  const [aiCategory, setAiCategory] = useState<ArticleCategory>('tang-co');
  const [aiTone, setAiTone] = useState<'expert' | 'friendly' | 'inspirational' | 'scientific'>('expert');
  const [aiFramework, setAiFramework] = useState<'evidence-based' | 'how-to-guide' | 'comparison' | 'myth-buster'>('evidence-based');
  const [aiSearchDepth, setAiSearchDepth] = useState<'deep' | 'quick'>('deep');
  const [aiTargetAudience, setAiTargetAudience] = useState('');
  const [aiCustomInstructions, setAiCustomInstructions] = useState('');
  const [aiEnableWebSearch, setAiEnableWebSearch] = useState(true);
  const [aiSelectedProduct, setAiSelectedProduct] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiStepMessage, setAiStepMessage] = useState('');

  // Tải danh sách chủ đề cá nhân hóa từ LocalStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('w4u_custom_quick_topics');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setQuickTopics(parsed);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  const saveQuickTopics = (newTopics: { topic: string; cat: string }[]) => {
    setQuickTopics(newTopics);
    try {
      localStorage.setItem('w4u_custom_quick_topics', JSON.stringify(newTopics));
    } catch {
      // ignore
    }
  };

  const handleAddQuickTopic = () => {
    if (!newTopicText.trim()) return;
    const updated = [{ topic: newTopicText.trim(), cat: newTopicCat }, ...quickTopics];
    saveQuickTopics(updated);
    setNewTopicText('');
    setIsAddingTopic(false);
    showToast('success', 'Đã thêm chủ đề gợi ý mới!');
  };

  const handleDeleteQuickTopic = (idxToRemove: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = quickTopics.filter((_, i) => i !== idxToRemove);
    saveQuickTopics(updated);
    showToast('success', 'Đã xóa chủ đề gợi ý!');
  };

  const handleResetQuickTopics = () => {
    saveQuickTopics(DEFAULT_QUICK_TOPICS);
    showToast('success', 'Đã khôi phục các chủ đề gợi ý mặc định!');
  };

  // Manual Edit / Create Modal
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingArticleId, setEditingArticleId] = useState<string | null>(null);
  const [editorTab, setEditorTab] = useState<'write' | 'preview'>('write');
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    coverImage: '',
    secondaryImage: '',
    secondaryImageCaption: '',
    category: 'tang-co' as ArticleCategory,
    authorName: 'Coach WHEY4YOU',
    authorRole: 'Chuyên gia Dinh Dưỡng W4U & NSCA-CPT',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    readingTime: 5,
    status: 'published' as 'published' | 'draft',
    isFeatured: false,
    suggestedProductSlugs: [] as string[],
    tags: 'Whey4You, Dinh Dưỡng Thể Hình',
  });

  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  // Convert image to WebP
  const handleConvertFileToWebP = (file: File, field: 'coverImage' | 'secondaryImage') => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const webpDataUrl = canvas.toDataURL('image/webp', 0.85);
          setFormData((prev) => ({ ...prev, [field]: webpDataUrl }));
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/articles');
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setArticles(json.data);
      } else {
        showToast('error', 'Không thể tải danh sách bài viết');
      }
    } catch {
      showToast('error', 'Không thể tải danh sách bài viết');
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setProducts(json.data);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchArticles();
    fetchProducts();
  }, []);

  // Filtered Articles
  const filteredArticles = articles.filter((art) => {
    const matchSearch =
      art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (art.tags || []).some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchCategory = filterCategory === 'all' || art.category === filterCategory;
    const matchStatus = filterStatus === 'all' || art.status === filterStatus;

    return matchSearch && matchCategory && matchStatus;
  });

  // AI Generator Handler
  const handleGenerateWithAi = async () => {
    if (!aiTopic.trim()) {
      showToast('error', 'Vui lòng nhập chủ đề bài viết');
      return;
    }

    setIsGenerating(true);
    setAiStepMessage('Đang kết nối MCP Deep Research & tra cứu nghiên cứu quốc tế (ISSN, PubMed)...');

    const stepTimer1 = setTimeout(() => {
      setAiStepMessage('Đang lọc và cào dữ liệu chuyên sâu từ các nguồn khoa học uy tín...');
    }, 1800);

    const stepTimer2 = setTimeout(() => {
      setAiStepMessage('AI đang phân tích cơ chế sinh học, lập bảng đối chiếu & lồng ghép sản phẩm W4U...');
    }, 3800);

    try {
      const res = await fetch('/api/ai/generate-article', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: aiTopic,
          category: aiCategory,
          tone: aiTone,
          framework: aiFramework,
          searchDepth: aiSearchDepth,
          targetAudience: aiTargetAudience.trim() || undefined,
          customInstructions: aiCustomInstructions.trim() || undefined,
          enableWebSearch: aiEnableWebSearch,
          selectedProductSlug: aiSelectedProduct || undefined,
        }),
      });

      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);

      const json = await res.json();

      if (!json.success || !json.data) {
        throw new Error(json.error || 'Lỗi sinh bài viết từ AI');
      }

      const generated = json.data;
      const matchedCover = generated.coverImage || '';

      // Đưa dữ liệu sinh ra vào Form Editor
      setEditingArticleId(null);
      setFormData({
        title: generated.title || aiTopic,
        slug: generated.slug || '',
        excerpt: generated.excerpt || '',
        content: generated.content || '',
        coverImage: matchedCover,
        secondaryImage: generated.secondaryImage || '',
        secondaryImageCaption: generated.secondaryImageCaption || '',
        category: aiCategory,
        authorName: 'Coach WHEY4YOU',
        authorRole: 'Chuyên gia Dinh Dưỡng W4U & NSCA-CPT',
        authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        readingTime: generated.readingTime || 6,
        status: 'published',
        isFeatured: false,
        suggestedProductSlugs: generated.suggestedProductSlugs || (aiSelectedProduct ? [aiSelectedProduct] : []),
        tags: Array.isArray(generated.tags) ? generated.tags.join(', ') : 'Whey4You, Dinh Dưỡng Thể Hình',
      });

      setIsAiModalOpen(false);
      setIsEditorOpen(true);
      setEditorTab('preview'); // Mở sẵn tab xem trước để chiêm ngưỡng bài AI viết
      showToast(
        'success',
        `Đã tạo bài viết AI "${generated.title}" thành công! (${json.researchSourcesCount || 0} nguồn dữ liệu)`
      );
    } catch (err: unknown) {
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      showToast('error', err instanceof Error ? err.message : 'Lỗi khi gọi AI');
    } finally {
      setIsGenerating(false);
      setAiStepMessage('');
    }
  };

  // Mở modal tạo mới thủ công
  const handleOpenCreateModal = () => {
    setEditingArticleId(null);
    setFormData({
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      coverImage: '',
      secondaryImage: '',
      secondaryImageCaption: '',
      category: 'tang-co',
      authorName: 'Coach WHEY4YOU',
      authorRole: 'Chuyên gia Dinh Dưỡng W4U & NSCA-CPT',
      authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      readingTime: 5,
      status: 'published',
      isFeatured: false,
      suggestedProductSlugs: [],
      tags: 'Whey4You, Thể Hình, Dinh Dưỡng',
    });
    setEditorTab('write');
    setIsEditorOpen(true);
  };

  // Mở modal chỉnh sửa bài viết đã có
  const handleOpenEditModal = (article: Article) => {
    setEditingArticleId(article.id);
    setFormData({
      title: article.title,
      slug: article.slug,
      excerpt: article.excerpt,
      content: article.content,
      coverImage: article.coverImage,
      secondaryImage: article.secondaryImage || '',
      secondaryImageCaption: article.secondaryImageCaption || '',
      category: article.category,
      authorName: article.authorName,
      authorRole: article.authorRole,
      authorAvatar: article.authorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      readingTime: article.readingTime,
      status: article.status as 'published' | 'draft',
      isFeatured: article.isFeatured,
      suggestedProductSlugs: article.suggestedProductSlugs || [],
      tags: (article.tags || []).join(', '),
    });
    setEditorTab('write');
    setIsEditorOpen(true);
  };

  // Tự động sinh slug từ tiêu đề
  const handleTitleChange = (newTitle: string) => {
    const generatedSlug = slugify(newTitle);

    setFormData((prev) => ({
      ...prev,
      title: newTitle,
      slug: prev.slug === '' || !editingArticleId ? generatedSlug : prev.slug,
    }));
  };

  // Lưu bài viết
  const handleSaveArticle = async (forcedStatus?: 'published' | 'draft') => {
    if (!formData.title.trim() || !formData.content.trim()) {
      showToast('error', 'Vui lòng điền Tiêu đề và Nội dung bài viết');
      return;
    }

    const categoryObj = ARTICLE_CATEGORIES.find((c) => c.id === formData.category) || ARTICLE_CATEGORIES[0];
    const targetStatus = forcedStatus || formData.status;

    const payload = {
      title: formData.title,
      slug: formData.slug || `bai-viet-${Date.now()}`,
      excerpt: formData.excerpt || formData.content.slice(0, 150) + '...',
      content: formData.content,
      coverImage: formData.coverImage,
      secondaryImage: formData.secondaryImage ? formData.secondaryImage.trim() : null,
      secondaryImageCaption: formData.secondaryImageCaption ? formData.secondaryImageCaption.trim() : null,
      category: formData.category,
      categoryName: categoryObj.name,
      authorName: formData.authorName,
      authorRole: formData.authorRole,
      authorAvatar: formData.authorAvatar,
      readingTime: Number(formData.readingTime) || 5,
      status: targetStatus,
      isFeatured: formData.isFeatured,
      suggestedProductSlugs: formData.suggestedProductSlugs,
      tags: formData.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
    };

    try {
      if (editingArticleId) {
        // Cập nhật bài viết
        const res = await fetch(`/api/admin/articles/${editingArticleId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const json = await res.json();
        if (!json.success) throw new Error(json.error);
        showToast('success', 'Đã cập nhật bài viết thành công!');
      } else {
        // Tạo mới bài viết
        const res = await fetch('/api/admin/articles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const json = await res.json();
        if (!json.success) throw new Error(json.error);
        showToast('success', 'Đã xuất bản bài viết mới thành công!');
      }

      setIsEditorOpen(false);
      fetchArticles();
    } catch (err: unknown) {
      showToast('error', err instanceof Error ? err.message : 'Lỗi khi lưu bài viết');
    }
  };

  // Toggle nhanh Publish / Draft
  const handleToggleStatus = async (article: Article) => {
    const nextStatus = article.status === 'published' ? 'draft' : 'published';
    try {
      const res = await fetch(`/api/admin/articles/${article.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setArticles((prev) =>
        prev.map((a) => (a.id === article.id ? { ...a, status: nextStatus } : a))
      );
      showToast('success', `Đã chuyển sang ${nextStatus === 'published' ? 'Xuất Bản' : 'Bản Nháp'}`);
    } catch {
      showToast('error', 'Không thể đổi trạng thái bài viết');
    }
  };

  // Xóa bài viết
  const handleDeleteArticle = async (id: string, title: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa bài viết: "${title}"?`)) return;
    try {
      const res = await fetch(`/api/admin/articles/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setArticles((prev) => prev.filter((a) => a.id !== id));
      showToast('success', 'Đã xóa bài viết!');
    } catch {
      showToast('error', 'Lỗi khi xóa bài viết');
    }
  };

  // Thống kê nhanh
  const totalArticles = articles.length;
  const publishedCount = articles.filter((a) => a.status === 'published').length;
  const draftCount = articles.filter((a) => a.status === 'draft').length;
  const totalViews = articles.reduce((acc, a) => acc + (a.viewCount || 0), 0);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl text-sm font-semibold transition-all animate-in fade-in slide-in-from-top-4 ${
            notification.type === 'success'
              ? 'bg-emerald-600 text-white'
              : 'bg-rose-600 text-white'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Header & Quick Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0055FE] flex items-center justify-center font-bold">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                Bài Viết & AI Studio Dinh Dưỡng
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm">
                  Mistral + MCP
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Tạo bài viết chuyên sâu tự động bằng AI, dẫn chứng khoa học thời gian thực và liên kết giỏ hàng W4U.
              </p>
            </div>
          </div>
        </div>

        {/* Action CTAs */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAiModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#0055FE] via-indigo-600 to-blue-700 text-white text-xs sm:text-sm font-bold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-yellow-300 animate-pulse" />
            <span>Tạo Bài Bằng AI Studio</span>
          </button>

          <button
            onClick={handleOpenCreateModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-bold transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Viết Thủ Công</span>
          </button>
        </div>
      </div>

      {/* Stats Counter Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold uppercase">Tổng bài viết</p>
            <p className="text-2xl font-black text-slate-900">{totalArticles}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold uppercase">Đã xuất bản</p>
            <p className="text-2xl font-black text-emerald-600">{publishedCount}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold uppercase">Bản nháp</p>
            <p className="text-2xl font-black text-amber-600">{draftCount}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Eye className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold uppercase">Tổng lượt xem</p>
            <p className="text-2xl font-black text-purple-600">{totalViews.toLocaleString('vi-VN')}</p>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm kiếm theo tiêu đề, tóm tắt hoặc hashtag..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0055FE] transition-all"
          />
        </div>

        {/* Category & Status Filters */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0055FE]"
          >
            <option value="all">Tất cả danh mục</option>
            {ARTICLE_CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as 'all' | 'published' | 'draft')}
            className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0055FE]"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="published">Đã xuất bản</option>
            <option value="draft">Bản nháp</option>
          </select>

          <button
            onClick={fetchArticles}
            className="p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-xl transition-colors cursor-pointer"
            title="Tải lại"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Articles Table / List */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-[#0055FE]" />
            <p className="text-sm font-semibold">Đang tải danh sách bài viết...</p>
          </div>
        ) : filteredArticles.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <BookOpen className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p className="text-base font-bold text-slate-700">Chưa có bài viết nào phù hợp</p>
            <p className="text-xs text-slate-400 mt-1">
              Thử tìm kiếm với từ khóa khác hoặc bấm nút Tạo Bài Bằng AI Studio ở trên!
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-black uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-4 sm:px-6">Bài Viết</th>
                  <th className="py-3.5 px-4">Danh Mục</th>
                  <th className="py-3.5 px-4">Tác Giả</th>
                  <th className="py-3.5 px-4">Đọc / Xem</th>
                  <th className="py-3.5 px-4">Trạng Thái</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                {filteredArticles.map((article) => (
                  <tr key={article.id} className="hover:bg-blue-50/30 transition-colors">
                    {/* Thumbnail & Title */}
                    <td className="py-4 px-4 sm:px-6">
                      <div className="flex items-center gap-3.5">
                        <img
                          src={article.coverImage}
                          alt={article.title}
                          className="w-16 h-12 rounded-lg object-cover bg-slate-100 shrink-0 border border-slate-200"
                        />
                        <div className="min-w-0 max-w-md">
                          <p className="font-bold text-slate-900 line-clamp-1 hover:text-[#0055FE] transition-colors">
                            {article.title}
                          </p>
                          <p className="text-slate-400 text-xs line-clamp-1 mt-0.5">
                            {article.excerpt}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[11px] font-mono text-slate-400">/{article.slug}</span>
                            {article.isFeatured && (
                              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded bg-amber-50 text-amber-700 text-[10px] font-black">
                                <Flame className="w-3 h-3 text-amber-500" /> Nổi Bật
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                        {article.categoryName}
                      </span>
                    </td>

                    {/* Author */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {article.authorAvatar && (
                          <img
                            src={article.authorAvatar}
                            alt={article.authorName}
                            className="w-6 h-6 rounded-full object-cover border border-slate-200"
                          />
                        )}
                        <span className="font-semibold text-slate-800 text-xs">{article.authorName}</span>
                      </div>
                    </td>

                    {/* Stats */}
                    <td className="py-4 px-4 whitespace-nowrap text-slate-500 text-xs">
                      <div className="flex flex-col">
                        <span className="flex items-center gap-1 font-medium">
                          <Clock className="w-3.5 h-3.5 text-slate-400" /> {article.readingTime} phút
                        </span>
                        <span className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
                          <Eye className="w-3.5 h-3.5 text-slate-400" /> {article.viewCount || 0} lượt
                        </span>
                      </div>
                    </td>

                    {/* Status Badge & 1-click Toggle */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleStatus(article)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                          article.status === 'published'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                            : 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
                        }`}
                        title="Bấm để chuyển đổi Xuất bản / Bản nháp"
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            article.status === 'published' ? 'bg-emerald-500' : 'bg-amber-500'
                          }`}
                        />
                        <span>{article.status === 'published' ? 'Đã Xuất Bản' : 'Bản Nháp'}</span>
                      </button>
                    </td>

                    {/* Action Buttons */}
                    <td className="py-4 px-4 sm:px-6 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/blog/${article.slug}`}
                          target="_blank"
                          className="p-2 text-slate-500 hover:text-[#0055FE] hover:bg-blue-50 rounded-lg transition-colors"
                          title="Xem trên trang blog"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleOpenEditModal(article)}
                          className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          title="Chỉnh sửa bài viết"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteArticle(article.id, article.title)}
                          className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Xóa bài viết"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: AI GENERATOR STUDIO (Mistral + MCP Internet Scrape) */}
      {/* ========================================================================= */}
      {isAiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#08183A] via-[#0055FE] to-[#1E3A8A] text-white p-6 relative">
              <button
                onClick={() => !isGenerating && setIsAiModalOpen(false)}
                className="absolute top-5 right-5 p-2 text-white/70 hover:text-white rounded-full hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                  <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-black">AI Nutrition Article Studio</h2>
                  <p className="text-xs text-white/80 mt-0.5">
                    Được vận hành bởi <strong>Mistral AI</strong> & <strong>MCP Internet Web Scrape</strong>
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5">
              
              {/* Quick Prompt Presets with Add / Remove capability */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/70 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <span>⚡ Chủ Đề Mẫu & Loại Bài Gợi Ý:</span>
                    <span className="text-[10px] text-slate-400 font-normal normal-case">({quickTopics.length} mẫu)</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsAddingTopic(!isAddingTopic)}
                      className="text-[11px] font-bold text-[#0055FE] hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>{isAddingTopic ? 'Đóng' : 'Thêm mẫu mới'}</span>
                    </button>
                    {quickTopics.length !== DEFAULT_QUICK_TOPICS.length && (
                      <button
                        type="button"
                        onClick={handleResetQuickTopics}
                        className="text-[11px] text-slate-400 hover:text-slate-600 flex items-center gap-0.5 cursor-pointer ml-1"
                        title="Khôi phục danh sách mẫu ban đầu"
                      >
                        <RotateCcw className="w-2.5 h-2.5" />
                        <span>Mặc định</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Form thêm chủ đề gợi ý mới */}
                {isAddingTopic && (
                  <div className="p-3 bg-white rounded-xl border border-blue-200 shadow-sm space-y-2.5 animate-in fade-in">
                    <p className="text-[11px] font-bold text-slate-700">Tạo mẫu chủ đề bài viết mới:</p>
                    <input
                      type="text"
                      value={newTopicText}
                      onChange={(e) => setNewTopicText(e.target.value)}
                      placeholder="Nhập tiêu đề hoặc định hướng bài viết mẫu..."
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0055FE]"
                    />
                    <div className="flex items-center justify-between gap-2">
                      <select
                        value={newTopicCat}
                        onChange={(e) => setNewTopicCat(e.target.value as ArticleCategory)}
                        className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700"
                      >
                        {ARTICLE_CATEGORIES.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setIsAddingTopic(false)}
                          className="px-2.5 py-1.5 text-xs text-slate-500 hover:bg-slate-100 rounded-lg"
                        >
                          Hủy
                        </button>
                        <button
                          type="button"
                          onClick={handleAddQuickTopic}
                          className="px-3 py-1.5 text-xs font-bold text-white bg-[#0055FE] hover:bg-blue-700 rounded-lg flex items-center gap-1 shadow-sm"
                        >
                          <Check className="w-3 h-3" />
                          <span>Lưu Mẫu</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Danh sách các chủ đề mẫu (Có thể click để chọn, hoặc bấm X để xoá) */}
                <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto pr-1">
                  {quickTopics.map((item, idx) => (
                    <div
                      key={idx}
                      onClick={() => {
                        setAiTopic(item.topic);
                        setAiCategory(item.cat as ArticleCategory);
                      }}
                      className="group flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-blue-50/80 text-slate-800 hover:text-[#0055FE] text-xs font-medium transition-all text-left border border-slate-200 hover:border-blue-200 shadow-2xs cursor-pointer"
                    >
                      <span className="line-clamp-1">{item.topic}</span>
                      <button
                        type="button"
                        onClick={(e) => handleDeleteQuickTopic(idx, e)}
                        className="opacity-40 group-hover:opacity-100 hover:text-rose-600 hover:bg-rose-50 rounded p-0.5 transition-all ml-0.5"
                        title="Xóa mẫu này"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  {quickTopics.length === 0 && (
                    <p className="text-xs text-slate-400 italic py-1">Chưa có mẫu nào. Bấm &quot;Thêm mẫu mới&quot; để tạo.</p>
                  )}
                </div>
              </div>

              {/* Topic Input */}
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                  Chủ Đề Hoặc Câu Hỏi Cần AI Viết Bài: <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={aiTopic}
                  onChange={(e) => setAiTopic(e.target.value)}
                  placeholder="Ví dụ: Hướng dẫn người mới tập gym uống Whey và Creatine đúng cách để tăng cơ nạc tối đa..."
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0055FE]"
                />
              </div>

              {/* Category, Tone & Framework Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                    Chuyên Mục:
                  </label>
                  <select
                    value={aiCategory}
                    onChange={(e) => setAiCategory(e.target.value as ArticleCategory)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0055FE]"
                  >
                    {ARTICLE_CATEGORIES.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                    Tông Giọng Viết:
                  </label>
                  <select
                    value={aiTone}
                    onChange={(e) => setAiTone(e.target.value as 'expert' | 'friendly' | 'inspirational' | 'scientific')}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0055FE]"
                  >
                    <option value="expert">Chuyên Gia Dinh Dưỡng W4U</option>
                    <option value="scientific">Dẫn Chứng Y Khoa Chuẩn</option>
                    <option value="inspirational">Truyền Lửa Động Lực Gymer</option>
                    <option value="friendly">Gần Gũi, Dễ Hiểu</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                    Định Dạng Framework:
                  </label>
                  <select
                    value={aiFramework}
                    onChange={(e) => setAiFramework(e.target.value as 'evidence-based' | 'how-to-guide' | 'comparison' | 'myth-buster')}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0055FE]"
                  >
                    <option value="evidence-based">🔬 Dẫn Chứng Khoa Học</option>
                    <option value="how-to-guide">📋 Cẩm Nang A-Z Thực Chiến</option>
                    <option value="comparison">⚖️ So Sánh & Review Đối Đầu</option>
                    <option value="myth-buster">💥 Lật Tẩy Lầm Tưởng</option>
                  </select>
                </div>
              </div>

              {/* Target Audience & Custom Instructions */}
              <div className="grid grid-cols-1 gap-3.5">
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                    Đối Tượng Độc Giả Mục Tiêu (Tùy chọn):
                  </label>
                  <input
                    type="text"
                    value={aiTargetAudience}
                    onChange={(e) => setAiTargetAudience(e.target.value)}
                    placeholder="Mặc định: Người tập gym, thể hình từ mới bắt đầu đến nâng cao (hoặc: Nữ giới, Người bận rộn...)"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0055FE]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                    Định Hướng & Yêu Cầu Riêng Cho AI (Custom Instructions):
                  </label>
                  <textarea
                    rows={2}
                    value={aiCustomInstructions}
                    onChange={(e) => setAiCustomInstructions(e.target.value)}
                    placeholder="Ví dụ: Nhấn mạnh ưu điểm của dòng Whey Isolate tinh khiết không gây mụn, có bảng đối chiếu thời điểm uống..."
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0055FE]"
                  />
                </div>
              </div>

              {/* Product Embed Selector */}
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                  Gài Sản Phẩm Đề Xuất Từ W4U Catalog:
                </label>
                <select
                  value={aiSelectedProduct}
                  onChange={(e) => setAiSelectedProduct(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0055FE]"
                >
                  <option value="">-- AI tự động chọn sản phẩm phù hợp nhất trong Catalog --</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.slug}>
                      {p.name} ({p.price.toLocaleString('vi-VN')}đ)
                    </option>
                  ))}
                </select>
              </div>

              {/* MCP Internet Web Search & Deep Research Option */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50/70 to-indigo-50/70 border border-blue-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-[#0055FE] text-white flex items-center justify-center shadow-xs">
                      <Globe className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">MCP Internet Live Research</p>
                      <p className="text-[11px] text-slate-500">Tra cứu nghiên cứu mới nhất từ ISSN, PubMed & Web</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={aiEnableWebSearch}
                    onChange={(e) => setAiEnableWebSearch(e.target.checked)}
                    className="w-5 h-5 accent-[#0055FE] cursor-pointer"
                  />
                </div>

                {aiEnableWebSearch && (
                  <div className="pt-2 border-t border-blue-200/50 flex items-center gap-3 text-xs">
                    <span className="font-bold text-slate-700">Độ sâu nghiên cứu:</span>
                    <label className="flex items-center gap-1.5 cursor-pointer text-slate-800">
                      <input
                        type="radio"
                        name="searchDepth"
                        value="deep"
                        checked={aiSearchDepth === 'deep'}
                        onChange={() => setAiSearchDepth('deep')}
                        className="accent-[#0055FE]"
                      />
                      <span className="font-semibold text-indigo-700">🧠 Nghiên cứu sâu (Scrape số liệu)</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer text-slate-800">
                      <input
                        type="radio"
                        name="searchDepth"
                        value="quick"
                        checked={aiSearchDepth === 'quick'}
                        onChange={() => setAiSearchDepth('quick')}
                        className="accent-[#0055FE]"
                      />
                      <span>⚡ Tra cứu nhanh</span>
                    </label>
                  </div>
                )}
              </div>

              {/* Progress Loading Steps when Generating */}
              {isGenerating && (
                <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-3 animate-in fade-in">
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin shrink-0" />
                    <span className="text-xs font-bold text-yellow-300">
                      {aiStepMessage || 'Đang xử lý bài viết bằng AI...'}
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-gradient-to-r from-yellow-400 via-blue-500 to-indigo-500 h-full w-4/5 animate-pulse" />
                  </div>
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                disabled={isGenerating}
                onClick={() => setIsAiModalOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs sm:text-sm font-bold hover:bg-slate-100 transition-colors disabled:opacity-50 cursor-pointer"
              >
                Hủy Bỏ
              </button>
              <button
                type="button"
                disabled={isGenerating || !aiTopic.trim()}
                onClick={handleGenerateWithAi}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#0055FE] to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white text-xs sm:text-sm font-black shadow-lg shadow-blue-500/25 disabled:opacity-50 transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-yellow-300" />
                <span>{isGenerating ? 'Đang Sinh Bài Viết...' : 'Bắt Đầu Sinh Bài Viết AI'}</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: FULL ARTICLE EDITOR & LIVE PREVIEW */}
      {/* ========================================================================= */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col max-h-[95vh]">
            
            {/* Editor Header */}
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500 text-white flex items-center justify-center">
                  <Edit3 className="w-4 h-4" />
                </div>
                <h2 className="text-base sm:text-lg font-black">
                  {editingArticleId ? 'Chỉnh Sửa Bài Viết' : 'Soạn Thảo / Tinh Chỉnh Bài Viết'}
                </h2>
              </div>

              {/* Tab Switcher */}
              <div className="flex items-center gap-2 bg-slate-800 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setEditorTab('write')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    editorTab === 'write' ? 'bg-[#0055FE] text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Soạn Thảo
                </button>
                <button
                  type="button"
                  onClick={() => setEditorTab('preview')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    editorTab === 'preview' ? 'bg-[#0055FE] text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Xem Trước (Live Preview)
                </button>
              </div>

              <button
                onClick={() => setIsEditorOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Editor Body */}
            <div className="p-6 overflow-y-auto space-y-5 flex-1">
              
              {/* Metadata Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Tiêu Đề Bài Viết: <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="Nhập tiêu đề chuẩn SEO..."
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0055FE]"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                      Đường Dẫn Slug: <span className="text-rose-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, slug: slugify(prev.title) }))}
                      className="text-[11px] font-bold text-[#0055FE] hover:underline flex items-center gap-1 cursor-pointer"
                      title="Tái tạo slug chuẩn SEO từ tiêu đề"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Tạo lại từ tiêu đề
                    </button>
                  </div>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    onBlur={(e) => setFormData({ ...formData, slug: slugify(e.target.value) })}
                    placeholder="thoi-diem-uong-whey-tot-nhat"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-mono text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0055FE]"
                  />
                  <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono mt-1 truncate">
                    <LinkIcon className="w-3 h-3 shrink-0 text-slate-400" />
                    <span className="truncate">Preview: <span className="text-[#0055FE] font-medium">/blog/{formData.slug || 'slug-bai-viet'}</span></span>
                  </div>
                </div>
              </div>

              {/* Excerpt */}
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Mô Tả Ngắn (Excerpt):
                </label>
                <textarea
                  rows={2}
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  placeholder="Tóm tắt ngắn 2-3 câu xuất hiện ở card bài viết và thẻ meta description..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0055FE]"
                />
              </div>

              {/* Category, Reading Time, Author */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Danh Mục:
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as ArticleCategory })}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0055FE]"
                  >
                    {ARTICLE_CATEGORIES.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Thời Gian Đọc (Phút):
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={formData.readingTime}
                    onChange={(e) => setFormData({ ...formData, readingTime: Number(e.target.value) })}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0055FE]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Tác Giả:
                  </label>
                  <input
                    type="text"
                    value={formData.authorName}
                    onChange={(e) => setFormData({ ...formData, authorName: e.target.value })}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0055FE]"
                  />
                </div>
              </div>

              {/* Cover Image & Secondary In-Article Image */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. Cover Image */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5 text-[#0055FE]" />
                      <span>1. Ảnh Bìa Chính (Cover)</span>
                    </label>
                    {formData.coverImage && (
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, coverImage: '' })}
                        className="text-[11px] font-bold text-rose-500 hover:underline flex items-center gap-0.5 cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                        <span>Xóa</span>
                      </button>
                    )}
                  </div>

                  <input
                    type="text"
                    value={formData.coverImage}
                    onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                    placeholder="Nhập URL ảnh bìa chính (https://...)"
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0055FE]"
                  />

                  <div className="flex items-center justify-between gap-2 pt-1">
                    <label className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:border-[#0055FE] rounded-lg text-[11px] font-bold text-slate-700 cursor-pointer shadow-2xs">
                      <Upload className="w-3 h-3 text-[#0055FE]" />
                      <span>Tải ảnh từ máy (WebP)</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleConvertFileToWebP(file, 'coverImage');
                        }}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {formData.coverImage && (
                    <div className="relative h-28 rounded-xl overflow-hidden border border-slate-200 bg-slate-900">
                      <img src={formData.coverImage} alt="Cover Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>

                {/* 2. Secondary In-Article Image */}
                <div className="p-4 bg-blue-50/60 rounded-2xl border border-blue-200/80 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-[#0055FE] uppercase tracking-wider flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span>2. Ảnh Phụ Giữa Bài (Secondary)</span>
                    </label>
                    {formData.secondaryImage && (
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, secondaryImage: '', secondaryImageCaption: '' })}
                        className="text-[11px] font-bold text-rose-500 hover:underline flex items-center gap-0.5 cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                        <span>Xóa</span>
                      </button>
                    )}
                  </div>

                  <input
                    type="text"
                    value={formData.secondaryImage}
                    onChange={(e) => setFormData({ ...formData, secondaryImage: e.target.value })}
                    placeholder="Nhập URL ảnh phụ chèn giữa bài viết..."
                    className="w-full p-2.5 bg-white border border-blue-200 rounded-xl text-xs font-mono text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0055FE]"
                  />

                  <div className="flex items-center justify-between gap-2">
                    <label className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-blue-200 hover:border-[#0055FE] rounded-lg text-[11px] font-bold text-[#0055FE] cursor-pointer shadow-2xs">
                      <Upload className="w-3 h-3" />
                      <span>Tải ảnh phụ (WebP)</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleConvertFileToWebP(file, 'secondaryImage');
                        }}
                        className="hidden"
                      />
                    </label>
                  </div>

                  <input
                    type="text"
                    value={formData.secondaryImageCaption}
                    onChange={(e) => setFormData({ ...formData, secondaryImageCaption: e.target.value })}
                    placeholder="Ghi chú / Chú thích ảnh (VD: Hướng dẫn kỹ thuật bài tập...)"
                    className="w-full p-2 bg-white border border-blue-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0055FE]"
                  />

                  {formData.secondaryImage && (
                    <div className="relative h-28 rounded-xl overflow-hidden border border-blue-200 bg-slate-900">
                      <img src={formData.secondaryImage} alt="Secondary Preview" className="w-full h-full object-cover" />
                      {formData.secondaryImageCaption && (
                        <div className="absolute bottom-0 inset-x-0 bg-black/70 px-2 py-1 text-[10px] text-white truncate text-center">
                          📸 {formData.secondaryImageCaption}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Suggested Products Link */}
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                  Sản Phẩm Đề Xuất Đính Kèm Trong Bài (Mua Ngay):
                </label>
                <div className="flex flex-wrap gap-2">
                  {products.map((prod) => {
                    const isSelected = formData.suggestedProductSlugs.includes(prod.slug);
                    return (
                      <button
                        key={prod.id}
                        type="button"
                        onClick={() => {
                          const current = [...formData.suggestedProductSlugs];
                          if (isSelected) {
                            setFormData({
                              ...formData,
                              suggestedProductSlugs: current.filter((s) => s !== prod.slug),
                            });
                          } else {
                            setFormData({
                              ...formData,
                              suggestedProductSlugs: [...current, prod.slug],
                            });
                          }
                        }}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#0055FE] text-white shadow-sm'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        <Dumbbell className="w-3.5 h-3.5" />
                        <span>{prod.name}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 ml-0.5" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tags & Featured */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Hashtags (Phân tách bằng dấu phẩy):
                  </label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="Whey, Tăng Cơ, Creatine..."
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0055FE]"
                  />
                </div>

                <div className="flex items-center gap-4 pt-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isFeatured}
                      onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                      className="w-4 h-4 accent-[#0055FE]"
                    />
                    <span className="text-xs font-bold text-slate-800">Ghim Bài Viết Nổi Bật</span>
                  </label>
                </div>
              </div>

              {/* MAIN CONTENT AREA: Write OR Preview Tab */}
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                  Nội Dung Bài Viết (Định Dạng Markdown Chuẩn):
                </label>

                {editorTab === 'write' ? (
                  <textarea
                    rows={16}
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="## 1. Tiêu đề mục...\nNội dung chi tiết...\n> 💡 Mẹo chuyên gia..."
                    className="w-full p-4 bg-slate-900 text-slate-100 font-mono text-xs sm:text-sm rounded-2xl border border-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0055FE]"
                  />
                ) : (
                  <div className="p-6 bg-white border border-slate-200 rounded-2xl max-h-[550px] overflow-y-auto space-y-6 text-slate-800 shadow-inner">
                    <div className="space-y-3 pb-4 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-[#0055FE] text-xs font-bold">
                          {ARTICLE_CATEGORIES.find((c) => c.id === formData.category)?.name || 'Chuyên mục'}
                        </span>
                        <span className="text-xs text-slate-400">•</span>
                        <span className="text-xs text-slate-500 font-medium">{formData.readingTime} phút đọc</span>
                      </div>
                      <h1 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
                        {formData.title || 'Tiêu Đề Bài Viết'}
                      </h1>
                      <div className="flex items-center gap-2.5 text-xs text-slate-500">
                        <span className="font-semibold text-slate-700">Tác giả: {formData.authorName}</span>
                        <span>({formData.authorRole})</span>
                      </div>
                    </div>

                    {/* Excerpt Box */}
                    {formData.excerpt && (
                      <div className="p-4 rounded-xl bg-slate-50 border-l-4 border-[#0055FE] text-xs sm:text-sm font-medium text-slate-700 italic">
                        &ldquo;{formData.excerpt}&rdquo;
                      </div>
                    )}

                    {formData.coverImage && (
                      <div className="rounded-2xl overflow-hidden aspect-[16/9] bg-slate-900 shadow-sm">
                        <img src={formData.coverImage} alt="Cover Preview" className="w-full h-full object-cover" />
                      </div>
                    )}

                    {/* Render Content with Secondary Image */}
                    {(() => {
                      const renderSecondaryImagePreview = () => {
                        if (!formData.secondaryImage) return null;
                        return (
                          <figure className="my-6 rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 p-3 space-y-2 shadow-xs">
                            <div className="rounded-xl overflow-hidden aspect-[16/9] bg-slate-900">
                              <img src={formData.secondaryImage} alt="Secondary Preview" className="w-full h-full object-cover" />
                            </div>
                            {formData.secondaryImageCaption && (
                              <figcaption className="text-center text-xs text-slate-600 font-medium italic">
                                📸 {formData.secondaryImageCaption}
                              </figcaption>
                            )}
                          </figure>
                        );
                      };

                      if (!formData.secondaryImage) {
                        return <MarkdownRenderer content={formData.content || 'Chưa có nội dung...'} />;
                      }

                      const rawSections = (formData.content || '').split(/(?=\n##\s+|^##\s+)/m).filter(Boolean);
                      if (rawSections.length >= 2) {
                        const midIndex = Math.max(1, Math.floor(rawSections.length / 2));
                        const firstHalf = rawSections.slice(0, midIndex).join('\n');
                        const secondHalf = rawSections.slice(midIndex).join('\n');
                        return (
                          <div className="space-y-6">
                            <MarkdownRenderer content={firstHalf} />
                            {renderSecondaryImagePreview()}
                            <MarkdownRenderer content={secondHalf} />
                          </div>
                        );
                      }

                      return (
                        <div className="space-y-6">
                          <MarkdownRenderer content={formData.content || 'Chưa có nội dung...'} />
                          {renderSecondaryImagePreview()}
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>

            </div>

            {/* Editor Footer Actions */}
            <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setIsEditorOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs sm:text-sm font-bold hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Đóng
              </button>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleSaveArticle('draft')}
                  className="px-4 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs sm:text-sm font-bold transition-all cursor-pointer"
                >
                  Lưu Bản Nháp
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveArticle('published')}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#0055FE] hover:bg-blue-600 text-white text-xs sm:text-sm font-black shadow-lg shadow-blue-500/25 transition-all cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Xuất Bản Ngay Lên Blog</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
