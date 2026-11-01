import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { authCookieOptions } from '@/lib/cookies';
import { BACKEND_API_URL } from '@/lib/env';
import { getNewAccessToken } from '@/service/refreshToken';
import { jwtUtils } from '@/utils/jwt';

export const dynamic = 'force-dynamic';

async function fetchMe(accessToken: string, refreshToken?: string) {
  const cookie = [`accessToken=${accessToken}`, refreshToken ? `refreshToken=${refreshToken}` : '']
    .filter(Boolean)
    .join('; ');

  try {
    const res = await fetch(`${BACKEND_API_URL}/users/me`, {
      headers: { Cookie: cookie, Accept: 'application/json' },
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.success ? json.data : null;
  } catch {
    return null;
  }
}

// Used by the public header (client side) to know who is logged in.
// Public pages stay static, only this tiny request is dynamic.
export async function GET() {
  const store = await cookies();
  let access = store.get('accessToken')?.value;
  const refresh = store.get('refreshToken')?.value;
  let refreshedToken: string | null = null;

  if ((!access || jwtUtils.isExpired(access)) && refresh) {
    const result = await getNewAccessToken(refresh);
    if (result.success) {
      access = result.data.accessToken;
      refreshedToken = access;
    }
  }

  const user = access ? await fetchMe(access, refresh) : null;

  const response = NextResponse.json(
    {
      user: user
        ? { id: user.id, name: user.name, email: user.email, role: user.role, profileImage: user.profileImage ?? null }
        : null,
    },
    { headers: { 'Cache-Control': 'private, no-store' } },
  );

  if (refreshedToken) {
    response.cookies.set('accessToken', refreshedToken, authCookieOptions(refreshedToken));
  }

  return response;
}
