'use client';

import { useState } from 'react';

// Lets a dialog work both on its own (with a trigger) and controlled by a parent (row action menus)
export function useDialogState(open?: boolean, onOpenChange?: (open: boolean) => void) {
  const [internal, setInternal] = useState(false);
  const controlled = open !== undefined;

  const isOpen = controlled ? open : internal;
  const setOpen = (value: boolean) => (controlled ? onOpenChange?.(value) : setInternal(value));

  return [isOpen, setOpen] as const;
}
