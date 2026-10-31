'use client';

import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/shared/common';
import { useAction } from '@/hooks/use-action';
import type { ActionResult } from '@/lib/action';

// A button that runs a server action, shows a toast and refreshes the data
export function ActionButton({
  action,
  args = [],
  children,
  variant = 'outline',
  size = 'sm',
  className,
  disabled,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  action: (...args: any[]) => Promise<ActionResult<any>>;
  args?: unknown[];
  children: React.ReactNode;
  variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  disabled?: boolean;
}) {
  const { run, pending } = useAction();

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      disabled={pending || disabled}
      onClick={() => run(() => action(...args))}
    >
      {pending ? <Spinner /> : null}
      {children}
    </Button>
  );
}
