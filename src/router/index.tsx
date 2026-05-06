import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AuthPage } from '@/pages/AuthPage'
import { RegisterAdminPage } from '@/pages/RegisterAdminPage'
import { AdminLayout } from '@/layouts/AdminLayout'
import { DashboardPage } from '@/pages/admin/DashboardPage'

export const router = createBrowserRouter([
  { path: '/login',          element: <AuthPage /> },
  { path: '/register',       element: <AuthPage /> },
  { path: '/register-admin', element: <RegisterAdminPage /> },
  { path: '/',               element: <div className="text-white p-8">Home — coming soon</div> },
  { 
    path: '/admin', 
    element: <AdminLayout />,
    children: [
      { index: true, element: <Navigate to="/admin/dashboard" replace /> },
      { path: 'dashboard', element: <DashboardPage /> },
      // Other admin routes will go here
    ]
  }
])