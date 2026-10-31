'use client';

import Link from 'next/link';
import { useState, useTransition } from 'react';
import { CalendarCheck, Ellipsis, Pencil, Trash2, Users } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Field, Input, Textarea } from '@/components/ui/form';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { Spinner } from '@/components/shared/common';
import { createEventAction, deleteEventAction, setEventStatusAction, updateEventAction } from '@/actions/event';
import { useAction } from '@/hooks/use-action';
import { useDialogState } from '@/hooks/use-dialog-state';
import { toDateTimeLocal, titleCase } from '@/lib/format';
import { EVENT_TRANSITIONS } from '@/lib/routes';
import type { EventItem } from '@/lib/types';

type Errors = Record<string, string>;
const text = (form: FormData, name: string) => String(form.get(name) ?? '').trim();

// ---------------------------------------------------------------- Create / edit dialog
export function EventFormDialog({
  event,
  trigger,
  open,
  onOpenChange,
}: {
  event?: EventItem;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [isOpen, setOpen] = useDialogState(open, onOpenChange);
  const [pending, startTransition] = useTransition();
  const [errors, setErrors] = useState<Errors>({});

  function onSubmit(submitEvent: React.FormEvent<HTMLFormElement>) {
    submitEvent.preventDefault();
    const form = new FormData(submitEvent.currentTarget);

    const date = new Date(text(form, 'eventDate'));
    if (Number.isNaN(date.getTime())) {
      setErrors({ eventDate: 'Please choose the date and time' });
      return;
    }

    const fee = text(form, 'fee');
    const capacity = text(form, 'capacity');
    const input = {
      title: text(form, 'title'),
      description: text(form, 'description') || undefined,
      venue: text(form, 'venue'),
      eventDate: date.toISOString(),
      fee: fee ? Number(fee) : undefined,
      capacity: capacity ? Number(capacity) : undefined,
    };

    startTransition(async () => {
      const result = event ? await updateEventAction(event.id, input) : await createEventAction(input);

      if (result.success) {
        toast.success(result.message);
        setErrors({});
        setOpen(false);
      } else {
        setErrors(result.errors ?? {});
        toast.error(result.message);
      }
    });
  }

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      {trigger ? <DialogTrigger asChild>{trigger}</DialogTrigger> : null}
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{event ? 'Edit event' : 'Create a new event'}</DialogTitle>
          <DialogDescription>
            {event ? 'Completed or cancelled events cannot be edited.' : 'The event date must be in the future.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <Field label="Title" htmlFor="title" error={errors.title}>
            <Input id="title" name="title" defaultValue={event?.title} required />
          </Field>
          <Field label="Description" htmlFor="description" error={errors.description}>
            <Textarea id="description" name="description" defaultValue={event?.description ?? ''} rows={4} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Venue" htmlFor="venue" error={errors.venue}>
              <Input id="venue" name="venue" defaultValue={event?.venue} required />
            </Field>
            <Field label="Date and time" htmlFor="eventDate" error={errors.eventDate}>
              <Input id="eventDate" name="eventDate" type="datetime-local" defaultValue={toDateTimeLocal(event?.eventDate)} required />
            </Field>
            <Field label="Fee (BDT)" htmlFor="fee" error={errors.fee} hint="Leave empty for a free event.">
              <Input id="fee" name="fee" type="number" min={0} step="any" defaultValue={event ? Number(event.fee) : ''} />
            </Field>
            <Field label="Seat limit" htmlFor="capacity" error={errors.capacity} hint="Leave empty for no limit.">
              <Input id="capacity" name="capacity" type="number" min={1} step={1} defaultValue={event?.capacity ?? ''} />
            </Field>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={pending}>Cancel</Button>
            <Button type="submit" disabled={pending}>{pending ? <Spinner /> : null}{event ? 'Save changes' : 'Create event'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------- Row actions
export function EventRowActions({ event }: { event: EventItem }) {
  const [dialog, setDialog] = useState<'edit' | 'delete' | 'cancel' | null>(null);
  const { run, pending } = useAction();

  const transitions = EVENT_TRANSITIONS[event.status];
  const editable = event.status === 'UPCOMING' || event.status === 'ONGOING';

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Event actions" disabled={pending}>
            {pending ? <Spinner /> : <Ellipsis />}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem asChild>
            <Link href={`/moderator/events/${event.id}`}><Users /> Registrations</Link>
          </DropdownMenuItem>
          {editable ? (
            <DropdownMenuItem onSelect={() => setDialog('edit')}><Pencil /> Edit event</DropdownMenuItem>
          ) : null}

          {transitions.length ? (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Change status</DropdownMenuLabel>
              {transitions.map((status) =>
                status === 'CANCELLED' ? (
                  <DropdownMenuItem key={status} variant="destructive" onSelect={() => setDialog('cancel')}>
                    <CalendarCheck /> Cancel event
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem key={status} onSelect={() => run(() => setEventStatusAction(event.id, status))}>
                    <CalendarCheck /> Mark as {titleCase(status)}
                  </DropdownMenuItem>
                ),
              )}
            </>
          ) : null}

          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onSelect={() => setDialog('delete')}><Trash2 /> Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <EventFormDialog event={event} open={dialog === 'edit'} onOpenChange={(value) => setDialog(value ? 'edit' : null)} />

      <ConfirmDialog
        open={dialog === 'cancel'}
        onOpenChange={(value) => setDialog(value ? 'cancel' : null)}
        title="Cancel this event?"
        description="Registered members will no longer be able to attend. This cannot be undone."
        confirmLabel="Cancel event"
        destructive
        action={setEventStatusAction}
        args={[event.id, 'CANCELLED']}
      />
      <ConfirmDialog
        open={dialog === 'delete'}
        onOpenChange={(value) => setDialog(value ? 'delete' : null)}
        title="Delete this event?"
        description="The event will disappear from the website. Registrations are kept for the records."
        confirmLabel="Delete"
        destructive
        action={deleteEventAction}
        args={[event.id]}
      />
    </>
  );
}
