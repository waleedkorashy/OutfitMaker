import axios from 'axios';

// Base URL for the ASP.NET Core backend.
// Override via VITE_API_URL env var, otherwise default to local dev server.
export const API_BASE_URL =
  (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') ||
  'http://localhost:5111';

export const API_IMAGE_URL = `${API_BASE_URL}/Images`;

// Base URL for the AI model container (SnapDeploy free tier).
// Called directly from the browser (CORS-enabled) because the ASP.NET proxy
// is blocked by SnapDeploy's Cloudflare bot-fight protection.
export const AI_BASE_URL =
  (import.meta.env.VITE_AI_API_URL as string | undefined)?.replace(/\/$/, '') ||
  'https://outfitmaker-ai-models-05e9a.containers.snapdeploy.app';

// SnapDeploy platform wake endpoint — free-tier containers sleep on idle.
export const AI_WAKE_URL = 'https://snapdeploy.dev/api/public/wake/outfitmaker-ai-models-05e9a';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach bearer token to every request when present.
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('outfitmaker_token');
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Centralized token storage helpers
export function setStoredToken(token: string | null) {
  if (token) localStorage.setItem('outfitmaker_token', token);
  else localStorage.removeItem('outfitmaker_token');
}

export function getStoredToken(): string | null {
  return localStorage.getItem('outfitmaker_token');
}
