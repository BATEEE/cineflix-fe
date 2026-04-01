import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Film, Eye, EyeOff } from 'lucide-react'

const loginSchema = z.object({
  email: z.string().email('Vui lòng nhập email hợp lệ.'),
  password: z.string().min(1, 'Vui lòng nhập mật khẩu.'),
})

const registerSchema = z.object({
  fullName: z.string().min(2, 'Họ tên tối thiểu 2 ký tự.'),
  email: z.string().email('Vui lòng nhập email hợp lệ.'),
  password: z.string().min(8, 'Mật khẩu từ 8 ký tự trở lên.'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Mật khẩu không khớp.',
  path: ['confirmPassword'],
})

type LoginForm = z.infer<typeof loginSchema>
type RegisterForm = z.infer<typeof registerSchema>

const FloatingInput = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string }
>(({ label, error, type = 'text', ...props }, ref) => {
  return (
    <div className="relative w-full group">
      <input
        ref={ref}
        type={type}
        placeholder=" "
        className={`
          peer w-full h-[56px] px-4 pt-5 pb-1.5 rounded-xl text-white text-[15px]
          bg-white/[0.03] border border-white/[0.08] backdrop-blur-md
          focus:outline-none focus:bg-white/[0.06] transition-all duration-300 ease-out
          ${error 
            ? 'border-[#E50914]/50 focus:border-[#E50914] focus:ring-4 focus:ring-[#E50914]/10' 
            : 'hover:border-white/20 hover:bg-white/[0.05] focus:border-white/40 focus:ring-4 focus:ring-white/[0.03]'}
        `}
        {...props}
      />
      
      {/* HIỆU ỨNG TRƯỢT GPU-ACCELERATED */}
      <label 
        className={`
          absolute left-4 top-4 text-[15px] transition-all duration-300 ease-out pointer-events-none origin-[0]
          peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 
          peer-focus:-translate-y-2.5 peer-focus:scale-[0.75] 
          peer-[&:not(:placeholder-shown)]:-translate-y-2.5 peer-[&:not(:placeholder-shown)]:scale-[0.75]
          ${error ? 'text-[#E50914]/80 peer-focus:text-[#E50914]' : 'text-zinc-400 peer-focus:text-zinc-200'}
        `}
      >
        {label}
      </label>
      
      {error && (
        <p className="text-[#E50914] text-[12.5px] mt-1.5 px-1 font-medium tracking-wide">
          {error}
        </p>
      )}
    </div>
  )
})
FloatingInput.displayName = 'FloatingInput'

// --- MAIN PAGE ---
export const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)

  const {
    register: registerLogin,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors, isSubmitting: isLoggingIn },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) })

  const {
    register: registerSignup,
    handleSubmit: handleRegisterSubmit,
    formState: { errors: registerErrors, isSubmitting: isRegistering },
  } = useForm<RegisterForm>({ resolver: zodResolver(registerSchema) })

  const onLogin = async (data: LoginForm) => {
    console.log('Login:', data)
    await new Promise((r) => setTimeout(r, 1500))
  }

  const onRegister = async (data: RegisterForm) => {
    console.log('Register:', data)
    await new Promise((r) => setTimeout(r, 1500))
  }

  return (
    // Background container
    <div className="relative flex min-h-screen sm:items-center justify-center bg-black selection:bg-[#E50914]/30">
      
      {/* Background */}
      <div 
        className="hidden sm:block absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-60"
        style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=2070&auto=format&fit=crop")' }}
      />
      <div className="hidden sm:block absolute inset-0 z-0 bg-gradient-to-b from-black/90 via-black/40 to-black/90" />

      {/* Header Logo */}
      <div className="absolute top-0 left-0 p-5 sm:p-8 z-20 w-full bg-gradient-to-b from-black/80 to-transparent sm:bg-none">
        <div className="flex items-center gap-2 text-[#E50914] font-black text-3xl tracking-tighter">
          <Film className="w-8 h-8" />
          <span>CINEFLIX</span>
        </div>
      </div>

      {/* Auth Box */}
      <div className="relative z-10 w-full max-w-[460px] flex flex-col pt-24 px-6 pb-10 sm:pt-14 sm:px-12 sm:pb-14 sm:bg-black/60 sm:rounded-2xl sm:backdrop-blur-xl sm:border sm:border-white/[0.08] min-h-screen sm:min-h-0 sm:shadow-2xl my-4">
        <h2 className="text-[32px] font-bold text-white mb-8 tracking-tight">
          {isLogin ? 'Đăng nhập' : 'Đăng ký'}
        </h2>

        {/* --- FORM ĐĂNG NHẬP --- */}
        {isLogin ? (
          <form onSubmit={handleLoginSubmit(onLogin)} className="flex flex-col gap-4">
            <FloatingInput 
              label="Email hoặc số điện thoại" 
              {...registerLogin('email')} 
              error={loginErrors.email?.message} 
            />

            <div className="relative">
              <FloatingInput 
                label="Mật khẩu" 
                type={showPassword ? 'text' : 'password'}
                {...registerLogin('password')} 
                error={loginErrors.password?.message} 
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-[18px] text-zinc-400 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            <button 
              type="submit" 
              disabled={isLoggingIn}
              className="mt-4 w-full bg-[#E50914] hover:bg-[#C11119] text-white text-[15px] font-semibold h-[50px] rounded-xl transition-all duration-300 disabled:opacity-50 active:scale-[0.98] shadow-lg shadow-[#E50914]/20"
            >
              {isLoggingIn ? 'Đang xử lý...' : 'Đăng nhập'}
            </button>

            <div className="flex items-center justify-between text-zinc-400 text-[13px] mt-2 px-1">
              <label className="flex items-center gap-2.5 cursor-pointer hover:text-white transition-colors group">
                <div className="relative flex items-center justify-center w-4 h-4 rounded-[4px] border border-zinc-500 group-hover:border-zinc-400 transition-colors">
                  <input type="checkbox" className="peer absolute opacity-0 w-full h-full cursor-pointer" />
                  <div className="w-full h-full rounded-[3px] bg-transparent peer-checked:bg-[#E50914] transition-colors" />
                </div>
                Ghi nhớ tôi
              </label>
              <a href="#" className="hover:underline hover:text-white transition-colors">Bạn cần trợ giúp?</a>
            </div>
          </form>
        ) : (
          /* --- FORM --- */
          <form onSubmit={handleRegisterSubmit(onRegister)} className="flex flex-col gap-4 my-4">
            <FloatingInput 
              label="Họ và tên" 
              {...registerSignup('fullName')} 
              error={registerErrors.fullName?.message} 
            />
            
            <FloatingInput 
              label="Email" 
              {...registerSignup('email')} 
              error={registerErrors.email?.message} 
            />

            <FloatingInput 
              label="Mật khẩu" 
              type="password"
              {...registerSignup('password')} 
              error={registerErrors.password?.message} 
            />

            <FloatingInput 
              label="Xác nhận mật khẩu" 
              type="password"
              {...registerSignup('confirmPassword')} 
              error={registerErrors.confirmPassword?.message} 
            />

            <button 
              type="submit" 
              disabled={isRegistering}
              className="mt-4 w-full bg-[#E50914] hover:bg-[#C11119] text-white text-[15px] font-semibold h-[50px] rounded-xl transition-all duration-300 disabled:opacity-50 active:scale-[0.98] shadow-lg shadow-[#E50914]/20"
            >
              {isRegistering ? 'Đang tạo tài khoản...' : 'Đăng ký ngay'}
            </button>
          </form>
        )}

        {/* Footer */}
        <div className="mt-12 sm:mt-10 text-zinc-400 text-[15px]">
          {isLogin ? (
            <p>
              Bạn mới tham gia Cineflix?{' '}
              <button 
                onClick={() => setIsLogin(false)} 
                className="text-white font-medium hover:underline focus:outline-none ml-1 transition-colors"
              >
                Đăng ký ngay.
              </button>
            </p>
          ) : (
            <p>
              Đã có tài khoản?{' '}
              <button 
                onClick={() => setIsLogin(true)} 
                className="text-white font-medium hover:underline focus:outline-none ml-1 transition-colors"
              >
                Đăng nhập.
              </button>
            </p>
          )}
        </div>
        
        <p className="mt-4 text-[13px] text-zinc-500 leading-relaxed">
          Trang này được bảo vệ bởi Google reCAPTCHA để đảm bảo bạn không phải là robot.{' '}
          <button className="text-[#0071EB] hover:underline">Tìm hiểu thêm.</button>
        </p>
      </div>
    </div>
  )
}