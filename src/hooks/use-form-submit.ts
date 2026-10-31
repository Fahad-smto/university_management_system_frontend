'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import type { ActionResult } from '@/lib/action';

// For forms: runs a server action, shows field errors under the inputs and refreshes the page data
export function useFormSubmit() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [errors, setErrors] = useState<Record<string, string>>({});

  function submit<T>(fn: () => Promise<ActionResult<T>>, onSuccess?: () => void) {
    startTransition(async () => {
      const result = await fn();

      if (result.success) {
        toast.success(result.message);
        setErrors({});
        onSuccess?.();
        router.refresh();
      } else {
        setErrors(result.errors ?? {});
        toast.error(result.message);
      }
    });
  }

  return { submit, pending, errors };
}
