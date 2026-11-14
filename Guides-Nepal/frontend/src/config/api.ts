/**
 * Centralized API configuration for the frontend.
 * 
 * The backend is deployed on Render at https://guides-nepal.onrender.com
 * In development, we use the Vite proxy (/api/v1) to avoid CORS issues.
 */
export const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? '/api/v1' : 'https://guides-nepal.onrender.com/api/v1');

export const getApiUrl = (path: string): string => {
  return `${API_BASE_URL}${path}`;
};