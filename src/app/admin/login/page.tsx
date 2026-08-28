'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Lock, Mail, ArrowRight, AlertCircle } from 'lucide-react';
import { Logo } from '@/components/ui/logo';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          password: password,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMsg(data.error || 'Email hoặc mật khẩu không chính xác.');
        setIsLoading(false);
        return;
      }

      // Lưu trạng thái xác thực và chuyển hướng
      document.cookie = `w4u_admin_auth=true; path=/; max-age=${60 * 60 * 24 * 7}`;
      if (data.user?.email) {
        localStorage.setItem('w4u_admin_user_email', data.user.email);
      }
      router.push('/admin');
      router.refresh();
    } catch {
      setErrorMsg('Lỗi kết nối máy chủ xác thực.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#08183A] flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#0055FE]/20 rounded-full blur-3xl pointer-events-none" />
      
      <div className="w-full max-w-md space-y-8 relative z-10">
        {/* Brand & Logo */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <Logo size="lg" onDark />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-400/20 text-[#00D2FF] text-xs font-bold uppercase tracking-wider mt-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            Admin Portal
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Đăng Nhập Quản Trị Hệ Thống
          </h2>
        </div>

        {/* Login Card */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          {errorMsg && (
            <div className="p-3.5 bg-red-500/20 border border-red-500/30 rounded-2xl text-red-200 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Email Quản Trị
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Nhập email quản trị..."
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/15 rounded-2xl text-white placeholder-slate-400 text-xs font-medium focus:bg-white/10 focus:border-[#00D2FF] focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Mật Khẩu
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nhập mật khẩu..."
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/15 rounded-2xl text-white placeholder-slate-400 text-xs font-medium focus:bg-white/10 focus:border-[#00D2FF] focus:outline-none transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-[#0055FE] hover:bg-[#0038FF] text-white font-bold text-xs rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <span>Đang xác thực...</span>
              ) : (
                <>
                  <span>Đăng Nhập Admin</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Return to website */}
        <div className="text-center">
          <a
            href="/"
            className="text-xs text-slate-400 hover:text-white transition-colors"
          >
            ← Quay lại Cửa Hàng Whey4You
          </a>
        </div>
      </div>
    </div>
  );
}

