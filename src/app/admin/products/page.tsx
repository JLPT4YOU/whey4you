'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { 
  Package, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Star, 
  X,
  Image as ImageIcon,
  Award,
  Layers,
  Tag,
  CheckCircle2,
  AlertCircle,
  Box,
  RotateCcw,
  Sparkles,
  Link as LinkIcon,
  Bot,
  Globe,
  FileText,
  ShieldCheck,
  HelpCircle,
  RefreshCw,
  Wand2,
  Check,
  ArrowRight,
  ArrowLeft,
  Upload
} from 'lucide-react';
import { slugify } from '@/lib/utils/slug';

interface NutritionFact {
  label: string;
  value: string;
  badge_color?: string;
}

export interface FormSizeItem {
  name: string;
  price: string;
  original_price?: string;
  is_in_stock: boolean;
  is_primary?: boolean;
}

interface ProductItem {
  id: string;
  name: string;
  slug: string;
  tagline?: string;
  category_id: string;
  category_name: string;
  price: number;
  original_price?: number;
  image: string;
  images?: string[];
  badge?: string;
  badge_type?: string;
  is_featured: boolean;
  is_in_stock?: boolean;
  goal: string;
  description: string;
  usage_guide?: string;
  quality_commitment?: string;
  flavors?: string[];
  sizes?: FormSizeItem[];
  macros?: NutritionFact[];
  product_variants?: any[];
  product_nutrition?: any[];
}

const DEFAULT_PRESET_FLAVORS = [
  'Chocolate Fudge',
  'Vanilla Ice Cream',
  'Matcha Latte',
  'Strawberry Milkshake',
  'Blue Raspberry',
  'Sour Green Apple',
  'Tropical Mango',
  'Cam Chanh',
  'Không Mùi (Unflavored)',
];

const DEFAULT_PRESET_SIZES = [
  '2.27kg (5 lbs / 75 servings)',
  '4.5kg (10 lbs / 150 servings)',
  '907g (2 lbs / 30 servings)',
  '30 Servings (Lần dùng)',
  '60 Servings (Lần dùng)',
  '100 Servings (Lần dùng)',
  '300g (Hũ bột siêu mịn)',
  '500g (Hũ bột tiết kiệm)',
  '60 Viên (Capsules)',
  '120 Viên (Capsules)',
  '240 Viên (Capsules)',
];

export default function AdminProductsPage() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Unified Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [currentProductId, setCurrentProductId] = useState<string | null>(null);

  // User-manageable Presets (with LocalStorage persistence)
  const [presetSizes, setPresetSizes] = useState<string[]>(DEFAULT_PRESET_SIZES);
  const [presetFlavors, setPresetFlavors] = useState<string[]>(DEFAULT_PRESET_FLAVORS);

  // Load custom presets on mount
  useEffect(() => {
    try {
      const savedSizes = localStorage.getItem('w4u_preset_sizes');
      if (savedSizes) setPresetSizes(JSON.parse(savedSizes));

      const savedFlavors = localStorage.getItem('w4u_preset_flavors');
      if (savedFlavors) setPresetFlavors(JSON.parse(savedFlavors));
    } catch {
      // ignore
    }
  }, []);

  // Form Fields (4 Highlight Metric Cards)
  const [formData, setFormData] = useState<{
    name: string;
    slug: string;
    tagline: string;
    category_id: string;
    goal: string;
    price: string;
    original_price: string;
    badge: string;
    is_featured: boolean;
    is_in_stock: boolean;
    image: string;
    images: string[];
    m1_val: string;
    m1_lbl: string;
    m2_val: string;
    m2_lbl: string;
    m3_val: string;
    m3_lbl: string;
    m4_val: string;
    m4_lbl: string;
    flavors: string[];
    sizes: FormSizeItem[];
    description: string;
    usage_guide: string;
    quality_commitment: string;
  }>({
    name: '',
    slug: '',
    tagline: '',
    category_id: 'whey-protein',
    goal: 'muscle-growth',
    price: '',
    original_price: '',
    badge: 'MỚI',
    is_featured: true,
    is_in_stock: true,
    image: '',
    images: [],
    m1_val: '',
    m1_lbl: '',
    m2_val: '',
    m2_lbl: '',
    m3_val: '',
    m3_lbl: '',
    m4_val: '',
    m4_lbl: '',
    flavors: [],
    sizes: [],
    description: '',
    usage_guide: '',
    quality_commitment: '',
  });

  // Active Content Section Tab inside Product Modal ('info' | 'usage' | 'guarantee')
  const [activeContentTab, setActiveContentTab] = useState<'info' | 'usage' | 'guarantee'>('info');

  // AI Generator Studio Modal State
  const [isAiStudioOpen, setIsAiStudioOpen] = useState(false);
  const [aiProductName, setAiProductName] = useState('');
  const [aiCategoryId, setAiCategoryId] = useState('whey-protein');
  const [aiGoal, setAiGoal] = useState('muscle-growth');
  const [aiEnableWebSearch, setAiEnableWebSearch] = useState(true);
  const [aiSearchQuery, setAiSearchQuery] = useState('');
  const [aiTone, setAiTone] = useState<'expert' | 'marketing' | 'scientific'>('expert');
  const [aiCustomInstructions, setAiCustomInstructions] = useState('');
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [aiStepMessage, setAiStepMessage] = useState('');
  const [aiGeneratedData, setAiGeneratedData] = useState<any>(null);

  // Temp inputs for adding custom chips & images
  const [customFlavorInput, setCustomFlavorInput] = useState('');
  const [customSizeInput, setCustomSizeInput] = useState('');
  const [customSizePriceInput, setCustomSizePriceInput] = useState('');
  const [customSizeOriginalPriceInput, setCustomSizeOriginalPriceInput] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [isBulkImageOpen, setIsBulkImageOpen] = useState(false);
  const [bulkImageUrlText, setBulkImageUrlText] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Fetch all products with variants & nutrition
  const fetchProducts = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          product_variants (id, type, name, price, original_price, price_modifier, is_in_stock, sort_order),
          product_nutrition (id, label, value, badge_color, sort_order)
        `)
        .order('created_at', { ascending: false });

      if (!error && data) {
        const formatted = data.map((p: any) => {
          const variants = p.product_variants || [];
          const flavors = variants
            .filter((v: any) => v.type === 'flavor')
            .map((v: any) => v.name);
          const sizes = variants
            .filter((v: any) => v.type === 'size')
            .sort((a: any, b: any) => a.sort_order - b.sort_order)
            .map((v: any) => {
              // Đọc giá tuyệt đối trực tiếp từ DB, fallback về basePrice + modifier
              const absolutePrice = v.price && Number(v.price) > 0
                ? Number(v.price)
                : Number(p.price) + Number(v.price_modifier || 0);
              const originalPrice = v.original_price && Number(v.original_price) > 0
                ? String(Number(v.original_price))
                : '';
              return {
                name: v.name,
                price: String(absolutePrice),
                original_price: originalPrice,
                is_in_stock: v.is_in_stock !== false,
              };
            });
          const macros = (p.product_nutrition || [])
            .sort((a: any, b: any) => a.sort_order - b.sort_order)
            .map((m: any) => ({ label: m.label, value: m.value, badge_color: m.badge_color }));

          return {
            ...p,
            is_in_stock: (p.is_in_stock !== undefined ? p.is_in_stock !== false : true)
              && (sizes.length === 0 || sizes.some((s: any) => s.is_in_stock)),
            usage_guide: p.usage_guide || p.usageGuide || '',
            quality_commitment: p.quality_commitment || p.qualityCommitment || '',
            flavors,
            sizes,
            macros,
          };
        });
        setProducts(formatted);
      }
    } catch (err) {
      console.error('Lỗi tải sản phẩm:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Helper: Open Modal for Create
  const handleOpenCreateModal = () => {
    setModalMode('create');
    setCurrentProductId(null);
    setSubmitError(null);
    setCustomFlavorInput('');
    setCustomSizeInput('');
    setCustomSizePriceInput('');
    setCustomSizeOriginalPriceInput('');
    setActiveContentTab('info');
    setFormData({
      name: '',
      slug: '',
      tagline: '',
      category_id: 'whey-protein',
      goal: 'muscle-growth',
      price: '',
      original_price: '',
      badge: 'MỚI',
      is_featured: true,
      is_in_stock: true,
      image: '',
      images: [],
      m1_val: '',
      m1_lbl: '',
      m2_val: '',
      m2_lbl: '',
      m3_val: '',
      m3_lbl: '',
      m4_val: '',
      m4_lbl: '',
      flavors: [],
      sizes: [
        { name: '2.27kg (5 lbs / 75 servings)', price: '', original_price: '', is_in_stock: true, is_primary: true }
      ],
      description: '',
      usage_guide: '',
      quality_commitment: '',
    });
    setIsModalOpen(true);
  };

  // Helper: Open Modal for Edit
  const handleOpenEditModal = (product: ProductItem) => {
    setModalMode('edit');
    setCurrentProductId(product.id);
    setSubmitError(null);
    setCustomFlavorInput('');
    setCustomSizeInput('');
    setCustomSizePriceInput('');
    setCustomSizeOriginalPriceInput('');
    setActiveContentTab('info');

    const m = product.macros || [];
    let hasPrimary = false;
    const formattedSizes: FormSizeItem[] = (product.sizes || []).map((sz: any, idx: number) => {
      if (typeof sz === 'object' && sz !== null) {
        const isPrim = (String(sz.price) === String(product.price)) || (!hasPrimary && idx === 0);
        if (isPrim) hasPrimary = true;
        return {
          name: sz.name,
          price: sz.price ? String(sz.price) : '',
          original_price: sz.original_price || sz.originalPrice ? String(sz.original_price || sz.originalPrice) : '',
          is_in_stock: sz.is_in_stock !== false,
          is_primary: isPrim,
        };
      }
      const isPrim = idx === 0;
      if (isPrim) hasPrimary = true;
      return {
        name: String(sz),
        price: '',
        original_price: '',
        is_in_stock: true,
        is_primary: isPrim,
      };
    });

    if (formattedSizes.length > 0 && !formattedSizes.some((s) => s.is_primary)) {
      formattedSizes[0].is_primary = true;
    }

    const productImages: string[] = product.images && product.images.length > 0
      ? product.images
      : (product.image ? [product.image] : []);

    const primarySize = formattedSizes.find((s) => s.is_primary) || formattedSizes[0];

    setFormData({
      name: product.name,
      slug: product.slug,
      tagline: product.tagline || product.name,
      category_id: product.category_id,
      goal: product.goal || 'muscle-growth',
      price: primarySize?.price || (product.price ? String(product.price) : ''),
      original_price: primarySize?.original_price || (product.original_price ? String(product.original_price) : ''),
      badge: product.badge || '',
      is_featured: product.is_featured,
      is_in_stock: product.is_in_stock !== false,
      image: product.image || productImages[0] || '',
      images: productImages,
      m1_val: m[0]?.value || '',
      m1_lbl: m[0]?.label || '',
      m2_val: m[1]?.value || '',
      m2_lbl: m[1]?.label || '',
      m3_val: m[2]?.value || '',
      m3_lbl: m[2]?.label || '',
      m4_val: m[3]?.value || '',
      m4_lbl: m[3]?.label || '',
      flavors: product.flavors && product.flavors.length > 0 ? product.flavors : ['Chocolate Fudge', 'Vanilla'],
      sizes: formattedSizes.length > 0 ? formattedSizes : [{ name: '2.27kg (5 lbs / 75 servings)', price: '', original_price: '', is_in_stock: true, is_primary: true }],
      description: product.description || '',
      usage_guide: product.usage_guide || '',
      quality_commitment: product.quality_commitment || '',
    });
    setIsModalOpen(true);
  };

  // AI Studio Handlers
  const handleOpenAiStudio = (initialName?: string) => {
    setAiProductName(initialName || formData.name || '');
    setAiCategoryId(formData.category_id || 'whey-protein');
    setAiGoal(formData.goal || 'muscle-growth');
    setAiSearchQuery('');
    setAiGeneratedData(null);
    setIsAiStudioOpen(true);
  };

  const handleGenerateProductContent = async () => {
    if (!aiProductName.trim()) {
      alert('Vui lòng nhập tên sản phẩm để AI tra cứu & tạo nội dung');
      return;
    }

    setIsAiGenerating(true);
    setAiStepMessage('Đang kết nối MCP DuckDuckGo tra cứu dữ liệu thực tế từ Internet...');

    try {
      setTimeout(() => {
        setAiStepMessage('Mistral AI đang viết Mô tả, Thành phần, Hướng dẫn sử dụng & Cam kết chất lượng...');
      }, 1200);

      const res = await fetch('/api/ai/generate-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: aiProductName.trim(),
          category_id: aiCategoryId,
          goal: aiGoal,
          enableWebSearch: aiEnableWebSearch,
          searchQuery: aiSearchQuery.trim() || undefined,
          tone: aiTone,
          customInstructions: aiCustomInstructions.trim() || undefined,
        }),
      });

      const json = await res.json();
      if (!json.success || !json.data) {
        throw new Error(json.error || 'Lỗi khi gọi AI');
      }

      setAiGeneratedData(json.data);
    } catch (err: any) {
      alert(err.message || 'Lỗi sinh nội dung AI');
    } finally {
      setIsAiGenerating(false);
    }
  };

  const handleApplyAiDataToForm = () => {
    if (!aiGeneratedData) return;

    setFormData((prev) => {
      const macros = aiGeneratedData.macros || [];
      const newFlavors = aiGeneratedData.flavors && aiGeneratedData.flavors.length > 0
        ? aiGeneratedData.flavors
        : prev.flavors;

      const newSizes = aiGeneratedData.sizes && Array.isArray(aiGeneratedData.sizes) && aiGeneratedData.sizes.length > 0
        ? aiGeneratedData.sizes.map((s: any) => ({
            name: typeof s === 'string' ? s : s.name || '2.27kg (5 lbs)',
            price: typeof s === 'object' && s.price ? String(s.price).replace(/\D/g, '') : '',
            is_in_stock: true,
          }))
        : prev.sizes;

      return {
        ...prev,
        name: prev.name.trim() ? prev.name : aiProductName,
        slug: prev.slug.trim() ? prev.slug : slugify(aiProductName),
        tagline: aiGeneratedData.tagline || prev.tagline,
        category_id: aiCategoryId || prev.category_id,
        goal: aiGoal || prev.goal,
        description: aiGeneratedData.description || prev.description,
        usage_guide: aiGeneratedData.usage_guide || prev.usage_guide,
        quality_commitment: aiGeneratedData.quality_commitment || prev.quality_commitment,
        m1_val: macros[0]?.value || prev.m1_val,
        m1_lbl: macros[0]?.label || prev.m1_lbl,
        m2_val: macros[1]?.value || prev.m2_val,
        m2_lbl: macros[1]?.label || prev.m2_lbl,
        m3_val: macros[2]?.value || prev.m3_val,
        m3_lbl: macros[2]?.label || prev.m3_lbl,
        m4_val: macros[3]?.value || prev.m4_val,
        m4_lbl: macros[3]?.label || prev.m4_lbl,
        flavors: newFlavors,
        sizes: newSizes,
      };
    });

    setIsAiStudioOpen(false);
    if (!isModalOpen) {
      setIsModalOpen(true);
      setModalMode('create');
    }
  };

  // -------------------------------------------------------------
  // Preset Management (Add to active, Remove from active, Delete from Preset Bank)
  // -------------------------------------------------------------

  // Flavor helpers
  const handleAddFlavor = (flavor: string) => {
    const trimmed = flavor.trim();
    if (trimmed && !formData.flavors.includes(trimmed)) {
      setFormData((prev) => ({ ...prev, flavors: [...prev.flavors, trimmed] }));
    }
    setCustomFlavorInput('');
  };

  const handleRemoveFlavor = (flavorToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      flavors: prev.flavors.filter((f) => f !== flavorToRemove),
    }));
  };

  const handleDeletePresetFlavor = (presetToDelete: string) => {
    const updated = presetFlavors.filter((f) => f !== presetToDelete);
    setPresetFlavors(updated);
    try {
      localStorage.setItem('w4u_preset_flavors', JSON.stringify(updated));
    } catch {}
  };

  const handleSaveAsPresetFlavor = (customFlavor: string) => {
    const trimmed = customFlavor.trim();
    if (!trimmed) return;
    if (!presetFlavors.includes(trimmed)) {
      const updated = [...presetFlavors, trimmed];
      setPresetFlavors(updated);
      try {
        localStorage.setItem('w4u_preset_flavors', JSON.stringify(updated));
      } catch {}
    }
    handleAddFlavor(trimmed);
  };

  const handleResetPresetFlavors = () => {
    setPresetFlavors(DEFAULT_PRESET_FLAVORS);
    try {
      localStorage.removeItem('w4u_preset_flavors');
    } catch {}
  };

  // Size helpers with price, original_price & is_primary
  const handleAddSize = (size: string, customPrice = '', customOriginalPrice = '', isPrimary = false) => {
    const trimmed = size.trim();
    if (!trimmed) return;
    setFormData((prev) => {
      if (prev.sizes.some((s) => s.name === trimmed)) {
        return prev;
      }
      const makePrimary = isPrimary || prev.sizes.length === 0;
      const cleanPrice = customPrice.replace(/\D/g, '');
      const cleanOriginalPrice = customOriginalPrice.replace(/\D/g, '');
      const newSizes = prev.sizes.map((s) => (makePrimary ? { ...s, is_primary: false } : s));
      newSizes.push({
        name: trimmed,
        price: cleanPrice,
        original_price: cleanOriginalPrice,
        is_in_stock: true,
        is_primary: makePrimary,
      });
      return {
        ...prev,
        price: makePrimary && cleanPrice ? cleanPrice : prev.price,
        original_price: makePrimary && cleanOriginalPrice ? cleanOriginalPrice : prev.original_price,
        sizes: newSizes,
      };
    });
    setCustomSizeInput('');
    setCustomSizePriceInput('');
    setCustomSizeOriginalPriceInput('');
  };

  const handleSetPrimarySize = (sizeName: string) => {
    setFormData((prev) => {
      const target = prev.sizes.find((s) => s.name === sizeName);
      return {
        ...prev,
        price: target?.price || prev.price,
        original_price: target?.original_price || prev.original_price,
        sizes: prev.sizes.map((s) => ({
          ...s,
          is_primary: s.name === sizeName,
        })),
      };
    });
  };

  const handleRemoveSize = (sizeNameToRemove: string) => {
    setFormData((prev) => {
      const remaining = prev.sizes.filter((s) => s.name !== sizeNameToRemove);
      if (remaining.length > 0 && !remaining.some((s) => s.is_primary)) {
        remaining[0].is_primary = true;
      }
      const prim = remaining.find((s) => s.is_primary) || remaining[0];
      return {
        ...prev,
        price: prim?.price || '',
        original_price: prim?.original_price || '',
        sizes: remaining,
      };
    });
  };

  const handleUpdateSizePrice = (sizeName: string, newPrice: string) => {
    const raw = newPrice.replace(/\D/g, '');
    setFormData((prev) => {
      const isPrim = prev.sizes.find((s) => s.name === sizeName)?.is_primary;
      return {
        ...prev,
        price: isPrim ? raw : prev.price,
        sizes: prev.sizes.map((s) => (s.name === sizeName ? { ...s, price: raw } : s)),
      };
    });
  };

  const handleUpdateSizeOriginalPrice = (sizeName: string, newOriginalPrice: string) => {
    const raw = newOriginalPrice.replace(/\D/g, '');
    setFormData((prev) => {
      const isPrim = prev.sizes.find((s) => s.name === sizeName)?.is_primary;
      return {
        ...prev,
        original_price: isPrim ? raw : prev.original_price,
        sizes: prev.sizes.map((s) => (s.name === sizeName ? { ...s, original_price: raw } : s)),
      };
    });
  };

  const handleToggleSizeStock = (sizeName: string) => {
    setFormData((prev) => ({
      ...prev,
      sizes: prev.sizes.map((s) => (s.name === sizeName ? { ...s, is_in_stock: !s.is_in_stock } : s)),
    }));
  };

  const handleDeletePresetSize = (presetToDelete: string) => {
    const updated = presetSizes.filter((s) => s !== presetToDelete);
    setPresetSizes(updated);
    try {
      localStorage.setItem('w4u_preset_sizes', JSON.stringify(updated));
    } catch {}
  };

  const handleSaveAsPresetSize = (customSize: string, customPrice = '', customOriginalPrice = '') => {
    const trimmed = customSize.trim();
    if (!trimmed) return;
    if (!presetSizes.includes(trimmed)) {
      const updated = [...presetSizes, trimmed];
      setPresetSizes(updated);
      try {
        localStorage.setItem('w4u_preset_sizes', JSON.stringify(updated));
      } catch {}
    }
    handleAddSize(trimmed, customPrice, customOriginalPrice);
  };

  const handleResetPresetSizes = () => {
    setPresetSizes(DEFAULT_PRESET_SIZES);
    try {
      localStorage.removeItem('w4u_preset_sizes');
    } catch {}
  };

  // Convert local file(s) to WebP and add to images gallery
  const handleConvertFileToWebP = (file: File) => {
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
          setFormData((prev) => {
            const nextImages = [...prev.images, webpDataUrl];
            return {
              ...prev,
              image: prev.image || webpDataUrl,
              images: nextImages,
            };
          });
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleConvertMultipleFilesToWebP = (files: FileList | File[]) => {
    Array.from(files).forEach((file) => {
      handleConvertFileToWebP(file);
    });
  };

  const handleAddImageUrl = (url: string) => {
    const clean = url.trim();
    if (!clean) return;
    setFormData((prev) => {
      const nextImages = prev.images.includes(clean) ? prev.images : [...prev.images, clean];
      return {
        ...prev,
        image: prev.image || nextImages[0] || '',
        images: nextImages,
      };
    });
    setNewImageUrl('');
  };

  const handleRemoveImage = (index: number) => {
    setFormData((prev) => {
      const nextImages = prev.images.filter((_, idx) => idx !== index);
      const isRemovingPrimary = prev.image === prev.images[index];
      const nextPrimary = isRemovingPrimary ? (nextImages[0] || '') : prev.image;
      return {
        ...prev,
        image: nextPrimary || nextImages[0] || '',
        images: nextImages,
      };
    });
  };

  const handleSetPrimaryImage = (index: number) => {
    setFormData((prev) => {
      const target = prev.images[index];
      if (!target) return prev;
      const remaining = prev.images.filter((_, idx) => idx !== index);
      return {
        ...prev,
        image: target,
        images: [target, ...remaining],
      };
    });
  };

  const handleMoveImage = (index: number, direction: 'left' | 'right') => {
    setFormData((prev) => {
      const newIdx = direction === 'left' ? index - 1 : index + 1;
      if (newIdx < 0 || newIdx >= prev.images.length) return prev;
      const nextImages = [...prev.images];
      const temp = nextImages[index];
      nextImages[index] = nextImages[newIdx];
      nextImages[newIdx] = temp;
      return {
        ...prev,
        image: nextImages[0] || '',
        images: nextImages,
      };
    });
  };

  const handleApplyBulkImages = () => {
    if (!bulkImageUrlText.trim()) return;
    const urls = bulkImageUrlText
      .split(/[\n,]+/)
      .map((u) => u.trim())
      .filter((u) => u.startsWith('http://') || u.startsWith('https://') || u.startsWith('data:image'));

    if (urls.length > 0) {
      setFormData((prev) => {
        const nextImages = Array.from(new Set([...prev.images, ...urls]));
        return {
          ...prev,
          image: prev.image || nextImages[0] || '',
          images: nextImages,
        };
      });
      setBulkImageUrlText('');
      setIsBulkImageOpen(false);
    }
  };

  // Toggle In-Stock status inline
  const handleToggleInStock = async (product: ProductItem) => {
    const nextVal = product.is_in_stock === false ? true : false;
    try {
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_in_stock: nextVal }),
      });
      const data = await res.json();
      if (data.success) {
        setProducts((prev) =>
          prev.map((p) =>
            p.id === product.id
              ? { ...p, is_in_stock: nextVal }
              : p
          )
        );
      }
    } catch (err) {
      console.error('Lỗi cập nhật trạng thái kho:', err);
    }
  };

  // Toggle Featured status inline
  const handleToggleFeatured = async (product: ProductItem) => {
    const nextVal = !product.is_featured;
    try {
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_featured: nextVal }),
      });
      const data = await res.json();
      if (data.success) {
        setProducts((prev) =>
          prev.map((p) => (p.id === product.id ? { ...p, is_featured: nextVal } : p))
        );
      }
    } catch (err) {
      console.error('Lỗi cập nhật nổi bật:', err);
    }
  };

  // Delete product
  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa vĩnh viễn sản phẩm này?')) return;
    try {
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setProducts((prev) => prev.filter((p) => p.id !== productId));
      }
    } catch (err) {
      console.error('Lỗi xóa sản phẩm:', err);
    }
  };

  // Submit Unified Form
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    const primaryImage = formData.image.trim() || formData.images[0] || '';
    const primarySize = formData.sizes.find((s) => s.is_primary) || formData.sizes[0];

    if (!formData.name.trim() || !primarySize || !primarySize.price || !primaryImage) {
      setSubmitError('Vui lòng điền Tên sản phẩm, thiết lập Giá bán cho Size chính và chọn ít nhất 1 Hình ảnh sản phẩm.');
      return;
    }

    const basePrice = Number(primarySize.price);
    const baseOriginalPrice = primarySize.original_price ? Number(primarySize.original_price) : (formData.original_price ? Number(formData.original_price) : null);

    const finalImages = formData.images.length > 0
      ? formData.images
      : (primaryImage ? [primaryImage] : []);

    setIsSubmitting(true);
    try {
      const macrosArray = [
        { value: formData.m1_val.trim(), label: formData.m1_lbl.trim(), badge_color: 'lime' },
        { value: formData.m2_val.trim(), label: formData.m2_lbl.trim(), badge_color: 'emerald' },
        { value: formData.m3_val.trim(), label: formData.m3_lbl.trim(), badge_color: 'blue' },
        { value: formData.m4_val.trim(), label: formData.m4_lbl.trim(), badge_color: 'amber' },
      ].filter((m) => m.value.length > 0 && m.label.length > 0);

      const cleanSlug = slugify(formData.slug || formData.name);
      const payload = {
        name: formData.name.trim(),
        slug: cleanSlug,
        tagline: formData.tagline.trim() || formData.name.trim(),
        category_id: formData.category_id,
        goal: formData.goal,
        price: basePrice,
        original_price: baseOriginalPrice,
        badge: formData.badge.trim() || null,
        is_featured: formData.is_featured,
        is_in_stock: formData.is_in_stock,
        image: primaryImage,
        images: finalImages,
        description: formData.description.trim() || formData.tagline.trim() || formData.name.trim(),
        usage_guide: formData.usage_guide.trim() || undefined,
        quality_commitment: formData.quality_commitment.trim() || undefined,
        flavors: formData.flavors,
        sizes: formData.sizes.map((s) => ({
          name: s.name,
          price: s.price ? Number(s.price) : basePrice,
          original_price: s.original_price ? Number(s.original_price) : null,
          is_in_stock: s.is_in_stock,
          is_primary: Boolean(s.is_primary),
        })),
        macros: macrosArray,
      };

      let res;
      if (modalMode === 'create') {
        res = await fetch('/api/admin/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch(`/api/admin/products/${currentProductId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();
      if (data.success) {
        setIsModalOpen(false);
        fetchProducts();
      } else {
        setSubmitError(data.error || 'Có lỗi xảy ra khi lưu sản phẩm.');
      }
    } catch (err: any) {
      setSubmitError(err.message || 'Lỗi kết nối máy chủ.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredProducts = products.filter((p) => {
    if (categoryFilter !== 'all' && p.category_id !== categoryFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q) ||
        (p.flavors || []).some((f) => f.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-display tracking-tight">
            Quản Lý Sản Phẩm ({filteredProducts.length})
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Hệ thống quản lý sản phẩm W4U với 3 khối nội dung chi tiết & Studio AI Mistral + MCP tra cứu Internet.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleOpenCreateModal}
            className="btn-w4u-primary px-5 py-3 rounded-2xl font-bold text-xs flex items-center gap-2 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Sản Phẩm Mới</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full sm:w-auto">
          {[
            { id: 'all', label: 'Tất Cả' },
            { id: 'whey-protein', label: 'Whey Protein' },
            { id: 'strength-endurance', label: 'Sức Mạnh & Sức Bền' },
            { id: 'vitamins', label: 'Vitamins & Khoáng' },
          ].map((c) => (
            <button
              key={c.id}
              onClick={() => setCategoryFilter(c.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                categoryFilter === c.id
                  ? 'bg-[#0055FE] text-white shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm tên, slug..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:border-[#0055FE] focus:outline-none"
          />
        </div>
      </div>

      {/* CLEAN & STREAMLINED PRODUCTS TABLE (TINH GỌN, KHÔNG RỐI MẮT) */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-xs text-slate-400">
            Đang tải dữ liệu từ Supabase...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-20 text-center text-xs text-slate-500 space-y-2">
            <Package className="w-8 h-8 text-slate-300 mx-auto" />
            <p>Không có sản phẩm nào phù hợp.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-400 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-6 py-4 font-bold">Sản Phẩm</th>
                  <th className="px-6 py-4 font-bold">Danh Mục</th>
                  <th className="px-6 py-4 font-bold">Giá Bán</th>
                  <th className="px-6 py-4 font-bold text-center">Tình Trạng Kho</th>
                  <th className="px-6 py-4 font-bold text-center">Hero Banner</th>
                  <th className="px-6 py-4 font-bold text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.map((prod) => (
                  <tr key={prod.id} className="hover:bg-slate-50/60 transition-colors">
                    {/* Product Item */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3.5">
                        <img
                          src={prod.image}
                          alt={prod.name}
                          onClick={() => handleOpenEditModal(prod)}
                          className="w-12 h-12 object-contain bg-slate-50 rounded-2xl p-1 border border-slate-200 cursor-pointer hover:border-[#0055FE] transition-colors shrink-0"
                          title="Bấm để chỉnh sửa"
                        />
                        <div className="min-w-0 max-w-sm">
                          <p 
                            onClick={() => handleOpenEditModal(prod)}
                            className="font-bold text-slate-900 truncate text-xs cursor-pointer hover:text-[#0055FE] transition-colors"
                          >
                            {prod.name}
                          </p>
                          <p className="text-[10px] text-slate-400 truncate mt-0.5">{prod.tagline || prod.slug}</p>
                          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                            {prod.badge && (
                              <span className="px-2 py-0.5 bg-blue-50 text-[#0055FE] rounded-md text-[9px] font-black uppercase">
                                {prod.badge}
                              </span>
                            )}
                            {prod.is_in_stock === false && (
                              <span className="px-2 py-0.5 bg-rose-100 text-rose-700 rounded-md text-[9px] font-bold">
                                Hết hàng
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-6 py-4 font-medium text-slate-700">
                      <span className="px-2.5 py-1 bg-slate-100 rounded-lg text-[11px] font-bold text-slate-700">
                        {prod.category_name}
                      </span>
                    </td>

                    {/* Price */}
                    <td className="px-6 py-4">
                      <p className="font-black text-[#0055FE] text-sm font-display">
                        {Number(prod.price).toLocaleString('vi-VN')}₫
                      </p>
                      {prod.original_price && (
                        <p className="text-[10px] text-slate-400 line-through">
                          {Number(prod.original_price).toLocaleString('vi-VN')}₫
                        </p>
                      )}
                      {prod.sizes && prod.sizes.length > 1 && (
                        <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">
                          {prod.sizes.length} quy cách / size
                        </span>
                      )}
                    </td>

                    {/* Stock status toggle button */}
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleToggleInStock(prod)}
                        className={`px-3 py-1.5 rounded-full text-[11px] font-bold inline-flex items-center gap-1.5 transition-all cursor-pointer ${
                          prod.is_in_stock !== false
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 shadow-2xs hover:bg-emerald-100'
                            : 'bg-rose-50 text-rose-700 border border-rose-300 shadow-2xs hover:bg-rose-100'
                        }`}
                        title="Bấm để bật/tắt Còn Hàng / Tạm Hết Hàng"
                      >
                        <CheckCircle2 className={`w-3.5 h-3.5 ${prod.is_in_stock !== false ? 'text-emerald-600' : 'text-rose-500'}`} />
                        <span>{prod.is_in_stock !== false ? 'Còn Hàng' : 'Tạm Hết Hàng'}</span>
                      </button>
                    </td>

                    {/* Featured toggle */}
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleToggleFeatured(prod)}
                        className={`px-3 py-1.5 rounded-full text-[11px] font-bold inline-flex items-center gap-1.5 transition-all ${
                          prod.is_featured
                            ? 'bg-amber-50 text-amber-700 border border-amber-300 shadow-2xs'
                            : 'bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600'
                        }`}
                      >
                        <Star className={`w-3.5 h-3.5 ${prod.is_featured ? 'fill-amber-500 text-amber-500' : ''}`} />
                        <span>{prod.is_featured ? '🌟 Ở Hero' : 'Ẩn'}</span>
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEditModal(prod)}
                          className="px-3 py-1.5 text-[#0055FE] bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors font-bold text-xs flex items-center gap-1"
                          title="Sửa toàn diện sản phẩm"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Chỉnh sửa</span>
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(prod.id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                          title="Xóa sản phẩm"
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
      {/* UNIFIED PRODUCT MODAL (4 HIGHLIGHT CARDS & USER-MANAGEABLE PRESETS)       */}
      {/* ========================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold text-[#0055FE] uppercase tracking-wider bg-blue-50 px-2.5 py-1 rounded-md">
                  {modalMode === 'create' ? 'Tạo mới sản phẩm' : 'Chỉnh sửa sản phẩm'}
                </span>
                <h3 className="text-xl font-black text-slate-900 font-display mt-1.5">
                  {modalMode === 'create' ? 'Thêm Sản Phẩm Mới Tiêu Chuẩn' : `Sửa: ${formData.name}`}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleOpenAiStudio(formData.name)}
                  className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                  title="Dùng Mistral AI + MCP Internet để viết nhanh thông tin sản phẩm"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                  <span>AI Viết Tự Động</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-900 rounded-full hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {submitError && (
              <div className="p-3 bg-red-50 text-red-700 text-xs font-bold rounded-2xl flex items-center gap-2 border border-red-200">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{submitError}</span>
              </div>
            )}

            <form onSubmit={handleSubmitForm} className="space-y-6 text-xs">
              
              {/* SECTION 1: THÔNG TIN CƠ BẢN */}
              <div className="bg-slate-50/70 p-4 sm:p-5 rounded-2xl border border-slate-200/80 space-y-4">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-xs pb-2 border-b border-slate-200/60">
                  <Tag className="w-4 h-4 text-[#0055FE]" />
                  <span>1. Thông Tin Cơ Bản Sản Phẩm</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Tên sản phẩm *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ví dụ: Whey Isolate Hydrolyzed 100%..."
                      value={formData.name}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData((prev) => {
                          const autoSlug = !prev.slug || prev.slug === slugify(prev.name);
                          return {
                            ...prev,
                            name: val,
                            slug: autoSlug ? slugify(val) : prev.slug,
                          };
                        });
                      }}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl focus:border-[#0055FE] focus:outline-none font-semibold text-slate-900"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block font-bold text-slate-700">Đường dẫn Slug (URL) *</label>
                      <button
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, slug: slugify(prev.name) }))}
                        className="text-[11px] font-bold text-[#0055FE] hover:underline flex items-center gap-1 cursor-pointer"
                        title="Tái tạo slug chuẩn SEO từ tên sản phẩm"
                      >
                        <RotateCcw className="w-3 h-3" />
                        Tạo lại từ tên
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        placeholder="whey-isolate-hydrolyzed"
                        value={formData.slug}
                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                        onBlur={(e) => setFormData({ ...formData, slug: slugify(e.target.value) })}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl focus:border-[#0055FE] focus:outline-none font-mono text-xs text-slate-800"
                      />
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono mt-1 truncate">
                      <LinkIcon className="w-3 h-3 shrink-0 text-slate-400" />
                      <span className="truncate">Preview: <span className="text-[#0055FE] font-medium">/product/{formData.slug || 'slug-san-pham'}</span></span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Danh mục *</label>
                    <select
                      value={formData.category_id}
                      onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl focus:border-[#0055FE] focus:outline-none font-bold"
                    >
                      <option value="whey-protein">Whey Protein</option>
                      <option value="strength-endurance">Sức Mạnh & Sức Bền</option>
                      <option value="vitamins">Vitamins & Khoáng Chất</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Mục tiêu thể hình</label>
                    <select
                      value={formData.goal}
                      onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl focus:border-[#0055FE] focus:outline-none"
                    >
                      <option value="muscle-growth">Tăng Cơ Nạc (Muscle Growth)</option>
                      <option value="fat-burn">Giảm Mỡ & Cắt Nét (Fat Burn)</option>
                      <option value="recovery">Phục Hồi Cơ Bắp (Recovery)</option>
                      <option value="health-vitality">Sức Khỏe & Năng Lượng (Health & Vitality)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Huy hiệu (Badge)</label>
                    <input
                      type="text"
                      placeholder="TOP SELLER / MỚI / GIẢM SÂU"
                      value={formData.badge}
                      onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl focus:border-[#0055FE] focus:outline-none font-bold text-[#0055FE]"
                    />
                  </div>
                </div>

                {/* Hero Feature Toggle & Stock Status */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-200/60">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="modal-hero-check"
                      checked={formData.is_featured}
                      onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                      className="w-4 h-4 text-[#0055FE] rounded border-slate-300 focus:ring-[#0055FE]"
                    />
                    <label htmlFor="modal-hero-check" className="text-xs font-bold text-slate-800 cursor-pointer">
                      🌟 Hiển thị slide Hero Banner đầu trang chủ
                    </label>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-700">Kho hàng:</span>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, is_in_stock: !formData.is_in_stock })}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        formData.is_in_stock
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-rose-100 text-rose-800 border border-rose-300'
                      }`}
                    >
                      <CheckCircle2 className={`w-3.5 h-3.5 ${formData.is_in_stock ? 'text-emerald-600' : 'text-rose-600'}`} />
                      <span>{formData.is_in_stock ? 'Còn Hàng' : 'Tạm Hết Hàng'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* SECTION 2: BỘ SƯU TẬP HÌNH ẢNH SẢN PHẨM (MULTI-IMAGE GALLERY) */}
              <div className="bg-slate-50/70 p-4 sm:p-5 rounded-2xl border border-slate-200/80 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200/60 gap-2">
                  <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
                    <ImageIcon className="w-4 h-4 text-[#0055FE]" />
                    <span>2. Bộ Sưu Tập Hình Ảnh Sản Phẩm ({formData.images.length} hình)</span>
                    <span className="px-2 py-0.5 rounded-full bg-blue-100 text-[#0055FE] text-[10px] font-black">
                      Ảnh đầu tiên là ảnh bìa
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">
                      Không giới hạn số lượng
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsBulkImageOpen(!isBulkImageOpen)}
                      className="text-[11px] font-bold text-[#0055FE] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <LinkIcon className="w-3 h-3" />
                      <span>{isBulkImageOpen ? 'Đóng dán hàng loạt' : 'Dán nhiều link'}</span>
                    </button>
                    {formData.images.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, image: '', images: [] })}
                        className="text-[11px] font-bold text-rose-500 hover:text-rose-700 flex items-center gap-1 cursor-pointer ml-2"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Xóa tất cả</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Bulk URL input panel (Collapsible) */}
                {isBulkImageOpen && (
                  <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-200 space-y-2">
                    <label className="block text-[11px] font-bold text-slate-700">
                      Dán danh sách URL hình ảnh (Mỗi link 1 dòng hoặc cách nhau bằng dấu phẩy):
                    </label>
                    <textarea
                      rows={3}
                      placeholder="https://example.com/image1.webp&#10;https://example.com/image2.webp"
                      value={bulkImageUrlText}
                      onChange={(e) => setBulkImageUrlText(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-blue-200 rounded-lg text-xs font-mono text-slate-800 focus:outline-none focus:border-[#0055FE]"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setBulkImageUrlText('');
                          setIsBulkImageOpen(false);
                        }}
                        className="px-3 py-1 bg-slate-200 text-slate-700 text-xs font-bold rounded-lg cursor-pointer hover:bg-slate-300"
                      >
                        Hủy
                      </button>
                      <button
                        type="button"
                        onClick={handleApplyBulkImages}
                        className="px-3 py-1 bg-[#0055FE] text-white text-xs font-bold rounded-lg cursor-pointer hover:bg-blue-700"
                      >
                        Thêm vào danh sách
                      </button>
                    </div>
                  </div>
                )}

                {/* Input Add Image: by URL or File Upload */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                  <div className="md:col-span-8 space-y-1">
                    <label className="block font-bold text-slate-700 text-xs">
                      Thêm link ảnh đơn lẻ (URL):
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        placeholder="https://images.unsplash.com/photo-..."
                        value={newImageUrl}
                        onChange={(e) => setNewImageUrl(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddImageUrl(newImageUrl);
                          }
                        }}
                        className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:border-[#0055FE] focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleAddImageUrl(newImageUrl)}
                        className="px-3.5 py-2 bg-[#0055FE] text-white text-xs font-bold rounded-xl hover:bg-blue-700 flex items-center gap-1 shrink-0 cursor-pointer shadow-xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Thêm</span>
                      </button>
                    </div>
                  </div>

                  <div className="md:col-span-4 space-y-1">
                    <label className="block font-bold text-slate-700 text-xs">
                      Tải nhiều ảnh từ máy (Tự nén WebP):
                    </label>
                    <label className="flex items-center justify-center gap-2 px-3 py-2 bg-white border border-dashed border-[#0055FE]/40 hover:border-[#0055FE] rounded-xl text-xs font-bold text-[#0055FE] cursor-pointer hover:bg-blue-50/50 transition-colors shadow-2xs">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Chọn file ảnh</span>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files && e.target.files.length > 0) {
                            handleConvertMultipleFilesToWebP(e.target.files);
                            e.target.value = '';
                          }
                        }}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {/* Live Multi-Image Gallery Grid */}
                {formData.images.length > 0 ? (
                  <div className="space-y-2 pt-2">
                    <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      Danh sách ảnh ({formData.images.length}):
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                      {formData.images.map((imgUrl, idx) => {
                        const isPrimary = idx === 0;
                        return (
                          <div
                            key={idx}
                            className={`group relative bg-white rounded-2xl p-2 border-2 transition-all shadow-2xs flex flex-col justify-between ${
                              isPrimary
                                ? 'border-[#0055FE] ring-2 ring-blue-500/20'
                                : 'border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            {/* Image Thumbnail */}
                            <div className="relative aspect-square w-full rounded-xl bg-slate-100 overflow-hidden mb-2 flex items-center justify-center">
                              <img
                                src={imgUrl}
                                alt={`Ảnh ${idx + 1}`}
                                className="w-full h-full object-contain"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src =
                                    'https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?auto=format&fit=crop&w=400&q=80';
                                }}
                              />

                              {/* Primary Badge */}
                              {isPrimary ? (
                                <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-md bg-[#0055FE] text-white text-[9px] font-black uppercase shadow-xs">
                                  ★ Ảnh Bìa
                                </span>
                              ) : (
                                <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-slate-900/60 text-white text-[9px] font-bold">
                                  #{idx + 1}
                                </span>
                              )}

                              {/* Delete button */}
                              <button
                                type="button"
                                onClick={() => handleRemoveImage(idx)}
                                className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-rose-500 text-white flex items-center justify-center opacity-80 hover:opacity-100 hover:scale-110 transition-all shadow-xs cursor-pointer"
                                title="Xóa ảnh này"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {/* Card Actions */}
                            <div className="flex items-center justify-between gap-1 pt-1 border-t border-slate-100 text-[10px]">
                              {!isPrimary ? (
                                <button
                                  type="button"
                                  onClick={() => handleSetPrimaryImage(idx)}
                                  className="text-[10px] font-bold text-[#0055FE] hover:underline flex items-center gap-0.5 cursor-pointer"
                                  title="Đặt làm ảnh bìa chính"
                                >
                                  <Star className="w-3 h-3" />
                                  <span>Đặt làm bìa</span>
                                </button>
                              ) : (
                                <span className="text-[10px] font-bold text-slate-400 italic">Ảnh chính</span>
                              )}

                              <div className="flex items-center gap-0.5">
                                {idx > 0 && (
                                  <button
                                    type="button"
                                    onClick={() => handleMoveImage(idx, 'left')}
                                    className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer"
                                    title="Di chuyển sang trái"
                                  >
                                    <ArrowLeft className="w-2.5 h-2.5" />
                                  </button>
                                )}
                                {idx < formData.images.length - 1 && (
                                  <button
                                    type="button"
                                    onClick={() => handleMoveImage(idx, 'right')}
                                    className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer"
                                    title="Di chuyển sang phải"
                                  >
                                    <ArrowRight className="w-2.5 h-2.5" />
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="p-6 bg-white rounded-2xl border border-dashed border-slate-200 flex flex-col items-center justify-center text-center space-y-1.5">
                    <ImageIcon className="w-8 h-8 text-slate-300" />
                    <p className="text-xs font-bold text-slate-600">Chưa có hình ảnh nào</p>
                    <p className="text-[11px] text-slate-400">
                      Hãy dán link ảnh trực tiếp ở trên hoặc tải file từ máy tính để tạo gallery đa hình ảnh.
                    </p>
                  </div>
                )}
              </div>

              {/* SECTION 3: 4 THÔNG SỐ NỔI BẬT DƯỚI ẢNH (HERO BANNER SPECS - 4 CARDS) */}
              <div className="bg-blue-50/60 p-4 sm:p-5 rounded-2xl border border-blue-100 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-blue-200/60">
                  <div className="flex items-center gap-2 text-[#0055FE] font-bold text-xs">
                    <Award className="w-4 h-4" />
                    <span>3. 4 Thông Số Nổi Bật Dưới Ảnh (Hiển thị Hero Banner & Card)</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium">4 khối (Số liệu to / Tên nhãn)</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {/* Metric 1 */}
                  <div className="bg-white p-2.5 rounded-xl border border-blue-200/80 space-y-1.5">
                    <span className="text-[9px] font-bold text-slate-400 uppercase block text-center">Khối 1</span>
                    <input
                      type="text"
                      value={formData.m1_val}
                      onChange={(e) => setFormData({ ...formData, m1_val: e.target.value })}
                      placeholder="27g / 100%"
                      className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded text-xs font-black text-slate-900 text-center font-display outline-none"
                    />
                    <input
                      type="text"
                      value={formData.m1_lbl}
                      onChange={(e) => setFormData({ ...formData, m1_lbl: e.target.value })}
                      placeholder="PROTEIN"
                      className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded text-[9px] font-bold text-slate-600 text-center uppercase outline-none"
                    />
                  </div>

                  {/* Metric 2 */}
                  <div className="bg-white p-2.5 rounded-xl border border-blue-200/80 space-y-1.5">
                    <span className="text-[9px] font-bold text-slate-400 uppercase block text-center">Khối 2</span>
                    <input
                      type="text"
                      value={formData.m2_val}
                      onChange={(e) => setFormData({ ...formData, m2_val: e.target.value })}
                      placeholder="6.5g / Lab Tested"
                      className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded text-xs font-black text-[#0055FE] text-center font-display outline-none"
                    />
                    <input
                      type="text"
                      value={formData.m2_lbl}
                      onChange={(e) => setFormData({ ...formData, m2_lbl: e.target.value })}
                      placeholder="BCAA / TIÊU CHUẨN"
                      className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded text-[9px] font-bold text-slate-600 text-center uppercase outline-none"
                    />
                  </div>

                  {/* Metric 3 */}
                  <div className="bg-white p-2.5 rounded-xl border border-blue-200/80 space-y-1.5">
                    <span className="text-[9px] font-bold text-slate-400 uppercase block text-center">Khối 3</span>
                    <input
                      type="text"
                      value={formData.m3_val}
                      onChange={(e) => setFormData({ ...formData, m3_val: e.target.value })}
                      placeholder="120 / 0g"
                      className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded text-xs font-black text-slate-900 text-center font-display outline-none"
                    />
                    <input
                      type="text"
                      value={formData.m3_lbl}
                      onChange={(e) => setFormData({ ...formData, m3_lbl: e.target.value })}
                      placeholder="CALORIES / TẠP CHẤT"
                      className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded text-[9px] font-bold text-slate-600 text-center uppercase outline-none"
                    />
                  </div>

                  {/* Metric 4 */}
                  <div className="bg-white p-2.5 rounded-xl border border-blue-200/80 space-y-1.5">
                    <span className="text-[9px] font-bold text-slate-400 uppercase block text-center">Khối 4</span>
                    <input
                      type="text"
                      value={formData.m4_val}
                      onChange={(e) => setFormData({ ...formData, m4_val: e.target.value })}
                      placeholder="0g / 100%"
                      className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded text-xs font-black text-[#0055FE] text-center font-display outline-none"
                    />
                    <input
                      type="text"
                      value={formData.m4_lbl}
                      onChange={(e) => setFormData({ ...formData, m4_lbl: e.target.value })}
                      placeholder="SUGAR / CHÍNH HÃNG"
                      className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded text-[9px] font-bold text-slate-600 text-center uppercase outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 4: QUY CÁCH ĐÓNG GÓI & HƯƠNG VỊ */}
              <div className="bg-slate-50/70 p-4 sm:p-5 rounded-2xl border border-slate-200/80 space-y-5">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-xs pb-2 border-b border-slate-200/60">
                  <Layers className="w-4 h-4 text-[#0055FE]" />
                  <span>4. Quy Cách Đóng Gói (Sizes) & Hương Vị (Flavors)</span>
                </div>

                {/* 4.1 QUY CÁCH ĐÓNG GÓI & GIÁ BÁN (SIZES & PRICING) */}
                <div className="space-y-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="block font-bold text-slate-800 text-xs flex items-center gap-1.5">
                        <Box className="w-4 h-4 text-[#0055FE]" />
                        <span>📦 Quy Cách Đóng Gói (Sizes) & Bảng Giá Chi Tiết ({formData.sizes.length} kích cỡ)</span>
                      </label>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Thiết lập giá bán và giá gốc riêng cho từng kích cỡ. Size được đánh dấu ⭐ <strong className="text-[#0055FE]">Size Chính</strong> sẽ là mức giá đại diện hiển thị ngoài trang chủ, trang danh mục và bộ lọc.
                      </p>
                    </div>
                  </div>

                  {/* 4.1.1 KHỐI SIZE CHÍNH / GIÁ NỔI BẬT ĐẠI DIỆN */}
                  {(() => {
                    const primarySize = formData.sizes.find((s) => s.is_primary) || formData.sizes[0];
                    if (!primarySize) return null;
                    return (
                      <div className="p-4 bg-gradient-to-br from-blue-50/90 via-indigo-50/40 to-amber-50/40 border-2 border-[#0055FE]/80 rounded-2xl space-y-3 shadow-xs">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-blue-200/80">
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-1 bg-[#0055FE] text-white rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                              <Star className="w-3 h-3 fill-amber-300 text-amber-300" />
                              <span>SIZE CHÍNH (GIÁ NỔI BẬT ĐẠI DIỆN)</span>
                            </span>
                            <span className="font-black text-xs text-slate-900 truncate">
                              {primarySize.name}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            {/* Toggle stock button for primary size */}
                            <button
                              type="button"
                              onClick={() => handleToggleSizeStock(primarySize.name)}
                              className={`px-3 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 border ${
                                primarySize.is_in_stock
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                                  : 'bg-rose-50 text-rose-700 border-rose-300'
                              }`}
                              title="Bật / Tắt trạng thái còn hàng của size chính"
                            >
                              <span>{primarySize.is_in_stock ? '✓ Còn hàng' : '✕ Hết hàng'}</span>
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {/* Primary Size Price */}
                          <div className="bg-white p-3 rounded-xl border border-blue-200/80 shadow-2xs">
                            <div className="flex items-center justify-between mb-1">
                              <label className="font-bold text-slate-800 text-[11px]">
                                Giá bán size chính (VNĐ) *
                              </label>
                              {primarySize.price && (
                                <span className="text-[11px] font-black text-[#0055FE]">
                                  {Number(primarySize.price).toLocaleString('vi-VN')}₫
                                </span>
                              )}
                            </div>
                            <input
                              type="text"
                              required
                              placeholder="Ví dụ: 1.850.000"
                              value={primarySize.price ? Number(primarySize.price.replace(/\D/g, '')).toLocaleString('vi-VN') : ''}
                              onChange={(e) => handleUpdateSizePrice(primarySize.name, e.target.value)}
                              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-black text-[#0055FE] focus:bg-white focus:border-[#0055FE] focus:outline-none"
                            />
                          </div>

                          {/* Primary Size Original Price */}
                          <div className="bg-white p-3 rounded-xl border border-blue-200/80 shadow-2xs">
                            <div className="flex items-center justify-between mb-1">
                              <label className="font-bold text-slate-700 text-[11px]">
                                Giá gốc gạch ngang size chính (Tuỳ chọn)
                              </label>
                              {primarySize.original_price && (
                                <span className="text-[11px] font-bold text-slate-400">
                                  {Number(primarySize.original_price).toLocaleString('vi-VN')}₫
                                </span>
                              )}
                            </div>
                            <input
                              type="text"
                              placeholder="Ví dụ: 2.150.000"
                              value={primarySize.original_price ? Number(primarySize.original_price.replace(/\D/g, '')).toLocaleString('vi-VN') : ''}
                              onChange={(e) => handleUpdateSizeOriginalPrice(primarySize.name, e.target.value)}
                              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-500 focus:bg-white focus:border-[#0055FE] focus:outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* 4.1.2 DANH SÁCH CÁC SIZE KHÁC (BIẾN THỂ PHỤ) */}
                  {(() => {
                    const primarySize = formData.sizes.find((s) => s.is_primary) || formData.sizes[0];
                    const otherSizes = formData.sizes.filter((s) => s !== primarySize);

                    if (otherSizes.length === 0) {
                      return null;
                    }

                    return (
                      <div className="space-y-2 pt-1">
                        <label className="block font-bold text-slate-700 text-xs">
                          📦 Những Size Khác ({otherSizes.length} quy cách bổ sung):
                        </label>
                        <div className="space-y-2.5">
                          {otherSizes.map((sz, idx) => (
                            <div
                              key={idx}
                              className="p-3 bg-slate-50/80 border border-slate-200 rounded-2xl space-y-2 hover:border-slate-300 transition-colors"
                            >
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <div className="flex items-center gap-2 min-w-0">
                                  <Box className="w-4 h-4 text-slate-500 shrink-0" />
                                  <span className="font-bold text-xs text-slate-800 truncate">
                                    {sz.name}
                                  </span>
                                </div>

                                <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
                                  {/* Set as Primary Size button */}
                                  <button
                                    type="button"
                                    onClick={() => handleSetPrimarySize(sz.name)}
                                    className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg text-[10px] font-bold transition-colors cursor-pointer flex items-center gap-1"
                                    title="Đặt kích cỡ này làm Size Chính hiển thị trên Trang Chủ & Danh Mục"
                                  >
                                    <Star className="w-3 h-3 text-amber-600" />
                                    <span>Đặt làm size chính</span>
                                  </button>

                                  {/* Toggle in-stock */}
                                  <button
                                    type="button"
                                    onClick={() => handleToggleSizeStock(sz.name)}
                                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 border ${
                                      sz.is_in_stock
                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                        : 'bg-rose-50 text-rose-700 border-rose-200'
                                    }`}
                                    title="Bấm để chuyển trạng thái kho của kích cỡ này"
                                  >
                                    <span>{sz.is_in_stock ? '✓ Còn hàng' : '✕ Hết hàng'}</span>
                                  </button>

                                  {/* Remove size */}
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveSize(sz.name)}
                                    className="text-slate-400 hover:text-red-600 hover:bg-red-50 p-1 rounded-lg transition-colors cursor-pointer"
                                    title="Xóa kích cỡ này"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-slate-200/60">
                                {/* Price */}
                                <div className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-xl border border-slate-200">
                                  <span className="text-[10px] font-bold text-slate-500 whitespace-nowrap">Giá bán:</span>
                                  <input
                                    type="text"
                                    placeholder="Giá riêng"
                                    value={sz.price ? Number(sz.price.replace(/\D/g, '')).toLocaleString('vi-VN') : ''}
                                    onChange={(e) => handleUpdateSizePrice(sz.name, e.target.value)}
                                    className="w-full text-xs font-black text-[#0055FE] bg-transparent outline-none text-right"
                                  />
                                  <span className="text-[10px] font-bold text-slate-500">₫</span>
                                </div>

                                {/* Original Price */}
                                <div className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-xl border border-slate-200">
                                  <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap">Giá gốc:</span>
                                  <input
                                    type="text"
                                    placeholder="Gạch ngang"
                                    value={sz.original_price ? Number(sz.original_price.replace(/\D/g, '')).toLocaleString('vi-VN') : ''}
                                    onChange={(e) => handleUpdateSizeOriginalPrice(sz.name, e.target.value)}
                                    className="w-full text-xs font-bold text-slate-400 bg-transparent outline-none text-right"
                                  />
                                  <span className="text-[10px] font-bold text-slate-400">₫</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}

                  {/* 4.1.3 THÊM QUY CÁCH / SIZE MỚI */}
                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                    <label className="block font-bold text-slate-700 text-xs">
                      ➕ Thêm Kích Cỡ / Quy Cách Mới:
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                      <div className="sm:col-span-5">
                        <input
                          type="text"
                          placeholder="Tên quy cách (VD: 4.54kg / 10 lbs)..."
                          value={customSizeInput}
                          onChange={(e) => setCustomSizeInput(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:border-[#0055FE] focus:outline-none"
                        />
                      </div>
                      <div className="sm:col-span-3">
                        <div className="flex items-center gap-1 bg-white px-3 py-2 rounded-xl border border-slate-200">
                          <input
                            type="text"
                            placeholder="Giá bán *"
                            value={customSizePriceInput ? Number(customSizePriceInput.replace(/\D/g, '')).toLocaleString('vi-VN') : ''}
                            onChange={(e) => setCustomSizePriceInput(e.target.value.replace(/\D/g, ''))}
                            className="w-full text-xs font-bold text-slate-800 bg-transparent outline-none text-right"
                          />
                          <span className="text-[10px] text-slate-400">₫</span>
                        </div>
                      </div>
                      <div className="sm:col-span-2">
                        <div className="flex items-center gap-1 bg-white px-3 py-2 rounded-xl border border-slate-200">
                          <input
                            type="text"
                            placeholder="Giá gốc"
                            value={customSizeOriginalPriceInput ? Number(customSizeOriginalPriceInput.replace(/\D/g, '')).toLocaleString('vi-VN') : ''}
                            onChange={(e) => setCustomSizeOriginalPriceInput(e.target.value.replace(/\D/g, ''))}
                            className="w-full text-xs font-bold text-slate-500 bg-transparent outline-none text-right"
                          />
                          <span className="text-[10px] text-slate-400">₫</span>
                        </div>
                      </div>
                      <div className="sm:col-span-2">
                        <button
                          type="button"
                          onClick={() => handleSaveAsPresetSize(customSizeInput, customSizePriceInput, customSizeOriginalPriceInput)}
                          className="w-full py-2 bg-[#0055FE] text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors cursor-pointer text-center whitespace-nowrap"
                        >
                          + Thêm Size
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* 4.1.4 MẪU QUY CÁCH PHỔ BIẾN (PRESETS) */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">
                        Mẫu quy cách phổ biến (Bấm để thêm nhanh):
                      </span>
                      <button
                        type="button"
                        onClick={handleResetPresetSizes}
                        className="text-[10px] text-slate-400 hover:text-[#0055FE] flex items-center gap-1 font-semibold transition-colors cursor-pointer"
                        title="Khôi phục danh sách mẫu gốc"
                      >
                        <RotateCcw className="w-2.5 h-2.5" />
                        <span>Mặc định</span>
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {presetSizes.map((preset, idx) => {
                        const isSelected = formData.sizes.some((s) => s.name === preset);
                        return (
                          <div
                            key={idx}
                            className={`inline-flex items-center rounded-lg border overflow-hidden transition-all ${
                              isSelected
                                ? 'bg-amber-100 text-amber-900 border-amber-300 shadow-2xs font-bold'
                                : 'bg-slate-50 hover:bg-blue-50 text-slate-600 border-slate-200'
                            }`}
                          >
                            <button
                              type="button"
                              onClick={() => (isSelected ? handleRemoveSize(preset) : handleAddSize(preset))}
                              className="px-2.5 py-1 text-[10px] font-semibold hover:text-[#0055FE] flex items-center gap-1 cursor-pointer"
                            >
                              <span>{isSelected ? '✓' : '+'}</span>
                              <span>{preset}</span>
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeletePresetSize(preset);
                              }}
                              className="px-1.5 py-1 text-slate-300 hover:text-red-600 hover:bg-red-50 transition-colors border-l border-slate-200 cursor-pointer"
                              title={`Xóa mẫu "${preset}" khỏi danh sách gợi ý`}
                            >
                              <X className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* 4.2 HƯƠNG VỊ (FLAVORS) */}
                <div className="space-y-2.5 bg-white p-4 rounded-2xl border border-slate-200">
                  <div className="flex items-center justify-between">
                    <label className="block font-bold text-slate-800 text-xs">
                      🍦 Danh Sách Hương Vị ({formData.flavors.length} vị đã chọn cho sản phẩm):
                    </label>
                    <span className="text-[10px] text-slate-400">Bấm ✕ để bỏ chọn</span>
                  </div>

                  {/* Active Selected Flavor Badges */}
                  <div className="flex flex-wrap gap-1.5 min-h-[34px] p-2 bg-slate-50 rounded-xl border border-slate-100">
                    {formData.flavors.length > 0 ? (
                      formData.flavors.map((flv, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-[#0055FE] border border-blue-200 rounded-lg text-xs font-bold shadow-2xs group"
                        >
                          <span>{flv}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveFlavor(flv)}
                            className="text-blue-400 hover:text-red-600 hover:bg-blue-100 p-0.5 rounded transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))
                    ) : (
                      <span className="text-[11px] text-slate-400 italic py-1">Chưa chọn mùi vị nào.</span>
                    )}
                  </div>

                  {/* Custom Flavor Input */}
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="text"
                      placeholder="Nhập mùi vị mới rồi bấm Thêm..."
                      value={customFlavorInput}
                      onChange={(e) => setCustomFlavorInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleSaveAsPresetFlavor(customFlavorInput);
                        }
                      }}
                      className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-[#0055FE] focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleSaveAsPresetFlavor(customFlavorInput)}
                      className="px-4 py-1.5 bg-[#0055FE] text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors shrink-0"
                    >
                      + Thêm Vị
                    </button>
                  </div>

                  {/* Preset Flavor Buttons (WITH DELETE OPTION FOR EACH PRESET) */}
                  <div className="space-y-1 pt-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">
                        Mẫu hương vị phổ biến (Bấm để chọn, bấm ✕ đỏ ở mép để xóa mẫu):
                      </span>
                      <button
                        type="button"
                        onClick={handleResetPresetFlavors}
                        className="text-[10px] text-slate-400 hover:text-[#0055FE] flex items-center gap-1 font-semibold transition-colors"
                        title="Khôi phục danh sách mẫu gốc"
                      >
                        <RotateCcw className="w-2.5 h-2.5" />
                        <span>Mặc định</span>
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {presetFlavors.map((preset, idx) => {
                        const isSelected = formData.flavors.includes(preset);
                        return (
                          <div
                            key={idx}
                            className={`inline-flex items-center rounded-lg border overflow-hidden transition-all ${
                              isSelected
                                ? 'bg-blue-100 text-[#0055FE] border-blue-300 shadow-2xs font-bold'
                                : 'bg-slate-50 hover:bg-blue-50 text-slate-600 border-slate-200'
                            }`}
                          >
                            <button
                              type="button"
                              onClick={() => (isSelected ? handleRemoveFlavor(preset) : handleAddFlavor(preset))}
                              className="px-2.5 py-1 text-[10px] font-semibold hover:text-[#0055FE] flex items-center gap-1"
                            >
                              <span>{isSelected ? '✓' : '+'}</span>
                              <span>{preset}</span>
                            </button>
                            {/* Delete this preset from presets bank button */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeletePresetFlavor(preset);
                              }}
                              className="px-1.5 py-1 text-slate-300 hover:text-red-600 hover:bg-red-50 transition-colors border-l border-slate-200"
                              title={`Xóa mẫu "${preset}" khỏi danh sách gợi ý`}
                            >
                              <X className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* SECTION: 3 KHỐI NỘI DUNG SẢN PHẨM CHUYÊN SÂU */}
                <div className="bg-gradient-to-br from-slate-50 to-blue-50/30 p-4 sm:p-5 rounded-2xl border border-blue-100/80 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200/70">
                    <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
                      <FileText className="w-4 h-4 text-[#0055FE]" />
                      <span>4. Nội Dung Chi Tiết (Hiển Thị 3 Tab Trang Sản Phẩm)</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleOpenAiStudio(formData.name)}
                      className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 text-white font-bold text-[11px] flex items-center gap-1.5 shadow-xs transition-all cursor-pointer self-start sm:self-auto"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                      <span>AI Viết 3 Mục Này (Mistral + MCP)</span>
                    </button>
                  </div>

                  {/* Tagline */}
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-700">
                      Mô tả ngắn 1 dòng (Tagline):
                    </label>
                    <input
                      type="text"
                      placeholder="Dòng Whey cao cấp hấp thu siêu tốc, tăng cơ nạc tối đa..."
                      value={formData.tagline}
                      onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl focus:border-[#0055FE] focus:outline-none"
                    />
                  </div>

                  {/* Tab Selector for 3 Content Sections */}
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center gap-2 p-1 bg-slate-200/70 rounded-xl">
                      <button
                        type="button"
                        onClick={() => setActiveContentTab('info')}
                        className={`flex-1 py-2 px-3 rounded-lg font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                          activeContentTab === 'info'
                            ? 'bg-white text-[#0055FE] shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Mô Tả & Thành Phần</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveContentTab('usage')}
                        className={`flex-1 py-2 px-3 rounded-lg font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                          activeContentTab === 'usage'
                            ? 'bg-white text-[#0055FE] shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <HelpCircle className="w-3.5 h-3.5" />
                        <span>Hướng Dẫn Sử Dụng</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveContentTab('guarantee')}
                        className={`flex-1 py-2 px-3 rounded-lg font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                          activeContentTab === 'guarantee'
                            ? 'bg-white text-[#0055FE] shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Cam Kết Chất Lượng</span>
                      </button>
                    </div>

                    {/* Tab 1: Mô Tả & Thành Phần */}
                    {activeContentTab === 'info' && (
                      <div className="space-y-1.5 animate-in fade-in duration-150">
                        <div className="flex items-center justify-between">
                          <label className="block font-bold text-slate-700">
                            1. Mô tả chi tiết & Thành phần dinh dưỡng:
                          </label>
                          <span className="text-[10px] text-slate-400">Xuất bản lên Tab "Mô Tả & Thành Phần"</span>
                        </div>
                        <textarea
                          rows={4}
                          placeholder="Giới thiệu công nghệ sản xuất, nguồn đạm tinh khiết, bảng phân tích dinh dưỡng và các ưu điểm nổi bật..."
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl focus:border-[#0055FE] focus:outline-none text-xs leading-relaxed"
                        />
                      </div>
                    )}

                    {/* Tab 2: Hướng Dẫn Sử Dụng */}
                    {activeContentTab === 'usage' && (
                      <div className="space-y-1.5 animate-in fade-in duration-150">
                        <div className="flex items-center justify-between">
                          <label className="block font-bold text-slate-700">
                            2. Hướng dẫn sử dụng & Thời điểm vàng:
                          </label>
                          <span className="text-[10px] text-slate-400">Xuất bản lên Tab "Hướng Dẫn Sử Dụng"</span>
                        </div>
                        <textarea
                          rows={4}
                          placeholder="Thời điểm uống tốt nhất (sau tập, sáng thức dậy), liều lượng mỗi lần dùng (1 muỗng), cách pha với nước mát hoặc sữa tươi..."
                          value={formData.usage_guide}
                          onChange={(e) => setFormData({ ...formData, usage_guide: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl focus:border-[#0055FE] focus:outline-none text-xs leading-relaxed"
                        />
                      </div>
                    )}

                    {/* Tab 3: Cam Kết Chất Lượng */}
                    {activeContentTab === 'guarantee' && (
                      <div className="space-y-1.5 animate-in fade-in duration-150">
                        <div className="flex items-center justify-between">
                          <label className="block font-bold text-slate-700">
                            3. Chính sách cam kết chất lượng & Bảo hành:
                          </label>
                          <span className="text-[10px] text-slate-400">Xuất bản lên Tab "Cam Kết Chất Lượng"</span>
                        </div>
                        <textarea
                          rows={4}
                          placeholder="Cam kết 100% chính hãng, có tem phụ tiếng Việt, tiêu chuẩn kiểm định an toàn (GMP, FDA, Creapure), hoàn tiền 200% nếu giả..."
                          value={formData.quality_commitment}
                          onChange={(e) => setFormData({ ...formData, quality_commitment: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl focus:border-[#0055FE] focus:outline-none text-xs leading-relaxed"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-w4u-primary px-8 py-2.5 font-bold text-xs rounded-xl shadow-xs disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmitting ? (
                    'Đang Lưu...'
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{modalMode === 'create' ? 'Tạo Sản Phẩm Mới' : 'Lưu Thay Đổi'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* AI PRODUCT STUDIO MODAL (Mistral AI + MCP DuckDuckGo Internet Search)      */}
      {/* ========================================================================= */}
      {isAiStudioOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 max-h-[92vh] overflow-y-auto border border-indigo-100">
            {/* AI Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/30">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg sm:text-xl font-black text-slate-900 font-display">
                      AI Studio Viết Nội Dung Sản Phẩm
                    </h3>
                    <span className="text-[10px] font-black uppercase tracking-wider bg-violet-100 text-violet-700 px-2.5 py-0.5 rounded-full border border-violet-200">
                      Mistral + MCP
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Tự động tra cứu thông tin thực tế từ Internet & viết trọn bộ 3 mục nội dung chuẩn Gym & E-commerce
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAiStudioOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-900 rounded-full hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* AI Inputs Section */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Product Name Input */}
                <div className="space-y-1 sm:col-span-2">
                  <label className="block font-bold text-slate-700 text-xs">
                    Tên sản phẩm / Thương hiệu tra cứu *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Ví dụ: Rule 1 Proteins R1 Protein Isolate 5lbs, Creatine Platinum Muscletech..."
                      value={aiProductName}
                      onChange={(e) => setAiProductName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl focus:border-[#0055FE] focus:outline-none text-xs font-semibold text-slate-900 pr-10"
                    />
                    <Sparkles className="w-4 h-4 text-violet-500 absolute right-3 top-3" />
                  </div>
                </div>

                {/* Category Selector */}
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700 text-xs">Danh mục sản phẩm:</label>
                  <select
                    value={aiCategoryId}
                    onChange={(e) => setAiCategoryId(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:border-[#0055FE] focus:outline-none text-xs"
                  >
                    <option value="whey-protein">Whey Protein</option>
                    <option value="strength-endurance">Sức Mạnh & Sức Bền</option>
                    <option value="vitamins">Vitamins & Khoáng Chất</option>
                  </select>
                </div>

                {/* Tone Selector */}
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700 text-xs">Tông giọng & Phong cách:</label>
                  <select
                    value={aiTone}
                    onChange={(e) => setAiTone(e.target.value as any)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:border-[#0055FE] focus:outline-none text-xs"
                  >
                    <option value="expert">Chuyên gia thể hình (Thực tế, tin cậy)</option>
                    <option value="marketing">Hấp dẫn mua hàng (Tối ưu chuyển đổi)</option>
                    <option value="scientific">Khoa học dinh dưỡng (Dẫn chứng, số liệu)</option>
                  </select>
                </div>
              </div>

              {/* MCP Internet Web Search Switch */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-50/80 to-indigo-50/60 border border-blue-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Globe className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                      <span>MCP Internet Live Search</span>
                      <span className="text-[9px] bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded-full">
                        DuckDuckGo Engine
                      </span>
                    </h4>
                    <p className="text-[11px] text-slate-600">
                      Tự động tra cứu thành phần, servings và chứng nhận thực tế của sản phẩm trên mạng Internet
                    </p>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={aiEnableWebSearch}
                    onChange={(e) => setAiEnableWebSearch(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0055FE]"></div>
                </label>
              </div>

              {/* Action Button: Generate */}
              <button
                type="button"
                onClick={handleGenerateProductContent}
                disabled={isAiGenerating || !aiProductName.trim()}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-indigo-500/20 disabled:opacity-50 transition-all cursor-pointer"
              >
                {isAiGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>{aiStepMessage || 'Đang tạo nội dung thông minh...'}</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4 text-amber-300" />
                    <span>Khởi Động AI Viết Sản Phẩm & Tra Cứu Internet</span>
                  </>
                )}
              </button>
            </div>

            {/* Generated Results Preview */}
            {aiGeneratedData && (
              <div className="space-y-4 pt-4 border-t border-slate-100 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-emerald-600" />
                    Kết Quả AI Đã Tạo Sẵn Sàng Áp Dụng:
                  </span>
                  <button
                    type="button"
                    onClick={handleApplyAiDataToForm}
                    className="btn-w4u-primary px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm"
                  >
                    <span>Áp Dụng Vào Form</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Tagline Preview */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-0.5">Tagline 1 dòng:</span>
                  <p className="text-xs font-bold text-slate-800">{aiGeneratedData.tagline}</p>
                </div>

                {/* 3 Content Blocks Preview */}
                <div className="space-y-2">
                  <div className="p-3.5 bg-blue-50/50 rounded-2xl border border-blue-100 space-y-1">
                    <span className="text-[11px] font-black text-[#0055FE] uppercase flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5" />
                      1. Mô Tả & Thành Phần:
                    </span>
                    <p className="text-xs text-slate-700 whitespace-pre-line leading-relaxed">
                      {aiGeneratedData.description}
                    </p>
                  </div>

                  <div className="p-3.5 bg-emerald-50/50 rounded-2xl border border-emerald-100 space-y-1">
                    <span className="text-[11px] font-black text-emerald-700 uppercase flex items-center gap-1">
                      <HelpCircle className="w-3.5 h-3.5" />
                      2. Hướng Dẫn Sử Dụng:
                    </span>
                    <p className="text-xs text-slate-700 whitespace-pre-line leading-relaxed">
                      {aiGeneratedData.usage_guide}
                    </p>
                  </div>

                  <div className="p-3.5 bg-amber-50/50 rounded-2xl border border-amber-100 space-y-1">
                    <span className="text-[11px] font-black text-amber-800 uppercase flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      3. Cam Kết Chất Lượng:
                    </span>
                    <p className="text-xs text-slate-700 whitespace-pre-line leading-relaxed">
                      {aiGeneratedData.quality_commitment}
                    </p>
                  </div>
                </div>

                {/* Macros Preview */}
                {aiGeneratedData.macros && aiGeneratedData.macros.length > 0 && (
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1.5">
                      4 Chỉ số Macro nổi bật được AI phân tích:
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {aiGeneratedData.macros.map((m: any, idx: number) => (
                        <div key={idx} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-center">
                          <span className="text-sm font-black text-slate-900 block">{m.value}</span>
                          <span className="text-[10px] font-bold text-slate-500 uppercase">{m.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Apply Button */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleApplyAiDataToForm}
                    className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Xác Nhận & Điền Tất Cả Vào Form Sản Phẩm</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
