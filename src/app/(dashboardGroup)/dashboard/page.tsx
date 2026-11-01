import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, BadgeCheck, CalendarDays, Receipt, UserPlus, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState, PageHeader, StatCard } from '@/components/shared/common';
import { StatusBadge } from '@/components/shared/status-badge';
import { DuesTable, PaymentsTable } from '@/components/features/tables';
import { api } from '@/lib/api';
import { formatDateTime, formatMoney } from '@/lib/format';
import { getMe } from '@/service/session';
import type { Due, EventRegistration, MemberProfile, Payment } from '@/lib/types';

export const metadata: Metadata = { title: 'My dashboard' };

export default async function DashboardPage() {
  // all requests run at the same time
  const [me, profile, dues, registrations, payments] = await Promise.all([
    getMe(),
    api<MemberProfile>('/members/me'),
    api<Due[]>('/payments/dues/my', { query: { limit: 12 } }),
    api<EventRegistration[]>('/events/my/registrations', { query: { limit: 5 } }),
    api<Payment[]>('/payments/my', { query: { limit: 5 } }),
  ]);

  const firstName = me.success ? me.data.name.split(' ')[0] : 'there';
  const hasProfile = profile.success;
  const outstanding = dues.success ? dues.data.filter((due) => due.status !== 'PAID') : [];
  const outstandingTotal = outstanding.reduce((sum, due) => sum + Number(due.amount), 0);
  const upcoming = registrations.success
    ? registrations.data.filter((item) => item.status === 'REGISTERED' && item.event.status === 'UPCOMING')
    : [];

  return (
    <>
      <PageHeader title={`Hello, ${firstName}`} description="Here is a quick look at your membership." />

      {!hasProfile ? (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground"><UserPlus className="size-5" /></span>
              <div>
                <h2 className="font-semibold">Complete your member profile</h2>
                <p className="text-sm text-muted-foreground">Add your student ID, class and session so a moderator can approve your membership.</p>
              </div>
            </div>
            <Button asChild><Link href="/dashboard/profile">Create profile <ArrowRight /></Link></Button>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={BadgeCheck}
          label="Membership"
          tone={profile.success && profile.data.membershipStatus === 'ACTIVE' ? 'success' : 'warning'}
          value={profile.success ? <StatusBadge status={profile.data.membershipStatus} className="text-sm" /> : 'No profile'}
          hint={profile.success ? `${profile.data.class} · ${profile.data.session}` : 'Create your profile'}
        />
        <StatCard
          icon={Receipt}
          label="Outstanding dues"
          tone={outstanding.length ? 'destructive' : 'success'}
          value={formatMoney(outstandingTotal)}
          hint={outstanding.length ? `${outstanding.length} unpaid month(s)` : 'You are all paid up'}
        />
        <StatCard icon={CalendarDays} label="Upcoming events" tone="info" value={upcoming.length} hint="You are registered for" />
        <StatCard icon={Wallet} label="Payments made" tone="primary" value={payments.success ? (payments.meta?.total ?? 0) : 0} hint="All time" />
      </div>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Dues to pay</h2>
          <Button asChild variant="ghost" size="sm"><Link href="/dashboard/dues">All dues <ArrowRight /></Link></Button>
        </div>
        {outstanding.length ? (
          <DuesTable dues={outstanding.slice(0, 4)} payable />
        ) : (
          <EmptyState icon={Receipt} title="Nothing to pay" description="New monthly dues will show up here." />
        )}
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>My upcoming events</CardTitle>
            <Button asChild variant="ghost" size="sm"><Link href="/dashboard/events">View all</Link></Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcoming.length ? (
              upcoming.map((item) => (
                <Link key={item.id} href={`/events/${item.event.id}`} className="flex items-center justify-between gap-3 rounded-xl border p-3.5 transition hover:bg-accent">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{item.event.title}</p>
                    <p className="text-xs text-muted-foreground">{formatDateTime(item.event.eventDate)}</p>
                  </div>
                  <ArrowRight className="size-4 shrink-0 text-muted-foreground" />
                </Link>
              ))
            ) : (
              <p className="py-6 text-center text-sm text-muted-foreground">You have not registered for any upcoming event.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Recent payments</CardTitle>
            <Button asChild variant="ghost" size="sm"><Link href="/dashboard/payments">View all</Link></Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {payments.success && payments.data.length ? (
              payments.data.slice(0, 4).map((payment) => (
                <div key={payment.id} className="flex items-center justify-between gap-3 rounded-xl border p-3.5">
                  <div>
                    <p className="font-medium">{formatMoney(payment.amount)}</p>
                    <p className="text-xs text-muted-foreground">{formatDateTime(payment.createdAt)}</p>
                  </div>
                  <StatusBadge status={payment.status} />
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
