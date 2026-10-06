import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function AuthGuard({ children }: { children: ReactNode }) {
  const { user, ready, configured } = useAuth()
  const location = useLocation()
  if (!ready) return <div className="page-shell"><div className="skeleton h-32 rounded-[2rem]" /></div>
  if (!configured || !user) return <Navigate to="/sign-in" state={{ from: location.pathname + location.search }} replace />
  return children
}
