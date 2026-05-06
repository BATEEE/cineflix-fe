import axiosClient from '../api/axiosClient';
import { LoginPayload, AuthResponse } from '../types/auth';

const authService = {
  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    const response = await axiosClient.post('/api/auth/login', payload);
    return response.data;
  },
  
  registerAdmin: async (payload: any) => {
    const response = await axiosClient.post('/api/auth/register-admin', payload);
    return response.data;
  }
};

export default authService;
