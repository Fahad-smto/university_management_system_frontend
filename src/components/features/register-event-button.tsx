'use client';

import Link from 'next/link';
import { CircleCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/shared/common';
import { registerForEventAction } from '@/actions/event';
import { useAction } from '@/hooks/use-action';
import { useMe } from '@/hooks/use-me';

// The event page itself is static. This small island knows who is logged in.
export function RegisterEventButton({ eventId, closedReason }: { eventId: string; closedReason?: string }) {
  const { status, user } = useMe();
  const { run, pending } = useAction();

  if (closedReason) {
    return <Button size="lg" className="w-full" disabled>{closedReason}</Button>;
  }

  if (status === 'loading') return <Skeleton className="h-11 w-full" />;

  if (!user) {
    return (
      <Button asChild size="lg" className="w-full">
        <Link href={`/login?redirectTo=/events/${eventId}`}>Log in to register</Link>
      </Button>
    );
  }

  return (
    <Button size="lg" className="w-full" disabled={pending} onClick={() => run(() => registerForEventAction(eventId))}>
      {pending ? <Spinner /> : <CircleCheck />}
      Register for this event
    </Button>
  );
}
