import { ReactNode } from "react"
import { Navigate } from "react-router-dom"
import { useAuthStore } from "../state/authStore"

export default function RequireAuth({ children }: { children: ReactNode }) {
  const { token, role } = useAuthStore()
  if (!token || !role) return <Navigate to="/dashboard/login" replace />
  return <>{children}</>
}
