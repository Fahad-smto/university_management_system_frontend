'use server';

import { revalidatePath } from 'next/cache';
import { api } from '@/lib/api';
import { fail, fromApi, type ActionResult } from '@/lib/action';
import type { Role, User } from '@/lib/types';

const MAX_IMAGE_SIZE = 2 * 1024 * 1024;
const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export async function updateAccountAction(input: { name: string; phone?: string }): Promise<ActionResult> {
  const result = await api('/users/me', {
    method: 'PATCH',
    body: { name: input.name, ...(input.phone ? { phone: input.phone } : {}) },
  });
  revalidatePath('/dashboard', 'layout');
  return fromApi(result, 'Account updated');
}

export async function uploadProfileImageAction(formData: FormData): Promise<ActionResult<{ profileImage: string | null }>> {
  const file = formData.get('image');

  if (!(file instanceof File) || file.size === 0) return { success: false, message: 'Please choose an image first' };
  if (!IMAGE_TYPES.includes(file.type)) return { success: false, message: 'Only JPG, PNG and WEBP images are allowed' };
  if (file.size > MAX_IMAGE_SIZE) return { success: false, message: 'The image must be 2MB or smaller' };

  // forward only the image field to the backend
  const body = new FormData();
  body.append('image', file);

  const result = await api<User>('/users/me/profile-image', { method: 'PATCH', formData: body });
  revalidatePath('/dashboard', 'layout');
  return fromApi(result, 'Profile picture updated', { profileImage: result.success ? (result.data.profileImage ?? null) : null });
}

export async function removeProfileImageAction(): Promise<ActionResult> {
  const result = await api('/users/me/profile-image', { method: 'DELETE' });
  revalidatePath('/dashboard', 'layout');
  return fromApi(result, 'Profile picture removed');
}

export async function changeUserRoleAction(userId: string, role: Role): Promise<ActionResult> {
  const result = await api(`/users/${userId}/role`, { method: 'PATCH', body: { role } });
  revalidatePath('/admin/users');
  return fromApi(result, `Role changed to ${role}`);
}

export async function setUserBlockedAction(userId: string, isBlocked: boolean): Promise<ActionResult> {
  const result = await api(`/users/${userId}/block`, { method: 'PATCH', body: { isBlocked } });
  revalidatePath('/admin/users');
  return fromApi(result, isBlocked ? 'User blocked' : 'User unblocked');
}

export async function deleteUserAction(userId: string): Promise<ActionResult> {
  const result = await api(`/users/${userId}`, { method: 'DELETE' });
  revalidatePath('/admin/users');
  return result.success ? { success: true, message: 'User deleted' } : fail(result);
}
