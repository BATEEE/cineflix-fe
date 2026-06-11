import { useState } from 'react'
import type { RegisterPayload } from '@/types/auth'
import authService from '@/services/authService'

export const useRegister = (onSuccess: (email: string, message: string) => void) => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleRegister = async (data: RegisterPayload) => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await authService.register(data)
      if (!response.success) {
        setError(response.message)
        return
      }
      onSuccess(data.email, 'Mã xác thực đã được gửi về email của bạn!')
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại.'
      setError(typeof msg === 'string' ? msg : 'Đã có lỗi xảy ra.')
    } finally {
      setIsLoading(false)
    }
  }

  return { handleRegister, isLoading, error, setError }
}