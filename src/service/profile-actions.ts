'use server';

import { revalidatePath } from 'next/cache';
import { api } from '@/lib/api';
import type { ApiResult } from '@/lib/types';

export type FormState = { success?: boolean; message?: string; errors?: Record<string, string> };

function toState(res: ApiResult<unknown>, okMessage: string): FormState {
  if (res.success) return { success: true, message: okMessage };
  const errors: Record<string, string> = {};
  for (const e of res.errors) if (e.path !== undefined) errors[String(e.path)] = e.message;
  return { success: false, message: res.message, errors };
}

const text = (fd: FormData, key: string) => String(fd.get(key) ?? '').trim();

// NOTE: adjust the endpoint paths below to match your backend routes.
export async function updateAccountAction(_prev: FormState, fd: FormData): Promise<FormState> {
  const res = await api('/users/me', { method: 'PATCH', body: { name: text(fd, 'name'), phone: text(fd, 'phone') || null } });
  if (res.success) revalidatePath('/dashboard/profile');
  return toState(res, 'Account updated.');
}

export async function updateMemberProfileAction(_prev: FormState, fd: FormData): Promise<FormState> {
  const res = await api('/members/me', { method: 'PATCH', body: { session: text(fd, 'session'), class: text(fd, 'class') } });
  if (res.success) revalidatePath('/dashboard/profile');
  return toState(res, 'Member profile updated.');
}

export async function uploadProfileImageAction(_prev: FormState, fd: FormData): Promise<FormState> {
  const file = fd.get('profileImage');
  if (!(file instanceof File) || file.size === 0) return { success: false, message: 'Please choose an image.' };
  const res = await api('/users/me/profile-image', { method: 'PATCH', formData: fd });
  if (res.success) revalidatePath('/dashboard/profile');
  return toState(res, 'Profile image updated.');
}

export async function changePasswordAction(_prev: FormState, fd: FormData): Promise<FormState> {
  const oldPassword = String(fd.get('oldPassword') ?? '');
  const newPassword = String(fd.get('newPassword') ?? '');
  const confirm = String(fd.get('confirmPassword') ?? '');
  if (newPassword.length < 8) return { success: false, message: 'New password must be at least 8 characters.' };
  if (newPassword !== confirm) return { success: false, message: 'Passwords do not match.' };
  const res = await api('/auth/change-password', { method: 'POST', body: { oldPassword, newPassword } });
  return toState(res, 'Password changed.');
}