import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

interface ProtectedRouteProps {
  allowedRoles?: (number | string)[]; // Danh sách các roleId hoặc roleName được phép truy cập
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { isAuthenticated, user } = useAuthStore();

  // 1. Nếu chưa đăng nhập -> Chuyển về trang login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 2. Nếu đã đăng nhập nhưng không có role phù hợp -> Chuyển về trang chủ
  if (allowedRoles && user) {
    const hasRole = allowedRoles.includes(user.roleId) || allowedRoles.includes(user.roleName);
    if (!hasRole) {
      return <Navigate to="/" replace />;
    }
  }

  // 3. Nếu thỏa mãn -> Hiển thị nội dung bên trong (Outlet)
  return <Outlet />;
};

export default ProtectedRoute;
