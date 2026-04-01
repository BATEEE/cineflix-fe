import { createBrowserRouter } from 'react-router-dom'
import { AuthPage } from '@/pages/AuthPage'

export const router = createBrowserRouter([
  { path: '/login', element: <AuthPage /> },
  { path: '/register', element: <AuthPage /> },
  { path: '/', element: <div className="text-white p-8">Home — coming soon</div> },
])