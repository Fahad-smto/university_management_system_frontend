import type { Metadata } from 'next';
import Link from 'next/link';
import { TriangleAlert, ArrowRight, CalendarDays, Megaphone, Receipt, Users } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { IconTile, PageHeader, StatCard } from '@/components/shared/common';
import { api } from '@/lib/api';
import { metaTotal } from '@/lib/format';

export const metadata: Metadata = { title: 'Moderation' };

const links = [
  { href: '/moderator/members', icon: Users, tone: 'primary', title: 'Members', text: 'See active members and manage their membership.' },
  { href: '/moderator/events', icon: CalendarDays, tone: 'info', title: 'Events', text: 'Create events, change their status and see who registered.' },
  { href: '/moderator/notices', icon: Megaphone, tone: 'warning', title: 'Notices', text: 'Publish or schedule announcements.' },
  { href: '/moderator/dues', icon: Receipt, tone: 'success', title: 'Monthly dues', text: 'Check who has paid and who is late.' },
] as const;

export default async function ModeratorOverviewPage() {
  // only the totals are needed, so every request asks for a single row
  const [members, events, notices, unpaid, overdue] = await Promise.all([
    api('/members/public', { query: { limit: 1 } }),
    api('/events', { query: { limit: 1, status: 'UPCOMING' } }),
    api('/notices', { query: { limit: 1 } }),
    api('/payments/dues', { query: { limit: 1, status: 'UNPAID' } }),
    api('/payments/dues', { query: { limit: 1, status: 'OVERDUE' } }),
  ]);

  return (
    <>
      <PageHeader title="Moderation" description="Everything you need to run the organization day to day." />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard icon={Users} label="Active members" value={metaTotal(members)} tone="primary" />
        <StatCard icon={CalendarDays} label="Upcoming events" value={metaTotal(events)} tone="info" />
        <StatCard icon={Megaphone} label="Notices" value={metaTotal(notices)} tone="warning" hint="Including scheduled ones" />
        <StatCard icon={Receipt} label="Unpaid dues" value={metaTotal(unpaid)} tone="warning" />
        <StatCard icon={TriangleAlert} label="Overdue dues" value={metaTotal(overdue)} tone="destructive" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {links.map((item) => (
          <Link key={item.href} href={item.href} className="group">
            <Card className="flex items-start gap-4 p-5 transition group-hover:border-primary/40 group-hover:shadow-md">
              <IconTile icon={item.icon} tone={item.tone} />
              <div className="flex-1">
                <h3 className="font-semibold">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.text}</p>
              </div>
              <ArrowRight className="size-4 text-muted-foreground transition group-hover:translate-x-1" />
            </Card>
          </Link>
        ))}
      </div>
    </>
  );
}
