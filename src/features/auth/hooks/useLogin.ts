import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import type { LoginFormData } from '@/features/auth/types'

export const useLogin = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const login = useAuthStore((s) => s.login)
  const navigate = useNavigate()

  const handleLogin = async (data: LoginFormData) => {
    setIsLoading(true)
    setError(null)
    try {
      // TODO: thay bằng API call thật
      await new Promise((r) => setTimeout(r, 1000))

      // Mock user tạm
      login(
        { id: '1', fullName: 'Nguyen Van A', email: data.email, role: 'user' },
        'mock-token-123'
      )
      navigate('/')
    } catch {
      setError('Email hoặc mật khẩu không đúng.')
    } finally {
      setIsLoading(false)
    }
  }

  return { handleLogin, isLoading, error }
}