'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { toast } from 'sonner';
import { logoutAction } from '@/actions/auth';
import { clearMe } from '@/hooks/use-me';

export function useLogout() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function logout() {
    startTransition(async () => {
      await logoutAction();
      clearMe();
      toast.success('You have been logged out');
      router.replace('/login');
      router.refresh();
    });
  }

  return { logout, pending };
}
