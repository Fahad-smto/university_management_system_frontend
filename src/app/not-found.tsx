import Link from 'next/link';
import { Compass } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <main className="hero-gradient grid min-h-dvh place-items-center px-6">
      <div className="max-w-md text-center">
        <span className="mx-auto mb-6 grid size-16 place-items-center rounded-2xl bg-primary/10 text-primary">
          <Compass className="size-8" />
        </span>
        <p className="text-sm font-semibold uppercase tracking-widest text-primary">Error 404</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">This page could not be found</h1>
        <p className="mt-3 text-muted-foreground">
          The page may have moved, or you may not have permission to open it.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Button asChild><Link href="/">Go home</Link></Button>
          <Button asChild variant="outline"><Link href="/dashboard">My dashboard</Link></Button>
        </div>
      </div>
    </main>
  );
}
