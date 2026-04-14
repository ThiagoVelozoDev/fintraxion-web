import { Navigate, Outlet, useLocation } from 'react-router-dom'

const AUTH_KEY = 'fintraxion_auth'

export function ProtectedRoute() {
  const location = useLocation()
  const isAuthenticated = localStorage.getItem(AUTH_KEY) === 'true'

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return <Outlet />
}
