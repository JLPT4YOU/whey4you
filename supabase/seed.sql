-- ==============================================================================
-- WHEY4YOU - SEED DATA SCRIPT CHO SUPABASE
-- Dữ liệu mẫu hoàn chỉnh: Danh mục, Sản phẩm, Macros, Biến thể & Mã giảm giá
-- ==============================================================================

-- 1. XÓA DỮ LIỆU CŨ TRÁNH TRÙNG LẶP (NẾU CÓ)
delete from public.order_items;
delete from public.orders;
delete from public.product_variants;
delete from public.product_nutrition;
delete from public.products;
delete from public.categories;
delete from public.coupons;

-- 2. INSERT DANH MỤC SẢN PHẨM (categories)
insert into public.categories (id, name, slug, icon, tag, count, sort_order) values
('all', 'Tất Cả Sản Phẩm', 'all', 'Sparkles', null, 6, 1),
('whey-protein', 'Whey Protein', 'whey-protein', 'Dumbbell', 'Bán chạy nhất', 1, 2),
('strength-endurance', 'Sức Mạnh & Sức Bền', 'strength-endurance', 'Zap', 'Bùng nổ sức mạnh', 3, 3),
('vitamins', 'Vitamins & Khoáng Chất', 'vitamins', 'ShieldPlus', 'Chăm sóc sức khỏe', 2, 4);

-- 3. INSERT MÃ GIẢM GIÁ (coupons)
insert into public.coupons (code, description, discount_percent, discount_amount, min_order_value, max_discount, is_active) values
('WHEY10', 'Giảm 10% cho đơn hàng bất kỳ', 10, null, 0, 200000, true),
('FREESHIP', 'Miễn phí vận chuyển toàn quốc (giảm 50k)', null, 50000, 500000, 50000, true),
('SUPERPUMP', 'Giảm 50.000đ cho đơn hàng từ 800.000đ', null, 50000, 800000, 50000, true);

-- 4. INSERT SẢN PHẨM & DỮ LIỆU LIÊN QUAN (Sử dụng DO block để lấy ID chính xác)
do $$
declare
    v_prod1 uuid;
    v_prod2 uuid;
    v_prod3 uuid;
    v_prod4 uuid;
    v_prod5 uuid;
    v_prod6 uuid;
begin

    -- SẢN PHẨM 1: Whey Isolate Hydrolyzed 100% Pure
    insert into public.products (name, slug, tagline, category_id, category_name, price, original_price, rating, review_count, image, badge, badge_type, description, goal, is_featured)
    values (
        'Whey Isolate Hydrolyzed 100% Pure',
        'whey-isolate-hydrolyzed-pure',
        'Dòng Whey cao cấp hấp thu siêu tốc, tăng cơ nạc tối đa',
        'whey-protein',
        'Whey Protein',
        1850000,
        2150000,
        4.90,
        428,
        'https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?auto=format&fit=crop&w=800&q=80',
        'TOP SELLER',
        'top-seller',
        '100% Whey Isolate thủy phân siêu tinh khiết loại bỏ hoàn toàn đường Lactose, chất béo và tạp chất, giúp cơ bắp phục hồi tức thì sau mỗi buổi tập nặng.',
        'muscle-growth',
        true
    ) returning id into v_prod1;

    -- Macros Prod 1
    insert into public.product_nutrition (product_id, label, value, badge_color, sort_order) values
    (v_prod1, 'Protein', '27g', 'lime', 1),
    (v_prod1, 'BCAA', '6.5g', 'emerald', 2),
    (v_prod1, 'Sugar', '0g', 'blue', 3),
    (v_prod1, 'Calo', '115 kcal', null, 4);

    -- Variants Prod 1
    insert into public.product_variants (product_id, type, name, price_modifier, stock_quantity, is_in_stock, sort_order) values
    (v_prod1, 'flavor', 'Chocolate Fudge', 0, 50, true, 1),
    (v_prod1, 'flavor', 'Vanilla Ice Cream', 0, 45, true, 2),
    (v_prod1, 'flavor', 'Matcha Latte', 0, 30, true, 3),
    (v_prod1, 'flavor', 'Strawberry Milkshake', 0, 25, true, 4),
    (v_prod1, 'size', '2.27kg (5 lbs / 75 servings)', 0, 100, true, 1),
    (v_prod1, 'size', '4.5kg (10 lbs / 150 servings)', 1400000, 50, true, 2);


    -- SẢN PHẨM 2: Nitro Igniter Pre-Workout Extreme Focus
    insert into public.products (name, slug, tagline, category_id, category_name, price, original_price, rating, review_count, image, badge, badge_type, description, goal, is_featured)
    values (
        'Nitro Igniter Pre-Workout Extreme Focus',
        'nitro-igniter-preworkout',
        'Bùng nổ sức mạnh, bơm phồng cơ bắp và tỉnh táo tột đỉnh',
        'strength-endurance',
        'Sức Mạnh & Sức Bền',
        920000,
        1100000,
        4.80,
        254,
        'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?auto=format&fit=crop&w=800&q=80',
        'EXTREME PUMP',
        'hot',
        'Gia tăng lưu thông máu và Pump cơ bắp vượt trội, loại bỏ hoàn toàn cảm giác mệt mỏi giúp bạn phá vỡ mọi mức tạ cá nhân (PR).',
        'muscle-growth',
        true
    ) returning id into v_prod2;

    -- Macros Prod 2
    insert into public.product_nutrition (product_id, label, value, badge_color, sort_order) values
    (v_prod2, 'Citrulline Malate', '8000mg', 'lime', 1),
    (v_prod2, 'Beta-Alanine', '3200mg', 'lime', 2),
    (v_prod2, 'Caffeine Tự Nhiên', '300mg', 'amber', 3),
    (v_prod2, 'Khẩu phần', '30 Servings', null, 4);

    -- Variants Prod 2
    insert into public.product_variants (product_id, type, name, price_modifier, stock_quantity, is_in_stock, sort_order) values
    (v_prod2, 'flavor', 'Blue Raspberry Rush', 0, 40, true, 1),
    (v_prod2, 'flavor', 'Sour Green Apple', 0, 35, true, 2),
    (v_prod2, 'flavor', 'Tropical Mango', 0, 30, true, 3),
    (v_prod2, 'size', '30 Servings (390g)', 0, 60, true, 1),
    (v_prod2, 'size', '60 Servings (780g)', 600000, 45, true, 2);


    -- SẢN PHẨM 3: Creapure® 100% Micronized Creatine Monohydrate
    insert into public.products (name, slug, tagline, category_id, category_name, price, original_price, rating, review_count, image, badge, badge_type, description, goal, is_featured)
    values (
        'Creapure® 100% Micronized Creatine Monohydrate',
        'creapure-micronized-creatine',
        'Creatine chuẩn Đức siêu mịn tinh khiết 99.99%',
        'strength-endurance',
        'Sức Mạnh & Sức Bền',
        490000,
        580000,
        4.95,
        512,
        'https://images.unsplash.com/photo-1546483875-ad9014c88eba?auto=format&fit=crop&w=800&q=80',
        'CHUẨN ĐỨC CREAPURE',
        'top-seller',
        'Creatine Monohydrate nguyên chất nhập khẩu từ AlzChem Đức, tăng cường sản sinh ATP nội bào, tăng kích thước tế bào cơ và duy trì độ sung mãn.',
        'muscle-growth',
        true
    ) returning id into v_prod3;

    -- Macros Prod 3
    insert into public.product_nutrition (product_id, label, value, badge_color, sort_order) values
    (v_prod3, 'Creatine Pure', '5000mg', 'lime', 1),
    (v_prod3, 'Độ tan', '100% Siêu Mịn', null, 2),
    (v_prod3, 'Tăng sức mạnh', '+15% Sức bộc phát', null, 3),
    (v_prod3, 'Khẩu phần', '100 Servings', null, 4);

    -- Variants Prod 3
    insert into public.product_variants (product_id, type, name, price_modifier, stock_quantity, is_in_stock, sort_order) values
    (v_prod3, 'flavor', 'Unflavored (Không mùi, dễ pha chung)', 0, 100, true, 1),
    (v_prod3, 'size', '500g (100 lần dùng)', 0, 80, true, 1),
    (v_prod3, 'size', '1kg (200 lần dùng)', 390000, 40, true, 2);


    -- SẢN PHẨM 4: EAA + Electrolytes Intra-Workout Matrix
    insert into public.products (name, slug, tagline, category_id, category_name, price, original_price, rating, review_count, image, badge, badge_type, description, goal, is_featured)
    values (
        'EAA + Electrolytes Intra-Workout Matrix',
        'eaa-electrolytes-recovery',
        '9 Axit amin thiết yếu + Khoáng bù điện giải chống dị hóa cơ',
        'strength-endurance',
        'Sức Mạnh & Sức Bền',
        850000,
        990000,
        4.88,
        167,
        'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80',
        'CHỐNG DỊ HÓA',
        'new',
        'Cung cấp đầy đủ 9 axit amin thiết yếu EAA giúp kích hoạt tổng hợp protein cơ bắp mTOR liên tục trong lúc tập, giảm đau nhức ê ẩm ngày hôm sau.',
        'recovery',
        false
    ) returning id into v_prod4;

    -- Macros Prod 4
    insert into public.product_nutrition (product_id, label, value, badge_color, sort_order) values
    (v_prod4, 'Essential Amino', '10g EAA', 'emerald', 1),
    (v_prod4, 'Điện giải bù nước', 'Dừa & Muối Hồng', 'blue', 2),
    (v_prod4, 'Zero Sugar', '0 Calo', null, 3),
    (v_prod4, 'Khẩu phần', '40 Servings', null, 4);

    -- Variants Prod 4
    insert into public.product_variants (product_id, type, name, price_modifier, stock_quantity, is_in_stock, sort_order) values
    (v_prod4, 'flavor', 'Watermelon Breeze', 0, 40, true, 1),
    (v_prod4, 'flavor', 'Peach Iced Tea', 0, 35, true, 2),
    (v_prod4, 'flavor', 'Lemon Lime', 0, 25, true, 3),
    (v_prod4, 'size', '400g (40 Servings)', 0, 100, true, 1);


    -- SẢN PHẨM 5: Ultra Pure Omega-3 Fish Oil Triple Strength
    insert into public.products (name, slug, tagline, category_id, category_name, price, original_price, rating, review_count, image, badge, badge_type, description, goal, is_featured)
    values (
        'Ultra Pure Omega-3 Fish Oil Triple Strength',
        'ultra-pure-omega-3-triple-strength',
        'Dầu cá đậm đặc 1200mg EPA/DHA chứng nhận IFOS 5 sao',
        'vitamins',
        'Vitamins & Khoáng Chất',
        680000,
        850000,
        4.95,
        312,
        'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80',
        'CHỨNG NHẬN IFOS',
        'hot',
        'Chiết xuất từ cá biển sâu hoang dã Na Uy, khử sạch kim loại nặng, giảm viêm khớp xương, bảo vệ tim mạch và tối ưu hóa não bộ cho người tập luyện.',
        'health-vitality',
        true
    ) returning id into v_prod5;

    -- Macros Prod 5
    insert into public.product_nutrition (product_id, label, value, badge_color, sort_order) values
    (v_prod5, 'EPA', '800mg', 'amber', 1),
    (v_prod5, 'DHA', '400mg', 'amber', 2),
    (v_prod5, 'Dạng Triglyceride', 'Siêu Hấp Thu', null, 3),
    (v_prod5, 'Viên nang', '180 viên', null, 4);

    -- Variants Prod 5
    insert into public.product_variants (product_id, type, name, price_modifier, stock_quantity, is_in_stock, sort_order) values
    (v_prod5, 'flavor', 'Vị Cam Chanh (Không tanh)', 0, 80, true, 1),
    (v_prod5, 'size', '180 Viên Mềm (Softgels)', 0, 50, true, 1),
    (v_prod5, 'size', '360 Viên Tiết Kiệm', 550000, 30, true, 2);


    -- SẢN PHẨM 6: Daily High-Potency Athlete Multi-Vitamin
    insert into public.products (name, slug, tagline, category_id, category_name, price, original_price, rating, review_count, image, badge, badge_type, description, goal, is_featured)
    values (
        'Daily High-Potency Athlete Multi-Vitamin',
        'daily-athlete-multivitamin',
        'Tổ hợp 35+ Vitamin, khoáng chất sinh học & Enzyme tiêu hóa',
        'vitamins',
        'Vitamins & Khoáng Chất',
        520000,
        650000,
        4.85,
        198,
        'https://images.unsplash.com/photo-1550572017-edd951aa8f72?auto=format&fit=crop&w=800&q=80',
        'ĐẦY ĐỦ VI CHẤT',
        'new',
        'Công thức cân bằng vi chất toàn diện được thiết kế riêng cho người có cường độ vận động cao, cải thiện giấc ngủ, tăng cường hệ miễn dịch và sinh lực.',
        'health-vitality',
        true
    ) returning id into v_prod6;

    -- Macros Prod 6
    insert into public.product_nutrition (product_id, label, value, badge_color, sort_order) values
    (v_prod6, 'Vitamin D3 & K2', '5000 IU', 'blue', 1),
    (v_prod6, 'Kẽm & Magie', 'ZMA Bio', 'emerald', 2),
    (v_prod6, 'Chống oxy hóa', 'Phức hợp Bioflavonoid', null, 3),
    (v_prod6, 'Viên uống', '90 viên', null, 4);

    -- Variants Prod 6
    insert into public.product_variants (product_id, type, name, price_modifier, stock_quantity, is_in_stock, sort_order) values
    (v_prod6, 'flavor', 'Viên nén thực vật', 0, 70, true, 1),
    (v_prod6, 'size', '90 Viên (Uống 45 ngày)', 0, 40, true, 1),
    (v_prod6, 'size', '180 Viên (Uống 90 ngày)', 450000, 30, true, 2);

end $$;
