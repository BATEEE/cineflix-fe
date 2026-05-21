import axios from 'axios';

const axiosClient = axios.create({
  baseURL: 'http://localhost:5063', // Backend URL
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor để tự động đính kèm Token vào Header
axiosClient.interceptors.request.use(
  (config) => {
    const authStorage = localStorage.getItem('auth-storage');
    if (authStorage) {
      const { state } = JSON.parse(authStorage);
      const token = state?.token;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor để xử lý lỗi 401 (Hết hạn token)
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest.url?.includes('/login')) {
      // Có thể xử lý logout hoặc refresh token ở đây
      localStorage.removeItem('auth-storage');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
