import type { Metadata } from 'next';
import Link from 'next/link';
import { ForgotPasswordForm } from '@/components/features/auth-forms';

export const metadata: Metadata = { title: 'Forgot password' };

export default function ForgotPasswordPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Forgot your password?</h1>
        <p className="text-muted-foreground">Enter your email and we will send you a 6 digit code.</p>
      </div>
      <ForgotPasswordForm />
      <p className="text-center text-sm text-muted-foreground">
        <Link href="/login" className="font-semibold text-primary hover:underline">Back to log in</Link>
      </p>
    </div>
  );
}
