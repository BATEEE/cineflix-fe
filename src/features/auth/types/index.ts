export interface LoginFormData {
  email: string
  password: string
}

export interface RegisterFormData {
  fullName: string
  email: string
  password: string
  confirmPassword: string
}

export interface User {
  id: string
  fullName: string
  email: string
  role: 'user' | 'admin'
}