import jwt, { type JwtPayload } from 'jsonwebtoken';

export type VerifyResult =
  | { success: true; data: JwtPayload }
  | { success: false; data: null; error: string };

const decodeToken = (token: string): JwtPayload | null => {
  const decoded = jwt.decode(token);
  return decoded && typeof decoded === 'object' ? decoded : null;
};

const isExpired = (token: string): boolean => {
  const payload = decodeToken(token);
  if (!payload?.exp) return true;
  return payload.exp * 1000 <= Date.now();
};

// With a secret the signature is verified.
// Without a secret we only check the structure and the expiry. This is safe because the backend
// verifies the token again on every API call, the proxy only uses it to pick a redirect.
const verifyToken = (token: string, secret?: string): VerifyResult => {
  try {
    if (secret) {
      const decoded = jwt.verify(token, secret);
      if (typeof decoded === 'string') return { success: false, data: null, error: 'Invalid token payload' };
      return { success: true, data: decoded };
    }

    const decoded = decodeToken(token);
    if (!decoded) return { success: false, data: null, error: 'Invalid token' };
    if (decoded.exp && decoded.exp * 1000 <= Date.now()) {
      return { success: false, data: null, error: 'Token expired' };
    }
    return { success: true, data: decoded };
  } catch (error) {
    return { success: false, data: null, error: error instanceof Error ? error.message : 'Invalid token' };
  }
};

export const jwtUtils = { verifyToken, decodeToken, isExpired };
