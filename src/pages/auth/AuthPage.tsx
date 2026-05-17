import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Film, Eye, EyeOff, Mail, ShieldCheck, RefreshCw } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import authService, { getRoleIdFromToken } from '@/services/authService'
import { useAuthStore } from '@/stores/authStore'

// ── Validation Schemas ─────────────────────────────────────────────────────
const loginSchema = z.object({
  email: z.string().email('Vui lòng nhập email hợp lệ.'),
  password: z.string().min(1, 'Vui lòng nhập mật khẩu.'),
})

const registerSchema = z.object({
  username: z.string().min(3, 'Username tối thiểu 3 ký tự.'),
  displayName: z.string().min(2, 'Tên hiển thị tối thiểu 2 ký tự.'),
  email: z.string().email('Vui lòng nhập email hợp lệ.'),
  password: z.string().min(6, 'Mật khẩu từ 6 ký tự trở lên.'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Mật khẩu không khớp.',
  path: ['confirmPassword'],
})

const otpSchema = z.object({
  code: z.string().length(6, 'Mã OTP phải có đúng 6 chữ số.'),
})

type LoginForm = z.infer<typeof loginSchema>
type RegisterForm = z.infer<typeof registerSchema>
type OtpForm = z.infer<typeof otpSchema>

// ── FloatingInput Component ────────────────────────────────────────────────
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

// ── Main Page ──────────────────────────────────────────────────────────────
type AuthStep = 'login' | 'register' | 'otp'

export const AuthPage = () => {
  const [step, setStep] = useState<AuthStep>('login')
  const [pendingEmail, setPendingEmail] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [serverSuccess, setServerSuccess] = useState<string | null>(null)
  const [isResending, setIsResending] = useState(false)
  const navigate = useNavigate()
  const loginStore = useAuthStore((state) => state.login)

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

  const {
    register: registerOtp,
    handleSubmit: handleOtpSubmit,
    formState: { errors: otpErrors, isSubmitting: isVerifying },
  } = useForm<OtpForm>({ resolver: zodResolver(otpSchema) })

  // ── Login Handler ──
  const onLogin = async (data: LoginForm) => {
    setServerError(null)
    try {
      const response = await authService.login(data)
      if (!response.success || !response.data) {
        setServerError(response.message)
        return
      }
      const { token, username, email, displayName, avt } = response.data
      const roleId = getRoleIdFromToken(token)
      console.log('Detected Role ID:', roleId)
      loginStore({ username, email, displayName, avt, roleId }, token)
      
      if (roleId === 1) {
        navigate('/admin/dashboard')
      } else if (roleId === 3) {
        navigate('/studio/dashboard')
      } else {
        navigate('/')
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Đăng nhập thất bại. Vui lòng thử lại.'
      setServerError(typeof msg === 'string' ? msg : 'Email hoặc mật khẩu không đúng.')
    }
  }

  // ── Register Handler (Step 1: Gửi OTP) ──
  const onRegister = async (data: RegisterForm) => {
    setServerError(null)
    try {
      const response = await authService.register({
        username: data.username,
        email: data.email,
        password: data.password,
        displayName: data.displayName,
      })
      if (!response.success) {
        setServerError(response.message)
        return
      }
      setPendingEmail(data.email)
      setStep('otp')
      setServerSuccess('Mã xác thực đã được gửi về email của bạn!')
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại.'
      setServerError(typeof msg === 'string' ? msg : 'Đã có lỗi xảy ra.')
    }
  }

  // ── OTP Verify Handler (Step 2) ──
  const onVerifyOtp = async (data: OtpForm) => {
    setServerError(null)
    setServerSuccess(null)
    try {
      const response = await authService.verify({ email: pendingEmail, code: data.code })
      if (!response.success || !response.data) {
        setServerError(response.message)
        return
      }
      const { token, username, email, displayName, avt } = response.data
      const roleId = getRoleIdFromToken(token)
      loginStore({ username, email, displayName, avt, roleId }, token)
      navigate('/')
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Xác thực thất bại.'
      setServerError(typeof msg === 'string' ? msg : 'Mã OTP không hợp lệ.')
    }
  }

  // ── Resend OTP ──
  const handleResendOtp = async () => {
    setIsResending(true)
    setServerError(null)
    setServerSuccess(null)
    try {
      const response = await authService.resendOtp({ email: pendingEmail })
      if (response.success) setServerSuccess('Đã gửi lại mã OTP về email của bạn!')
      else setServerError(response.message)
    } catch {
      setServerError('Không thể gửi lại OTP. Vui lòng thử lại sau.')
    } finally {
      setIsResending(false)
    }
  }

  const switchStep = (newStep: AuthStep) => {
    setStep(newStep)
    setServerError(null)
    setServerSuccess(null)
  }

  return (
    <div className="relative flex min-h-screen sm:items-center justify-center bg-black selection:bg-[#E50914]/30">

      {/* Background */}
      <div
        className="hidden sm:block absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-60"
        style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=2070&auto=format&fit=crop")' }}
      />
      <div className="hidden sm:block absolute inset-0 z-0 bg-gradient-to-b from-black/90 via-black/40 to-black/90" />

      {/* Logo */}
      <div className="absolute top-0 left-0 p-5 sm:p-8 z-20 w-full bg-gradient-to-b from-black/80 to-transparent sm:bg-none">
        <div className="flex items-center gap-2 text-[#E50914] font-black text-3xl tracking-tighter">
          <Film className="w-8 h-8" />
          <span>CINEFLIX</span>
        </div>
      </div>

      {/* Auth Card */}
      <div className="relative z-10 w-full max-w-[460px] flex flex-col pt-24 px-6 pb-10 sm:pt-14 sm:px-12 sm:pb-14 sm:bg-black/60 sm:rounded-2xl sm:backdrop-blur-xl sm:border sm:border-white/[0.08] min-h-screen sm:min-h-0 sm:shadow-2xl my-4">
        <h2 className="text-[32px] font-bold text-white mb-8 tracking-tight">
          {step === 'login' ? 'Đăng nhập' : step === 'register' ? 'Đăng ký' : 'Xác thực Email'}
        </h2>

        {/* Feedback Banners */}
        {serverError && (
          <div className="mb-4 px-4 py-3 rounded-xl bg-[#E50914]/10 border border-[#E50914]/30 text-red-300 text-[13.5px]">
            ⚠️ {serverError}
          </div>
        )}
        {serverSuccess && (
          <div className="mb-4 px-4 py-3 rounded-xl bg-green-500/10 border border-green-500/30 text-green-300 text-[13.5px]">
            ✅ {serverSuccess}
          </div>
        )}

        {/* ─── FORM ĐĂNG NHẬP ─── */}
        {step === 'login' && (
          <form onSubmit={handleLoginSubmit(onLogin)} className="flex flex-col gap-4">
            <FloatingInput
              label="Email"
              type="email"
              autoComplete="email"
              {...registerLogin('email')}
              error={loginErrors.email?.message}
            />

            <div className="relative">
              <FloatingInput
                label="Mật khẩu"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
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
              className="mt-4 w-full bg-[#E50914] hover:bg-[#C11119] text-white text-[15px] font-semibold h-[50px] rounded-xl transition-all duration-300 disabled:opacity-50 active:scale-[0.98] shadow-lg shadow-[#E50914]/20 flex items-center justify-center gap-2"
            >
              {isLoggingIn ? (
                <>
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Đang xác thực...
                </>
              ) : 'Đăng nhập'}
            </button>

            <div className="flex items-center justify-end text-zinc-400 text-[13px] mt-2 px-1">
              <a href="#" className="hover:underline hover:text-white transition-colors">Bạn cần trợ giúp?</a>
            </div>
          </form>
        )}

        {/* ─── FORM ĐĂNG KÝ ─── */}
        {step === 'register' && (
          <form onSubmit={handleRegisterSubmit(onRegister)} className="flex flex-col gap-4 my-4">
            <FloatingInput
              label="Username"
              {...registerSignup('username')}
              error={registerErrors.username?.message}
            />
            <FloatingInput
              label="Tên hiển thị"
              {...registerSignup('displayName')}
              error={registerErrors.displayName?.message}
            />
            <FloatingInput
              label="Email"
              type="email"
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
              {isRegistering ? 'Đang gửi mã xác thực...' : 'Đăng ký ngay'}
            </button>
          </form>
        )}

        {/* ─── OTP VERIFICATION ─── */}
        {step === 'otp' && (
          <div className="flex flex-col items-center gap-6 my-4">
            <div className="w-20 h-20 rounded-full bg-[#E50914]/10 border border-[#E50914]/30 flex items-center justify-center">
              <ShieldCheck className="w-10 h-10 text-[#E50914]" />
            </div>
            <div className="text-center">
              <p className="text-zinc-300 text-[15px] leading-relaxed">
                Mã xác thực 6 chữ số đã được gửi đến
              </p>
              <p className="text-white font-semibold mt-1 flex items-center justify-center gap-2">
                <Mail className="w-4 h-4 text-[#E50914]" />
                {pendingEmail}
              </p>
            </div>

            <form onSubmit={handleOtpSubmit(onVerifyOtp)} className="w-full flex flex-col gap-4">
              <FloatingInput
                label="Nhập mã OTP (6 chữ số)"
                maxLength={6}
                {...registerOtp('code')}
                error={otpErrors.code?.message}
              />
              <button
                type="submit"
                disabled={isVerifying}
                className="w-full bg-[#E50914] hover:bg-[#C11119] text-white text-[15px] font-semibold h-[50px] rounded-xl transition-all duration-300 disabled:opacity-50 active:scale-[0.98] shadow-lg shadow-[#E50914]/20"
              >
                {isVerifying ? 'Đang xác thực...' : 'Xác nhận'}
              </button>
            </form>

            <button
              onClick={handleResendOtp}
              disabled={isResending}
              className="flex items-center gap-2 text-zinc-400 hover:text-white text-[13px] transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isResending ? 'animate-spin' : ''}`} />
              {isResending ? 'Đang gửi lại...' : 'Gửi lại mã OTP'}
            </button>
          </div>
        )}

        {/* Footer Toggle */}
        <div className="mt-12 sm:mt-10 text-zinc-400 text-[15px] text-center">
          {step === 'login' ? (
            <p>
              Bạn mới tham gia Cineflix?{' '}
              <button
                onClick={() => switchStep('register')}
                className="text-white font-medium hover:underline focus:outline-none ml-1 transition-colors"
              >
                Đăng ký ngay.
              </button>
            </p>
          ) : step === 'register' ? (
            <p>
              Đã có tài khoản?{' '}
              <button
                onClick={() => switchStep('login')}
                className="text-white font-medium hover:underline focus:outline-none ml-1 transition-colors"
              >
                Đăng nhập.
              </button>
            </p>
          ) : (
            <p>
              <button
                onClick={() => switchStep('register')}
                className="text-white font-medium hover:underline focus:outline-none transition-colors"
              >
                ← Quay lại đăng ký
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}