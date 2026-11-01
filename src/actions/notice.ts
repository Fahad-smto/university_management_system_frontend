'use server';

import { revalidatePath } from 'next/cache';
import { api } from '@/lib/api';
import { fromApi, type ActionResult } from '@/lib/action';

type NoticeInput = {
  title: string;
  content: string;
  category?: string;
  publishedAt?: string; // ISO string, a future date schedules the notice
};

function refreshNoticePages(id?: string) {
  revalidatePath('/');
  revalidatePath('/notices');
  revalidatePath('/moderator/notices');
  if (id) revalidatePath(`/notices/${id}`);
}

export async function createNoticeAction(input: NoticeInput): Promise<ActionResult> {
  const result = await api('/notices', { method: 'POST', body: input });
  refreshNoticePages();
  return fromApi(result, input.publishedAt ? 'Notice saved' : 'Notice published');
}

export async function updateNoticeAction(id: string, input: Partial<NoticeInput>): Promise<ActionResult> {
  const result = await api(`/notices/${id}`, { method: 'PATCH', body: input });
  refreshNoticePages(id);
  return fromApi(result, 'Notice updated');
}

export async function deleteNoticeAction(id: string): Promise<ActionResult> {
  const result = await api(`/notices/${id}`, { method: 'DELETE' });
  refreshNoticePages(id);
  return fromApi(result, 'Notice deleted');
}
