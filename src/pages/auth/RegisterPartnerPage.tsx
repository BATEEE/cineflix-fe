import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, Link } from 'react-router-dom';
import { Building2, User, Mail, Lock, Globe, ShieldCheck, Film, AlertCircle } from 'lucide-react';
import authService from '@/services/authService';

const countriesList = [
  "Việt Nam", "Mỹ (USA)", "Hàn Quốc (South Korea)", "Nhật Bản (Japan)",
  "Trung Quốc (China)", "Anh (UK)", "Pháp (France)", "Khác"
];

const registerPartnerSchema = z.object({
  username: z.string().min(3, 'Tên đăng nhập phải có ít nhất 3 ký tự.').max(50, 'Tên đăng nhập không được quá 50 ký tự.'),
  email: z.string().email('Vui lòng nhập email hợp lệ.'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự.'),
  confirmPassword: z.string().min(6, 'Vui lòng xác nhận mật khẩu.'),
  displayName: z.string().min(2, 'Tên hiển thị phải có ít nhất 2 ký tự.'),
  studioName: z.string().min(2, 'Tên hãng phim phải có ít nhất 2 ký tự.'),
  country: z.string().min(1, 'Vui lòng chọn quốc gia.')
}).refine((data) => data.password === data.confirmPassword, {
  message: "Mật khẩu xác nhận không khớp.",
  path: ["confirmPassword"], // path of error
});

type RegisterPartnerForm = z.infer<typeof registerPartnerSchema>;

export const RegisterPartnerPage = () => {
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useForm<RegisterPartnerForm>({
    resolver: zodResolver(registerPartnerSchema),
    defaultValues: { country: "Việt Nam" }
  });

  const onSubmit = async (data: RegisterPartnerForm) => {
    setServerError(null);
    setSuccessMsg(null);
    try {
      const response = await authService.registerStudioOwner({
        username: data.username,
        email: data.email,
        password: data.password,
        displayName: data.displayName,
        studioName: data.studioName,
        country: data.country
      });

      if (!response.success) {
        setServerError(response.message);
        return;
      }

      setSuccessMsg(response.message || "Đăng ký thành công!");
      reset();
      
      // Auto redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);

    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Có lỗi xảy ra khi kết nối với máy chủ. Vui lòng thử lại sau.';
      setServerError(typeof msg === 'string' ? msg : 'Lỗi hệ thống.');
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 font-sans flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px]"></div>
      <div className="absolute left-1/2 top-0 -z-10 -translate-x-1/2 w-[800px] h-[400px] rounded-full bg-[#E50914] opacity-10 blur-[120px] pointer-events-none"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-3xl relative z-10 px-4">
        <div className="flex justify-center mb-6">
          <div className="flex items-center gap-2 text-brand-red font-black text-3xl tracking-tighter">
            <Film className="w-10 h-10" />
            <span>CINEFLIX</span>
            <span className="text-zinc-500 font-light text-xl ml-2">| PARTNER</span>
          </div>
        </div>
        <h2 className="mt-2 text-center text-3xl font-bold tracking-tight text-white">
          Đăng ký đối tác Hãng Phim
        </h2>
        <p className="mt-2 text-center text-sm text-zinc-400">
          Tham gia mạng lưới phát hành nội dung của Cineflix ngay hôm nay
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-3xl relative z-10">
        <div className="bg-zinc-900/80 backdrop-blur-xl py-8 px-4 shadow-2xl sm:rounded-2xl sm:px-10 border border-zinc-800/50">
          
          {serverError && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <p className="text-red-200 text-sm">{serverError}</p>
            </div>
          )}

          {successMsg && (
            <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-green-200 text-sm font-medium">{successMsg}</p>
                <p className="text-green-200/70 text-xs mt-1">Đang chuyển hướng về trang đăng nhập...</p>
              </div>
            </div>
          )}

          <form className="space-y-8" onSubmit={handleSubmit(onSubmit)}>
            
            {/* PHẦN 1: THÔNG TIN TÀI KHOẢN */}
            <div>
              <div className="flex items-center gap-2 mb-4 border-b border-zinc-800 pb-2">
                <User className="w-5 h-5 text-[#E50914]" />
                <h3 className="text-lg font-medium text-white">1. Thông tin tài khoản</h3>
              </div>
              
              <div className="grid grid-cols-1 gap-y-5 gap-x-6 sm:grid-cols-2">
                
                {/* Username */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-zinc-300">Tên đăng nhập</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-zinc-500" />
                    </div>
                    <input
                      {...register('username')}
                      type="text"
                      className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#E50914]/50 focus:border-[#E50914] transition-all"
                      placeholder="studio_admin123"
                    />
                  </div>
                  {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username.message}</p>}
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-zinc-300">Email doanh nghiệp</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-zinc-500" />
                    </div>
                    <input
                      {...register('email')}
                      type="email"
                      className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#E50914]/50 focus:border-[#E50914] transition-all"
                      placeholder="contact@studio.com"
                    />
                  </div>
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-zinc-300">Mật khẩu</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-zinc-500" />
                    </div>
                    <input
                      {...register('password')}
                      type="password"
                      className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#E50914]/50 focus:border-[#E50914] transition-all"
                      placeholder="••••••••"
                    />
                  </div>
                  {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
                </div>

                {/* Confirm Password */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-zinc-300">Xác nhận mật khẩu</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-zinc-500" />
                    </div>
                    <input
                      {...register('confirmPassword')}
                      type="password"
                      className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#E50914]/50 focus:border-[#E50914] transition-all"
                      placeholder="••••••••"
                    />
                  </div>
                  {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
                </div>

                {/* Display Name */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-sm font-medium text-zinc-300">Tên người đại diện quản lý</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-zinc-500" />
                    </div>
                    <input
                      {...register('displayName')}
                      type="text"
                      className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#E50914]/50 focus:border-[#E50914] transition-all"
                      placeholder="Nguyễn Văn A"
                    />
                  </div>
                  {errors.displayName && <p className="text-red-500 text-xs mt-1">{errors.displayName.message}</p>}
                </div>
              </div>
            </div>

            {/* PHẦN 2: THÔNG TIN HÃNG PHIM */}
            <div>
              <div className="flex items-center gap-2 mb-4 border-b border-zinc-800 pb-2">
                <Building2 className="w-5 h-5 text-[#E50914]" />
                <h3 className="text-lg font-medium text-white">2. Thông tin Hãng phim (Studio Profile)</h3>
              </div>
              
              <div className="grid grid-cols-1 gap-y-5 gap-x-6 sm:grid-cols-2">
                
                {/* Studio Name */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-zinc-300">Tên Hãng phim / Nhà sản xuất</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Building2 className="h-5 w-5 text-zinc-500" />
                    </div>
                    <input
                      {...register('studioName')}
                      type="text"
                      className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#E50914]/50 focus:border-[#E50914] transition-all"
                      placeholder="Galaxy Studio"
                    />
                  </div>
                  {errors.studioName && <p className="text-red-500 text-xs mt-1">{errors.studioName.message}</p>}
                </div>

                {/* Country */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-zinc-300">Quốc gia đặt trụ sở</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Globe className="h-5 w-5 text-zinc-500" />
                    </div>
                    <select
                      {...register('country')}
                      className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl pl-10 pr-10 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#E50914]/50 focus:border-[#E50914] transition-all appearance-none"
                    >
                      {countriesList.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-zinc-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  {errors.country && <p className="text-red-500 text-xs mt-1">{errors.country.message}</p>}
                </div>

              </div>
            </div>

            {/* BẢO MẬT & SUBMIT */}
            <div className="pt-4 flex flex-col items-center gap-4 border-t border-zinc-800/50">
              <button
                type="submit"
                disabled={isSubmitting || !!successMsg}
                className="w-full sm:w-auto min-w-[200px] bg-[#E50914] hover:bg-[#C11119] text-white font-medium py-3 px-8 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-[#E50914]/20 active:scale-[0.98]"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Đang đăng ký...
                  </>
                ) : (
                  'Hoàn tất đăng ký đối tác'
                )}
              </button>

              <p className="text-sm text-zinc-400">
                Đã có tài khoản đối tác?{' '}
                <Link to="/login" className="text-brand-red font-medium hover:underline">
                  Đăng nhập ngay
                </Link>
              </p>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
};
