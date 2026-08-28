export type CategorySlug = 'whey-protein' | 'strength-endurance' | 'vitamins' | 'all';

export interface NutritionalFact {
  label: string;
  value: string;
  badgeColor?: 'lime' | 'amber' | 'blue' | 'emerald';
}

export interface ProductVariant {
  id?: string;
  name: string;
  price?: number;
  originalPrice?: number;
  priceModifier?: number;
  inStock?: boolean;
}

export interface ProductSizeVariant {
  id?: string;
  name: string;
  price?: number;
  originalPrice?: number;
  priceModifier?: number;
  inStock?: boolean;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  category: CategorySlug;
  categoryName: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  image: string;
  images?: string[];
  badge?: string;
  badgeType?: 'top-seller' | 'new' | 'hot' | 'sale';
  macros: NutritionalFact[];
  description: string;
  usageGuide?: string;
  qualityCommitment?: string;
  flavors?: string[];
  sizes?: string[];
  sizeVariants?: ProductSizeVariant[];
  inStock?: boolean;
  goal: 'muscle-growth' | 'health-vitality' | 'recovery' | 'fat-burn';
  isFeatured?: boolean;
}

export interface CartItem {
  product: Product;
  selectedFlavor?: string;
  selectedSize?: string;
  quantity: number;
  price: number;
}

