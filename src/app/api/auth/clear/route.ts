import { NextResponse, type NextRequest } from 'next/server';

// Used when a token is still valid but the backend no longer accepts it (blocked or deleted user).
// It removes the cookies and sends the user to the login page.
export function GET(request: NextRequest) {
  const response = NextResponse.redirect(new URL('/login', request.url));
  response.cookies.delete('accessToken');
  response.cookies.delete('refreshToken');
  return response;
}
