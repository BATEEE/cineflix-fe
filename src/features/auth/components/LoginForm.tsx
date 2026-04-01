import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useLogin } from '@/features/auth/hooks/useLogin'
import type { LoginFormData } from '@/features/auth/types'

const schema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu tối thiểu 6 ký tự'),
})

const inputClass = `
  w-full h-11 px-3.5 rounded-xl text-sm text-white placeholder:text-white/20
  bg-white/[0.05] border border-white/[0.09]
  focus:outline-none focus:border-purple-500/50 focus:bg-purple-500/[0.06]
  focus:ring-2 focus:ring-purple-500/10 transition-all
`

export const LoginForm = () => {
  const { handleLogin, isLoading, error } = useLogin()
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(schema),
  })

  return (
    <form onSubmit={handleSubmit(handleLogin)} className="space-y-4">
      {error && (
        <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="space-y-1.5">
        <label className="block text-[11px] font-medium text-white/40 uppercase tracking-widest">Email</label>
        <input {...register('email')} type="email" placeholder="example@email.com" className={inputClass} />
        {errors.email && <p className="text-xs text-red-400">{errors.email.message}</p>}
      </div>

      <div className="space-y-1.5">
        <label className="block text-[11px] font-medium text-white/40 uppercase tracking-widest">Mật khẩu</label>
        <input {...register('password')} type="password" placeholder="Nhập mật khẩu" className={inputClass} />
        {errors.password && <p className="text-xs text-red-400">{errors.password.message}</p>}
      </div>

      <div className="flex justify-end">
        <button type="button" className="text-xs text-purple-400 hover:text-purple-300 transition-colors">
          Quên mật khẩu?
        </button>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full h-11 rounded-xl bg-gradient-to-r from-red-600 to-purple-700 text-white text-sm font-semibold hover:opacity-90 active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
      </button>

      <div className="flex items-center gap-3 text-white/20 text-xs">
        <div className="flex-1 h-px bg-white/[0.07]" />
        hoặc tiếp tục với
        <div className="flex-1 h-px bg-white/[0.07]" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        {['Google', 'Facebook'].map((s) => (
          <button
            key={s}
            type="button"
            className="h-11 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/50 hover:text-white hover:bg-white/[0.07] hover:border-white/15 text-sm transition-all"
          >
            {s}
          </button>
        ))}
      </div>
    </form>
  )
}