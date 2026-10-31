'use client';

import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { cancelRegistrationAction } from '@/actions/event';

export function CancelRegistrationButton({ eventId }: { eventId: string }) {
  return (
    <ConfirmDialog
      title="Cancel your registration?"
      description="Your seat will be released for someone else."
      confirmLabel="Yes, cancel"
      destructive
      action={cancelRegistrationAction}
      args={[eventId]}
      trigger={<Button size="sm" variant="outline">Cancel</Button>}
    />
  );
}
