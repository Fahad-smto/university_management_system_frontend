import { NextResponse, type NextRequest } from 'next/server';
import { authCookieOptions } from '@/lib/cookies';
import { ADMIN_ROLES, AUTH_ROUTES, PROTECTED_PREFIXES, STAFF_ROLES, roleHome } from '@/lib/routes';
import { getNewAccessToken } from '@/service/refreshToken';
import { jwtUtils } from '@/utils/jwt';

// Put the fresh access token into the request cookies too,
// so the page that renders in this same request already sees it.
function withUpdatedCookie(request: NextRequest, name: string, value: string): Headers {
  const headers = new Headers(request.headers);
  const jar = new Map<string, string>();

  for (const part of (request.headers.get('cookie') ?? '').split(';')) {
    const index = part.indexOf('=');
    if (index < 1) continue;
    jar.set(part.slice(0, index).trim(), part.slice(index + 1).trim());
  }

  jar.set(name, value);
  headers.set('cookie', Array.from(jar, ([key, val]) => `${key}=${val}`).join('; '));
  return headers;
}

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  let accessToken = request.cookies.get('accessToken')?.value;
  const refreshToken = request.cookies.get('refreshToken')?.value;

  let decodedAccessToken = accessToken ? jwtUtils.verifyToken(accessToken, process.env.JWT_ACCESS_SECRET) : null;
  const decodedRefreshToken = refreshToken ? jwtUtils.verifyToken(refreshToken, process.env.JWT_REFRESH_SECRET) : null;

  let newAccessToken: string | null = null;

  // Access token expired but the refresh token is still valid: get a new access token from the backend
  if (!decodedAccessToken?.success && decodedRefreshToken?.success && refreshToken) {
    const result = await getNewAccessToken(refreshToken);

    if (result.success) {
      newAccessToken = result.data.accessToken;
      accessToken = newAccessToken;
      decodedAccessToken = jwtUtils.verifyToken(newAccessToken, process.env.JWT_ACCESS_SECRET);
    }
  }

  const isLoggedIn = Boolean(decodedAccessToken?.success);
  const userRole = decodedAccessToken?.success ? String(decodedAccessToken.data.role ?? '') : null;

  // Every response we return carries the cookie changes (new token, or cleanup of dead tokens)
  const finalize = (response: NextResponse) => {
    if (newAccessToken) {
      response.cookies.set('accessToken', newAccessToken, authCookieOptions(newAccessToken));
    }
    if (!isLoggedIn && request.cookies.has('accessToken')) {
      response.cookies.delete('accessToken');
    }
    if (refreshToken && !decodedRefreshToken?.success) {
      response.cookies.delete('refreshToken');
    }
    return response;
  };

  const isAuthRoute = AUTH_ROUTES.some((route) => pathname === route || pathname.startsWith(route + '/'));
  const isProtectedRoute = PROTECTED_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(prefix + '/'));

  // Logged in users do not need the login or register pages
  if (isLoggedIn && isAuthRoute) {
    return finalize(NextResponse.redirect(new URL(roleHome(userRole), request.url)));
  }

  // Dashboard pages need a login
  if (!isLoggedIn && isProtectedRoute) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirectTo', pathname);
    return finalize(NextResponse.redirect(loginUrl));
  }

  // Role based access control (the backend checks again on every API call)
  if (isLoggedIn) {
    if (pathname.startsWith('/admin') && !ADMIN_ROLES.includes(userRole as never)) {
      return finalize(NextResponse.redirect(new URL('/not-found', request.url)));
    }
    if (pathname.startsWith('/moderator') && !STAFF_ROLES.includes(userRole as never)) {
      return finalize(NextResponse.redirect(new URL('/not-found', request.url)));
    }
  }

  const response = newAccessToken
    ? NextResponse.next({ request: { headers: withUpdatedCookie(request, 'accessToken', newAccessToken) } })
    : NextResponse.next();

  return finalize(response);
}

// The proxy only runs where it is needed, so public pages stay fast and cacheable
export const config = {
  matcher: ['/dashboard/:path*', '/moderator/:path*', '/admin/:path*', '/login', '/register', '/forgot-password', '/reset-password'],
};
