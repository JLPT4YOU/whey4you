/**
 * WHEY4YOU - SUPABASE SEED SCRIPT (ESM)
 * Chạy: npm run db:seed
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Đọc file .env.local hoặc .env
function loadEnv() {
  const envFiles = ['.env.local', '.env'];
  for (const file of envFiles) {
    const filePath = path.resolve(process.cwd(), file);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      content.split('\n').forEach((line) => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
          const [key, ...values] = trimmed.split('=');
          if (key && values.length > 0) {
            process.env[key.trim()] = values.join('=').trim().replace(/(^"|"$)/g, '');
          }
        }
      });
      console.log(`✅ Đã tải biến môi trường từ ${file}`);
      break;
    }
  }
}

loadEnv();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ LỖI: Vui lòng thiết lập NEXT_PUBLIC_SUPABASE_URL và NEXT_PUBLIC_SUPABASE_ANON_KEY (hoặc SUPABASE_SERVICE_ROLE_KEY) trong file .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const CATEGORIES = [
  { id: 'all', name: 'Tất Cả Sản Phẩm', slug: 'all', icon: 'Sparkles', count: 6, sort_order: 1 },
  { id: 'whey-protein', name: 'Whey Protein', slug: 'whey-protein', icon: 'Dumbbell', tag: 'Bán chạy nhất', count: 1, sort_order: 2 },
  { id: 'strength-endurance', name: 'Sức Mạnh & Sức Bền', slug: 'strength-endurance', icon: 'Zap', tag: 'Bùng nổ sức mạnh', count: 3, sort_order: 3 },
  { id: 'vitamins', name: 'Vitamins & Khoáng Chất', slug: 'vitamins', icon: 'ShieldPlus', tag: 'Chăm sóc sức khỏe', count: 2, sort_order: 4 },
];

const COUPONS = [
  { code: 'WHEY10', description: 'Giảm 10% cho đơn hàng bất kỳ', discount_percent: 10, min_order_value: 0, max_discount: 200000, is_active: true },
  { code: 'FREESHIP', description: 'Miễn phí vận chuyển toàn quốc (giảm 50k)', discount_amount: 50000, min_order_value: 500000, max_discount: 50000, is_active: true },
  { code: 'SUPERPUMP', description: 'Giảm 50.000đ cho đơn hàng từ 800.000đ', discount_amount: 50000, min_order_value: 800000, max_discount: 50000, is_active: true },
];

const PRODUCTS = [
  {
    name: 'Whey Isolate Hydrolyzed 100% Pure',
    slug: 'whey-isolate-hydrolyzed-pure',
    tagline: 'Dòng Whey cao cấp hấp thu siêu tốc, tăng cơ nạc tối đa',
    category_id: 'whey-protein',
    category_name: 'Whey Protein',
    price: 1850000,
    original_price: 2150000,
    rating: 4.9,
    review_count: 428,
    image: 'https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?auto=format&fit=crop&w=800&q=80',
    badge: 'TOP SELLER',
    badge_type: 'top-seller',
    description: '100% Whey Isolate thủy phân siêu tinh khiết loại bỏ hoàn toàn đường Lactose, chất béo và tạp chất, giúp cơ bắp phục hồi tức thì sau mỗi buổi tập nặng.',
    goal: 'muscle-growth',
    is_featured: true,
    nutrition: [
      { label: 'Protein', value: '27g', badge_color: 'lime', sort_order: 1 },
      { label: 'BCAA', value: '6.5g', badge_color: 'emerald', sort_order: 2 },
      { label: 'Sugar', value: '0g', badge_color: 'blue', sort_order: 3 },
      { label: 'Calo', value: '115 kcal', sort_order: 4 },
    ],
    variants: [
      { type: 'flavor', name: 'Chocolate Fudge', price_modifier: 0, sort_order: 1 },
      { type: 'flavor', name: 'Vanilla Ice Cream', price_modifier: 0, sort_order: 2 },
      { type: 'flavor', name: 'Matcha Latte', price_modifier: 0, sort_order: 3 },
      { type: 'flavor', name: 'Strawberry Milkshake', price_modifier: 0, sort_order: 4 },
      { type: 'size', name: '2.27kg (5 lbs / 75 servings)', price_modifier: 0, sort_order: 1 },
      { type: 'size', name: '4.5kg (10 lbs / 150 servings)', price_modifier: 1400000, sort_order: 2 },
    ],
  },
  {
    name: 'Nitro Igniter Pre-Workout Extreme Focus',
    slug: 'nitro-igniter-preworkout',
    tagline: 'Bùng nổ sức mạnh, bơm phồng cơ bắp và tỉnh táo tột đỉnh',
    category_id: 'strength-endurance',
    category_name: 'Sức Mạnh & Sức Bền',
    price: 920000,
    original_price: 1100000,
    rating: 4.8,
    review_count: 254,
    image: 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?auto=format&fit=crop&w=800&q=80',
    badge: 'EXTREME PUMP',
    badge_type: 'hot',
    description: 'Gia tăng lưu thông máu và Pump cơ bắp vượt trội, loại bỏ hoàn toàn cảm giác mệt mỏi giúp bạn phá vỡ mọi mức tạ cá nhân (PR).',
    goal: 'muscle-growth',
    is_featured: true,
    nutrition: [
      { label: 'Citrulline Malate', value: '8000mg', badge_color: 'lime', sort_order: 1 },
      { label: 'Beta-Alanine', value: '3200mg', badge_color: 'lime', sort_order: 2 },
      { label: 'Caffeine Tự Nhiên', value: '300mg', badge_color: 'amber', sort_order: 3 },
      { label: 'Khẩu phần', value: '30 Servings', sort_order: 4 },
    ],
    variants: [
      { type: 'flavor', name: 'Blue Raspberry Rush', price_modifier: 0, sort_order: 1 },
      { type: 'flavor', name: 'Sour Green Apple', price_modifier: 0, sort_order: 2 },
      { type: 'flavor', name: 'Tropical Mango', price_modifier: 0, sort_order: 3 },
      { type: 'size', name: '30 Servings (390g)', price_modifier: 0, sort_order: 1 },
      { type: 'size', name: '60 Servings (780g)', price_modifier: 600000, sort_order: 2 },
    ],
  },
  {
    name: 'Creapure® 100% Micronized Creatine Monohydrate',
    slug: 'creapure-micronized-creatine',
    tagline: 'Creatine chuẩn Đức siêu mịn tinh khiết 99.99%',
    category_id: 'strength-endurance',
    category_name: 'Sức Mạnh & Sức Bền',
    price: 490000,
    original_price: 580000,
    rating: 4.95,
    review_count: 512,
    image: 'https://images.unsplash.com/photo-1546483875-ad9014c88eba?auto=format&fit=crop&w=800&q=80',
    badge: 'CHUẨN ĐỨC CREAPURE',
    badge_type: 'top-seller',
    description: 'Creatine Monohydrate nguyên chất nhập khẩu từ AlzChem Đức, tăng cường sản sinh ATP nội bào, tăng kích thước tế bào cơ và duy trì độ sung mãn.',
    goal: 'muscle-growth',
    is_featured: true,
    nutrition: [
      { label: 'Creatine Pure', value: '5000mg', badge_color: 'lime', sort_order: 1 },
      { label: 'Độ tan', value: '100% Siêu Mịn', sort_order: 2 },
      { label: 'Tăng sức mạnh', value: '+15% Sức bộc phát', sort_order: 3 },
      { label: 'Khẩu phần', value: '100 Servings', sort_order: 4 },
    ],
    variants: [
      { type: 'flavor', name: 'Unflavored (Không mùi, dễ pha chung)', price_modifier: 0, sort_order: 1 },
      { type: 'size', name: '500g (100 lần dùng)', price_modifier: 0, sort_order: 1 },
      { type: 'size', name: '1kg (200 lần dùng)', price_modifier: 390000, sort_order: 2 },
    ],
  },
  {
    name: 'EAA + Electrolytes Intra-Workout Matrix',
    slug: 'eaa-electrolytes-recovery',
    tagline: '9 Axit amin thiết yếu + Khoáng bù điện giải chống dị hóa cơ',
    category_id: 'strength-endurance',
    category_name: 'Sức Mạnh & Sức Bền',
    price: 850000,
    original_price: 990000,
    rating: 4.88,
    review_count: 167,
    image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80',
    badge: 'CHỐNG DỊ HÓA',
    badge_type: 'new',
    description: 'Cung cấp đầy đủ 9 axit amin thiết yếu EAA giúp kích hoạt tổng hợp protein cơ bắp mTOR liên tục trong lúc tập, giảm đau nhức ê ẩm ngày hôm sau.',
    goal: 'recovery',
    is_featured: false,
    nutrition: [
      { label: 'Essential Amino', value: '10g EAA', badge_color: 'emerald', sort_order: 1 },
      { label: 'Điện giải bù nước', value: 'Dừa & Muối Hồng', badge_color: 'blue', sort_order: 2 },
      { label: 'Zero Sugar', value: '0 Calo', sort_order: 3 },
      { label: 'Khẩu phần', value: '40 Servings', sort_order: 4 },
    ],
    variants: [
      { type: 'flavor', name: 'Watermelon Breeze', price_modifier: 0, sort_order: 1 },
      { type: 'flavor', name: 'Peach Iced Tea', price_modifier: 0, sort_order: 2 },
      { type: 'flavor', name: 'Lemon Lime', price_modifier: 0, sort_order: 3 },
      { type: 'size', name: '400g (40 Servings)', price_modifier: 0, sort_order: 1 },
    ],
  },
  {
    name: 'Ultra Pure Omega-3 Fish Oil Triple Strength',
    slug: 'ultra-pure-omega-3-triple-strength',
    tagline: 'Dầu cá đậm đặc 1200mg EPA/DHA chứng nhận IFOS 5 sao',
    category_id: 'vitamins',
    category_name: 'Vitamins & Khoáng Chất',
    price: 680000,
    original_price: 850000,
    rating: 4.95,
    review_count: 312,
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80',
    badge: 'CHỨNG NHẬN IFOS',
    badge_type: 'hot',
    description: 'Chiết xuất từ cá biển sâu hoang dã Na Uy, khử sạch kim loại nặng, giảm viêm khớp xương, bảo vệ tim mạch và tối ưu hóa não bộ cho người tập luyện.',
    goal: 'health-vitality',
    is_featured: true,
    nutrition: [
      { label: 'EPA', value: '800mg', badge_color: 'amber', sort_order: 1 },
      { label: 'DHA', value: '400mg', badge_color: 'amber', sort_order: 2 },
      { label: 'Dạng Triglyceride', value: 'Siêu Hấp Thu', sort_order: 3 },
      { label: 'Viên nang', value: '180 viên', sort_order: 4 },
    ],
    variants: [
      { type: 'flavor', name: 'Vị Cam Chanh (Không tanh)', price_modifier: 0, sort_order: 1 },
      { type: 'size', name: '180 Viên Mềm (Softgels)', price_modifier: 0, sort_order: 1 },
      { type: 'size', name: '360 Viên Tiết Kiệm', price_modifier: 550000, sort_order: 2 },
    ],
  },
  {
    name: 'Daily High-Potency Athlete Multi-Vitamin',
    slug: 'daily-athlete-multivitamin',
    tagline: 'Tổ hợp 35+ Vitamin, khoáng chất sinh học & Enzyme tiêu hóa',
    category_id: 'vitamins',
    category_name: 'Vitamins & Khoáng Chất',
    price: 520000,
    original_price: 650000,
    rating: 4.85,
    review_count: 198,
    image: 'https://images.unsplash.com/photo-1550572017-edd951aa8f72?auto=format&fit=crop&w=800&q=80',
    badge: 'ĐẦY ĐỦ VI CHẤT',
    badge_type: 'new',
    description: 'Công thức cân bằng vi chất toàn diện được thiết kế riêng cho người có cường độ vận động cao, cải thiện giấc ngủ, tăng cường hệ miễn dịch và sinh lực.',
    goal: 'health-vitality',
    is_featured: true,
    nutrition: [
      { label: 'Vitamin D3 & K2', value: '5000 IU', badge_color: 'blue', sort_order: 1 },
      { label: 'Kẽm & Magie', value: 'ZMA Bio', badge_color: 'emerald', sort_order: 2 },
      { label: 'Chống oxy hóa', value: 'Phức hợp Bioflavonoid', sort_order: 3 },
      { label: 'Viên uống', value: '90 viên', sort_order: 4 },
    ],
    variants: [
      { type: 'flavor', name: 'Viên nén thực vật', price_modifier: 0, sort_order: 1 },
      { type: 'size', name: '90 Viên (Uống 45 ngày)', price_modifier: 0, sort_order: 1 },
      { type: 'size', name: '180 Viên (Uống 90 ngày)', price_modifier: 450000, sort_order: 2 },
    ],
  },
];

async function seed() {
  console.log('🚀 Bắt đầu Seed dữ liệu lên Supabase...');

  // 1. Categories
  console.log('📦 Đang chèn Danh mục (categories)...');
  const { error: catError } = await supabase.from('categories').upsert(CATEGORIES, { onConflict: 'id' });
  if (catError) console.error('Lỗi khi chèn categories:', catError.message);
  else console.log('✅ Chèn danh mục thành công!');

  // 2. Coupons
  console.log('🏷️  Đang chèn Mã khuyến mãi (coupons)...');
  const { error: coupError } = await supabase.from('coupons').upsert(COUPONS, { onConflict: 'code' });
  if (coupError) console.error('Lỗi khi chèn coupons:', coupError.message);
  else console.log('✅ Chèn coupons thành công!');

  // 3. Products
  console.log('💊 Đang chèn Sản phẩm & Biến thể...');
  for (const item of PRODUCTS) {
    const { nutrition, variants, ...prodData } = item;

    // Upsert product by slug
    const { data: insertedProd, error: prodError } = await supabase
      .from('products')
      .upsert(prodData, { onConflict: 'slug' })
      .select('id')
      .single();

    if (prodError || !insertedProd) {
      console.error(`Lỗi khi chèn sản phẩm ${prodData.name}:`, prodError?.message);
      continue;
    }

    const productId = insertedProd.id;

    // Delete existing nutrition and variants for clean overwrite
    await supabase.from('product_nutrition').delete().eq('product_id', productId);
    await supabase.from('product_variants').delete().eq('product_id', productId);

    // Insert Nutrition
    if (nutrition && nutrition.length > 0) {
      const nutritionRows = nutrition.map((n) => ({ ...n, product_id: productId }));
      await supabase.from('product_nutrition').insert(nutritionRows);
    }

    // Insert Variants
    if (variants && variants.length > 0) {
      const variantRows = variants.map((v) => ({ ...v, product_id: productId }));
      await supabase.from('product_variants').insert(variantRows);
    }

    console.log(`  + Đã chèn sản phẩm: ${prodData.name}`);
  }

  console.log('🎉 QUÁ TRÌNH SEED DỮ LIỆU ĐÃ HOÀN TẤT THÀNH CÔNG!');
}

seed().catch((err) => {
  console.error('❌ Lỗi:', err);
  process.exit(1);
});
