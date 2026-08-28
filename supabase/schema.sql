-- ==============================================================================
-- WHEY4YOU - SUPABASE POSTGRESQL DATABASE SCHEMA
-- Hệ thống Cơ sở dữ liệu E-commerce Thực phẩm Bổ sung & Dinh dưỡng Thể hình
-- ==============================================================================

-- 1. KÍCH HOẠT EXTENSION HỖ TRỢ UUID & TÌM KIẾM
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ==============================================================================
-- 2. TẠO CÁC BẢNG CƠ SỞ DỮ LIỆU
-- ==============================================================================

-- BẢNG 1: DANH MỤC SẢN PHẨM (categories)
create table if not exists public.categories (
    id text primary key, -- 'whey-protein', 'strength-endurance', 'vitamins'
    name text not null,
    slug text not null unique,
    icon text not null default 'Sparkles',
    tag text,
    count integer not null default 0,
    sort_order integer not null default 0,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- BẢNG 2: SẢN PHẨM CHÍNH (products)
create table if not exists public.products (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    slug text not null unique,
    tagline text not null,
    category_id text not null references public.categories(id) on update cascade on delete restrict,
    category_name text not null,
    price numeric(12, 0) not null check (price >= 0),
    original_price numeric(12, 0) check (original_price is null or original_price >= price),
    rating numeric(3, 2) not null default 5.0 check (rating >= 0 and rating <= 5),
    review_count integer not null default 0 check (review_count >= 0),
    image text not null,
    images text[] default '{}',
    badge text,
    badge_type text check (badge_type in ('top-seller', 'hot', 'new', 'sale')),
    description text not null,
    usage_guide text,
    quality_commitment text,
    goal text not null check (goal in ('muscle-growth', 'health-vitality', 'recovery', 'fat-burn')),
    is_featured boolean not null default false,
    is_in_stock boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- BẢNG 3: BẢNG CHỈ SỐ DINH DƯỠNG / MACROS (product_nutrition)
create table if not exists public.product_nutrition (
    id uuid primary key default gen_random_uuid(),
    product_id uuid not null references public.products(id) on delete cascade,
    label text not null, -- 'Protein', 'BCAA', 'Sugar', 'Calo', 'Creatine Pure'...
    value text not null, -- '27g', '6.5g', '0g', '5000mg'...
    badge_color text check (badge_color in ('lime', 'emerald', 'blue', 'amber')),
    sort_order integer not null default 0,
    created_at timestamptz not null default now()
);

-- BẢNG 4: BIẾN THỂ & HƯƠNG VỊ / KÍCH THƯỚC (product_variants)
create table if not exists public.product_variants (
    id uuid primary key default gen_random_uuid(),
    product_id uuid not null references public.products(id) on delete cascade,
    type text not null check (type in ('flavor', 'size')),
    name text not null, -- 'Chocolate Fudge', '2.27kg (5 lbs / 75 servings)'...
    price_modifier numeric(12, 0) not null default 0,
    stock_quantity integer not null default 100 check (stock_quantity >= 0),
    is_in_stock boolean not null default true,
    sort_order integer not null default 0,
    created_at timestamptz not null default now()
);

-- BẢNG 5: HỒ SƠ KHÁCH HÀNG / USER PROFILE (profiles - Liên kết với auth.users)
create table if not exists public.profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    full_name text,
    phone text,
    avatar_url text,
    role text not null default 'customer' check (role in ('customer', 'admin', 'staff')),
    fitness_goal text check (fitness_goal in ('muscle-growth', 'health-vitality', 'recovery', 'fat-burn')),
    height_cm numeric(5, 1),
    weight_kg numeric(5, 1),
    loyalty_points integer not null default 0,
    default_shipping_address text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- BẢNG 6: MÃ KHUYẾN MÃI (coupons)
create table if not exists public.coupons (
    id uuid primary key default gen_random_uuid(),
    code text not null unique,
    description text,
    discount_percent integer check (discount_percent > 0 and discount_percent <= 100),
    discount_amount numeric(12, 0) check (discount_amount > 0),
    min_order_value numeric(12, 0) not null default 0,
    max_discount numeric(12, 0),
    expires_at timestamptz,
    usage_limit integer,
    used_count integer not null default 0,
    is_active boolean not null default true,
    created_at timestamptz not null default now()
);

-- BẢNG 7: ĐƠN HÀNG (orders)
create table if not exists public.orders (
    id uuid primary key default gen_random_uuid(),
    order_code text not null unique, -- 'W4Y-2026-XXXX'
    user_id uuid references auth.users(id) on delete set null,
    customer_name text not null,
    customer_phone text not null,
    customer_email text,
    shipping_address text not null,
    city text not null default 'Hồ Chí Minh',
    district text,
    ward text,
    note text,
    coupon_code text,
    subtotal numeric(12, 0) not null check (subtotal >= 0),
    shipping_fee numeric(12, 0) not null default 0 check (shipping_fee >= 0),
    discount_amount numeric(12, 0) not null default 0 check (discount_amount >= 0),
    total_amount numeric(12, 0) not null check (total_amount >= 0),
    payment_method text not null check (payment_method in ('cod', 'vietqr', 'momo', 'vnpay', 'zalopay')),
    payment_status text not null default 'pending' check (payment_status in ('pending', 'paid', 'failed', 'refunded')),
    order_status text not null default 'pending' check (order_status in ('pending', 'confirmed', 'processing', 'shipping', 'delivered', 'cancelled')),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- BẢNG 8: CHI TIẾT SẢN PHẨM TRONG ĐƠN HÀNG (order_items)
create table if not exists public.order_items (
    id uuid primary key default gen_random_uuid(),
    order_id uuid not null references public.orders(id) on delete cascade,
    product_id uuid references public.products(id) on delete set null,
    product_name text not null,
    product_image text,
    flavor text,
    size text,
    quantity integer not null check (quantity > 0),
    unit_price numeric(12, 0) not null check (unit_price >= 0),
    total_price numeric(12, 0) not null check (total_price >= 0),
    created_at timestamptz not null default now()
);

-- BẢNG 9: YÊU CẦU TƯ VẤN / LIÊN HỆ GỌI LẠI (consultation_requests)
create table if not exists public.consultation_requests (
    id uuid primary key default gen_random_uuid(),
    full_name text not null,
    phone text not null,
    fitness_goal text,
    note text,
    status text not null default 'pending' check (status in ('pending', 'contacted', 'completed', 'cancelled')),
    created_at timestamptz not null default now()
);

-- BẢNG 10: BÀI VIẾT BLOG DINH DƯỠNG & THỂ HÌNH (articles)
create table if not exists public.articles (
    id uuid primary key default gen_random_uuid(),
    title text not null,
    slug text not null unique,
    excerpt text not null,
    content text not null,
    cover_image text not null,
    secondary_image text,
    secondary_image_caption text,
    category text not null check (category in ('tang-co', 'giam-mo', 'supplement', 'dinh-duong-chung', 'phuc-hoi')),
    category_name text not null,
    author_name text not null default 'Chuyên gia Whey4You',
    author_role text not null default 'HLV Dinh Dưỡng W4U',
    author_avatar text,
    reading_time integer not null default 5 check (reading_time > 0),
    status text not null default 'published' check (status in ('draft', 'published', 'archived')),
    is_featured boolean not null default false,
    view_count integer not null default 0 check (view_count >= 0),
    suggested_product_slugs text[] default '{}',
    tags text[] default '{}',
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- ==============================================================================
-- 3. CHỈ MỤC (INDEXES) TỐI ƯU HIỆU NĂNG TÌM KIẾM
-- ==============================================================================
create index if not exists idx_products_slug on public.products(slug);
create index if not exists idx_products_category on public.products(category_id);
create index if not exists idx_products_goal on public.products(goal);
create index if not exists idx_products_featured on public.products(is_featured);
create index if not exists idx_nutrition_product on public.product_nutrition(product_id);
create index if not exists idx_variants_product on public.product_variants(product_id);
create index if not exists idx_orders_code on public.orders(order_code);
create index if not exists idx_orders_user on public.orders(user_id);
create index if not exists idx_orders_status on public.orders(order_status);
create index if not exists idx_articles_slug on public.articles(slug);
create index if not exists idx_articles_category on public.articles(category);
create index if not exists idx_articles_status on public.articles(status);

-- ==============================================================================
-- 4. FUNCTION VÀ TRIGGER TỰ ĐỘNG CẬP NHẬT updated_at
-- ==============================================================================
create or replace function public.handle_updated_at()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

create trigger trigger_products_updated_at
    before update on public.products
    for each row execute function public.handle_updated_at();

create trigger trigger_orders_updated_at
    before update on public.orders
    for each row execute function public.handle_updated_at();

create trigger trigger_profiles_updated_at
    before update on public.profiles
    for each row execute function public.handle_updated_at();

create trigger trigger_articles_updated_at
    before update on public.articles
    for each row execute function public.handle_updated_at();

-- ==============================================================================
-- 5. FUNCTION & TRIGGER TỰ ĐỘNG TẠO PROFILE KHI USER ĐĂNG KÝ (auth.users)
-- ==============================================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
    insert into public.profiles (id, full_name, avatar_url, role)
    values (
        new.id,
        coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''),
        coalesce(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture', ''),
        'customer'
    )
    on conflict (id) do nothing;
    return new;
end;
$$ language plpgsql security definer;

-- Trigger chạy khi có user mới trong auth.users
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
    after insert on auth.users
    for each row execute function public.handle_new_user();

-- ==============================================================================
-- 6. THIẾT LẬP BẢO MẬT ROW LEVEL SECURITY (RLS)
-- ==============================================================================

-- Bật RLS cho tất cả các bảng
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_nutrition enable row level security;
alter table public.product_variants enable row level security;
alter table public.profiles enable row level security;
alter table public.coupons enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.consultation_requests enable row level security;
alter table public.articles enable row level security;

-- POLICIES CHO BẢNG SẢN PHẨM & DANH MỤC & BÀI VIẾT (Ai cũng có thể đọc)
create policy "Mọi người đều có thể xem danh mục"
    on public.categories for select using (true);

create policy "Mọi người đều có thể xem sản phẩm"
    on public.products for select using (true);

create policy "Mọi người đều có thể xem thông tin dinh dưỡng"
    on public.product_nutrition for select using (true);

create policy "Mọi người đều có thể xem biến thể sản phẩm"
    on public.product_variants for select using (true);

create policy "Mọi người có thể xem mã giảm giá đang hoạt động"
    on public.coupons for select using (is_active = true);

create policy "Mọi người có thể xem bài viết đã xuất bản"
    on public.articles for select using (status = 'published');

-- POLICIES CHO BẢNG PROFILES (Người dùng xem và sửa profile của chính mình)
create policy "Người dùng có thể xem profile của mình"
    on public.profiles for select using (auth.uid() = id);

create policy "Người dùng có thể cập nhật profile của mình"
    on public.profiles for update using (auth.uid() = id);

-- POLICIES CHO BẢNG ĐƠN HÀNG (Khách có thể tạo đơn hàng, xem đơn của chính mình)
create policy "Khách vãng lai và user đều có thể tạo đơn hàng"
    on public.orders for insert with check (true);

create policy "User có thể xem đơn hàng của mình"
    on public.orders for select using (auth.uid() = user_id or user_id is null);

create policy "Cho phép tạo order_items khi tạo đơn hàng"
    on public.order_items for insert with check (true);

create policy "User có thể xem chi tiết order_items của mình"
    on public.order_items for select using (
        exists (
            select 1 from public.orders
            where orders.id = order_items.order_id
            and (orders.user_id = auth.uid() or orders.user_id is null)
        )
    );

-- POLICIES CHO YÊU CẦU TƯ VẤN (Khách có thể gửi form yêu cầu gọi lại)
create policy "Khách có thể gửi yêu cầu tư vấn"
    on public.consultation_requests for insert with check (true);

