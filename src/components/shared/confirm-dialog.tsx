'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Spinner } from '@/components/shared/common';
import { useAction } from '@/hooks/use-action';
import type { ActionResult } from '@/lib/action';

type Props = {
  title: string;
  description: string;
  confirmLabel?: string;
  destructive?: boolean;
  // a server action and its arguments (functions created inline cannot cross from server to client)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  action: (...args: any[]) => Promise<ActionResult<any>>;
  args?: unknown[];
  trigger?: React.ReactNode; // uncontrolled: the dialog has its own trigger button
  open?: boolean; // controlled: used by row action menus
  onOpenChange?: (open: boolean) => void;
};

export function ConfirmDialog({
  title,
  description,
  confirmLabel = 'Confirm',
  destructive,
  action,
  args = [],
  trigger,
  open,
  onOpenChange,
}: Props) {
  const [internalOpen, setInternalOpen] = useState(false);
  const { run, pending } = useAction();

  const controlled = open !== undefined;
  const isOpen = controlled ? open : internalOpen;
  const setOpen = (value: boolean) => (controlled ? onOpenChange?.(value) : setInternalOpen(value));

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      {trigger ? <DialogTrigger asChild>{trigger}</DialogTrigger> : null}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" disabled={pending} onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            variant={destructive ? 'destructive' : 'default'}
            disabled={pending}
            onClick={() => run(() => action(...args), { onSuccess: () => setOpen(false) })}
          >
            {pending ? <Spinner /> : null}
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
