'use server';

import { revalidatePath } from 'next/cache';
import { api } from '@/lib/api';
import type { NoticeCategory } from '@/lib/types';
import type { FormState } from './profile-actions';

function payload(fd: FormData) {
  return {
    title: String(fd.get('title') ?? '').trim(),
    content: String(fd.get('content') ?? '').trim(),
    category: String(fd.get('category') ?? 'GENERAL') as NoticeCategory,
  };
}

async function run(res: Awaited<ReturnType<typeof api>>, ok: string): Promise<FormState> {
  if (!res.success) return { success: false, message: res.message };
  revalidatePath('/moderator/notices');
  return { success: true, message: ok };
}

// NOTE: adjust the endpoint paths to match your backend routes.
export async function createNoticeAction(_prev: FormState, fd: FormData) {
  return run(await api('/notices', { method: 'POST', body: payload(fd) }), 'Notice created.');
}

export async function updateNoticeAction(id: string, _prev: FormState, fd: FormData) {
  return run(await api(`/notices/${id}`, { method: 'PATCH', body: payload(fd) }), 'Notice updated.');
}

export async function deleteNoticeAction(id: string) {
  return run(await api(`/notices/${id}`, { method: 'DELETE' }), 'Notice deleted.');
}