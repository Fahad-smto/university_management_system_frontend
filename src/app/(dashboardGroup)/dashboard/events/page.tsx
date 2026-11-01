import type { Metadata } from 'next';
import Link from 'next/link';
import { CalendarDays, CircleX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { EmptyState, PageHeader } from '@/components/shared/common';
import { Pagination } from '@/components/shared/pagination';
import { StatusBadge } from '@/components/shared/status-badge';
import { cancelRegistrationAction } from '@/actions/event';
import { api } from '@/lib/api';
import { formatDateTime, formatMoney } from '@/lib/format';
import { pageOf, readParams, type SearchParams } from '@/lib/search-params';
import type { EventRegistration } from '@/lib/types';

export const metadata: Metadata = { title: 'My events' };

export default async function MyEventsPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await readParams(searchParams);
  const result = await api<EventRegistration[]>('/events/my/registrations', {
    query: { page: pageOf(params), limit: 10, sortOrder: 'desc' },
  });

  return (
    <>
      <PageHeader
        title="My events"
        description="Events you registered for."
        actions={<Button asChild><Link href="/events">Browse events</Link></Button>}
      />

      {!result.success ? (
        <EmptyState icon={CalendarDays} title="Could not load your events" description={result.message} />
      ) : result.data.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="No registrations yet"
          description="Find an event you like and reserve your seat."
          action={<Button asChild><Link href="/events">Browse events</Link></Button>}
        />
      ) : (
        <>
          <Card className="overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Event</TableHead>
                  <TableHead>When</TableHead>
                  <TableHead>Fee</TableHead>
                  <TableHead>Event</TableHead>
                  <TableHead>Registration</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {result.data.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Link href={`/events/${item.event.id}`} className="font-medium hover:text-primary hover:underline">{item.event.title}</Link>
                      <p className="text-xs text-muted-foreground">{item.event.venue}</p>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-muted-foreground">{formatDateTime(item.event.eventDate)}</TableCell>
                    <TableCell>{Number(item.event.fee) === 0 ? 'Free' : formatMoney(item.event.fee)}</TableCell>
                    <TableCell><StatusBadge status={item.event.status} /></TableCell>
                    <TableCell><StatusBadge status={item.status} /></TableCell>
                    <TableCell className="text-right">
                      {item.status === 'REGISTERED' && item.event.status === 'UPCOMING' ? (
                        <ConfirmDialog
                          title="Cancel your registration?"
                          description={`Your seat for "${item.event.title}" will be given up.`}
                          confirmLabel="Cancel registration"
                          destructive
                          action={cancelRegistrationAction}
                          args={[item.event.id]}
                          trigger={<Button variant="outline" size="sm"><CircleX /> Cancel</Button>}
                        />
                      ) : null}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
          <Pagination meta={result.meta} basePath="/dashboard/events" params={params} />
        </>
      )}
    </>
  );
}
