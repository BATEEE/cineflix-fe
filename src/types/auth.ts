export interface LoginPayload {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  username: string;
  displayName: string;
  roleId: number;
}

export interface User {
  id: string;
  username: string;
  displayName: string;
  roleId: number;
}