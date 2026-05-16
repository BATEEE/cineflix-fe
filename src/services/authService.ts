import axiosClient from '../api/axiosClient';
import type { LoginPayload, RegisterPayload, VerifyPayload, ResendPayload, GoogleLoginPayload, ApiResponse, AuthResponseData } from '../types/auth';

// Helper: decode JWT payload để lấy roleId
function decodeJwtPayload(token: string): Record<string, any> {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
  } catch {
    return {};
  }
}

export function getRoleIdFromToken(token: string): number {
  const payload = decodeJwtPayload(token);
  // JWT claim key: "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
  const roleKey = Object.keys(payload).find(k => k.toLowerCase().includes('role'));
  return roleKey ? parseInt(payload[roleKey]) : 2;
}

const authService = {
  // Login bằng email (backend mới)
  login: async (payload: LoginPayload): Promise<ApiResponse<AuthResponseData>> => {
    const response = await axiosClient.post('/api/auth/login', payload);
    return response.data;
  },

  // Đăng ký (gửi OTP)
  register: async (payload: RegisterPayload): Promise<ApiResponse> => {
    const response = await axiosClient.post('/api/auth/register', payload);
    return response.data;
  },

  // Xác nhận OTP
  verify: async (payload: VerifyPayload): Promise<ApiResponse<AuthResponseData>> => {
    const response = await axiosClient.post('/api/auth/verify', payload);
    return response.data;
  },

  // Gửi lại OTP
  resendOtp: async (payload: ResendPayload): Promise<ApiResponse> => {
    const response = await axiosClient.post('/api/auth/resend-otp', payload);
    return response.data;
  },

  // Đăng nhập Google
  googleLogin: async (payload: GoogleLoginPayload): Promise<ApiResponse<AuthResponseData>> => {
    const response = await axiosClient.post('/api/auth/google-login', payload);
    return response.data;
  },

  // Tạo tài khoản Admin (không cần OTP)
  registerAdmin: async (payload: RegisterPayload): Promise<ApiResponse> => {
    const response = await axiosClient.post('/api/auth/register-admin', payload);
    return response.data;
  },
};

export default authService;
