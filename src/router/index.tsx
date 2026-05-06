import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AuthPage } from '@/pages/AuthPage'
import { RegisterAdminPage } from '@/pages/RegisterAdminPage'
import { AdminLayout } from '@/layouts/AdminLayout'
import { MainLayout } from '@/layouts/MainLayout'
import { DashboardPage } from '@/pages/admin/DashboardPage'
import ProtectedRoute from '@/components/ProtectedRoute'

import { HomePage } from '@/pages/HomePage'

export const router = createBrowserRouter([
  { path: '/login',          element: <AuthPage /> },
  { path: '/register',       element: <AuthPage /> },
  { path: '/register-admin', element: <RegisterAdminPage /> },
  
  // Public/User Routes with MainLayout
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <HomePage /> },
      // Other routes like /movies, /tv-shows, /watch/:id, /profile will go here
    ]
  },
  {
    path: '/admin',
    element: <ProtectedRoute allowedRoles={['Admin']} />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { index: true, element: <Navigate to="/admin/dashboard" replace /> },
          { path: 'dashboard', element: <DashboardPage /> },
        ]
      }
    ]
  }
])