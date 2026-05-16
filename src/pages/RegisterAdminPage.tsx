import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Film, Eye, EyeOff, ShieldCheck, CheckCircle2, XCircle } from 'lucide-react'

// ── Schema validation ──────────────────────────────────────────────────────
const schema = z.object({
  username: z
    .string()
    .min(3, 'Username tối thiểu 3 ký tự')
    .max(50, 'Username tối đa 50 ký tự')
    .regex(/^[a-zA-Z0-9_]+$/, 'Chỉ được dùng chữ, số và dấu _'),
  displayName: z.string().min(2, 'Tên hiển thị tối thiểu 2 ký tự').max(100),
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu tối thiểu 6 ký tự').max(256),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Mật khẩu không khớp',
  path: ['confirmPassword'],
})

type FormData = z.infer<typeof schema>

// ── FloatingInput component (tái sử dụng style từ AuthPage) ───────────────
const FloatingInput = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string }
>(({ label, error, type = 'text', ...props }, ref) => (
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
          : 'hover:border-white/20 hover:bg-white/[0.05] focus:border-amber-400/60 focus:ring-4 focus:ring-amber-400/10'}
      `}
      {...props}
    />
    <label
      className={`
        absolute left-4 top-4 text-[15px] transition-all duration-300 ease-out pointer-events-none origin-[0]
        peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100
        peer-focus:-translate-y-2.5 peer-focus:scale-[0.75]
        peer-[&:not(:placeholder-shown)]:-translate-y-2.5 peer-[&:not(:placeholder-shown)]:scale-[0.75]
        ${error ? 'text-[#E50914]/80 peer-focus:text-[#E50914]' : 'text-zinc-400 peer-focus:text-amber-300'}
      `}
    >
      {label}
    </label>
    {error && (
      <p className="text-[#E50914] text-[12.5px] mt-1.5 px-1 font-medium">{error}</p>
    )}
  </div>
))
FloatingInput.displayName = 'FloatingInput'

// ── Main Page ─────────────────────────────────────────────────────────────
export const RegisterAdminPage = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm]   = useState(false)
  const [result, setResult] = useState<{
    type: 'success' | 'error'
    message: string
    data?: Record<string, unknown>
  } | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormData) => {
    setResult(null)
    try {
      const { default: authService } = await import('@/services/authService')
      const response = await authService.registerAdmin({
        username:    data.username,
        displayName: data.displayName,
        email:       data.email,
        password:    data.password,
      })

      if (response.success) {
        setResult({
          type: 'success',
          message: `✅ Tạo tài khoản Admin thành công!`,
          data: response as any,
        })
        reset()
      } else {
        setResult({
          type: 'error',
          message: response.message ?? 'Lỗi không xác định',
        })
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Không kết nối được backend. Hãy chắc chắn server đang chạy.'
      setResult({
        type: 'error',
        message: typeof msg === 'string' ? msg : 'Lỗi hệ thống.',
      })
    }
  }

  return (
    <div className="relative flex min-h-screen sm:items-center justify-center bg-black selection:bg-amber-500/20">

      {/* Background */}
      <div
        className="hidden sm:block absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-40"
        style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=2070&auto=format&fit=crop")' }}
      />
      <div className="hidden sm:block absolute inset-0 z-0 bg-gradient-to-b from-black/95 via-black/50 to-black/95" />

      {/* Header Logo */}
      <div className="absolute top-0 left-0 p-5 sm:p-8 z-20 w-full bg-gradient-to-b from-black/80 to-transparent sm:bg-none">
        <div className="flex items-center gap-2 text-[#E50914] font-black text-3xl tracking-tighter">
          <Film className="w-8 h-8" />
          <span>CINEFLIX</span>
        </div>
      </div>

      {/* Card */}
      <div className="relative z-10 w-full max-w-[480px] flex flex-col pt-24 px-6 pb-10 sm:pt-12 sm:px-12 sm:pb-14 sm:bg-black/65 sm:rounded-2xl sm:backdrop-blur-xl sm:border sm:border-amber-400/10 min-h-screen sm:min-h-0 sm:shadow-2xl my-4">

        {/* Title */}
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-xl bg-amber-400/10 border border-amber-400/20">
            <ShieldCheck className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <h2 className="text-[28px] font-bold text-white tracking-tight leading-tight">
              Tạo tài khoản Admin
            </h2>
            <p className="text-zinc-500 text-[13px] mt-0.5">Dành cho mục đích kiểm thử</p>
          </div>
        </div>

        {/* Warning badge */}
        <div className="mt-5 mb-6 px-4 py-3 rounded-xl bg-amber-400/[0.07] border border-amber-400/20 text-amber-300 text-[13px] leading-relaxed">
          ⚠️ Trang này chỉ dùng để test. Tài khoản được tạo sẽ có quyền <strong>Admin</strong> đầy đủ.
        </div>

        {/* Alert result */}
        {result && (
          <div
            className={`mb-5 flex items-start gap-3 px-4 py-3.5 rounded-xl text-[14px] leading-relaxed border ${
              result.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                : 'bg-[#E50914]/10 border-[#E50914]/20 text-red-300'
            }`}
          >
            {result.type === 'success'
              ? <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
              : <XCircle className="w-5 h-5 shrink-0 mt-0.5" />}
            <div>
              <p className="font-semibold">{result.message}</p>
              {result.data && (
                <pre className="mt-2 text-[11px] text-zinc-400 overflow-x-auto whitespace-pre-wrap">
                  {JSON.stringify(result.data, null, 2)}
                </pre>
              )}
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <FloatingInput
            id="admin-username"
            label="Username"
            autoComplete="username"
            {...register('username')}
            error={errors.username?.message}
          />

          <FloatingInput
            id="admin-display-name"
            label="Tên hiển thị"
            autoComplete="name"
            {...register('displayName')}
            error={errors.displayName?.message}
          />

          <FloatingInput
            id="admin-email"
            label="Email"
            type="email"
            autoComplete="email"
            {...register('email')}
            error={errors.email?.message}
          />

          {/* Password */}
          <div className="relative">
            <FloatingInput
              id="admin-password"
              label="Mật khẩu"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              {...register('password')}
              error={errors.password?.message}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-[18px] text-zinc-400 hover:text-white transition-colors"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          {/* Confirm Password */}
          <div className="relative">
            <FloatingInput
              id="admin-confirm-password"
              label="Xác nhận mật khẩu"
              type={showConfirm ? 'text' : 'password'}
              autoComplete="new-password"
              {...register('confirmPassword')}
              error={errors.confirmPassword?.message}
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-4 top-[18px] text-zinc-400 hover:text-white transition-colors"
            >
              {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          <button
            id="btn-register-admin"
            type="submit"
            disabled={isSubmitting}
            className="mt-3 w-full bg-amber-500 hover:bg-amber-400 text-black text-[15px] font-bold h-[52px] rounded-xl transition-all duration-300 disabled:opacity-50 active:scale-[0.98] shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Đang tạo tài khoản...
              </>
            ) : (
              <>
                <ShieldCheck className="w-5 h-5" />
                Tạo tài khoản Admin
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <p className="mt-8 text-[13px] text-zinc-600 text-center">
          API endpoint:{' '}
          <code className="text-zinc-400 bg-white/[0.05] px-1.5 py-0.5 rounded text-[12px]">
            POST /api/auth/register-admin
          </code>
        </p>
      </div>
    </div>
  )
}
