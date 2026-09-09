/**
 * Centralized API configuration for the dashboard.
 * 
 * The backend is deployed on Render at https://guides-nepal.onrender.com
 * In development, we use the local backend at http://localhost:8000
 */
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.DEV ? 'http://localhost:8000/api/v1' : 'https://guides-nepal.onrender.com/api/v1');

export const getApiUrl = (path: string): string => {
  return `${API_BASE_URL}${path}`;
};

/**
 * URL of the real frontend site. The live page editor embeds the actual
 * frontend page (with ?cms_edit=1) so the writer previews and edits the
 * exact real page, not an approximation.
 */
export const FRONTEND_URL =
  import.meta.env.VITE_FRONTEND_URL ||
  (import.meta.env.DEV ? 'http://localhost:5175' : 'https://guides-nepal.onrender.com');