import axios from "axios"
import { useAuthStore } from "../state/authStore"
import { API_BASE_URL } from "../config/api"

export const http = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true
})

http.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) {
    config.headers = config.headers ?? {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// When the backend rejects the token (expired after 30 min, revoked, or a
// stale dev token), clear the session so the app falls back to the login
// page instead of silently rendering empty lists everywhere.
// IMPORTANT: only react to 401s on requests that actually carried a token —
// a 401 from the /auth/login attempt itself (wrong password) must NOT clear
// the session or bounce the user anywhere.
http.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error?.response?.status === 401) {
      const hadToken = Boolean(error?.config?.headers?.Authorization)
      if (hadToken) {
        useAuthStore.getState().reset()
        // /dashboard/login is the actual login route — redirecting to "/login"
        // would hit the catch-all and dump the user on the public home page.
        if (!window.location.pathname.startsWith("/dashboard/login")) {
          window.location.assign("/dashboard/login")
        }
      }
    }
    return Promise.reject(error)
  }
)
