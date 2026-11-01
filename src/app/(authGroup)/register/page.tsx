import type { Metadata } from 'next';
import Link from 'next/link';
import { GoogleLoginButton, RegisterForm } from '@/components/features/auth-forms';

export const metadata: Metadata = { title: 'Create account' };

export default function RegisterPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Join the organization</h1>
        <p className="text-muted-foreground">Create your account. You will complete your member profile next.</p>
      </div>
      <RegisterForm />
      <GoogleLoginButton />
      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link href="/login" className="font-semibold text-primary hover:underline">Log in</Link>
      </p>
    </div>
  );
}
