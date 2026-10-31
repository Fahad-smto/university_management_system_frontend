'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState, useTransition } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Field, Input } from '@/components/ui/form';
import { PasswordInput } from '@/components/ui/password-input';
import { Spinner } from '@/components/shared/common';
import { forgotPasswordAction, googleLoginAction, loginAction, registerAction, resetPasswordAction } from '@/actions/auth';
import { refreshMe } from '@/hooks/use-me';

type Errors = Record<string, string>;
const value = (form: FormData, name: string) => String(form.get(name) ?? '').trim();

// ---------------------------------------------------------------- Login
export function LoginForm({ redirectTo }: { redirectTo?: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [errors, setErrors] = useState<Errors>({});

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);

    startTransition(async () => {
      const result = await loginAction({ email: value(form, 'email'), password: String(form.get('password') ?? ''), redirectTo });

      if (result.success) {
        toast.success(result.message);
        await refreshMe();
        router.replace(result.data?.redirectTo ?? '/dashboard');
        router.refresh();
      } else {
        setErrors(result.errors ?? {});
        toast.error(result.message);
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Field label="Email" htmlFor="email" error={errors.email}>
        <Input id="email" name="email" type="email" autoComplete="email" placeholder="you@example.com" required />
      </Field>
      <Field label="Password" htmlFor="password" error={errors.password}>
        <PasswordInput id="password" name="password" autoComplete="current-password" placeholder="Your password" required />
      </Field>
      <div className="flex justify-end">
        <Link href="/forgot-password" className="text-sm font-medium text-primary hover:underline">Forgot password?</Link>
      </div>
      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? <Spinner /> : null} Log in
      </Button>
    </form>
  );
}

// ---------------------------------------------------------------- Register
export function RegisterForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [errors, setErrors] = useState<Errors>({});

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);

    startTransition(async () => {
      const result = await registerAction({
        name: value(form, 'name'),
        email: value(form, 'email'),
        phone: value(form, 'phone'),
        password: String(form.get('password') ?? ''),
      });

      if (result.success) {
        toast.success(result.message);
        await refreshMe();
        router.replace(result.data?.redirectTo ?? '/dashboard');
        router.refresh();
      } else {
        setErrors(result.errors ?? {});
        toast.error(result.message);
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Field label="Full name" htmlFor="name" error={errors.name}>
        <Input id="name" name="name" autoComplete="name" placeholder="Your full name" required />
      </Field>
      <Field label="Email" htmlFor="email" error={errors.email}>
        <Input id="email" name="email" type="email" autoComplete="email" placeholder="you@example.com" required />
      </Field>
      <Field label="Phone (optional)" htmlFor="phone" error={errors.phone} hint="Only moderators can see it.">
        <Input id="phone" name="phone" type="tel" autoComplete="tel" placeholder="01XXXXXXXXX" />
      </Field>
      <Field label="Password" htmlFor="password" error={errors.password} hint="At least 6 characters.">
        <PasswordInput id="password" name="password" autoComplete="new-password" placeholder="Create a password" minLength={6} required />
      </Field>
      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? <Spinner /> : null} Create account
      </Button>
    </form>
  );
}

// ---------------------------------------------------------------- Forgot password
export function ForgotPasswordForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [errors, setErrors] = useState<Errors>({});

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const email = value(new FormData(event.currentTarget), 'email');

    startTransition(async () => {
      const result = await forgotPasswordAction(email);

      if (result.success) {
        toast.success('If this email has an account, an OTP is on its way.');
        router.push(`/reset-password?email=${encodeURIComponent(email)}`);
      } else {
        setErrors(result.errors ?? {});
        toast.error(result.message);
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Field label="Email" htmlFor="email" error={errors.email}>
        <Input id="email" name="email" type="email" autoComplete="email" placeholder="you@example.com" required />
      </Field>
      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? <Spinner /> : null} Send OTP
      </Button>
    </form>
  );
}

// ---------------------------------------------------------------- Reset password
export function ResetPasswordForm({ email }: { email?: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [errors, setErrors] = useState<Errors>({});

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);

    startTransition(async () => {
      const result = await resetPasswordAction({
        email: value(form, 'email'),
        otp: value(form, 'otp'),
        newPassword: String(form.get('newPassword') ?? ''),
      });

      if (result.success) {
        toast.success(result.message);
        router.push('/login');
      } else {
        setErrors(result.errors ?? {});
        toast.error(result.message);
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Field label="Email" htmlFor="email" error={errors.email}>
        <Input id="email" name="email" type="email" defaultValue={email} placeholder="you@example.com" required />
      </Field>
      <Field label="6 digit OTP" htmlFor="otp" error={errors.otp} hint="Check your inbox (and spam). The code works for 5 minutes.">
        <Input id="otp" name="otp" inputMode="numeric" maxLength={6} pattern="[0-9]{6}" placeholder="123456" className="text-center text-lg tracking-[0.5em]" required />
      </Field>
      <Field label="New password" htmlFor="newPassword" error={errors.newPassword}>
        <PasswordInput id="newPassword" name="newPassword" autoComplete="new-password" minLength={6} placeholder="Your new password" required />
      </Field>
      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? <Spinner /> : null} Reset password
      </Button>
    </form>
  );
}

// ---------------------------------------------------------------- Google (optional)
type GoogleId = {
  initialize: (config: { client_id: string; callback: (response: { credential: string }) => void }) => void;
  renderButton: (element: HTMLElement, options: Record<string, unknown>) => void;
};
declare global {
  interface Window {
    google?: { accounts: { id: GoogleId } };
  }
}

export function GoogleLoginButton({ redirectTo }: { redirectTo?: string }) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const router = useRouter();
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!clientId) return;

    const init = () => {
      if (!window.google || !container.current) return;

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async ({ credential }) => {
          const result = await googleLoginAction(credential, redirectTo);
          if (result.success) {
            toast.success(result.message);
            await refreshMe();
            router.replace(result.data?.redirectTo ?? '/dashboard');
            router.refresh();
          } else {
            toast.error(result.message);
          }
        },
      });
      window.google.accounts.id.renderButton(container.current, { theme: 'outline', size: 'large', shape: 'pill', text: 'continue_with', width: 340 });
    };

    if (window.google) {
      init();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = init;
    document.head.appendChild(script);
  }, [clientId, redirectTo, router]);

  if (!clientId) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 text-xs uppercase tracking-wider text-muted-foreground">
        <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
      </div>
      <div ref={container} className="flex min-h-11 justify-center" />
    </div>
  );
}
