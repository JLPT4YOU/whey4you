import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Vui lòng nhập đầy đủ Email và Mật khẩu' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@whey4you.vn').trim().toLowerCase();
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123456';

    // 1. Kiểm tra với tài khoản cấu hình trong biến môi trường .env.local
    const isValidEnvAdmin = cleanEmail === adminEmail && password === adminPassword;

    if (isValidEnvAdmin) {
      const response = NextResponse.json({
        success: true,
        message: 'Đăng nhập Admin thành công',
        user: { email: cleanEmail },
      });

      // Thiết lập cookie xác thực
      response.cookies.set('w4u_admin_auth', 'true', {
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 ngày
        sameSite: 'lax',
      });

      return response;
    }

    // 2. Fallback: Thử xác thực với Supabase Auth nếu người dùng dùng tài khoản Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseAnonKey) {
      const supabase = createClient(supabaseUrl, supabaseAnonKey);
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: password,
      });

      if (!error && data?.session) {
        const response = NextResponse.json({
          success: true,
          message: 'Đăng nhập Supabase Admin thành công',
          user: { email: cleanEmail },
        });

        response.cookies.set('w4u_admin_auth', 'true', {
          path: '/',
          maxAge: 60 * 60 * 24 * 7,
          sameSite: 'lax',
        });

        return response;
      }
    }

    return NextResponse.json(
      { success: false, error: 'Email hoặc mật khẩu không chính xác.' },
      { status: 401 }
    );
  } catch (error) {
    console.error('Admin Login API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi hệ thống trong quá trình xác thực.' },
      { status: 500 }
    );
  }
}
