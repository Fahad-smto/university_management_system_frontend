import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { PageHeader } from '@/components/shared/common';
import { AccountForm, MemberProfileForm, ProfileImageCard } from '@/components/features/profile-forms';
import { api } from '@/lib/api';
import { getMe } from '@/service/session';
import type { MemberProfile } from '@/lib/types';

export const metadata: Metadata = { title: 'My profile' };

export default async function ProfilePage() {
  const [me, profile] = await Promise.all([getMe(), api<MemberProfile>('/members/me')]);
  if (!me.success) redirect('/api/auth/clear');

  const user = me.data;

  return (
    <>
      <PageHeader title="My profile" description="Your account, picture and member information." />
      <div className="grid gap-6 xl:grid-cols-2">
        <div className="space-y-6">
          <ProfileImageCard name={user.name} src={user.profileImage} />
          <AccountForm name={user.name} email={user.email} phone={user.phone} />
        </div>
        <MemberProfileForm profile={profile.success ? profile.data : null} />
      </div>
    </>
  );
}
