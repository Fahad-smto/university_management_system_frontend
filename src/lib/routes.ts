import type { MembershipStatus, EventStatus, Role } from './types';

export const AUTH_ROUTES = ['/login', '/register', '/forgot-password', '/reset-password'];
export const PROTECTED_PREFIXES = ['/dashboard', '/moderator', '/admin'];

export const STAFF_ROLES: Role[] = ['MODERATOR', 'ADMIN', 'SUPER_ADMIN'];
export const ADMIN_ROLES: Role[] = ['ADMIN', 'SUPER_ADMIN'];

// Bigger number = more power (same hierarchy as the backend)
export const ROLE_LEVEL: Record<Role, number> = { SUPER_ADMIN: 4, ADMIN: 3, MODERATOR: 2, MEMBER: 1 };

export const isStaff = (role?: string | null) => !!role && STAFF_ROLES.includes(role as Role);
export const isAdmin = (role?: string | null) => !!role && ADMIN_ROLES.includes(role as Role);

// Where each role lands after login
export function roleHome(role?: string | null): string {
  if (role === 'SUPER_ADMIN' || role === 'ADMIN') return '/admin';
  if (role === 'MODERATOR') return '/moderator';
  return '/dashboard';
}

// You can only manage users who are below you
export const canManageUser = (actor: Role, target: Role) => ROLE_LEVEL[actor] > ROLE_LEVEL[target];

// Roles an actor is allowed to give (SUPER_ADMIN can never be given)
export function assignableRoles(actor: Role): Role[] {
  if (actor === 'SUPER_ADMIN') return ['ADMIN', 'MODERATOR', 'MEMBER'];
  if (actor === 'ADMIN') return ['MODERATOR', 'MEMBER'];
  return [];
}

// Allowed status changes (same rules as the backend)
export const MEMBER_TRANSITIONS: Record<MembershipStatus, MembershipStatus[]> = {
  PENDING: ['ACTIVE', 'INACTIVE'],
  ACTIVE: ['INACTIVE', 'EXPIRED'],
  INACTIVE: ['ACTIVE'],
  EXPIRED: ['ACTIVE'],
};

export const EVENT_TRANSITIONS: Record<EventStatus, EventStatus[]> = {
  UPCOMING: ['ONGOING', 'CANCELLED'],
  ONGOING: ['COMPLETED', 'CANCELLED'],
  COMPLETED: [],
  CANCELLED: [],
};

// Only allow redirects inside our own site
export function safeRedirect(path?: string | null): string | null {
  if (!path || !path.startsWith('/') || path.startsWith('//')) return null;
  if (AUTH_ROUTES.some((route) => path === route || path.startsWith(route + '/'))) return null;
  return path;
}
