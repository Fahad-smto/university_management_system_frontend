'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { toast } from 'sonner';
import type { ActionResult } from '@/lib/action';

type Options<T> = {
  onSuccess?: (result: Extract<ActionResult<T>, { success: true }>) => void;
  refresh?: boolean; // re-fetch the server data after success (default true)
  silent?: boolean; // do not show the success toast
};

// Runs a server action, shows a toast and refreshes the page data
export function useAction() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function run<T>(fn: () => Promise<ActionResult<T>>, options: Options<T> = {}) {
    startTransition(async () => {
      const result = await fn();

      if (result.success) {
        if (!options.silent) toast.success(result.message);
        options.onSuccess?.(result);
        if (options.refresh !== false) router.refresh();
      } else {
        toast.error(result.message);
      }
    });
  }

  return { run, pending };
}
