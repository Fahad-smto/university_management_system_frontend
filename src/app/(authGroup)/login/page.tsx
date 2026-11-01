import type { Metadata } from 'next';
import Link from 'next/link';
import { GoogleLoginButton, LoginForm } from '@/components/features/auth-forms';
import { readParams, type SearchParams } from '@/lib/search-params';
import { safeRedirect } from '@/lib/routes';

export const metadata: Metadata = { title: 'Log in' };

export default async function LoginPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await readParams(searchParams);
  const redirectTo = safeRedirect(params.redirectTo) ?? undefined;

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
        <p className="text-muted-foreground">Log in to manage your membership, events and payments.</p>
      </div>
      <LoginForm redirectTo={redirectTo} />
      <GoogleLoginButton redirectTo={redirectTo} />
      <p className="text-center text-sm text-muted-foreground">
        New here?{' '}
        <Link href="/register" className="font-semibold text-primary hover:underline">Create an account</Link>
      </p>
    </div>
  );
}
