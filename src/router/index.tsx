import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AuthPage } from '@/pages/auth/AuthPage'
import { RegisterAdminPage } from '@/pages/auth/RegisterAdminPage'
import { RegisterPartnerPage } from '@/pages/auth/RegisterPartnerPage'
import { AdminLayout } from '@/layouts/AdminLayout'
import { MainLayout } from '@/layouts/MainLayout'
import { DashboardPage } from '@/pages/admin/DashboardPage'
import { MoviesManagementPage } from '@/pages/admin/MoviesManagementPage'
import { EpisodesManagementPage } from '@/pages/admin/EpisodesManagementPage'
import { GenresManagementPage } from '@/pages/admin/GenresManagementPage'
import { StudiosManagementPage } from '@/pages/admin/StudiosManagementPage'
import { PersonsManagementPage } from '@/pages/admin/PersonsManagementPage'
import { UsersManagementPage } from '@/pages/admin/UsersManagementPage'
import { CommentsManagementPage } from '@/pages/admin/CommentsManagementPage'
import { StudioLayout } from '@/layouts/StudioLayout'
import { StudioDashboard } from '@/pages/studio/StudioDashboard'
import { StudioMoviesPage } from '@/pages/studio/StudioMoviesPage'
import { StudioSettingsPage, StudioCommentsPage, StudioRevenuePage } from '@/pages/studio/StudioOtherPages'
import ProtectedRoute from '@/components/ProtectedRoute'

import { HomePage } from '@/pages/client/HomePage'
import { MoviesPage } from '@/pages/client/film/MoviesPage'
import { TVShowsPage } from '@/pages/client/series/TVShowsPage'
import { ExplorePage } from '@/pages/client/ExplorePage'
import { MovieDetailPage } from '@/pages/client/MovieDetailPage'
import { WatchPage } from '@/pages/client/my_list/WatchPage'
import { ProfilePage } from '@/pages/client/ProfilePage'
import { SearchPage } from '@/pages/client/SearchPage'

export const router = createBrowserRouter([
  { path: '/login',          element: <AuthPage /> },
  { path: '/register',       element: <AuthPage /> },
  { path: '/register-admin', element: <RegisterAdminPage /> },
  { path: '/register-partner', element: <RegisterPartnerPage /> },
  
  // Public/User Routes with MainLayout
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'movies', element: <MoviesPage /> },
      { path: 'tv-shows', element: <TVShowsPage /> },
      { path: 'explore', element: <ExplorePage /> },
      { path: 'movie/:id', element: <MovieDetailPage /> },
      { path: 'watch/:id', element: <WatchPage /> },
      { path: 'profile', element: <ProfilePage /> },
      { path: 'search', element: <SearchPage /> },
      // Other routes like /movies, /tv-shows will go here
    ]
  },
  {
    path: '/admin',
    element: <ProtectedRoute allowedRoles={[1, 3]} />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { index: true, element: <Navigate to="/admin/dashboard" replace /> },
          { path: 'dashboard', element: <DashboardPage /> },
          { path: 'movies', element: <MoviesManagementPage /> },
          { path: 'episodes', element: <EpisodesManagementPage /> },
          { path: 'genres', element: <GenresManagementPage /> },
          { path: 'studios', element: <StudiosManagementPage /> },
          { path: 'persons', element: <PersonsManagementPage /> },
          { path: 'users', element: <UsersManagementPage /> },
          { path: 'comments', element: <CommentsManagementPage /> },
        ]
      }
    ]
  },
  {
    path: '/studio',
    element: <ProtectedRoute allowedRoles={[1, 3]} />,
    children: [
      {
        element: <StudioLayout />,
        children: [
          { index: true, element: <Navigate to="/studio/dashboard" replace /> },
          { path: 'dashboard', element: <StudioDashboard /> },
          { path: 'movies', element: <StudioMoviesPage /> },
          { path: 'comments', element: <StudioCommentsPage /> },
          { path: 'revenue', element: <StudioRevenuePage /> },
          { path: 'settings', element: <StudioSettingsPage /> },
        ]
      }
    ]
  }
])