import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, BadgeCheck, CalendarDays, CreditCard, Megaphone, Receipt, TriangleAlert, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserAvatar } from '@/components/ui/avatar';
import { PageHeader, StatCard } from '@/components/shared/common';
import { StatusBadge } from '@/components/shared/status-badge';
import { api } from '@/lib/api';
import { formatDate, formatDateTime, formatMoney, metaTotal } from '@/lib/format';
import type { Payment, User } from '@/lib/types';

export const metadata: Metadata = { title: 'Administration' };

export default async function AdminOverviewPage() {
  // the totals come from the "meta" of list responses, so no extra statistics API is needed
  const [users, members, events, notices, payments, paid, unpaid, overdue, recentUsers, recentPayments] = await Promise.all([
    api('/users', { query: { limit: 1 } }),
    api('/members/public', { query: { limit: 1 } }),
    api('/events', { query: { limit: 1 } }),
    api('/notices', { query: { limit: 1 } }),
    api('/payments', { query: { limit: 1 } }),
    api('/payments', { query: { limit: 1, status: 'SUCCESS' } }),
    api('/payments/dues', { query: { limit: 1, status: 'UNPAID' } }),
    api('/payments/dues', { query: { limit: 1, status: 'OVERDUE' } }),
    api<User[]>('/users', { query: { limit: 5, sortBy: 'createdAt', sortOrder: 'desc' } }),
    api<Payment[]>('/payments', { query: { limit: 5 } }),
  ]);

  return (
    <>
      <PageHeader title="Administration" description="A live summary of the whole organization." />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Users} label="Users" value={metaTotal(users)} tone="primary" />
        <StatCard icon={BadgeCheck} label="Active members" value={metaTotal(members)} tone="success" />
        <StatCard icon={CalendarDays} label="Events" value={metaTotal(events)} tone="info" />
        <StatCard icon={Megaphone} label="Notices" value={metaTotal(notices)} tone="warning" />
        <StatCard icon={CreditCard} label="Payments" value={metaTotal(payments)} tone="primary" hint={`${metaTotal(paid)} successful`} />
        <StatCard icon={Receipt} label="Unpaid dues" value={metaTotal(unpaid)} tone="warning" />
        <StatCard icon={TriangleAlert} label="Overdue dues" value={metaTotal(overdue)} tone="destructive" />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Newest users</CardTitle>
            <Button asChild variant="ghost" size="sm"><Link href="/admin/users">Manage <ArrowRight /></Link></Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentUsers.success && recentUsers.data.length ? (
              recentUsers.data.map((user) => (
                <div key={user.id} className="flex items-center gap-3 rounded-xl border p-3">
                  <UserAvatar name={user.name} src={user.profileImage} className="size-10" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{user.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{user.email} · {formatDate(user.createdAt)}</p>
                  </div>
                  <StatusBadge status={user.role} />
                </div>
              ))
            ) : (
              <p className="py-6 text-center text-sm text-muted-foreground">No users to show.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Latest payments</CardTitle>
            <Button asChild variant="ghost" size="sm"><Link href="/admin/payments">View all <ArrowRight /></Link></Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentPayments.success && recentPayments.data.length ? (
              recentPayments.data.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between gap-3 rounded-xl border p-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{payment.user.name}</p>
                    <p className="text-xs text-muted-foreground">{formatDateTime(payment.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold">{formatMoney(payment.amount)}</span>
                    <StatusBadge status={payment.status} />
                  </div>
                </div>
              ))
            ) : (
              <p className="py-6 text-center text-sm text-muted-foreground">No payments yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
