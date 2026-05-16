import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AuthPage } from '@/pages/auth/AuthPage'
import { RegisterAdminPage } from '@/pages/auth/RegisterAdminPage'
import { AdminLayout } from '@/layouts/AdminLayout'
import { MainLayout } from '@/layouts/MainLayout'
import { DashboardPage } from '@/pages/admin/DashboardPage'
import { MoviesManagementPage } from '@/pages/admin/MoviesManagementPage'
import { EpisodesManagementPage } from '@/pages/admin/EpisodesManagementPage'
import { AdminLoginPage } from '@/pages/admin/AdminLoginPage'
import ProtectedRoute from '@/components/ProtectedRoute'

import { HomePage } from '@/pages/client/HomePage'
import { MovieDetailPage } from '@/pages/client/MovieDetailPage'
import { WatchPage } from '@/pages/client/WatchPage'
import { ProfilePage } from '@/pages/client/ProfilePage'

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
      { path: 'movie/:id', element: <MovieDetailPage /> },
      { path: 'watch/:id', element: <WatchPage /> },
      { path: 'profile', element: <ProfilePage /> },
      // Other routes like /movies, /tv-shows will go here
    ]
  },
  { path: '/admin/login',    element: <AdminLoginPage /> },
  {
    path: '/admin',
    element: <ProtectedRoute allowedRoles={['Admin']} />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { index: true, element: <Navigate to="/admin/dashboard" replace /> },
          { path: 'dashboard', element: <DashboardPage /> },
          { path: 'movies', element: <MoviesManagementPage /> },
          { path: 'episodes', element: <EpisodesManagementPage /> },
        ]
      }
    ]
  }
])