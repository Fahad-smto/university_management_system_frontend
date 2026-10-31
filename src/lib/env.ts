// Server side only. The backend base URL (always ends with /api/v1, no trailing slash).
export const BACKEND_API_URL = (
  process.env.BACKEND_API_URL ?? 'https://university-org-management-backend.vercel.app/api/v1'
).replace(/\/+$/, '');
