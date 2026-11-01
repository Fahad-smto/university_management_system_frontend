'use server';

import { cookies } from 'next/headers';
import { api, backendFetch, getAuthCookieHeader } from '@/lib/api';
import { fail, fromApi, type ActionResult } from '@/lib/action';
import { authCookieOptions } from '@/lib/cookies';
import { roleHome, safeRedirect } from '@/lib/routes';
import { jwtUtils } from '@/utils/jwt';

type LoginData = { redirectTo: string };

// The backend sets its tokens as cookies on ITS domain. The browser never sees them,
// so we copy the tokens from the Set-Cookie headers into cookies on OUR domain.
async function startSession(res: Response, body: { data?: { accessToken?: string; refreshToken?: string } }) {
  const headers = res.headers as Headers & { getSetCookie?: () => string[] };
  const found: Record<string, string> = {};

  for (const raw of headers.getSetCookie?.() ?? []) {
    const pair = raw.split(';')[0] ?? '';
    const index = pair.indexOf('=');
    if (index < 1) continue;
    const name = pair.slice(0, index).trim();
    const value = pair.slice(index + 1).trim();
    if ((name === 'accessToken' || name === 'refreshToken') && value) found[name] = value;
  }

  // Fallback: tokens in the response body
  if (!found.accessToken && body?.data?.accessToken) found.accessToken = body.data.accessToken;
  if (!found.refreshToken && body?.data?.refreshToken) found.refreshToken = body.data.refreshToken;

  if (!found.accessToken) return null;

  const store = await cookies();
  for (const [name, value] of Object.entries(found)) {
    store.set(name, value, authCookieOptions(value));
  }
  return found.accessToken;
}

async function loginWith(email: string, password: string, redirectTo?: string | null): Promise<ActionResult<LoginData>> {
  try {
    const res = await backendFetch('/auth/login', { method: 'POST', body: { email, password }, auth: false });
    const json = await res.json().catch(() => null);

    if (!json?.success) {
      return fail({ success: false, status: res.status, message: json?.message ?? 'Login failed', errors: json?.errors ?? [] });
    }

    const token = await startSession(res, json);
    if (!token) return { success: false, message: 'Login worked but no session was returned. Please try again.' };

    const role = String(jwtUtils.decodeToken(token)?.role ?? '');
    return { success: true, message: 'Welcome back!', data: { redirectTo: safeRedirect(redirectTo) ?? roleHome(role) } };
  } catch {
    return { success: false, message: 'Could not reach the server. Please try again.' };
  }
}

export async function loginAction(input: {
  email: string;
  password: string;
  redirectTo?: string | null;
}): Promise<ActionResult<LoginData>> {
  return loginWith(input.email, input.password, input.redirectTo);
}

export async function registerAction(input: {
  name: string;
  email: string;
  password: string;
  phone?: string;
}): Promise<ActionResult<LoginData>> {
  const result = await api('/auth/register', {
    method: 'POST',
    auth: false,
    body: { name: input.name, email: input.email, password: input.password, ...(input.phone ? { phone: input.phone } : {}) },
  });
  if (!result.success) return fail(result);

  // Log the new user in right away
  const session = await loginWith(input.email, input.password);
  if (session.success) return { success: true, message: 'Account created. Welcome aboard!', data: { redirectTo: '/dashboard' } };
  return { success: true, message: 'Account created. Please log in.', data: { redirectTo: '/login' } };
}

export async function googleLoginAction(idToken: string, redirectTo?: string | null): Promise<ActionResult<LoginData>> {
  try {
    const res = await backendFetch('/auth/google-login', { method: 'POST', body: { idToken }, auth: false });
    const json = await res.json().catch(() => null);

    if (!json?.success) {
      return fail({ success: false, status: res.status, message: json?.message ?? 'Google login failed', errors: json?.errors ?? [] });
    }

    const token = await startSession(res, json);
    if (!token) return { success: false, message: 'Google login worked but no session was returned.' };

    const role = String(jwtUtils.decodeToken(token)?.role ?? '');
    return { success: true, message: 'Signed in with Google', data: { redirectTo: safeRedirect(redirectTo) ?? roleHome(role) } };
  } catch {
    return { success: false, message: 'Could not reach the server. Please try again.' };
  }
}

export async function logoutAction(): Promise<ActionResult> {
  try {
    // tell the backend too (best effort)
    const cookie = await getAuthCookieHeader();
    await backendFetch('/auth/logout', { method: 'POST', auth: false, body: {} }).catch(() => null);
    void cookie;
  } finally {
    const store = await cookies();
    store.delete('accessToken');
    store.delete('refreshToken');
  }
  return { success: true, message: 'Logged out' };
}

export async function forgotPasswordAction(email: string): Promise<ActionResult> {
  const result = await api('/auth/forgot-password', { method: 'POST', auth: false, body: { email } });
  return fromApi(result);
}

export async function resetPasswordAction(input: {
  email: string;
  otp: string;
  newPassword: string;
}): Promise<ActionResult> {
  const result = await api('/auth/reset-password', { method: 'POST', auth: false, body: input });
  return fromApi(result);
}

export async function changePasswordAction(input: { oldPassword: string; newPassword: string }): Promise<ActionResult> {
  const result = await api('/auth/change-password', { method: 'POST', body: input });
  return fromApi(result);
}
