'use client';

import { useActionState } from 'react';
import {
  changePasswordAction,
  updateAccountAction,
  updateMemberProfileAction,
  uploadProfileImageAction,
  type FormState,
} from '@/service/profile-actions';
import type { MemberProfile } from '@/lib/types';

const INPUT = 'w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring disabled:opacity-60';
const BUTTON = 'rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60';
const initial: FormState = {};

function Field({ label, name, error, ...rest }: { label: string; name: string; error?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={name} className="text-sm font-medium">{label}</label>
      <input id={name} name={name} className={INPUT} {...rest} />
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

function Message({ state }: { state: FormState }) {
  if (!state.message) return null;
  return <p className={`text-sm ${state.success ? 'text-green-600' : 'text-red-600'}`}>{state.message}</p>;
}

export function AccountForm({ name, email, phone }: { name: string; email: string; phone: string | null }) {
  const [state, action, pending] = useActionState(updateAccountAction, initial);
  return (
    <form action={action} className="space-y-4">
      <Field label="Name" name="name" defaultValue={name} required error={state.errors?.name} />
      <Field label="Email" name="email" defaultValue={email} disabled />
      <Field label="Phone" name="phone" defaultValue={phone ?? ''} error={state.errors?.phone} />
      <Message state={state} />
      <button className={BUTTON} disabled={pending}>{pending ? 'Saving...' : 'Save changes'}</button>
    </form>
  );
}

export function MemberProfileForm({ profile }: { profile: MemberProfile | null }) {
  const [state, action, pending] = useActionState(updateMemberProfileAction, initial);
  if (!profile) return <p className="text-sm text-muted-foreground">No member profile found.</p>;
  return (
    <form action={action} className="space-y-4">
      <Field label="Student ID" name="studentIdNo" defaultValue={profile.studentIdNo} disabled />
      <Field label="Session" name="session" defaultValue={profile.session} required error={state.errors?.session} />
      <Field label="Class" name="class" defaultValue={profile.class} required error={state.errors?.class} />
      <Message state={state} />
      <button className={BUTTON} disabled={pending}>{pending ? 'Saving...' : 'Save profile'}</button>
    </form>
  );
}

export function ProfileImageCard({ name, src }: { name: string; src?: string | null }) {
  const [state, action, pending] = useActionState(uploadProfileImageAction, initial);
  return (
    <form action={action} className="space-y-4">
      <div className="flex items-center gap-4">
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt={name} className="size-20 rounded-full border object-cover" />
        ) : (
          <div className="flex size-20 items-center justify-center rounded-full border bg-muted text-2xl font-semibold">
            {name.charAt(0).toUpperCase()}
          </div>
        )}
        <input type="file" name="profileImage" accept="image/*" className="text-sm" required />
      </div>
      <Message state={state} />
      <button className={BUTTON} disabled={pending}>{pending ? 'Uploading...' : 'Upload image'}</button>
    </form>
  );
}

export function ChangePasswordForm() {
  const [state, action, pending] = useActionState(changePasswordAction, initial);
  return (
    <form action={action} className="space-y-4" key={state.success ? 'done' : 'form'}>
      <Field label="Current password" name="oldPassword" type="password" autoComplete="current-password" required />
      <Field label="New password" name="newPassword" type="password" autoComplete="new-password" minLength={8} required />
      <Field label="Confirm new password" name="confirmPassword" type="password" autoComplete="new-password" required />
      <Message state={state} />
      <button className={BUTTON} disabled={pending}>{pending ? 'Updating...' : 'Change password'}</button>
    </form>
  );
}