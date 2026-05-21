import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import authService, { getRoleIdFromToken } from '@/services/authService'
import type { VerifyPayload } from '@/types/auth'

export const useOtp = () => {
  const [isVerifying, setIsVerifying] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  
  const loginStore = useAuthStore((s) => s.login)
  const navigate = useNavigate()

  const handleVerify = async (data: VerifyPayload) => {
    setIsVerifying(true)
    setError(null)
    setSuccessMsg(null)
    try {
      const response = await authService.verify(data)
      if (!response.success || !response.data) {
        setError(response.message)
        return
      }
      const { token, username, email, displayName, avt, isVip } = response.data
      const roleId = getRoleIdFromToken(token)
      loginStore({ username, email, displayName, avt, roleId, isVip }, token)
      navigate('/')
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Xác thực thất bại.'
      setError(typeof msg === 'string' ? msg : 'Mã OTP không hợp lệ.')
    } finally {
      setIsVerifying(false)
    }
  }

  const handleResend = async (email: string) => {
    setIsResending(true)
    setError(null)
    setSuccessMsg(null)
    try {
      const response = await authService.resendOtp({ email })
      if (response.success) setSuccessMsg('Đã gửi lại mã OTP về email của bạn!')
      else setError(response.message)
    } catch {
      setError('Không thể gửi lại OTP. Vui lòng thử lại sau.')
    } finally {
      setIsResending(false)
    }
  }

  return { handleVerify, handleResend, isVerifying, isResending, error, setError, successMsg, setSuccessMsg }
}
