export type ArticleCategory =
  | 'tang-co'
  | 'giam-mo'
  | 'supplement'
  | 'dinh-duong-chung'
  | 'phuc-hoi';

export type ArticleStatus = 'published' | 'draft' | 'archived';

export interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  secondaryImage?: string;
  secondaryImageCaption?: string;
  category: ArticleCategory;
  categoryName: string;
  authorName: string;
  authorRole: string;
  authorAvatar?: string;
  readingTime: number; // in minutes
  status: ArticleStatus;
  isFeatured: boolean;
  viewCount: number;
  suggestedProductSlugs?: string[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateArticleInput {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  secondaryImage?: string;
  secondaryImageCaption?: string;
  category: ArticleCategory;
  categoryName: string;
  authorName?: string;
  authorRole?: string;
  authorAvatar?: string;
  readingTime?: number;
  status?: ArticleStatus;
  isFeatured?: boolean;
  suggestedProductSlugs?: string[];
  tags?: string[];
}

export interface UpdateArticleInput extends Partial<CreateArticleInput> {
  id: string;
}

export interface ArticleCategoryInfo {
  id: ArticleCategory;
  name: string;
  description: string;
  icon: string;
  color: string;
}

export const ARTICLE_CATEGORIES: ArticleCategoryInfo[] = [
  {
    id: 'tang-co',
    name: 'Tăng Cơ & Thể Hình',
    description: 'Chiến lược dinh dưỡng và nạp Protein tối ưu hóa phát triển cơ bắp',
    icon: 'Dumbbell',
    color: 'blue',
  },
  {
    id: 'giam-mo',
    name: 'Giảm Mỡ & Siết Cơ',
    description: 'Thực đơn thâm hụt calo khoa học, giữ cơ tối đa khi cắt nét',
    icon: 'Flame',
    color: 'amber',
  },
  {
    id: 'supplement',
    name: 'Cẩm Nang Supplement',
    description: 'Cách dùng Whey, Creatine, Pre-workout, EAA chuẩn y khoa',
    icon: 'Zap',
    color: 'emerald',
  },
  {
    id: 'dinh-duong-chung',
    name: 'Kiến Thức Dinh Dưỡng',
    description: 'Tính toán Macro, Calo, vi chất và thói quen ăn uống lành mạnh',
    icon: 'Apple',
    color: 'lime',
  },
  {
    id: 'phuc-hoi',
    name: 'Phục Hồi & Sức Khỏe',
    description: 'Giấc ngủ, chống viêm cơ khớp, bổ sung Omega-3 & Vitamin thiết yếu',
    icon: 'ShieldPlus',
    color: 'indigo',
  },
];

/**
 * Định dạng ngày tháng cố định chống Hydration Mismatch giữa SSR và Client
 */
export function formatArticleDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return dateStr;
  }
}

