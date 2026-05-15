export interface LoginPayload {
  username: string;
  password: string;
}

export interface AuthResponse {
  id: number;
  token: string;
  username: string;
  displayName: string;
  roleId: number;
  roleName: string;
}

export interface User {
  id: number;
  username: string;
  displayName: string;
  roleId: number;
  roleName: string;
}