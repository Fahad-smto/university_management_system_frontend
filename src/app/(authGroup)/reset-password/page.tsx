import type { Metadata } from 'next';
import Link from 'next/link';
import { ResetPasswordForm } from '@/components/features/auth-forms';
import { readParams, type SearchParams } from '@/lib/search-params';

export const metadata: Metadata = { title: 'Reset password' };

export default async function ResetPasswordPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await readParams(searchParams);

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Reset your password</h1>
        <p className="text-muted-foreground">Enter the code from your email and choose a new password.</p>
      </div>
      <ResetPasswordForm email={params.email} />
      <p className="text-center text-sm text-muted-foreground">
        No code?{' '}
        <Link href="/forgot-password" className="font-semibold text-primary hover:underline">Send a new one</Link>
      </p>
    </div>
  );
}
