'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Ellipsis, Eye, Pencil, Trash2, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Field, Input, Textarea } from '@/components/ui/form';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { Spinner } from '@/components/shared/common';
import { createEventAction, deleteEventAction, setEventStatusAction, updateEventAction } from '@/actions/event';
import { useFormSubmit } from '@/hooks/use-form-submit';
import { titleCase, toDateTimeLocal } from '@/lib/format';
import { EVENT_TRANSITIONS } from '@/lib/routes';
import type { EventItem, EventStatus } from '@/lib/types';

type DialogProps = {
  event?: EventItem; // present = edit mode
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

const field = (form: FormData, name: string) => String(form.get(name) ?? '').trim();

// Create or edit an event
export function EventFormDialog({ event, trigger, open, onOpenChange }: DialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const { submit, pending, errors } = useFormSubmit();

  const controlled = open !== undefined;
  const isOpen = controlled ? open : internalOpen;
  const setOpen = (value: boolean) => (controlled ? onOpenChange?.(value) : setInternalOpen(value));
  const initialDate = toDateTimeLocal(event?.eventDate);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const dateValue = field(form, 'eventDate');
    const fee = field(form, 'fee');
    const capacity = field(form, 'capacity');

    const base = {
      title: field(form, 'title'),
      venue: field(form, 'venue'),
      ...(field(form, 'description') ? { description: field(form, 'description') } : {}),
      ...(fee !== '' ? { fee: Number(fee) } : {}),
      ...(capacity !== '' ? { capacity: Number(capacity) } : {}),
    };

    if (event) {
      // the date is only sent when it was changed (the backend only accepts future dates)
      const dateChanged = dateValue !== '' && dateValue !== initialDate;
      submit(
        () => updateEventAction(event.id, { ...base, ...(dateChanged ? { eventDate: new Date(dateValue).toISOString() } : {}) }),
        () => setOpen(false),
      );
    } else {
      submit(() => createEventAction({ ...base, eventDate: new Date(dateValue).toISOString() }), () => setOpen(false));
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      {trigger ? <DialogTrigger asChild>{trigger}</DialogTrigger> : null}
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{event ? 'Edit event' : 'Create event'}</DialogTitle>
          <DialogDescription>{event ? 'Update the details of this event.' : 'Publish a new event for members to join.'}</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
          <Field label="Title" htmlFor="title" error={errors.title} className="sm:col-span-2">
            <Input id="title" name="title" defaultValue={event?.title} placeholder="e.g. Annual Cultural Night" required />
          </Field>
          <Field label="Venue" htmlFor="venue" error={errors.venue}>
            <Input id="venue" name="venue" defaultValue={event?.venue} placeholder="College auditorium" required />
          </Field>
          <Field label="Date and time" htmlFor="eventDate" error={errors.eventDate} hint="Must be in the future.">
            <Input id="eventDate" name="eventDate" type="datetime-local" defaultValue={initialDate} required />
          </Field>
          <Field label="Entry fee (৳)" htmlFor="fee" error={errors.fee}>
            <Input id="fee" name="fee" type="number" min={0} step="1" defaultValue={event ? Number(event.fee) : 0} />
          </Field>
          <Field label="Seat limit" htmlFor="capacity" error={errors.capacity} hint="Leave empty for no limit.">
            <Input id="capacity" name="capacity" type="number" min={1} step="1" defaultValue={event?.capacity ?? ''} />
          </Field>
          <Field label="Description" htmlFor="description" error={errors.description} className="sm:col-span-2">
            <Textarea id="description" name="description" defaultValue={event?.description ?? ''} placeholder="What is this event about?" />
          </Field>
          <DialogFooter className="sm:col-span-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={pending}>Cancel</Button>
            <Button type="submit" disabled={pending}>{pending ? <Spinner /> : null}{event ? 'Save changes' : 'Create event'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// The "..." menu on every event row
export function EventRowActions({ event }: { event: EventItem }) {
  const [dialog, setDialog] = useState<'edit' | 'delete' | null>(null);
  const [nextStatus, setNextStatus] = useState<EventStatus | null>(null);

  const transitions = EVENT_TRANSITIONS[event.status];
  const canEdit = event.status === 'UPCOMING' || event.status === 'ONGOING';

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Event actions"><Ellipsis /></Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem asChild>
            <Link href={`/moderator/events/${event.id}`}><Users /> Registrations</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={`/events/${event.id}`}><Eye /> Public page</Link>
          </DropdownMenuItem>
          {canEdit ? <DropdownMenuItem onSelect={() => setDialog('edit')}><Pencil /> Edit</DropdownMenuItem> : null}
          {transitions.length ? <DropdownMenuSeparator /> : null}
          {transitions.map((status) => (
            <DropdownMenuItem key={status} onSelect={() => setNextStatus(status)}>
              Mark as {titleCase(status)}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onSelect={() => setDialog('delete')}><Trash2 /> Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {dialog === 'edit' ? <EventFormDialog event={event} open onOpenChange={(value) => setDialog(value ? 'edit' : null)} /> : null}

      <ConfirmDialog
        open={dialog === 'delete'}
        onOpenChange={(value) => setDialog(value ? 'delete' : null)}
        title="Delete this event?"
        description={`"${event.title}" will be removed from the website. This cannot be undone from here.`}
        confirmLabel="Delete event"
        destructive
        action={deleteEventAction}
        args={[event.id]}
      />

      {nextStatus ? (
        <ConfirmDialog
          open
          onOpenChange={(value) => !value && setNextStatus(null)}
          title={`Mark as ${titleCase(nextStatus)}?`}
          description={
            nextStatus === 'CANCELLED'
              ? 'Cancelled events are final and registration will close.'
              : 'The status change is shown to everyone on the website.'
          }
          confirmLabel={`Mark as ${titleCase(nextStatus)}`}
          destructive={nextStatus === 'CANCELLED'}
          action={setEventStatusAction}
          args={[event.id, nextStatus]}
        />
      ) : null}
    </>
  );
}
