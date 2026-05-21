import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import authService, { getRoleIdFromToken } from '@/services/authService'
import type { LoginPayload } from '@/types/auth'

export const useLogin = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const loginStore = useAuthStore((s) => s.login)
  const navigate = useNavigate()

  const handleLogin = async (data: LoginPayload) => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await authService.login(data)
      if (!response.success || !response.data) {
        setError(response.message)
        return
      }
      const { token, username, displayName, email, avt, isVip } = response.data
      const roleId = getRoleIdFromToken(token)
      loginStore({ username, email, displayName, avt, roleId, isVip }, token)
      
      if (roleId === 1) {
        navigate('/admin/dashboard')
      } else if (roleId === 3) {
        navigate('/studio/dashboard')
      } else {
        navigate('/')
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Đăng nhập thất bại. Vui lòng thử lại.'
      setError(typeof msg === 'string' ? msg : 'Email hoặc mật khẩu không đúng.')
    } finally {
      setIsLoading(false)
    }
  }

  return { handleLogin, isLoading, error, setError }
}