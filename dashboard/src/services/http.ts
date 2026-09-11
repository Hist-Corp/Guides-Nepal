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
http.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error?.response?.status === 401) {
      useAuthStore.getState().reset()
      if (!window.location.pathname.startsWith("/login")) {
        window.location.assign("/login")
      }
    }
    return Promise.reject(error)
  }
)
