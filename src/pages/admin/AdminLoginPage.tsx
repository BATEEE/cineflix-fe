import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, ShieldAlert, ShieldCheck } from 'lucide-react';
import authService, { getRoleIdFromToken } from '@/services/authService';
import { useAuthStore } from '@/stores/authStore';

const adminLoginSchema = z.object({
  email: z.string().email('Vui lòng nhập email hợp lệ.'),
  password: z.string().min(1, 'Vui lòng nhập mật khẩu.'),
});

type AdminLoginForm = z.infer<typeof adminLoginSchema>;

export const AdminLoginPage = () => {
  const [serverError, setServerError] = useState<string | null>(null);
  const navigate = useNavigate();
  const loginStore = useAuthStore((state) => state.login);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AdminLoginForm>({
    resolver: zodResolver(adminLoginSchema),
  });

  const onLogin = async (data: AdminLoginForm) => {
    setServerError(null);
    try {
      const response = await authService.login(data);
      if (!response.success || !response.data) {
        setServerError(response.message);
        return;
      }
      
      const { token, username, email, displayName, avt } = response.data;
      const roleId = getRoleIdFromToken(token);
      
      // Strict Admin Check
      if (roleId !== 1) {
        setServerError('Bạn không có quyền truy cập vào hệ thống quản trị.');
        return;
      }

      loginStore({ username, email, displayName, avt, roleId }, token);
      navigate('/admin/dashboard');
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Đăng nhập thất bại. Vui lòng thử lại.';
      setServerError(typeof msg === 'string' ? msg : 'Tài khoản hoặc mật khẩu không đúng.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 font-sans relative overflow-hidden">
      {/* Background styling for Admin Panel */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px]"></div>
      <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-[#E50914] opacity-20 blur-[100px]"></div>

      <div className="relative z-10 w-full max-w-md p-8 bg-zinc-900/80 backdrop-blur-xl border border-zinc-800/50 rounded-2xl shadow-2xl">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-[#E50914]/10 rounded-2xl flex items-center justify-center mb-4 border border-[#E50914]/20 shadow-[0_0_15px_rgba(229,9,20,0.2)]">
            <ShieldCheck className="w-8 h-8 text-[#E50914]" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Cineflix Admin</h1>
          <p className="text-zinc-400 text-sm mt-2 text-center">
            Đăng nhập để truy cập vào hệ thống quản trị viên
          </p>
        </div>

        {serverError && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <p className="text-red-200 text-sm">{serverError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onLogin)} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-300 ml-1">Email quản trị</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-zinc-500" />
              </div>
              <input
                {...register('email')}
                type="email"
                className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#E50914]/50 focus:border-[#E50914] transition-all"
                placeholder="admin@cineflix.com"
              />
            </div>
            {errors.email && <p className="text-red-500 text-xs ml-1 mt-1">{errors.email.message}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-300 ml-1">Mật khẩu</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-zinc-500" />
              </div>
              <input
                {...register('password')}
                type="password"
                className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#E50914]/50 focus:border-[#E50914] transition-all"
                placeholder="••••••••"
              />
            </div>
            {errors.password && <p className="text-red-500 text-xs ml-1 mt-1">{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#E50914] hover:bg-[#C11119] text-white font-medium py-3 rounded-xl transition-all disabled:opacity-50 mt-4 flex items-center justify-center gap-2 shadow-lg shadow-[#E50914]/20 active:scale-[0.98]"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Đang xác thực...
              </>
            ) : (
              'Đăng nhập hệ thống'
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-xs text-zinc-600">
            Khu vực hạn chế. Mọi truy cập trái phép đều được ghi log.
          </p>
        </div>
      </div>
    </div>
  );
};
