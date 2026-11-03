'use client';

import { useState, useTransition } from 'react';
import { initiatePaymentAction } from '@/service/payment-actions';

export function PayButton({ dueId, label = 'Pay now' }: { dueId: string; label?: string }) {
  const [pending, start] = useTransition();
  const [error, setError] = useState('');

  return (
    <div className="space-y-1">
      <button
        type="button"
        disabled={pending}
        className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground disabled:opacity-60"
        onClick={() =>
          start(async () => {
            setError('');
            const res = await initiatePaymentAction(dueId);
            if (res.success) window.location.href = res.url;
            else setError(res.message);
          })
        }
      >
        {pending ? 'Redirecting...' : label}
      </button>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}