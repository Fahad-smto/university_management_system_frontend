'use server';

import { revalidatePath } from 'next/cache';
import { api } from '@/lib/api';
import { fromApi, type ActionResult } from '@/lib/action';
import type { InitiatedPayment, Payment } from '@/lib/types';

export async function generateDuesAction(input: { month: number; year: number; amount: number }): Promise<ActionResult> {
  const result = await api<{ created: number; alreadyExisted: number }>('/payments/dues/generate', {
    method: 'POST',
    body: input,
  });
  revalidatePath('/admin/dues');
  revalidatePath('/moderator/dues');

  if (!result.success) return fromApi(result);
  const { created, alreadyExisted } = result.data;
  return { success: true, message: `${created} dues created, ${alreadyExisted} already existed` };
}

// Starts a bKash payment. The browser then opens data.bkashURL.
export async function initiatePaymentAction(dueId: string): Promise<ActionResult<InitiatedPayment>> {
  const result = await api<InitiatedPayment>('/payments/initiate', { method: 'POST', body: { dueId } });
  return fromApi(result, 'Redirecting you to bKash…', result.success ? result.data : undefined);
}

// Asks bKash about a payment that stayed PENDING (for example the browser was closed before returning)
export async function verifyPaymentAction(paymentId: string): Promise<ActionResult> {
  const result = await api<Payment>(`/payments/${paymentId}/verify`, { method: 'POST' });
  revalidatePath('/dashboard/payments');
  revalidatePath('/dashboard/dues');
  revalidatePath('/admin/payments');
  if (!result.success) return fromApi(result);
  return { success: true, message: `Payment status: ${result.data.status}` };
}
