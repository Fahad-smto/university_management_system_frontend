import { BACKEND_API_URL } from '@/lib/env';

type RefreshResult = { success: true; data: { accessToken: string } } | { success: false; data: null };

// Asks the backend for a new access token. The backend reads the refresh token from the Cookie header.
export async function getNewAccessToken(refreshToken: string): Promise<RefreshResult> {
  try {
    const res = await fetch(`${BACKEND_API_URL}/auth/refresh-token`, {
      method: 'POST',
      headers: { Cookie: `refreshToken=${refreshToken}`, Accept: 'application/json' },
      cache: 'no-store',
    });
    const json = await res.json().catch(() => null);

    if (res.ok && json?.success && json?.data?.accessToken) {
      return { success: true, data: { accessToken: json.data.accessToken as string } };
    }
    return { success: false, data: null };
  } catch {
    return { success: false, data: null };
  }
}
