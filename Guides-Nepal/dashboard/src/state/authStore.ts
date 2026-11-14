import { create } from "zustand"
import type { Role } from "../utils/roles"

type User = {
  id: number
  email: string
  firstName?: string
  lastName?: string
  role: Role
}

type AuthState = {
  token: string | null
  role: Role | null
  user: User | null
  loading: boolean
  error: string | null
  setToken: (t: string | null) => void
  setRole: (r: Role | null) => void
  setUser: (u: User | null) => void
  setLoading: (v: boolean) => void
  setError: (e: string | null) => void
  reset: () => void
}

function readPersisted() {
  try {
    const token = localStorage.getItem("gn_token")
    const role = localStorage.getItem("gn_role") as Role | null
    const raw = localStorage.getItem("gn_user")
    const user = raw ? (JSON.parse(raw) as User) : null
    return { token, role, user }
  } catch {
    return { token: null, role: null, user: null }
  }
}

export const useAuthStore = create<AuthState>((set) => {
  const initial = readPersisted()
  return {
    token: initial.token,
    role: initial.role,
    user: initial.user,
    loading: false,
    error: null,
    setToken: (t) => set({ token: t }),
    setRole: (r) => set({ role: r }),
    setUser: (u) => set({ user: u }),
    setLoading: (v) => set({ loading: v }),
    setError: (e) => set({ error: e }),
    reset: () => {
      try {
        localStorage.removeItem("gn_token")
        localStorage.removeItem("gn_role")
        localStorage.removeItem("gn_user")
      } catch {}
      set({ token: null, role: null, user: null, loading: false, error: null })
    }
  }
})
