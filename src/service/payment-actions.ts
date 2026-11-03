'use server';

import { api } from '@/lib/api';
import type { InitiatedPayment } from '@/lib/types';

export type PayResult = { success: true; url: string } | { success: false; message: string };

// NOTE: adjust the endpoint path and body to match your backend.
export async function initiatePaymentAction(dueId: string): Promise<PayResult> {
  const res = await api<InitiatedPayment>('/payments/initiate', { method: 'POST', body: { dueId } });
  if (!res.success) return { success: false, message: res.message };
  return { success: true, url: res.data.bkashURL };
}