import { redirect } from 'next/navigation';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { getMe } from '@/service/session';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const me = await getMe();

  if (!me.success) {
    // token is valid but the backend does not accept it any more (blocked or deleted): clean the cookies
    if (me.status === 401 || me.status === 403) redirect('/api/auth/clear');
    throw new Error(me.message);
  }

  const { name, email, role, profileImage } = me.data;

  return <DashboardShell user={{ name, email, role, profileImage: profileImage ?? null }}>{children}</DashboardShell>;
}
export const dynamic = 'force-dynamic';