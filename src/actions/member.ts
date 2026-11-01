'use server';

import { revalidatePath } from 'next/cache';
import { api } from '@/lib/api';
import { fromApi, type ActionResult } from '@/lib/action';
import type { MembershipStatus } from '@/lib/types';

export async function createMemberProfileAction(input: {
  studentIdNo: string;
  session: string;
  class: string;
  sectionId?: string;
}): Promise<ActionResult> {
  const result = await api('/members', {
    method: 'POST',
    body: { studentIdNo: input.studentIdNo, session: input.session, class: input.class, ...(input.sectionId ? { sectionId: input.sectionId } : {}) },
  });
  revalidatePath('/dashboard', 'layout');
  return fromApi(result, 'Member profile created. A moderator will review it soon.');
}

export async function updateMemberProfileAction(input: { session?: string; class?: string }): Promise<ActionResult> {
  const result = await api('/members/me', { method: 'PATCH', body: input });
  revalidatePath('/dashboard', 'layout');
  return fromApi(result, 'Member profile updated');
}

export async function setMemberStatusAction(memberId: string, status: MembershipStatus): Promise<ActionResult> {
  const result = await api(`/members/${memberId}/status`, { method: 'PATCH', body: { status } });
  revalidatePath('/admin/users');
  revalidatePath('/moderator/members');
  revalidatePath('/members');
  return fromApi(result, `Membership is now ${status}`);
}

export async function assignSectionAction(memberId: string, sectionId: string): Promise<ActionResult> {
  const result = await api(`/members/${memberId}/section`, { method: 'PATCH', body: { sectionId } });
  revalidatePath('/moderator/members');
  revalidatePath('/members');
  return fromApi(result, 'Section assigned');
}

export async function deleteMemberAction(memberId: string): Promise<ActionResult> {
  const result = await api(`/members/${memberId}`, { method: 'DELETE' });
  revalidatePath('/admin/users');
  revalidatePath('/moderator/members');
  revalidatePath('/members');
  return fromApi(result, 'Member removed');
}
