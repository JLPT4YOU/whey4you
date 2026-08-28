/**
 * Utility functions for generating, cleaning, and validating SEO-optimized slugs
 * Designed specifically for Vietnamese e-commerce & content websites.
 */

/**
 * Chuyển đổi văn bản tiếng Việt hoặc bất kỳ chuỗi ký tự nào thành slug chuẩn SEO.
 * Ví dụ: "Sữa Tăng Cơ Whey Isolate Hydrolyzed 100% (Vị Socola & Dâu)!"
 * -> "sua-tang-co-whey-isolate-hydrolyzed-100-vi-socola-dau"
 */
export function slugify(text: string): string {
  if (!text || typeof text !== 'string') return '';

  let str = text.trim().toLowerCase();

  // 1. Thay thế các ký tự đặc biệt tiếng Việt đặc thù (đ, Đ)
  str = str.replace(/đ/g, 'd').replace(/Đ/g, 'd');

  // 2. Chuẩn hóa phân rã ký tự tổ hợp Unicode (NFD) và loại bỏ các dấu thanh tiếng Việt
  str = str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  // 3. Thay thế các ký tự mang nghĩa nối
  str = str.replace(/&/g, '-va-');
  str = str.replace(/@/g, '-at-');
  str = str.replace(/\+/g, '-plus-');
  str = str.replace(/%/g, '-percent-');

  // 4. Thay thế tất cả các ký tự không phải chữ cái latin (a-z) hoặc số (0-9) thành dấu gạch ngang
  str = str.replace(/[^a-z0-9]+/g, '-');

  // 5. Rút gọn nhiều dấu gạch ngang liên tiếp thành 1 dấu gạch ngang
  str = str.replace(/-+/g, '-');

  // 6. Xóa các dấu gạch ngang ở đầu và cuối chuỗi
  str = str.replace(/^-+|-+$/g, '');

  return str;
}

/**
 * Giải mã an toàn và làm sạch slug từ URL parameters
 * (Tránh lỗi do ký tự mã hóa URL %20, %c3, chữ hoa thường...)
 */
export function cleanSlugParam(param: string): string {
  if (!param || typeof param !== 'string') return '';

  try {
    const decoded = decodeURIComponent(param);
    return slugify(decoded);
  } catch {
    return slugify(param);
  }
}

/**
 * Kiểm tra xem một chuỗi có phải là slug hợp lệ chuẩn SEO không
 */
export function isValidSlug(slug: string): boolean {
  if (!slug || typeof slug !== 'string') return false;
  // Slug hợp lệ chỉ gồm chữ thường, số, dấu gạch nối giữa các từ, không bắt đầu/kết thúc bằng dấu '-'
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}
