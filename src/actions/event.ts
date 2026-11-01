'use server';

import { revalidatePath } from 'next/cache';
import { api } from '@/lib/api';
import { fromApi, type ActionResult } from '@/lib/action';
import type { EventStatus } from '@/lib/types';

type EventInput = {
  title: string;
  description?: string;
  venue: string;
  eventDate: string; // ISO string
  fee?: number;
  capacity?: number;
};

function refreshEventPages(id?: string) {
  revalidatePath('/');
  revalidatePath('/events');
  revalidatePath('/moderator/events');
  if (id) revalidatePath(`/events/${id}`);
}

export async function createEventAction(input: EventInput): Promise<ActionResult> {
  const result = await api('/events', { method: 'POST', body: input });
  refreshEventPages();
  return fromApi(result, 'Event created');
}

export async function updateEventAction(id: string, input: Partial<EventInput>): Promise<ActionResult> {
  const result = await api(`/events/${id}`, { method: 'PATCH', body: input });
  refreshEventPages(id);
  return fromApi(result, 'Event updated');
}

export async function setEventStatusAction(id: string, status: EventStatus): Promise<ActionResult> {
  const result = await api(`/events/${id}/status`, { method: 'PATCH', body: { status } });
  refreshEventPages(id);
  return fromApi(result, `Event marked as ${status}`);
}

export async function deleteEventAction(id: string): Promise<ActionResult> {
  const result = await api(`/events/${id}`, { method: 'DELETE' });
  refreshEventPages(id);
  return fromApi(result, 'Event deleted');
}

export async function registerForEventAction(id: string): Promise<ActionResult> {
  const result = await api(`/events/${id}/register`, { method: 'POST' });
  refreshEventPages(id);
  revalidatePath('/dashboard/events');
  return fromApi(result, 'You are registered for this event');
}

export async function cancelRegistrationAction(id: string): Promise<ActionResult> {
  const result = await api(`/events/${id}/register`, { method: 'DELETE' });
  refreshEventPages(id);
  revalidatePath('/dashboard/events');
  return fromApi(result, 'Registration cancelled');
}
