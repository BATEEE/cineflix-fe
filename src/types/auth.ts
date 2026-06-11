// Auth DTOs - khớp với backend mới (ApiResponse<AuthResponseDto>)
export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
  displayName: string;
  avt?: string;
}

export interface RegisterStudioOwnerPayload {
  username: string;
  email: string;
  password: string;
  displayName: string;
  studioName: string;
  country: string;
}

export interface VerifyPayload {
  email: string;
  code: string;
}

export interface ResendPayload {
  email: string;
}

export interface GoogleLoginPayload {
  credential: string;
}

// AuthResponseDto từ backend mới: { token, username, email, displayName, avt }
export interface AuthResponseData {
  token: string;
  username: string;
  email: string;
  displayName: string;
  avt: string | null;
  isVip: boolean;
}

// ApiResponse<T> wrapper
export interface ApiResponse<T = void> {
  success: boolean;
  message: string;
  data?: T;
}

// User stored in Zustand
export interface User {
  id?: number;
  username: string;
  email: string;
  displayName: string;
  avt: string | null;
  roleId: number;  // 1 = Admin, 2 = User (decoded from JWT)
  isVip?: boolean;
}