import { jwtUtils } from '@/utils/jwt';

// Cookie options for the tokens we store on the frontend domain.
// The cookie lives exactly as long as the token itself.
export function authCookieOptions(token: string) {
  const payload = jwtUtils.decodeToken(token);
  const now = Math.floor(Date.now() / 1000);
  const maxAge = payload?.exp ? Math.max(payload.exp - now, 60) : 60 * 60 * 24;

  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge,
  };
}
