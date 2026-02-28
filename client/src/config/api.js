/**
 * API base URL for backend requests.
 * - In dev: Use empty string so Vite proxy forwards /api to backend
 * - In prod: Set VITE_API_URL to your backend URL (e.g. https://api.yourdomain.com)
 */
export const API_BASE = import.meta.env.VITE_API_URL || '';
