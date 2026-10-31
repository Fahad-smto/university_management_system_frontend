'use client';

import { TriangleAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="grid min-h-dvh place-items-center px-6">
      <div className="max-w-md text-center">
        <span className="mx-auto mb-6 grid size-16 place-items-center rounded-2xl bg-destructive/10 text-destructive">
          <TriangleAlert className="size-8" />
        </span>
        <h1 className="text-2xl font-bold tracking-tight">Something went wrong</h1>
        <p className="mt-3 text-muted-foreground">{error.message || 'An unexpected error happened. Please try again.'}</p>
        <Button className="mt-8" onClick={reset}>Try again</Button>
      </div>
    </main>
  );
}
