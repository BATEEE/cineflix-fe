import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { RegisterFormData } from '@/features/auth/types'

export const useRegister = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const navigate = useNavigate()

  const handleRegister = async (data: RegisterFormData) => {
    setIsLoading(true)
    setError(null)
    try {
      // TODO: thay bằng API call thật
      await new Promise((r) => setTimeout(r, 1000))

      setSuccess(true)
      setTimeout(() => navigate('/login'), 1500)
    } catch {
      setError('Đăng ký thất bại, vui lòng thử lại.')
    } finally {
      setIsLoading(false)
    }
  }

  return { handleRegister, isLoading, error, success }
}