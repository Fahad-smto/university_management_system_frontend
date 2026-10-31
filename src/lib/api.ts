import 'server-only';
import { cookies } from 'next/headers';
import { BACKEND_API_URL } from './env';
import type { ApiResult } from './types';

type Primitive = string | number | boolean | null | undefined;

export type ApiOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  query?: Record<string, Primitive>;
  body?: unknown; // sent as JSON
  formData?: FormData; // sent as multipart (profile image)
  auth?: boolean; // forward the login cookies (default true)
  revalidate?: number | false; // cache seconds for public GET requests (only when auth is false)
  tags?: string[];
};

// The backend reads the tokens from cookies, so we forward the ones stored on our domain
export async function getAuthCookieHeader(): Promise<string> {
  const store = await cookies();
  const parts: string[] = [];
  const access = store.get('accessToken')?.value;
  const refresh = store.get('refreshToken')?.value;
  if (access) parts.push(`accessToken=${access}`);
  if (refresh) parts.push(`refreshToken=${refresh}`);
  return parts.join('; ');
}

function buildUrl(path: string, query?: ApiOptions['query']): string {
  const url = new URL(`${BACKEND_API_URL}${path}`);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null && value !== '') url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

// Low level call, returns the raw Response (the login action needs the Set-Cookie headers)
export async function backendFetch(path: string, options: ApiOptions = {}): Promise<Response> {
  const { method = 'GET', query, body, formData, auth = true, revalidate, tags } = options;

  const headers: Record<string, string> = { Accept: 'application/json' };
  if (auth) {
    const cookieHeader = await getAuthCookieHeader();
    if (cookieHeader) headers.Cookie = cookieHeader;
  }

  let payload: BodyInit | undefined;
  if (formData) {
    payload = formData; // fetch adds the multipart boundary itself
  } else if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
    payload = JSON.stringify(body);
  }

  const init: RequestInit & { next?: { revalidate?: number | false; tags?: string[] } } = {
    method,
    headers,
    body: payload,
  };

  // Public GET requests can be cached. Everything user specific is never cached.
  if (method === 'GET' && !auth && revalidate !== undefined) {
    init.next = { revalidate, tags };
  } else {
    init.cache = 'no-store';
  }

  return fetch(buildUrl(path, query), init);
}

// High level call: never throws, always returns { success, ... }
export async function api<T>(path: string, options: ApiOptions = {}): Promise<ApiResult<T>> {
  try {
    const res = await backendFetch(path, options);
    const json = await res.json().catch(() => null);

    if (json && json.success === true) return json as ApiResult<T>;

    return {
      success: false,
      status: res.status,
      message: json?.message ?? 'Something went wrong. Please try again.',
      errors: Array.isArray(json?.errors) ? json.errors : [],
    };
  } catch {
    return { success: false, status: 0, message: 'Could not reach the server. Please try again.', errors: [] };
  }
}
